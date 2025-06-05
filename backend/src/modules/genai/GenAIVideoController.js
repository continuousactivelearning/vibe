require('dotenv').config({path: path.resolve(__dirname, '../../../.env')});
// backend/src/modules/genai/GenAIVideoController.js
const fs = require('fs'); // Main import for sync methods
const fsp = require('fs').promises; // For async methods if needed
const path = require('path');
const util = require('util');
const {exec} = require('child_process'); // exec is sufficient
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const pdf = require('pdf-parse');
const axios = require('axios');

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    // fs.mkdirSync is fine here as it's part of initial setup of multer
    fs.mkdirSync(uploadPath, {recursive: true});
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'),
    );
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
    // fs.readFileSync is acceptable here as pdf-parse expects a buffer or path
    // and this function is async due to pdf() call.
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error extracting text from PDF ${pdfPath}:`, error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}
// runs the Whisper CLI to transcribe an audio file, waits for it to finish, reads the generated .txt output, and returns the transcript text.
async function runWhisperAndGetText(
  whisperCommand,
  expectedTranscriptFilePath,
  tempTranscriptDir,
) {
  const execProm = util.promisify(exec); // Define execProm here
  try {
    await fsp.mkdir(tempTranscriptDir, {recursive: true});
    const {stdout, stderr} = await execProm(whisperCommand);
    console.log('Whisper CLI stdout:', stdout.trim());
    if (stderr) console.error('Whisper CLI stderr:', stderr.trim());
    const text = await fsp.readFile(expectedTranscriptFilePath, 'utf-8');
    console.log(
      'Whisper CLI transcription successful. Output read from:',
      expectedTranscriptFilePath,
    );
    return text.trim();
  } catch (err) {
    console.error('Whisper processing error:', err.message);
    try {
      const filesInDir = await fsp.readdir(tempTranscriptDir);
      console.log(`Files in "${tempTranscriptDir}":`, filesInDir);
    } catch (dirErr) {
      console.error(
        `Could not read output directory "${tempTranscriptDir}":`,
        dirErr.message,
      );
    }
    throw err;
  }
}

class GenAIVideoController {
  constructor() {
    console.log(
      'GenAIVideoController initialized. Ensure OpenAI Whisper CLI is installed in the specified venv (e.g., onnx_generation_env/Scripts/whisper.exe) and accessible.',
    );
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
      let processedAudioPath = null;
      let ytdlpOutputPath = null;
      let tempTranscriptDir = null;

      try {
        if (youtubeUrl) {
          if (
            !youtubeUrl.includes('youtube.com') &&
            !youtubeUrl.includes('youtu.be')
          ) {
            return res
              .status(400)
              .json({message: 'Invalid YouTube URL provided.'});
          }

          const tempAudioDir = path.join(__dirname, 'temp_audio');
          await fsp.mkdir(tempAudioDir, {recursive: true});

          ytdlpOutputPath = path.join(
            tempAudioDir,
            `${Date.now()}_audio_from_ytdlp.wav`,
          );
          processedAudioPath = path.join(
            tempAudioDir,
            `${Date.now()}_final_audio.wav`,
          );

          // Path to the virtual environment's Scripts directory
          const venvScriptsPath = path.resolve(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'onnx_generation_env',
            'Scripts',
          );
          const venvYtDlpPath = path.join(venvScriptsPath, 'yt-dlp.exe'); // Assuming yt-dlp.exe is in the venv

          const ytdlpCommand = `"${venvYtDlpPath}" -x --audio-format wav --audio-quality 0 -o "${ytdlpOutputPath}" "${youtubeUrl}"`;

          console.log(`Executing yt-dlp: ${ytdlpCommand}`);
          await new Promise((resolve, reject) => {
            exec(ytdlpCommand, (error, stdout, stderr) => {
              if (error) {
                console.error(`yt-dlp execution error: ${error.message}`);
                console.error(`yt-dlp stderr: ${stderr}`);
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

          console.log(
            `Standardizing ${ytdlpOutputPath} to ${processedAudioPath} (16kHz, 1-channel)`,
          );
          await new Promise((resolve, reject) => {
            ffmpeg(ytdlpOutputPath)
              .toFormat('wav')
              .audioFrequency(16000)
              .audioChannels(1)
              .on('error', ffmpegErr => {
                console.error('FFmpeg standardization error:', ffmpegErr);
                reject(
                  new Error(
                    'FFmpeg audio standardization failed: ' + ffmpegErr.message,
                  ),
                );
              })
              .on('end', async () => {
                console.log(
                  'FFmpeg standardization finished:',
                  processedAudioPath,
                );
                if (fs.existsSync(ytdlpOutputPath)) {
                  //checks if a specific file (an intermediate audio file generated by yt-dlp) exists, and if it does, it attempts to delete it.
                  try {
                    await fsp.unlink(ytdlpOutputPath);
                    console.log(
                      'Cleaned up intermediate ytdlp audio file:',
                      ytdlpOutputPath,
                    );
                  } catch (unlinkErr) {
                    console.error(
                      'Error deleting intermediate ytdlp audio file:',
                      unlinkErr,
                    );
                  }
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
            const pdfText = await extractTextFromPdf(req.file.path);
            console.log(
              'Extracted PDF text (first 100 chars):',
              pdfText.substring(0, 100),
            );
            transcript += ` [PDF content processed. Text length: ${pdfText.length}]`; //check i think needs to changed
          } catch (pdfError) {
            console.error('PDF processing error:', pdfError.message);
            transcript += ` [PDF processing failed: ${pdfError.message}]`;
          }
        }

        // --- OpenAI Whisper CLI Integration Start ---
        if (processedAudioPath) {
          console.log(
            'Starting OpenAI Whisper CLI transcription for:',
            processedAudioPath,
          );

          tempTranscriptDir = path.join(__dirname, 'temp_transcripts');
          await fsp.mkdir(tempTranscriptDir, {recursive: true});

          // Path to the virtual environment's Scripts directory
          const venvScriptsPath = path.resolve(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'onnx_generation_env',
            'Scripts',
          );
          const whisperExecutable = path.join(venvScriptsPath, 'whisper.exe'); // Assuming whisper.exe

          // Output file name will be <audio_file_name_without_ext>.txt
          const audioFileNameWithoutExt = path.basename(
            processedAudioPath,
            path.extname(processedAudioPath),
          );
          const expectedTranscriptFilePath = path.join(
            tempTranscriptDir,
            `${audioFileNameWithoutExt}.txt`,
          );

          const whisperCommand = `"${whisperExecutable}" "${processedAudioPath}" --model small --language English --output_format txt --output_dir "${tempTranscriptDir}"`;

          console.log(`Executing Whisper CLI: ${whisperCommand}`);
          // const execProm = util.promisify(exec); // Moved execProm definition to the top of runWhisperAndGetText
          try {
            const whisperText = await runWhisperAndGetText(
              whisperCommand,
              expectedTranscriptFilePath,
              tempTranscriptDir,
            );
            transcript += ` [Whisper CLI Output: "${whisperText}"]`;
          } catch (cliError) {
            console.error('Whisper CLI processing error:', cliError);
            transcript += ` [Error during Whisper CLI processing: ${cliError.message}]`;
          }
        } else if (!req.file) {
          transcript = 'No audio input provided for transcription.';
        }

        // --- OpenAI Whisper CLI Integration End ---

        res.status(200).json({
          message: 'Transcript generation process completed.',
          youtubeUrl: youtubeUrl,
          pdfFile: req.file ? req.file.path : null,
          generatedTranscript: transcript,
        });
      } catch (error) {
        console.error('Error in generateTranscript:', error);
        res
          .status(500)
          .json({message: 'Error generating transcript: ' + error.message});
      } finally {
        // Cleanup temporary files and directories
        if (processedAudioPath && fs.existsSync(processedAudioPath)) {
          try {
            await fsp.unlink(processedAudioPath);
            console.log('Cleaned up processed audio:', processedAudioPath);
          } catch (delErr) {
            console.error('Error deleting processed audio:', delErr);
          }
        }
        // ytdlpOutputPath is deleted by ffmpeg promise on success, ensure cleanup on failure if it still exists
        if (ytdlpOutputPath && fs.existsSync(ytdlpOutputPath)) {
          try {
            await fsp.unlink(ytdlpOutputPath);
            console.log(
              'Cleaned up ytdlp temp audio (on error or if ffmpeg step skipped):',
              ytdlpOutputPath,
            );
          } catch (delErr) {
            console.error(
              'Error deleting ytdlp temp audio (on error or if ffmpeg step skipped):',
              delErr,
            );
          }
        }
        if (tempTranscriptDir) {
          try {
            await fsp.rm(tempTranscriptDir, {recursive: true, force: true});
            console.log(`Cleaned up temp transcript dir: ${tempTranscriptDir}`);
          } catch (rmDirError) {
            // force: true should prevent ENOENT, this catches other errors.
            if (rmDirError.code !== 'ENOENT') {
              console.error(
                `Error deleting temp transcript dir ${tempTranscriptDir}:`,
                rmDirError,
              );
            }
          }
        }
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          try {
            await fsp.unlink(req.file.path);
            console.log('Cleaned up uploaded PDF file:', req.file.path);
          } catch (pdfDelErr) {
            console.error('Error deleting uploaded PDF file:', pdfDelErr);
          }
        }
      }
    });
  }

  async generateTranscriptSegment(req, res) {
    console.log('GenAIVideoController: generateTranscriptSegment endpoint hit');
    try {
      const {transcript} = req.body;
      if (
        !transcript ||
        typeof transcript !== 'string' ||
        transcript.trim() === ''
      ) {
        return res.status(400).json({
          error: 'Transcript text is required and must be a non-empty string.',
        });
      }

      // const apiToken = process.env.HF_API_TOKEN;
      // if (!apiToken) {
      //   console.error('Hugging Face API token (HF_API_TOKEN) is not configured in .env file.');
      //   return res.status(500).json({ error: 'API token configuration error.' });
      // }

      console.log(
        `Processing transcript for segmentation with LLM (length: ${transcript.length} chars)`,
      );

      const llmApiUrl = 'http://192.168.1.108:11434/api/generate';
      const prompt = `Analyze the following timed lecture transcript. Your task is to segment it into meaningful subtopics.
    The transcript is formatted with each line as: [start_time --> end_time] text.

    For each identified subtopic, you must provide:
    1. "end_time": The end timestamp of the *last transcript line* that belongs to this subtopic (e.g., "02:53.000").
    2. "transcript_lines": An array of strings, where each string is an *original transcript line (including its timestamps and text)* that belongs to this subtopic.

    Please format your entire response as a single JSON array. Each object in the array should represent a subtopic and have the fields "end_time" and "transcript_lines".

    Transcript to process:
    ${transcript}
    `;

      let segments = [];
      try {
        const response = await axios.post(llmApiUrl, {
          model: 'gemma3',
          prompt: prompt, // This 'prompt' variable should already hold the detailed segmentation instructions
          stream: false,
        });

        if (response.data && typeof response.data.response === 'string') {
          // Check for response.data.response
          const generatedText = response.data.response; // Assign from response.data.response
          console.log('Ollama raw response text:', generatedText); // Log Ollama's raw response
          try {
            segments = JSON.parse(generatedText);
            // Add a basic validation that segments is an array, and its elements have the expected keys
            if (
              !Array.isArray(segments) ||
              (segments.length > 0 &&
                (typeof segments[0].end_time === 'undefined' ||
                  typeof segments[0].transcript_lines === 'undefined'))
            ) {
              console.error(
                'Ollama output, though valid JSON, is not in the expected format of [{end_time, transcript_lines}, ...]:',
                segments,
              );
              // Set segments to empty or handle as an error specific to content structure
              // For now, let's return an error if structure is wrong after successful parse
              return res.status(500).json({
                error:
                  'Ollama output was valid JSON but not in the expected structured format.',
              });
            }
          } catch (parseError) {
            console.error(
              'Failed to parse Ollama generated_text as JSON:',
              parseError,
            );
            console.error(
              'Ollama raw output that failed parsing:',
              generatedText,
            );
            return res.status(500).json({
              error:
                'Ollama output was not valid JSON. Cannot process segments.',
            });
          }
        } else {
          console.warn(
            'Ollama response did not contain expected response string format:',
            response.data,
          );
          return res.status(500).json({
            error:
              'Ollama response missing generated_text or not in expected format.',
          });
        }
      } catch (llmError) {
        console.error('Error calling Ollama API:', llmError.message);
        if (llmError.response) {
          console.error(
            'Ollama API Response Status:',
            llmError.response.status,
          );
          console.error('Ollama API Response Data:', llmError.response.data);
          // if (llmError.response.status === 401) { // This specific check might be less relevant
          //   return res.status(500).json({ error: 'LLM API authentication error. Check API token.' });
          // }
          return res.status(500).json({
            error: `Ollama API error: ${(llmError.response.data && llmError.response.data.error) || 'Failed to process transcript with Ollama'}`,
          });
        } else if (llmError.request) {
          return res.status(500).json({
            error: 'No response from Ollama API. Check network or API status.',
          });
        }
        throw llmError; // Rethrow for the outer catch if not handled specifically
      }

      res.status(200).json({
        message: 'Transcript segmentation completed successfully using LLM.',
        segments: segments,
        segmentCount: segments.length,
      });
    } catch (error) {
      console.error('Error in generateTranscriptSegment:', error);
      // Ensure a response is sent if an error is rethrown from inner try-catch
      if (!res.headersSent) {
        res
          .status(500)
          .json({error: 'Error segmenting transcript: ' + error.message});
      }
    }
  }
}

module.exports = new GenAIVideoController();
