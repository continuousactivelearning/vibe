// backend/src/modules/genai/GenAIVideoController.js
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process'); // For yt-dlp
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const pdf = require('pdf-parse'); // From previous step

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save PDFs in a temporary 'uploads' folder within the genai module
    const uploadPath = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadPath, {recursive: true}); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'),
    ); // Sanitize filename
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
}).single('pdfFile'); // Assuming the PDF comes in a field named 'pdfFile'

// PDF Text Extraction Utility Function
async function extractTextFromPdf(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error extracting text from PDF ${pdfPath}:`, error);
    // Depending on desired error handling, either throw the error
    // or return a specific value like null or an error message.
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

class GenAIVideoController {
  constructor() {
    // Initialization logic if needed
  }

  async generateTranscript(req, res) {
    console.log('GenAIVideoController: generateTranscript endpoint hit');

    upload(req, res, async err => {
      if (err) {
        return res
          .status(400)
          .json({message: 'PDF upload error: ' + err.message});
      }

      const {youtubeUrl} = req.body;
      if (!youtubeUrl && !req.file) {
        return res
          .status(400)
          .json({message: 'YouTube URL or PDF file is required.'});
      }

      let transcript = 'Placeholder transcript. ';
      let processedAudioPath = null; // This will be the final WAV path for transcription
      let ytdlpOutputPath = null; // Define here for cleanup in case of error

      try {
        if (youtubeUrl) {
          // Validate YouTube URL (basic check)
          if (
            !youtubeUrl.includes('youtube.com') &&
            !youtubeUrl.includes('youtu.be')
          ) {
            return res
              .status(400)
              .json({message: 'Invalid YouTube URL provided.'});
          }

          const tempAudioDir = path.join(__dirname, 'temp_audio');
          fs.mkdirSync(tempAudioDir, {recursive: true});

          // yt-dlp will produce a .wav file directly if possible with --extract-audio and --audio-format wav
          // Let's name the initial download from yt-dlp
          ytdlpOutputPath = path.join(
            tempAudioDir,
            `${Date.now()}_audio_from_ytdlp.wav`,
          ); // Assign here for broader scope
          processedAudioPath = path.join(
            tempAudioDir,
            `${Date.now()}_final_audio.wav`,
          ); // Final standardized WAV

          // Construct yt-dlp command
          // -x or --extract-audio: Extract audio track.
          // --audio-format wav: Convert to WAV.
          // --audio-quality 0: Best audio quality.
          // -o: Output template.
          // We add --ffmpeg-location if ffmpegPath is configured, helps yt-dlp find it.
          // Forcing output to wav, then we will standardize it with our ffmpeg call.
          const ytdlpCommand = `yt-dlp -x --audio-format wav --audio-quality 0 -o "${ytdlpOutputPath}" "${youtubeUrl}"`;

          console.log(`Executing yt-dlp: ${ytdlpCommand}`);

          await new Promise((resolve, reject) => {
            exec(ytdlpCommand, (error, stdout, stderr) => {
              if (error) {
                console.error(`yt-dlp execution error: ${error.message}`);
                console.error(`yt-dlp stderr: ${stderr}`);
                // Try to provide a more specific error if yt-dlp output indicates something useful
                if (stderr.includes('Unsupported URL')) {
                  return reject(
                    new Error('Invalid or unsupported YouTube URL by yt-dlp.'),
                  );
                }
                if (stderr.includes('Video unavailable')) {
                  return reject(
                    new Error('Video unavailable according to yt-dlp.'),
                  );
                }
                return reject(new Error(`yt-dlp failed: ${error.message}`));
              }
              console.log(`yt-dlp stdout: ${stdout}`);
              // Check if the ytdlpOutputPath was actually created
              if (!fs.existsSync(ytdlpOutputPath)) {
                console.error(
                  `yt-dlp finished but output file ${ytdlpOutputPath} not found. stderr: ${stderr}`,
                );
                return reject(
                  new Error(
                    'yt-dlp did not produce the expected output file. Check logs.',
                  ),
                );
              }
              console.log(
                'yt-dlp download and conversion to WAV successful:',
                ytdlpOutputPath,
              );
              resolve();
            });
          });

          // Now, standardize the audio from yt-dlp using fluent-ffmpeg
          console.log(
            `Standardizing ${ytdlpOutputPath} to ${processedAudioPath} (16kHz, 1-channel)`,
          );
          await new Promise((resolve, reject) => {
            ffmpeg(ytdlpOutputPath)
              .toFormat('wav')
              .audioFrequency(16000) // Whisper typically expects 16kHz
              .audioChannels(1) // Mono
              .on('error', ffmpegErr => {
                console.error('FFmpeg standardization error:', ffmpegErr);
                reject(
                  new Error(
                    'FFmpeg audio standardization failed: ' + ffmpegErr.message,
                  ),
                );
              })
              .on('end', () => {
                console.log(
                  'FFmpeg standardization finished:',
                  processedAudioPath,
                );
                // Clean up the intermediate file from yt-dlp
                if (fs.existsSync(ytdlpOutputPath)) {
                  fs.unlink(ytdlpOutputPath, unlinkErr => {
                    if (unlinkErr)
                      console.error(
                        'Error deleting intermediate ytdlp audio file:',
                        unlinkErr,
                      );
                    else
                      console.log(
                        'Cleaned up intermediate ytdlp audio file:',
                        ytdlpOutputPath,
                      );
                  });
                }
                resolve();
              })
              .save(processedAudioPath);
          });
          console.log('Audio downloaded and standardized:', processedAudioPath);
        }

        if (req.file) {
          console.log('PDF file uploaded:', req.file.path);
          try {
            const pdfText = await extractTextFromPdf(req.file.path); // Ensure extractTextFromPdf is defined in the class or file
            console.log(
              'Extracted PDF text (first 100 chars):',
              pdfText.substring(0, 100),
            );
            transcript += ` [PDF content processed. Text length: ${pdfText.length}]`;
          } catch (pdfError) {
            console.error('PDF processing error:', pdfError.message);
            transcript += ` [PDF processing failed: ${pdfError.message}]`;
          }
        }

        if (processedAudioPath) {
          transcript += `Audio from ${processedAudioPath} would be transcribed here using ONNX.`;
        }

        res.status(200).json({
          message: 'Transcript generation process initiated.',
          youtubeUrl: youtubeUrl,
          pdfFile: req.file ? req.file.path : null,
          generatedTranscript: transcript,
        });
      } catch (error) {
        console.error('Error in generateTranscript:', error);
        // Clean up any created audio files if an error occurs mid-process
        if (processedAudioPath && fs.existsSync(processedAudioPath)) {
          fs.unlink(processedAudioPath, delErr => {
            if (delErr)
              console.error(
                'Error deleting processed audio on failure:',
                delErr,
              );
          });
        }
        // Also attempt to clean up ytdlpOutputPath if it exists and is different
        if (
          ytdlpOutputPath &&
          fs.existsSync(ytdlpOutputPath) &&
          ytdlpOutputPath !== processedAudioPath
        ) {
          fs.unlink(ytdlpOutputPath, delErr => {
            if (delErr)
              console.error(
                'Error deleting ytdlp temp audio on failure:',
                delErr,
              );
          });
        }

        res
          .status(500)
          .json({message: 'Error generating transcript: ' + error.message});
      }
      // No finally block for cleanup here as processedAudioPath might be needed by a later (mocked) transcription step.
      // Cleanup should ideally happen after transcription, or if transcription is part of this flow and fails.
      // The prompt also implies that the final processedAudioPath should be cleaned up later.
      // The intermediate ytdlpOutputPath is cleaned up after successful ffmpeg standardization.
      // Error case cleanup is handled in the catch block.
    });
  }

  /**
   * Endpoint: genai/generate/transcript/segment/
   * Handles transcript input, segments it, and supports PDF uploads.
   */
  async generateTranscriptSegment(req, res) {
    console.log('GenAIVideoController: generateTranscriptSegment endpoint hit');

    upload(req, res, async err => {
      if (err) {
        return res
          .status(400)
          .json({message: 'PDF upload error: ' + err.message});
      }

      const {transcript} = req.body;

      if (!transcript) {
        return res
          .status(400)
          .json({message: 'Transcript is required in the request body.'});
      }

      let segmentedTranscript = 'Placeholder segmented transcript. ';

      try {
        if (req.file) {
          console.log(
            'PDF file uploaded for segmentation context:',
            req.file.path,
          );
          try {
            const pdfText = await extractTextFromPdf(req.file.path);
            console.log(
              'Extracted PDF text for context (first 100 chars):',
              pdfText.substring(0, 100),
            );
            // Here, pdfText could be used to provide context to the segmentation model
            segmentedTranscript += ` [PDF context processed. Text length: ${pdfText.length}]`;
          } catch (pdfError) {
            console.error('PDF context processing error:', pdfError.message);
            segmentedTranscript += ` [PDF context processing failed: ${pdfError.message}]`;
          }
        }

        // Placeholder for ONNX SEGBOT model inference
        segmentedTranscript += `Transcript: "${transcript.substring(0, 100)}..." would be segmented here using ONNX.`;

        res.status(200).json({
          message: 'Transcript segmentation process initiated.',
          originalTranscriptPreview: transcript.substring(0, 200) + '...',
          pdfFile: req.file ? req.file.path : null,
          generatedSegments: segmentedTranscript,
        });
      } catch (error) {
        console.error('Error in generateTranscriptSegment:', error);
        res
          .status(500)
          .json({message: 'Error segmenting transcript: ' + error.message});
      }
      // Decide if PDFs should be kept or deleted after processing.
      // If temporary, uncomment the unlink:
      // if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      //     fs.unlink(req.file.path, (err) => {
      //         if (err) console.error("Error deleting uploaded PDF file:", req.file.path, err);
      //         else console.log("Cleaned up uploaded PDF file:", req.file.path);
      //     });
      // }
    });
  }
}

module.exports = new GenAIVideoController();
