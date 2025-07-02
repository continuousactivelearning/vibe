import {
  JsonController,
  Post,
  HttpCode,
  Res,
  Body,
} from 'routing-controllers';
import {injectable, inject} from 'inversify';
import {Response} from 'express';
import axios from 'axios';

import {VideoService} from './services/VideoService.js';
import {AudioService} from './services/AudioService.js';
import {TranscriptionService} from './services/TranscriptionService.js';
import {AIContentService} from './services/AIContentService.js';
import {CleanupService} from './services/CleanupService.js';
import {COURSES_TYPES} from '../courses/types.js';
import {ItemService} from '../courses/services/ItemService.js';
import {ModuleService} from '../courses/services/ModuleService.js';
import {SectionService} from '../courses/services/SectionService.js';
import {QUIZZES_TYPES} from '../quizzes/types.js';
import {QuestionBankService} from '../quizzes/services/QuestionBankService.js';
import {QuestionService} from '../quizzes/services/QuestionService.js';
import {QuizService} from '../quizzes/services/QuizService.js';
import {CreateModuleBody} from '../courses/classes/validators/ModuleValidators.js';
import {CreateSectionBody} from '../courses/classes/validators/SectionValidators.js';
import {CreateItemBody} from '../courses/classes/validators/ItemValidators.js';
import {QuestionBank} from '../quizzes/classes/transformers/QuestionBank.js';
import {BaseQuestion, QuestionFactory} from '../quizzes/classes/transformers/Question.js';
import {ItemType} from '#shared/interfaces/models.js';

@injectable()
@JsonController('/genai-playlist')
export default class GenAIPlaylistController {
  constructor(
    private videoService: VideoService,
    private audioService: AudioService,
    private transcriptionService: TranscriptionService,
    private aiContentService: AIContentService,
    private cleanupService: CleanupService,
    @inject(COURSES_TYPES.ItemService) private itemService: ItemService,
    @inject(COURSES_TYPES.ModuleService) private moduleService: ModuleService,
    @inject(COURSES_TYPES.SectionService) private sectionService: SectionService,
    @inject(QUIZZES_TYPES.QuestionBankService)
    private questionBankService: QuestionBankService,
    @inject(QUIZZES_TYPES.QuestionService)
    private questionService: QuestionService,
    @inject(QUIZZES_TYPES.QuizService) private quizService: QuizService,
  ) {}

  @Post('/generate-course-from-playlist')
  @HttpCode(200)
  async generateCourseFromPlaylist(
    @Body()
    body: {
      versionId: string;
      courseId: string;
      playlistURL: string;
      lam?: number; 
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
    },
    @Res() res: Response,
  ) {
    const {versionId, courseId, playlistURL} = body;

    try {
      const videos = await this.videoService.getPlaylistInfo(playlistURL);
      const titles = videos.map(v => v.title);

      const clusteringResponse = await axios.post(
        'http://127.0.0.1:8000/cluster-titles',
        {titles},
      );
      const modules: string[][][] = clusteringResponse.data.clusters;

      for (const moduleData of modules) {
        const moduleBody: CreateModuleBody = {
          name: `Module - ${moduleData[0][0].substring(0, 20)}...`,
          description: 'Auto-generated module from playlist.',
        };
        const newModuleResult = await this.moduleService.createModule(
          versionId,
          moduleBody,
        );
        const newModuleId = newModuleResult.modules.slice(-1)[0].moduleId.toString();
        
        console.log(`✅ Created Module: "${moduleBody.name}" with ID: ${newModuleId}`);

        for (const sectionData of moduleData) {
          const sectionBody: CreateSectionBody = {
            name: `Section - ${sectionData[0].substring(0, 20)}...`,
            description: 'Auto-generated section from playlist.',
          };
          const newSectionResult = await this.sectionService.createSection(
            versionId,
            newModuleId,
            sectionBody,
          );
          const module = newSectionResult.modules.find(m => m.moduleId.toString() === newModuleId);
          const newSectionId = module!.sections.slice(-1)[0].sectionId.toString();
          
          console.log(`  ✅ Created Section: "${sectionBody.name}" with ID: ${newSectionId} in Module: ${newModuleId}`);

          for (const videoTitle of sectionData) {
            const video = videos.find(v => v.title === videoTitle);
            if (video) {
              await this._processSingleVideo({
                ...body,
                videoURL: video.url,
                moduleId: newModuleId,
                sectionId: newSectionId,
                lam: body.lam, // Pass lam through
              });
            }
          }
        }
      }
      return res.json({
        message: 'Course generated from playlist successfully.',
      });
    } catch (error: any) {
      console.error('Error processing playlist:', error);
      return res.status(500).json({message: 'Failed to process playlist.'});
    }
  }

