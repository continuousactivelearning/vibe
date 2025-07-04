import {
  JsonController,
  Post,
  HttpCode,
  Req,
  Res,
  Body,
} from 'routing-controllers';
import {injectable, inject} from 'inversify';
import {Request, Response} from 'express';
import axios from 'axios';

import {VideoService} from './services/VideoService.js';
import {AudioService} from './services/AudioService.js';
import {TranscriptionService} from './services/TranscriptionService.js';
import {AIContentService} from './services/AIContentService.js';
import {CleanupService} from './services/CleanupService.js';
import {ItemService} from '../courses/services/ItemService.js';
import {COURSES_TYPES} from '../courses/types.js';
import {QUIZZES_TYPES} from '../quizzes/types.js';
import {QuestionBankService} from '../quizzes/services/QuestionBankService.js';
import {QuestionService} from '../quizzes/services/QuestionService.js';
import {QuizService} from '../quizzes/services/QuizService.js';
import {QuestionBank} from '../quizzes/classes/transformers/QuestionBank.js';
import {BaseQuestion, QuestionFactory} from '../quizzes/classes/transformers/Question.js';
import {CreateItemBody} from '../courses/classes/validators/ItemValidators.js';
import {ItemType} from '#shared/interfaces/models.js';

@injectable()
@JsonController('/genai')
export default class GenAIVideoController {
  constructor(
    private videoService: VideoService,
    private audioService: AudioService,
    private transcriptionService: TranscriptionService,
    private aiContentService: AIContentService,
    private cleanupService: CleanupService,
    @inject(COURSES_TYPES.ItemService) private itemService: ItemService,
    @inject(QUIZZES_TYPES.QuestionBankService)
    private questionBankService: QuestionBankService,
    @inject(QUIZZES_TYPES.QuestionService)
    private questionService: QuestionService,
    @inject(QUIZZES_TYPES.QuizService) private quizService: QuizService,
  ) {}

  @Post('/generate/transcript')
  @HttpCode(200)
  async generateTranscript(
    @Body() body: {youtubeUrl: string; language?: string},
    @Res() res: Response,
  ) {
    const tempPaths: string[] = [];

    try {
      const {youtubeUrl, language} = body;

      if (!youtubeUrl) {
        return res.status(400).json({
          message: 'YouTube URL is required.',
        });
      }

      let transcriptionResult: any = null;

      if (youtubeUrl) {
        // 1. Download video
        const videoPath = await this.videoService.downloadVideo(youtubeUrl);
        tempPaths.push(videoPath);

        // 2. Extract audio
        const audioPath = await this.audioService.extractAudio(videoPath);
        tempPaths.push(audioPath);

        // 3. Transcribe audio using the new method that creates JSON files
        transcriptionResult = await this.transcriptionService.transcribeAudio(audioPath, language);
        
        // Add JSON file to cleanup if it was created
        if (transcriptionResult.jsonFilePath) {
          tempPaths.push(transcriptionResult.jsonFilePath);
        }
      }

      // 4. Return transcript with JSON file information
      return res.json({
        message: 'Transcript generation completed successfully.',
        youtubeUrl: youtubeUrl || null,
        text: transcriptionResult.text, // Full transcript text
        chunks: transcriptionResult.chunks, // Segments with timestamp arrays
        jsonFilePath: transcriptionResult.jsonFilePath, // Path to saved JSON file
      });
    } catch (err: any) {
      return res
        .status(err.status || 500)
        .json({message: err.message || 'Internal Server Error'});
    } finally {
      // 5. Cleanup temporary files
      await this.cleanupService.cleanup(tempPaths);
    }
  }

  @Post('/generate/transcript/segment')
  @HttpCode(200)
  async segmentTranscript(
    @Body() body: {transcript: string; model?: string; lam?: number},
    @Res() res: Response,
  ) {
    try {
      const {transcript, lam = 3.0} = body;

      if (
        !transcript ||
        typeof transcript !== 'string' ||
        transcript.trim() === ''
      ) {
        return res.status(400).json({
          error: 'Transcript text is required and must be a non-empty string.',
        });
      }

      // Create a temporary JSON file with transcript chunks
      // For backwards compatibility, we'll create chunks from the raw transcript
      const tempJsonData = {
        text: transcript,
        chunks: transcript.split('.').map((sentence, index) => ({
          text: sentence.trim(),
          timestamp: [index * 5, (index + 1) * 5] // Mock timestamps
        })).filter(chunk => chunk.text.length > 0)
      };

      const fs = require('fs');
      const path = require('path');
      const tempFilePath = path.join('/tmp', `transcript_${Date.now()}.json`);
      
      fs.writeFileSync(tempFilePath, JSON.stringify(tempJsonData));

      try {
        // Call the Fast_Api segmentation service
        const segmentationResponse = await axios.post(
          'http://127.0.0.1:8000/segment-transcript',
          { 
            file_path: tempFilePath,
            lam: lam
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000,
          }
        );

        const segments = segmentationResponse.data.segments || {};
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        return res.json({
          message: 'Transcript segmentation completed successfully.',
          segments,
          segmentCount: Object.keys(segments).length,
        });
      } catch (segError) {
        // Clean up temp file on error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        throw segError;
      }
    } catch (err: any) {
      console.error('Error in GenAIVideoController.segmentTranscript:', err);
      return res
        .status(err.status || 500)
        .json({error: err.message || 'Error segmenting transcript'});
    }
  }

