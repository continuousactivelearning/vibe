import express, {Request, Response, NextFunction} from 'express'; // Import NextFunction
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const whisper = require('whisper-node');

// Ensure the tmp directory exists
const tmpDir = path.resolve(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, {recursive: true});
}

interface TranscriptSegment {
  id: string;
  startTime?: number; // Optional: Start time of the segment in seconds
  endTime?: number; // Optional: End time of the segment in seconds
  text: string;
  topic?: string; // Optional: Identified topic for this segment
  summary?: string; // Optional: A brief summary of the segment
}

export class GenAIVideoController {
  /**
   * POST /genai/generate/transcript
   * Body: { url: string }
   */
  static async generateTranscript(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    // Add next parameter
    const {url} = req.body;
    if (!url) {
      return res.status(400).json({error: 'Missing YouTube URL'});
    }

    try {
      // Determine if URL is a playlist or single video
      const isPlaylist = await ytpl.validateID(url); // ytpl.validateID is usually synchronous, but let's keep await if your version differs or for future-proofing
      const videoUrls: string[] = [];

      if (isPlaylist) {
        // Fetch all video URLs from playlist
        const playlist = await ytpl(url, {pages: Infinity});
        playlist.items.forEach(item => {
          videoUrls.push(item.shortUrl); // Using shortUrl as url_simple might not be available in all ytpl versions
        });
      } else {
        // Single video URL
        if (ytdl.validateURL(url)) {
          videoUrls.push(url);
        } else {
          return res
            .status(400)
            .json({error: 'Invalid YouTube video or playlist URL'});
        }
      }

      const transcripts = [];

      // Process each video sequentially (or parallelize if desired)
      for (const videoUrl of videoUrls) {
        const info = await ytdl.getInfo(videoUrl);
        const titleSafe = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, '_');
        const tempFile = path.resolve(tmpDir, `${titleSafe}.mp4`);

        // Download video to a temp directory
        await new Promise<void>((resolve, reject) => {
          // Added void for Promise type
          const stream = ytdl(videoUrl, {quality: 'highest'}).pipe(
            fs.createWriteStream(tempFile),
          );
          stream.on('finish', resolve);
          stream.on('error', reject);
        });

        // Generate transcript via Whisper STT
        const response = await whisper(tempFile, {
          modelName: 'base', // or any other model like 'tiny', 'small', 'medium', 'large'
          apiKey: process.env.WHISPER_API_KEY, // Use environment variable for API key
          language: 'en',
        });
        transcripts.push({
          videoUrl,
          title: info.videoDetails.title,
          transcript: Array.isArray(response)
            ? response.map(r => r.text).join(' ')
            : (response as any).text, // Handling potential array or object response
        });

        // Clean up temp file
        fs.unlinkSync(tempFile);
      }

      return res.json({transcripts});
    } catch (err) {
      console.error('Error generating transcript:', err);
      // Pass error to Express error handling middleware
      next(err);
    }
  }

  /**
   * POST /genai/generate/transcript/segment
   * Body: { transcript: string, options?: any } // options for future segmentation strategies
   */
  static async segmentTranscript(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {transcript, options} = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res
        .status(400)
        .json({error: 'Missing or invalid transcript text'});
    }

    try {
      // TODO: Implement actual transcript segmentation logic here.
      // This is a placeholder. Real segmentation would involve NLP techniques.

      console.log(
        `Received transcript for segmentation (length: ${transcript.length})`,
      );
      console.log('Segmentation options:', options);

      // Placeholder segmentation:
      const segments: TranscriptSegment[] = transcript
        .split('\n\n') // Basic split, replace with sophisticated logic
        .map((text, index) => {
          const segmentText = text.trim();
          return {
            id: `segment-${index + 1}-${Date.now()}`,
            text: segmentText,
            startTime: undefined, // Placeholder: Real start time cannot be derived from flat text here
            endTime: undefined, // Placeholder: Real end time cannot be derived from flat text here
            topic:
              segmentText.substring(0, 50) +
              (segmentText.length > 50 ? '...' : ''), // Placeholder for title
            // summary: "Placeholder summary" // Future: Add summarization
          };
        })
        .filter(segment => segment.text.length > 0);

      if (segments.length === 0 && transcript.length > 0) {
        // If splitting resulted in no segments but there was input, treat as one segment
        const segmentText = transcript.trim();
        segments.push({
          id: `segment-1-${Date.now()}`,
          text: segmentText,
          startTime: undefined,
          endTime: undefined,
          topic:
            segmentText.substring(0, 50) +
            (segmentText.length > 50 ? '...' : ''),
        });
      }

      console.log(`Generated ${segments.length} segments.`);

      return res.json({
        message: 'Transcript segmented successfully (placeholder logic).',
        originalLength: transcript.length,
        segments,
      });
    } catch (err) {
      console.error('Error segmenting transcript:', err);
      next(err); // Pass error to Express error handling middleware
    }
  }
}

// Router setup
const router = express.Router();
// Ensure the handler is correctly passed
router.post(
  '/generate/transcript',
  (req: Request, res: Response, next: NextFunction) => {
    GenAIVideoController.generateTranscript(req, res, next).catch(next); // Ensure promise rejections are caught and passed to next
  },
);

// Add new route for segmentation
router.post(
  '/generate/transcript/segment',
  (req: Request, res: Response, next: NextFunction) => {
    GenAIVideoController.segmentTranscript(req, res, next).catch(next);
  },
);

export default router;