  private async _processSingleVideo(body: {
    versionId: string;
    moduleId: string;
    sectionId: string;
    courseId: string;
    videoURL: string;
    numQues?: number;
    lam?: number; // Lambda parameter for segmentation
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
  }) {
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
      lam = 3.3, 
    } = body;

    const tempPaths: string[] = [];

    try {
      console.log(`Processing single video: ${videoURL}`);

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

      // 2. Segment Transcript using Fast API server (as required)
      let segmentsMap: Record<string, string> = {};
      
      if (transcriptionResult.jsonFilePath) {
        try {
          console.log('🔍 Starting transcript segmentation using Fast API server...');
          
          // Call Fast API segmentation service directly
          const segmentationResponse = await axios.post(
            'http://127.0.0.1:8000/segment-transcript',
            { 
              file_path: transcriptionResult.jsonFilePath,
              lam: lam // Pass the lambda parameter
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 60000, // 60 second timeout for segmentation
            }
          );
          
          segmentsMap = segmentationResponse.data.segments || {};
          console.log(`✅ Segmentation completed: ${Object.keys(segmentsMap).length} segments`);
          
        } catch (segmentationError: any) {
          console.error('❌ Error in segmentation service:', segmentationError.message);
          
          // Fallback: create a single segment with the entire transcript
          console.log('📝 Fallback: Using entire transcript as single segment');
          // Calculate total duration from the last chunk
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
      
      console.log('Debug: Received segments from Fast API segmentation service:', Object.keys(segmentsMap));

      // 3. Generate Questions using AIContentService (as required)
      const allQuestionsData = await this.aiContentService.generateQuestions({
        segments: segmentsMap,
        globalQuestionSpecification: [globalQuestionSpecification || {}],
      });

      console.log('Generated questions data:', JSON.stringify(allQuestionsData, null, 2));

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

      // Check if any questions were generated
      const totalQuestionsGenerated = Object.values(questionsGroupedBySegment).reduce((sum, questions) => sum + questions.length, 0);
      if (totalQuestionsGenerated === 0) {
        throw new Error(`No questions were generated for video: ${videoURL}. Please check the question generation service and configuration.`);
      }

      // Helper function to convert decimal seconds to HH:MM:SS format
      const secondsToTimestamp = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      // Helper function to convert time strings to seconds for correct sorting
      const timeToSeconds = (timeStr: string): number => {
        // Handle both decimal (65.14) and timestamp (00:01:05) formats
        if (timeStr.includes(':')) {
          const parts = timeStr.split(':').map(Number).reverse(); // [ss, mm, hh]
          let seconds = 0;
          if (parts[0]) seconds += parts[0]; // seconds
          if (parts[1]) seconds += parts[1] * 60; // minutes
          if (parts[2]) seconds += parts[2] * 3600; // hours
          return seconds;
        } else {
          // Handle decimal format like "65.14"
          return parseFloat(timeStr);
        }
      };

      const sortedSegmentIds = Object.keys(segmentsMap).sort((a, b) =>
        timeToSeconds(a) - timeToSeconds(b)
      );
      let previousSegmentEndTime = '00:00:00';

      for (const currentSegmentId of sortedSegmentIds) {
        const segmentText = segmentsMap[currentSegmentId];
        const segmentStartTime = previousSegmentEndTime;
        
        // Convert decimal timestamp to HH:MM:SS format for video items
        const currentSegmentEndTime = currentSegmentId.includes(':') ? currentSegmentId : secondsToTimestamp(parseFloat(currentSegmentId));
        
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

        // Create Question Bank and Questions for the segment
        const questionsForSegment = questionsGroupedBySegment[currentSegmentId] || [];
        console.log(`Found ${questionsForSegment.length} questions for segment ${currentSegmentId}`);
        if (questionsForSegment.length > 0) {
          console.log(`Creating quiz for segment ${currentSegmentId}`);
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
              const questionnew = QuestionFactory.createQuestion({
                question: questionData.question,
                solution: questionData.solution
              });

              const questionId = await this.questionService.create(questionnew);
              createdQuestionIds.push(questionId);

              // Add question to the question bank
              await this.questionBankService.addQuestion(questionBankId, questionId);
            } catch (questionError) {
              console.warn(`Failed to create question for segment ${currentSegmentId}:`, questionError);
            }
          }

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
              maxAttempts: 3,
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
        }
        
        previousSegmentEndTime = currentSegmentEndTime;
      }

      console.log(`Successfully processed video: ${videoURL}`);
    } catch (error) {
      console.error(`Error processing single video ${videoURL}:`, error);
      throw error;
    } finally {
      // Cleanup downloaded files
      await this.cleanupService.cleanup(tempPaths);
    }
  }
}
