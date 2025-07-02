import * as path from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import util from 'util';
import {exec} from 'child_process';
import {injectable} from 'inversify';
import {InternalServerError} from 'routing-controllers';
import {fileURLToPath} from 'url';

const execAsync = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@injectable()
export class VideoService {
  public async downloadVideo(youtubeUrl: string): Promise<string> {
    try {
      const videoId = this.extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        throw new InternalServerError('Invalid YouTube URL: Missing video ID');
      }

      // Use a more flexible output path that allows yt-dlp to choose the extension
      const outputTemplate = path.join(
        __dirname,
        '..',
        'videos',
        `${videoId}.%(ext)s`,
      );

      // Ensure the videos directory exists
      const videosDirPath = path.dirname(outputTemplate);
      if (!fs.existsSync(videosDirPath)) {
        await fsp.mkdir(videosDirPath, {recursive: true});
      }

      // More robust format selection for HLS streams and separated video/audio
      // This handles the case where only separated streams are available
      const formatSelector = 'bv*[height<=720]+ba/bv*+ba/best';

      // Arguments for yt-dlp with HLS support
      const command = `yt-dlp -f "${formatSelector}" --merge-output-format mp4 --no-playlist --hls-prefer-ffmpeg -o "${outputTemplate}" "${youtubeUrl}"`;

      console.log('🎥 Downloading video with command:', command);

      // Execute the command using execAsync with increased buffer size
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer for command output (not video file)
        timeout: 600000, // 10 minutes timeout for large videos
      });

      if (stderr && stderr.includes('ERROR')) {
        console.error('yt-dlp stderr (potential error):', stderr);
      }

      // Find the actual downloaded file (since extension might vary)
      const files = await fsp.readdir(videosDirPath);
      const downloadedFile = files.find(file => file.startsWith(videoId!));

      if (!downloadedFile) {
        console.error(
          `yt-dlp completed but no file found. Video ID: ${videoId}. Files in directory: ${files.join(', ')}`,
        );
        throw new InternalServerError(
          'Failed to download video: Output file not found after yt-dlp execution',
        );
      }

      const finalPath = path.join(videosDirPath, downloadedFile);
      return finalPath;
    } catch (error: any) {
      console.error('Error downloading video:', error);

      if (error instanceof InternalServerError) {
        throw error;
      }

      // Provide more detailed error information
      const errorMessage =
        error.message || 'Unknown error occurred during video download';
      throw new InternalServerError(
        `Failed to download video: ${errorMessage}`,
      );
    }
  }

  public async getPlaylistInfo(
    playlistUrl: string,
  ): Promise<{title: string; url: string}[]> {
    try {
      // This command gets metadata for each video in the playlist in JSON format.
      const command = `yt-dlp --flat-playlist --dump-json "${playlistUrl}"`;
      console.log('🎥 Fetching playlist info with command:', command);

      const {stdout} = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      // Each line of stdout is a JSON object for a video.
      const videos = stdout
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const entry = JSON.parse(line);
          return {
            title: entry.title,
            url: `https://www.youtube.com/watch?v=${entry.id}`,
          };
        });

      return videos;
    } catch (error: any) {
      console.error('Error fetching playlist info:', error);
      throw new InternalServerError(
        `Failed to fetch playlist info: ${error.message}`,
      );
    }
  }

  private extractYouTubeVideoId(url: string): string | null {
    if (typeof url !== 'string' || url.trim() === '') {
      return null;
    }

    // Comprehensive regex to find a YouTube video ID from various URL formats.
    const urlRegex =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(urlRegex);

    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }

    // If no match from URL, check if the input string is just a video ID
    const idRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (idRegex.test(url)) {
      return url;
    }

    return null;
  }
}
