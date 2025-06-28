import axios, { AxiosError } from 'axios';
import { injectable } from 'inversify';
import { HttpError } from 'routing-controllers';
import { llmConfig } from '#root/config/llm.js';
import { extractJSONFromMarkdown } from '../utils/extractJSONFromMarkdown.js';
import { questionSchemas } from '../schemas/index.js';
import { secondsToTimestamp } from '../utils/timeUtils.js';

// --- SEGBOT API Types ---
interface Segment {
  text: string;
  start_time: number;
  end_time: number;
}

// --- Type Definitions ---
export interface GeneratedQuestion {
  segmentId?: string | number;
  questionType?: string;
  questionText: string;
  options?: Array<{text: string; correct?: boolean; explanation?: string}>;
  solution?: any;
  isParameterized?: boolean;
  timeLimitSeconds?: number;
  points?: number;
}

@injectable()
export class AIContentService {
  private readonly ollimaApiBaseUrl: string;
  private readonly segbotApiBaseUrl: string;

  constructor() {
    // Configure Ollama API URL from config
    this.ollimaApiBaseUrl = `http://${llmConfig.ollamaHost}:${llmConfig.ollamaPort}/api`;
    // Configure SEGBOT API URL via environment variable
    this.segbotApiBaseUrl = llmConfig.segbotApiBaseUrl;
  }

  public async segmentTranscript(
    transcript: string,
    model = llmConfig.ollamaModel
  ): Promise<Record<string, string>> {
    if (
      !transcript ||
      typeof transcript !== 'string' ||
      transcript.trim() === ''
    ) {
      throw new HttpError(
        400,
        'Transcript text is required and must be a non-empty string.',
      );
    }

    console.log('🔍 Starting SEGBOT transcript segmentation...');
    console.log('📝 Transcript length:', transcript.length);
    console.log('🔗 SEGBOT API URL:', this.segbotApiBaseUrl);

    try {
      // Send raw transcript directly to SEGBOT API
      // Let Python service handle preprocessing internally
      const response = await axios.post<Segment[]>(
        `${this.segbotApiBaseUrl}/segment`,
        { transcript }, // Send raw transcript text
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const segments = response.data;
      console.log(`✅ SEGBOT API returned ${segments.length} segments`);

      // Convert segments to the expected format using video timestamp keys
      const segmentedTranscript: Record<string, string> = {};
      
      segments.forEach((segment: Segment, index: number) => {
        // Convert seconds to MM:SS.sss format (video timestamp format)
        const startTimestamp = secondsToTimestamp(segment.start_time);
        const endTimestamp = secondsToTimestamp(segment.end_time);
        
        // Use start timestamp as the key (this matches your original format)
        const timestampKey = startTimestamp;
        
        segmentedTranscript[timestampKey] = segment.text;
        
        console.log(`📑 Segment ${timestampKey}: [${segment.start_time}s - ${segment.end_time}s] Duration: ${(segment.end_time - segment.start_time).toFixed(2)}s (${segment.text.length} chars)`);
      });

      console.log(`✅ SEGBOT segmentation completed: ${Object.keys(segmentedTranscript).length} segments`);
      return segmentedTranscript;

    } catch (error: any) {
      console.error('❌ Error in SEGBOT segmentation:', error.message);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNREFUSED') {
          throw new HttpError(
            503,
            'SEGBOT API service is unavailable. Please ensure the Python segmentation service is running.'
          );
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const errorData = axiosError.response.data;
          
          console.error('🔍 SEGBOT API Error Details:', {
            status,
            data: errorData,
          });

          throw new HttpError(
            status,
            `SEGBOT API error: ${(errorData as any)?.detail || 'Unknown error'}`
          );
        }
      }

      throw new HttpError(500, `Segmentation failed: ${error.message}`);
    }
  }

  /**
   * Check if SEGBOT API service is healthy
   */
  public async checkSegbotHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.segbotApiBaseUrl}/`, {
        timeout: 5000,
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('❌ SEGBOT API health check failed:', error);
      return false;
    }
  }

  // --- Question Generation Logic ---
  private createQuestionPrompt(
    questionType: string,
    count: number,
    transcriptContent: string,
  ): string {
    const basePrompt = `Based on the following transcript content, generate ${count} educational question(s) of type ${questionType}.

Transcript content:
${transcriptContent}

Each question should:
- Be based on the transcript content
- Have appropriate difficulty level
- Set isParameterized to false unless the question uses variables

`;

    const typeSpecificInstructions: Record<string, string> = {
      SOL: `Create SELECT_ONE_IN_LOT questions (single correct answer multiple choice):
- Clear question text
- 3-4 incorrect options with explanations
- 1 correct option with explanation
- Set timeLimitSeconds to 60 and points to 5`,

      SML: `Create SELECT_MANY_IN_LOT questions (multiple correct answers):
- Clear question text
- 2-3 incorrect options with explanations
- 2-3 correct options with explanations
- Set timeLimitSeconds to 90 and points to 8`,

      OTL: `Create ORDER_THE_LOTS questions (ordering/sequencing):
