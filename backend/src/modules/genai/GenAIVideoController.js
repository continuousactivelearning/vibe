// backend/src/modules/genai/GenAIVideoController.js
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const pdf = require('pdf-parse'); // Added pdf-parse require

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save PDFs in a temporary 'uploads' folder within the genai module
        const uploadPath = path.join(__dirname, 'uploads'); 
        fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')); // Sanitize filename
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
            return cb(new Error('Only PDF files are allowed'), false);
        }
        cb(null, true);
    }
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

    /**
     * Endpoint: genai/generate/transcript/
     * Handles YouTube video URL, downloads audio, transcribes, and supports PDF uploads.
     */
    async generateTranscript(req, res) {
        console.log("GenAIVideoController: generateTranscript endpoint hit");

        upload(req, res, async (err) => {
            if (err) {
                // Multer errors (e.g., file type)
                console.error("Multer error:", err.message);
                return res.status(400).json({ message: "File upload error: " + err.message });
            }

            const { youtubeUrl } = req.body;
            if (!youtubeUrl && !req.file) {
                return res.status(400).json({ message: "YouTube URL or PDF file is required." });
            }

            let transcript = "Placeholder transcript. ";
            let audioFilePath = null;
            const tempAudioDir = path.join(__dirname, 'temp_audio'); 

            try {
                if (youtubeUrl) {
                    if (!ytdl.validateURL(youtubeUrl)) {
                        return res.status(400).json({ message: "Invalid YouTube URL." });
                    }

                    const videoInfo = await ytdl.getInfo(youtubeUrl);
                    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio', filter: 'audioonly' });
                    if (!audioFormat) {
                        return res.status(400).json({ message: "No suitable audio format found for this YouTube video." });
                    }
                    
                    fs.mkdirSync(tempAudioDir, { recursive: true });
                    const rawAudioPath = path.join(tempAudioDir, Date.now() + '_raw_audio'); 
                    audioFilePath = path.join(tempAudioDir, Date.now() + '_audio.wav'); 

                    console.log(`Downloading audio from ${youtubeUrl} to ${rawAudioPath}`);
                    console.log(`Target WAV file: ${audioFilePath}`);

                    await new Promise((resolve, reject) => {
                        const stream = ytdl(youtubeUrl, { format: audioFormat });
                        stream.pipe(fs.createWriteStream(rawAudioPath))
                            .on('finish', () => {
                                console.log('Download finished. Converting to WAV...');
                                ffmpeg(rawAudioPath)
                                    .toFormat('wav')
                                    .audioFrequency(16000) 
                                    .audioChannels(1)      
                                    .on('error', (ffmpegErr) => {
                                        console.error('FFmpeg error:', ffmpegErr);
                                        if (fs.existsSync(rawAudioPath)) {
                                            fs.unlink(rawAudioPath, (unlinkErr) => {
                                                if (unlinkErr) console.error("Error deleting raw audio file after ffmpeg error:", unlinkErr);
                                            });
                                        }
                                        reject(new Error('FFmpeg conversion failed: ' + ffmpegErr.message + '. Ensure ffmpeg is installed and accessible in PATH.'));
                                    })
                                    .on('end', () => {
                                        console.log('WAV conversion finished:', audioFilePath);
                                        if (fs.existsSync(rawAudioPath)) {
                                            fs.unlink(rawAudioPath, (unlinkErr) => { 
                                                if (unlinkErr) console.error("Error deleting raw audio file:", unlinkErr);
                                            });
                                        }
                                        resolve();
                                    })
                                    .save(audioFilePath);
                            })
                            .on('error', (downloadErr) => {
                                console.error('YouTube download error:', downloadErr);
                                if (fs.existsSync(rawAudioPath)) {
                                    fs.unlink(rawAudioPath, (unlinkErr) => {
                                        if (unlinkErr) console.error("Error deleting raw audio file after download error:", unlinkErr);
                                    });
                                }
                                reject(new Error('YouTube audio download failed: ' + downloadErr.message));
                            });
                    });
                    console.log("Audio downloaded and converted to WAV:", audioFilePath);
                }

                if (req.file) {
                    console.log("PDF file uploaded:", req.file.path);
                    try {
                        const pdfText = await extractTextFromPdf(req.file.path);
                        console.log("Extracted PDF text (first 100 chars):", pdfText.substring(0, 100));
                        transcript += ` [PDF content processed. Text length: ${pdfText.length}]`;
                        // Here, pdfText could be passed to the transcription model or used otherwise
                    } catch (pdfError) {
                        console.error("PDF processing error:", pdfError.message);
                        // Decide if this error should halt the process or just be logged
                        transcript += ` [PDF processing failed: ${pdfError.message}]`;
                    }
                }

                // Placeholder for ONNX Whisper model inference
                if (audioFilePath) {
                    transcript += `Audio from ${audioFilePath} would be transcribed here using ONNX.`;
                }
                
                res.status(200).json({ 
                    message: "Transcript generation process initiated.", 
                    youtubeUrl: youtubeUrl,
                    pdfFile: req.file ? req.file.path : null, 
                    audioFileProcessed: audioFilePath, 
                    generatedTranscript: transcript 
                });

            } catch (error) {
                console.error("Error in generateTranscript:", error);
                res.status(500).json({ message: "Error generating transcript: " + error.message });
            } finally {
                if (audioFilePath && fs.existsSync(audioFilePath)) {
                    fs.unlink(audioFilePath, (err) => {
                        if (err) console.error("Error deleting processed audio file:", audioFilePath, err);
                        else console.log("Cleaned up processed audio file:", audioFilePath);
                    });
                }
                // Decide if PDFs should be kept or deleted after processing.
                // If temporary, uncomment the unlink:
                // if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                //     fs.unlink(req.file.path, (err) => {
                //         if (err) console.error("Error deleting uploaded PDF file:", req.file.path, err);
                //         else console.log("Cleaned up uploaded PDF file:", req.file.path);
                //     });
                // }
            }
        });
    }

    /**
     * Endpoint: genai/generate/transcript/segment/
     * Handles transcript input, segments it, and supports PDF uploads.
     */
    async generateTranscriptSegment(req, res) {
        console.log("GenAIVideoController: generateTranscriptSegment endpoint hit");

        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: "PDF upload error: " + err.message });
            }

            const { transcript } = req.body;

            if (!transcript) {
                return res.status(400).json({ message: "Transcript is required in the request body." });
            }

            let segmentedTranscript = "Placeholder segmented transcript. ";

            try {
                if (req.file) {
                    console.log("PDF file uploaded for segmentation context:", req.file.path);
                    try {
                        const pdfText = await extractTextFromPdf(req.file.path);
                        console.log("Extracted PDF text for context (first 100 chars):", pdfText.substring(0, 100));
                        // Here, pdfText could be used to provide context to the segmentation model
                        segmentedTranscript += ` [PDF context processed. Text length: ${pdfText.length}]`;
                    } catch (pdfError) {
                        console.error("PDF context processing error:", pdfError.message);
                        segmentedTranscript += ` [PDF context processing failed: ${pdfError.message}]`;
                    }
                }

                // Placeholder for ONNX SEGBOT model inference
                segmentedTranscript += `Transcript: "${transcript.substring(0, 100)}..." would be segmented here using ONNX.`;
                
                res.status(200).json({
                    message: "Transcript segmentation process initiated.",
                    originalTranscriptPreview: transcript.substring(0, 200) + "...",
                    pdfFile: req.file ? req.file.path : null,
                    generatedSegments: segmentedTranscript
                });

            } catch (error) {
                console.error("Error in generateTranscriptSegment:", error);
                res.status(500).json({ message: "Error segmenting transcript: " + error.message });
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
