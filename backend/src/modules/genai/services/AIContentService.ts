import axios, { AxiosError } from 'axios';
import { injectable } from 'inversify';
import { HttpError, InternalServerError } from 'routing-controllers';
import { segmentTranscriptByTimes } from '../utils/segmentationHelper.js';
import { preprocessTranscriptForAnalysis } from '../utils/transcriptPreprocessor.js';
import { questionSchemas } from '../schemas/index.js';
import { extractJSONFromMarkdown } from '../utils/extractJSONFromMarkdown.js';

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
    model = 'deepseek-r1:70b',
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

    console.log('🔍 Starting transcript segmentation...');
    console.log('📝 Transcript length:', transcript.length);
    console.log('📋 First 200 chars of transcript:', transcript.substring(0, 200));

    // Preprocess transcript for better topic analysis
    const cleanedTranscript = preprocessTranscriptForAnalysis(transcript);

    const prompt = `You are analyzing a lecture transcript to identify NATURAL TOPIC BOUNDARIES.

The transcript is formatted as:
[TIMESTAMP] Content text for that section

INSTRUCTIONS:
1. Read through the content and identify where sub topics or themes change
2. Look for natural transitions: new concepts, different subjects, conclusion statements
3. Each segment should contain substantial content (minimum 5 minutes)
4. Return the END timestamps where topics naturally conclude

REQUIREMENTS:
- Only break at genuine topic changes, not arbitrary time intervals
- Minimum 5-minute gaps between segments
- return the timestamps in format as shown in brackets
- Include the final timestamp as the last segment boundary

For the transcript below, identify where topics naturally transition and return ONLY the END timestamps of each topic section as a JSON array.

TRANSCRIPT:
${cleanedTranscript}

Return JSON array of topic boundary timestamps:`;

    try {
      console.log('🤖 Calling AI model for end times...');
      const response = await axios.post(`${this.ollimaApiBaseUrl}/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.0,
        },
      });

      if (response.data && typeof response.data.response === 'string') {
        const generatedText = response.data.response;
        console.log('✅ AI response received for end times');
        console.log('📋 Raw AI response:', generatedText);

        try {
          let endTimes = JSON.parse(generatedText);

          // Handle different response formats from the LLM
          if (typeof endTimes === 'object' && endTimes !== null && !Array.isArray(endTimes)) {
            // Handle object with array property
            const keys = Object.keys(endTimes);
            const arrayKey = keys.find(key => Array.isArray(endTimes[key]));
            if (arrayKey) {
              console.log(`Found end times array under key: '${arrayKey}'`);
              const extractedArray = endTimes[arrayKey];

              // Check if the array contains objects with a 'timestamp' key
              if (
                Array.isArray(extractedArray) &&
                extractedArray.length > 0 &&
                typeof extractedArray[0] === 'object' &&
                extractedArray[0] !== null &&
                'timestamp' in extractedArray[0]
              ) {
                console.log('🤖 Array contains objects with timestamps. Extracting...');
                endTimes = extractedArray.map((item: any) => item.timestamp.toString());
                console.log('✅ Extracted timestamps:', endTimes);
              } else {
                endTimes = extractedArray;
              }
            } else {
              throw new Error('AI returned object without timestamp array');
            }
          }

          if (!Array.isArray(endTimes) || !endTimes.every(t => typeof t === 'string')) {
            console.error('❌ LLM did not return a valid JSON array of strings for end times.');
            console.error('🔍 Received data type:', typeof endTimes);
            console.error('🔍 Is array?:', Array.isArray(endTimes));
            console.error('🔍 Raw response:', generatedText);
            return {};
          }

          console.log('✅ Successfully parsed end times:', endTimes);

          // Use the helper to segment the transcript
          console.log('📊 Starting transcript segmentation with helper...');
          const segmentedTranscript = segmentTranscriptByTimes(endTimes, transcript);
        
          console.log('📈 Number of segments created:', Object.keys(segmentedTranscript.segments).length);
          
          return segmentedTranscript.segments;
        } catch (parseError: any) {
          console.error('❌ Failed to parse LLM response as JSON:', parseError.message);
          console.error('🔍 Raw response that failed to parse:', generatedText);
          return {};
        }
      } else {
        console.error('❌ LLM response was empty or in an invalid format.');
        console.error('🔍 Response data:', response.data);
        throw new InternalServerError('LLM response was empty or in an invalid format.');
      }
    } catch (error: any) {
      console.error('❌ Error in segmentation:', error.message);
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