- Clear question text asking to order items
- 3-5 items that need to be ordered correctly
- Each item should have text and explanation
- Order should be numbered starting from 1
- Set timeLimitSeconds to 120 and points to 10`,

      NAT: `Create NUMERIC_ANSWER_TYPE questions (numerical answers):
- Clear question text requiring a numerical answer
- Appropriate decimal precision (0-3)
- Realistic upper and lower limits for the answer
- Either a specific value or expression for the solution
- Set timeLimitSeconds to 90 and points to 6`,

      DES: `Create DESCRIPTIVE questions (text-based answers):
- Clear question text requiring explanation or description
- Detailed solution text that demonstrates the expected answer
- Questions that test understanding of concepts from the transcript
- Set timeLimitSeconds to 300 and points to 15`,
    };

    return (
      basePrompt +
      (typeSpecificInstructions[questionType] ||
        `Generate question of type ${questionType}.`)
    );
  }

  public async generateQuestions(args: {
    segments: Record<string | number, string>;
    globalQuestionSpecification: Array<Record<string, number>>;
    model?: string;
  }): Promise<GeneratedQuestion[]> {
    const {segments, globalQuestionSpecification, model = llmConfig.ollamaModel || 'deepseek-r1:70b'} = args;

    if (
      !segments ||
      typeof segments !== 'object' ||
      Object.keys(segments).length === 0
    ) {
      throw new HttpError(
        400,
        'segments is required and must be a non-empty object with segmentId as keys and transcript as values.',
      );
    }
    if (
      !globalQuestionSpecification ||
      !Array.isArray(globalQuestionSpecification) ||
      globalQuestionSpecification.length === 0 ||
      !globalQuestionSpecification[0] ||
      typeof globalQuestionSpecification[0] !== 'object' ||
      Object.keys(globalQuestionSpecification[0]).length === 0
    ) {
      throw new HttpError(
        400,
        'globalQuestionSpecification is required and must be a non-empty array with a non-empty object defining question types and counts.',
      );
    }

    const allGeneratedQuestions: GeneratedQuestion[] = [];
    console.log(`Using model: ${model} for question generation.`);

    const questionSpecs = globalQuestionSpecification[0];

    // Process each segment
    for (const segmentId in segments) {
      if (Object.prototype.hasOwnProperty.call(segments, segmentId)) {
        const segmentTranscript = segments[segmentId];

        if (!segmentTranscript) {
          console.warn(`No transcript found for segment ${segmentId}. Skipping.`);
          continue;
        }

        console.log(`Processing segment ${segmentId} with global specs:`, questionSpecs);

        // Generate questions for each type based on globalQuestionSpecification
        for (const [questionType, count] of Object.entries(questionSpecs)) {
          if (typeof count === 'number' && count > 0) {
            try {
                // Build schema for structured output
                let format: any;
                const baseSchema = (questionSchemas as any)[questionType];
                if (baseSchema) {
                  if (count === 1) {
                    format = baseSchema;
                  } else {
                    format = {
                      type: 'array',
                      items: baseSchema,
                      minItems: count,
                      maxItems: count,
                    };
                  }
                }

              const prompt = this.createQuestionPrompt(
                questionType,
                count,
                segmentTranscript,
              );

              console.log(`🚀 Starting AI generation for ${count} ${questionType} questions in segment ${segmentId}...`);

              const response = await axios.post(
                `${this.ollimaApiBaseUrl}/generate`,
                {
                  model,
                  prompt,
                  stream: false,
                  format: format || undefined,
                  options: {temperature: 0},
                },
              );

              if (response.data && typeof response.data.response === 'string') {
                const generatedText = response.data.response;
                const cleanedJsonText = extractJSONFromMarkdown(generatedText);

                try {
                  const generated = JSON.parse(cleanedJsonText) as
                    | GeneratedQuestion
                    | GeneratedQuestion[];
                  const arr = Array.isArray(generated) ? generated : [generated];

                  arr.forEach(q => {
                    q.segmentId = segmentId;
                    q.questionType = questionType;
                  });

                  allGeneratedQuestions.push(...arr);
                  console.log(
                    `Generated ${arr.length} ${questionType} questions for segment ${segmentId}`,
                  );
                } catch (parseError) {
                  console.error(
                    `Error parsing JSON for ${questionType} questions in segment ${segmentId}:`,
                    parseError,
 
                  );
                }
              } else {
                console.warn(
                  `No response data or response.response is not a string for ${questionType} in segment ${segmentId}. Response:`, 
                  response.data
                );
              }
            } catch (error: any) {
              console.error(
                `Error generating ${questionType} questions for segment ${segmentId}:`,
                error.message,
              );

              if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                console.error('Ollima API Error:', {
                  status: axiosError.response?.status,
                  data: axiosError.response?.data,
                });
              }
            }
          }
        }
      }
    }

    console.log(
      `Question generation completed. Generated ${allGeneratedQuestions.length} total questions.`,
    );
    return allGeneratedQuestions;
  }
}
