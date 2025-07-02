import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import {injectable} from 'inversify';
import {InternalServerError} from 'routing-controllers';
import axios from 'axios';

// Supported languages for transcription
const SUPPORTED_LANGUAGES = ['English', 'Hindi'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

interface TranscriptionResponse {
  text: string;  // Full transcript text
  chunks: Array<{
    timestamp: [number, number];
    text: string;
  }>;
  json_file_path?: string;  // Path to saved JSON file
}

@injectable()
export class TranscriptionService {
  private readonly transcriptionApiUrl = 'http://127.0.0.1:8000';

  /**
   * Validates if the provided language is supported
   * @param language The language to validate
   * @returns boolean indicating if the language is supported
   */
  private isLanguageSupported(language: string): language is SupportedLanguage {
    return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
  }

  /**
   * Transcribes an audio file using the FastAPI transcription service.
   * @param audioPath Path to the input audio file (WAV format expected).
   * @param language Optional language for transcription. Defaults to 'English'. Supported: 'English', 'Hindi'
   * @returns Promise<string> The transcribed text.
   * @throws InternalServerError if transcription fails.
   */
  public async transcribe(audioPath: string, language: string = 'English'): Promise<string> {
    if (!fs.existsSync(audioPath)) {
      throw new InternalServerError(`Input audio file not found: ${audioPath}`);
    }

    if (!this.isLanguageSupported(language)) {
      throw new InternalServerError(
        `Unsupported language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`
      );
    }

    try {
      const response = await axios.post<TranscriptionResponse>(`${this.transcriptionApiUrl}/transcribe`, {
        audio_path: audioPath,
        model_size: 'medium',
        language: language,
        save_json: true
      }, {
        timeout: 600000, // 10 minute timeout for larger models
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.text;

    } catch (error: any) {
      if (error.response) {
        // API returned an error response
        const errorMessage = error.response.data?.detail || error.response.statusText;
        throw new InternalServerError(`Transcription API error: ${errorMessage}`);
      } else if (error.code === 'ECONNREFUSED') {
        // Service is not running
        throw new InternalServerError(
          'Transcription service is not available. Please ensure the FastAPI transcription service is running on port 8000.'
        );
      } else if (error.code === 'ETIMEDOUT') {
        // Request timeout
        throw new InternalServerError('Transcription request timed out. The audio file may be too large.');
      } else {
        // Other network or unknown errors
        throw new InternalServerError(`Transcription failed: ${error.message}`);
      }
    }
  }

  /**
   * Transcribes an audio file and returns both text and detailed chunks
   * @param audioPath Path to the input audio file
   * @param language Optional language for transcription
   * @returns Promise containing transcript text, chunks, and JSON file path
   */
  public async transcribeAudio(audioPath: string, language: string = 'English'): Promise<{
    text: string;
    chunks: Array<{
      timestamp: [number, number];
      text: string;
    }>;
    jsonFilePath?: string;
  }> {
    if (!fs.existsSync(audioPath)) {
      throw new InternalServerError(`Input audio file not found: ${audioPath}`);
    }

    if (!this.isLanguageSupported(language)) {
      throw new InternalServerError(
        `Unsupported language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`
      );
    }

    try {
      const response = await axios.post<TranscriptionResponse>(`${this.transcriptionApiUrl}/transcribe`, {
        audio_path: audioPath,
        model_size: 'medium',
        language: language,
        save_json: true
      }, {
        timeout: 600000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        text: response.data.text,
        chunks: response.data.chunks,
        jsonFilePath: response.data.json_file_path
      };

    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data?.detail || error.response.statusText;
        throw new InternalServerError(`Transcription API error: ${errorMessage}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new InternalServerError(
          'Transcription service is not available. Please ensure the FastAPI transcription service is running on port 8000.'
        );
      } else if (error.code === 'ETIMEDOUT') {
        throw new InternalServerError('Transcription request timed out. The audio file may be too large.');
      } else {
        throw new InternalServerError(`Transcription failed: ${error.message}`);
      }
    }
  }
}
