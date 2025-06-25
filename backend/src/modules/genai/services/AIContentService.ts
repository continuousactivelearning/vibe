import axios, { AxiosError } from 'axios';
import { injectable } from 'inversify';
import { HttpError, InternalServerError } from 'routing-controllers';
import { preprocessTranscriptForAnalysis } from '../utils/transcriptPreprocessor.js';
import { questionSchemas } from '../schemas/index.js';
import { extractJSONFromMarkdown } from '../utils/extractJSONFromMarkdown.js';
import { 
  createTimeBasedWindows, 
  createTokenBasedWindows, 
  detectTopicBoundaries, 
  createSegmentsFromBoundaries,
  TranscriptWindow,
  LabeledWindow 
} from '../utils/windowSegmentation.js';

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
  private readonly ollimaApiBaseUrl = 'http://100.100.108.12:11434/api';

  public async segmentTranscript(
    transcript: string,
    model = 'deepseek-r1:70b'
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

    console.log('🔍 Starting change-detection transcript segmentation...');
    console.log('📝 Transcript length:', transcript.length);

    try {
      // STAGE 1: Change detection at minute intervals
      console.log('🔄 Stage 1: Detecting topic changes at minute intervals...');
      const boundaries: string[] = [];
      
      // Get the transcript duration and determine minute boundaries
      const lines = transcript.split('\n').filter(line => line.trim());
      const timestampRegex = /^\[(\d{2}):(\d{2})\.\d{3}\s+-->\s+(\d{2}):(\d{2})\.\d{3}\]/;
      
      // Find the last timestamp to determine total duration
      let maxMinutes = 0;
      for (const line of lines) {
        const match = line.match(timestampRegex);
        if (match) {
          const endMinutes = parseInt(match[3]);
          const endSeconds = parseInt(match[4]);
          const totalMinutes = endMinutes + (endSeconds >= 30 ? 1 : 0);
          maxMinutes = Math.max(maxMinutes, totalMinutes);
        }
      }
      
      console.log(`🔧 DEBUG: Video duration is ${maxMinutes} minutes - processing entire video`);
      
      // Check for topic changes at each minute boundary (01:00, 02:00, 03:00, etc.)
      for (let minute = 1; minute <= maxMinutes; minute++) {
        const minuteTimestamp = `${minute.toString().padStart(2, '0')}:00`;
        console.log(`🔧 DEBUG: Checking topic change at ${minuteTimestamp} (${minute}/${maxMinutes})`);
        
        // Get content before and after this minute mark
        const beforeLines: string[] = [];
        const afterLines: string[] = [];
        
        for (const line of lines) {
          const match = line.match(timestampRegex);
          if (match) {
            const startMinutes = parseInt(match[1]);
            const startSeconds = parseInt(match[2]);
            const lineTimeInSeconds = startMinutes * 60 + startSeconds;
            const boundaryTimeInSeconds = minute * 60;
            
            // Include lines within 30 seconds before/after the minute mark
            if (lineTimeInSeconds >= boundaryTimeInSeconds - 30 && lineTimeInSeconds < boundaryTimeInSeconds) {
              beforeLines.push(line);
            } else if (lineTimeInSeconds >= boundaryTimeInSeconds && lineTimeInSeconds < boundaryTimeInSeconds + 30) {
              afterLines.push(line);
            }
          }
        }
        
        // Skip if we don't have content on both sides
        if (beforeLines.length === 0 || afterLines.length === 0) {
          console.log(`⏭️ Skipping ${minuteTimestamp} - insufficient content`);
          continue;
        }
        
        const beforeContent = beforeLines.join('\n');
        const afterContent = afterLines.join('\n');
        const cleanedBefore = preprocessTranscriptForAnalysis(beforeContent);
        const cleanedAfter = preprocessTranscriptForAnalysis(afterContent);
        
        const changeDetectionPrompt = `Analyze this transcript content and determine if there is a significant topic change at the ${minuteTimestamp} minute mark.

BEFORE (content leading up to ${minuteTimestamp}):
${cleanedBefore}

AFTER (content starting from ${minuteTimestamp}):
${cleanedAfter}

Question: At the ${minuteTimestamp} mark, does a new technical topic begin that is clearly distinct from the previous segment??

Respond with ONLY "YES" or "NO", nothing else.

Answer:`;

        try {
          const response = await axios.post(`${this.ollimaApiBaseUrl}/generate`, {
            model: model,
            prompt: changeDetectionPrompt,
            stream: false,
            options: {
              temperature: 0.0,
            },
          });

          if (response.data && typeof response.data.response === 'string') {
            let answer = response.data.response.trim().toUpperCase();
            console.log(`🔧 DEBUG: Response for ${minuteTimestamp}:`, answer);
            
            // Extract YES/NO from response, handling <THINK> tags
            let finalAnswer = '';
            const thinkMatch = answer.match(/<THINK>[\s\S]*?<\/THINK>\s*(YES|NO)/);
            if (thinkMatch) {
              finalAnswer = thinkMatch[1];
            } else {
              // If no <THINK> tags, look for YES or NO in the response
              if (answer.includes('YES') && !answer.includes('NO')) {
                finalAnswer = 'YES';
              } else if (answer.includes('NO') && !answer.includes('YES')) {
                finalAnswer = 'NO';
              } else {
                // If both or neither, take the last line
                const lines = answer.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
                  const lastLine = lines[lines.length - 1].trim();
                  if (lastLine === 'YES' || lastLine === 'NO') {
                    finalAnswer = lastLine;
                  }
                }
              }
            }
            
            console.log(`🔧 DEBUG: Extracted answer: "${finalAnswer}"`);
            const isTopicChange = finalAnswer === 'YES';
            
            if (isTopicChange) {
              // Find the exact timestamp closest to this minute mark
              let closestTimestamp = `${minuteTimestamp}.000`;
              for (const line of afterLines) {
                const match = line.match(/^\[(\d{2}:\d{2}\.\d{3})/);
                if (match) {
                  closestTimestamp = match[1];
                  break;
                }
              }
              boundaries.push(closestTimestamp);
              console.log(`✅ Topic change detected at ${closestTimestamp}`);
            } else {
              console.log(`➡️ No topic change at ${minuteTimestamp}`);
            }
          } else {
            console.warn(`⚠️ Failed to get change detection response for ${minuteTimestamp}`);
          }
        } catch (error) {
          console.error(`❌ Error in change detection for ${minuteTimestamp}:`, error);
        }
      }

      // STAGE 2: Create segments from detected boundaries
      console.log('🔄 Stage 2: Creating segments from detected boundaries...');
      console.log(`🎯 Found ${boundaries.length} topic boundaries:`, boundaries);
      
      const segments = createSegmentsFromBoundaries(transcript, boundaries);

      console.log(`📈 Successfully created ${Object.keys(segments).length} segments`);
      console.log('🏷️ Detected boundaries:', boundaries.join(', '));

      return segments;

    } catch (error: any) {
      console.error('❌ Error in two-stage segmentation:', error.message);
      if (axios.isAxiosError(error)) {
        console.error('🔍 Ollima API Error:', {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      return {};
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
    const {segments, globalQuestionSpecification, model = 'deepseek-r1:70b'} = args;

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