  @Post('/generate/questions')
  @HttpCode(200)
  async generateQuestions(
    @Body()
    body: {
      segments: Record<string | number, string>; 
      globalQuestionSpecification: any[]; 
      model?: string;
    },
    @Res() res: Response,
  ) {
    try {
      const {segments, globalQuestionSpecification, model} = body; 

      const questions = await this.aiContentService.generateQuestions({
        segments, 
        globalQuestionSpecification, 
        model,
      });

      return res.json({
        message: 'Questions generation completed successfully.',
        totalQuestions: questions.length,
        questions,
      });
    } catch (err: any) {
      console.error('Error in GenAIVideoController.generateQuestions:', err);
      return res
        .status(err.status || 500)
        .json({error: err.message || 'Error generating questions'});
    }
  }

  @Post('/generate-course-items-from-video')
  @HttpCode(200)
  async generateCourseItemsFromVideo(
    @Body()
    body: {
      versionId: string;
      moduleId: string;
      sectionId: string;
      courseId: string;
      videoURL: string;
      numQues?: number;
      globalQuestionSpecification?: {
        SOL?: number;
        SML?: number;
        OTL?: number;
        NAT?: number;
        DES?: number;
      };
      videoItemBaseName?: string;
      quizItemBaseName?: string;
      questionBankOptions?: {
        count: number;
        difficulty?: string[];
        tags?: string[];
      };
      lam?: number; // Add lambda parameter for segmentation
    },
    @Res() res: Response,
  ) {
    const {
      versionId,
      moduleId,
      sectionId,
      courseId,
      videoURL,
      globalQuestionSpecification,
      videoItemBaseName,
      quizItemBaseName,
      questionBankOptions,
      numQues,
      lam = 3.3, // Default lambda value
    } = body;

    if (!versionId || !moduleId || !sectionId || !videoURL || !courseId) {
      return res.status(400).json({
        message: 'versionId, moduleId, sectionId, courseId, and videoURL are required.',
      });
    }

    const tempPaths: string[] = [];
    try {
      // 1. Video Processing & Transcription
      const videoPath = await this.videoService.downloadVideo(videoURL);
      tempPaths.push(videoPath);
      const audioPath = await this.audioService.extractAudio(videoPath);
      tempPaths.push(audioPath);
      const transcriptionResult = await this.transcriptionService.transcribeAudio(audioPath);
      
      // Add JSON file to cleanup if it was created
      if (transcriptionResult.jsonFilePath) {
        tempPaths.push(transcriptionResult.jsonFilePath);
      }

      // 2. Segment Transcript using Fast_Api service
      let segmentsMap: Record<string, string> = {};
      
      if (transcriptionResult.jsonFilePath) {
        console.log('🔍 Using Fast_Api segmentation service with JSON file...');
        try {
          const segmentationResponse = await axios.post(
            'http://127.0.0.1:8000/segment-transcript',
            { 
              file_path: transcriptionResult.jsonFilePath,
              lam: lam
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 60000,
            }
          );
          
          segmentsMap = segmentationResponse.data.segments || {};
          console.log(`✅ Fast_Api segmentation completed: ${Object.keys(segmentsMap).length} segments`);
          
        } catch (segmentationError: any) {
          console.error('❌ Error in Fast_Api segmentation service:', segmentationError.message);
          
          // Fallback: create a single segment with the entire transcript
          console.log('📝 Fallback: Using entire transcript as single segment');
          const lastChunkEndTime = transcriptionResult.chunks && transcriptionResult.chunks.length > 0 
            ? transcriptionResult.chunks[transcriptionResult.chunks.length - 1].timestamp[1]
            : 0;
          segmentsMap = {
            [lastChunkEndTime.toString()]: transcriptionResult.text
          };
        }
      } else {
        // Fallback: create a single segment with the entire transcript
        console.log('📝 No JSON file available, using entire transcript as single segment');
        segmentsMap = {
          '0': transcriptionResult.text
        };
      }
      
      console.log('Debug: Received segments from Fast_Api segmentation service:', Object.keys(segmentsMap));

      // 3. Generate Questions for all relevant segments
      const transformedGlobalQuestionSpec = [globalQuestionSpecification || {}];

      const allQuestionsData = await this.aiContentService.generateQuestions({
        segments: segmentsMap,
        globalQuestionSpecification: transformedGlobalQuestionSpec,
      });

      // 4. Group questions by segmentId
      const questionsGroupedBySegment: Record<string, any[]> = {};
      if (Array.isArray(allQuestionsData)) {
        for (const question of allQuestionsData) {
          const segId = (question as any).segmentId;
          if (segId && segmentsMap[segId]) {
            if (!questionsGroupedBySegment[segId]) {
              questionsGroupedBySegment[segId] = [];
            }
            questionsGroupedBySegment[segId].push(question);
          } else {
            console.warn(
              `Question found without a valid segmentId ("${segId}") or segmentId not in segmentsMap.`,
              question,
            );
          }
        }
      }

      // Prepare tracking arrays
      const createdVideoItemsInfo: Array<{
        id?: string;
        name: string;
        segmentId: string;
        startTime: string;
        endTime: string;
        points: number;
      }> = [];
      const createdQuizItemsInfo: Array<{
        id?: string;
        name: string;
        segmentId: string;
        questionCount: number;
      }> = [];
      const createdQuestionBanksInfo: Array<{
        id: string;
        name: string;
        segmentId: string;
        questionCount: number;
        questionIds: string[];
      }> = [];

      // Helper function to convert time strings (like "5:15" or "1:02:30") to seconds for correct sorting
      const timeToSeconds = (timeStr: string): number => {
        const parts = timeStr.split(':').map(Number).reverse(); // [ss, mm, hh]
        let seconds = 0;
        if (parts[0]) seconds += parts[0]; // seconds
        if (parts[1]) seconds += parts[1] * 60; // minutes
        if (parts[2]) seconds += parts[2] * 3600; // hours
        return seconds;
      };

      const sortedSegmentIds = Object.keys(segmentsMap).sort((a, b) =>
        timeToSeconds(a) - timeToSeconds(b)
      );
      let previousSegmentEndTime = '0:00:00';

      for (const currentSegmentId of sortedSegmentIds) {
        const segmentText = segmentsMap[currentSegmentId];
        const segmentStartTime = previousSegmentEndTime;
        const currentSegmentEndTime = currentSegmentId;
        const segmentTextPreview = segmentText
          ? segmentText.substring(0, 70) +
            (segmentText.length > 70 ? '...' : '')
          : 'No content';

        // Create Video Item for the segment
        const videoSegName = videoItemBaseName
          ? `${videoItemBaseName} - Segment (${segmentStartTime} - ${currentSegmentEndTime})`
          : `Video Segment (${segmentStartTime} - ${currentSegmentEndTime})`;

        const videoItemBody: CreateItemBody = {
          name: videoSegName,
          description: `Video content for segment: ${segmentStartTime} - ${currentSegmentEndTime}. ${segmentTextPreview}`,
          type: ItemType.VIDEO,
          videoDetails: {
            URL: videoURL,
            startTime: segmentStartTime,
            endTime: currentSegmentEndTime,
            points: 10,
          },
        };
                const createdVideoItem = await this.itemService.createItem(
          versionId,
          moduleId,
          sectionId,
          videoItemBody,
        );
                createdVideoItemsInfo.push({
          id: createdVideoItem.createdItem?._id?.toString(),
          name: videoSegName,
          segmentId: currentSegmentId,
          startTime: segmentStartTime,
          endTime: currentSegmentEndTime,
          points: 10,
        });

        // Create Question Bank and Questions for the segment
        const questionsForSegment = questionsGroupedBySegment[currentSegmentId] || [];
        if (questionsForSegment.length > 0) {
                    // Create Question Bank for this segment
          const questionBankName = `Question Bank - Segment (${segmentStartTime} - ${currentSegmentEndTime})`;
          const questionBank = new QuestionBank({
            title: questionBankName,
            description: `Question bank for video segment from ${segmentStartTime} to ${currentSegmentEndTime}. Content: "${segmentTextPreview}"`,
            courseId: courseId,
            courseVersionId: versionId,
            questions: [], // Will be populated after creating questions
            tags: [`segment_${currentSegmentId}`, 'ai_generated'],
          });

          const questionBankId = await this.questionBankService.create(questionBank);

          // Create individual questions and add them to the question bank
          const createdQuestionIds: string[] = [];
          for (const questionData of questionsForSegment) {
            try {
              // Validate and truncate hint if it's too long
              let hint = questionData.question.hint;
              const MAX_HINT_LENGTH = 80; // Maximum hint length in characters
              
              if (hint && typeof hint === 'string' && hint.length > MAX_HINT_LENGTH) {
                // Truncate hint and add ellipsis
                hint = hint.substring(0, MAX_HINT_LENGTH - 3) + '...';
                console.log(`Hint truncated for question in segment ${currentSegmentId}: Original length ${questionData.question.hint.length}, truncated to ${hint.length}`);
              }

              // Prepare the question data object for creation
              const questionPayload = {
                text: questionData.question.text,
                type: questionData.question.type, 
                isParameterized: questionData.question.isParameterized,
                parameters: questionData.question.parameters || [],
                hint: hint, // Use the validated/truncated hint
                timeLimitSeconds: questionData.question.timeLimitSeconds,
                points: questionData.question.points,
                solution: questionData.solution, 
                tags: [`segment_${currentSegmentId}`, 'ai_generated', questionData.question.type.toLowerCase()],
              };
              const questionnew=QuestionFactory.createQuestion({question: questionData.question,solution: questionData.solution});

              const questionId = await this.questionService.create(questionnew);
              createdQuestionIds.push(questionId);

              // Add question to the question bank
              await this.questionBankService.addQuestion(questionBankId, questionId);
            } catch (questionError) {
              console.warn(`Failed to create question for segment ${currentSegmentId}:`, questionError);
            }
          }

          createdQuestionBanksInfo.push({
            id: questionBankId,
            name: questionBankName,
            segmentId: currentSegmentId,
            questionCount: createdQuestionIds.length,
            questionIds: createdQuestionIds,
          });

          // Create Quiz Item (this will be added immediately after the video item)
          const quizSegName = quizItemBaseName
            ? `${quizItemBaseName} - Segment Quiz (${segmentStartTime} - ${currentSegmentEndTime})`
            : `Quiz for Segment (${segmentStartTime} - ${currentSegmentEndTime})`;

          const quizItemBody: CreateItemBody = {
            name: quizSegName,
            description: `Quiz for video segment from ${segmentStartTime} to ${currentSegmentEndTime}. Content: "${segmentTextPreview}". This quiz's points are based on its questions.`,
            type: ItemType.QUIZ,
            quizDetails: {
              passThreshold: 0.7,
              maxAttempts: 1000,
              quizType: 'NO_DEADLINE',
              approximateTimeToComplete: '00:05:00',
              allowPartialGrading: true,
              allowHint: true,
              showCorrectAnswersAfterSubmission: true,
              showExplanationAfterSubmission: true,
              showScoreAfterSubmission: true,
              questionVisibility: createdQuestionIds.length,
              releaseTime: new Date(),
              deadline: undefined,
            },
          };
          
          const createdQuizItem = await this.itemService.createItem(
            versionId,
            moduleId,
            sectionId,
            quizItemBody,
          );

          // Link the QuestionBank to the Quiz
          const quizId = createdQuizItem.createdItem?._id?.toString();
          if (quizId && questionBankId) {
            try {
              await this.quizService.addQuestionBank(quizId, {
                bankId: questionBankId,
                count:
                  numQues ??
                  questionBankOptions?.count ??
                  createdQuestionIds.length,
                difficulty: questionBankOptions?.difficulty,
                tags: questionBankOptions?.tags,
              });
            } catch (linkError) {
              console.warn(
                `Failed to link question bank ${questionBankId} to quiz ${quizId}:`,
                linkError,
              );
            }
          }

          createdQuizItemsInfo.push({
            id: createdQuizItem.createdItem?._id?.toString(),
            name: quizSegName,
            segmentId: currentSegmentId,
            questionCount: createdQuestionIds.length,
          });
        }
        
        previousSegmentEndTime = currentSegmentEndTime;
              }

      return res.json({
        message:
          'Video items, Quiz items, and Question banks for segments generated successfully from video.',
        videoURL,
        transcriptPreview: transcriptionResult.text.substring(0, 200) + '...',
        generatedItemsSummary: {
          totalSegmentsProcessed: sortedSegmentIds.length,
          totalVideoItemsCreated: createdVideoItemsInfo.length,
          totalQuizItemsCreated: createdQuizItemsInfo.length,
          totalQuestionBanksCreated: createdQuestionBanksInfo.length,
          totalQuestionsGenerated: createdQuestionBanksInfo.reduce((sum, bank) => sum + bank.questionCount, 0),
        },
        createdVideoItems: createdVideoItemsInfo,
        createdQuizItems: createdQuizItemsInfo,
        createdQuestionBanks: createdQuestionBanksInfo,
      });
    } catch (err: any) {
      console.error(
        'Error in GenAIVideoController.generateCourseItemsFromVideo:',
        err,
      );
      return res
        .status(err.status || 500)
        .json({message: err.message || 'Internal Server Error'});
    } finally {
      // 6. Cleanup temporary files
      await this.cleanupService.cleanup(tempPaths);
    }
  }
}
