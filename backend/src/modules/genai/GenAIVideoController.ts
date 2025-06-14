import {
  JsonController,
  Post,
  HttpCode,
  Req,
  Res,
  Body,
} from 'routing-controllers';
import {Service} from 'typedi';
import {Request, Response} from 'express';

import {VideoService} from './services/VideoService.js';
import {AudioService} from './services/AudioService.js';
import {TranscriptionService} from './services/TranscriptionService.js';
import {AIContentService} from './services/AIContentService.js';
import {CleanupService} from './services/CleanupService.js';
import {ItemService} from '../courses/services/ItemService.js';
import {CreateItemBody} from '../courses/classes/validators/ItemValidators.js';
import {ItemType} from '#shared/interfaces/models.js';

@Service()
@JsonController('/genai')
export default class GenAIVideoController {
  constructor(
    private videoService: VideoService,
    private audioService: AudioService,
    private transcriptionService: TranscriptionService,
    private aiContentService: AIContentService,
    private cleanupService: CleanupService,
    private itemService: ItemService,
  ) {}

  @Post('/generate/transcript')
  @HttpCode(200)
  async generateTranscript(@Req() req: Request, @Res() res: Response) {
    const tempPaths: string[] = [];

    try {
      const {youtubeUrl} = req.body;

      if (!youtubeUrl && !req.file) {
        return res.status(400).json({
          message: 'YouTube URL or PDF file is required.',
        });
      }

      let transcript = '';

      if (youtubeUrl) {
        // 1. Download video
        const videoPath = await this.videoService.downloadVideo(youtubeUrl);
        tempPaths.push(videoPath);

        // 2. Extract audio
        const audioPath = await this.audioService.extractAudio(videoPath);
        tempPaths.push(audioPath);

        // 3. Transcribe audio
        transcript = await this.transcriptionService.transcribe(audioPath);
      }

      // Handle PDF processing if file is uploaded
      if (req.file) {
        // Add PDF processing logic here if needed
        transcript += ' [PDF content processed]';
      }

      // 4. Return transcript
      return res.json({
        message: 'Transcript generation completed successfully.',
        youtubeUrl: youtubeUrl || null,
        pdfFile: req.file ? req.file.path : null,
        generatedTranscript: transcript,
      });
    } catch (err: any) {
      console.error('Error in GenAIVideoController.generateTranscript:', err);
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
    @Body() body: {transcript: string; model?: string},
    @Res() res: Response,
  ) {
    try {
      const {transcript, model} = body;

      if (
        !transcript ||
        typeof transcript !== 'string' ||
        transcript.trim() === ''
      ) {
        return res.status(400).json({
          error: 'Transcript text is required and must be a non-empty string.',
        });
      }

      const segments = await this.aiContentService.segmentTranscript(
        transcript,
        model,
      );

      return res.json({
        message: 'Transcript segmentation completed successfully.',
        segments,
        segmentCount: segments.length,
      });
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
      segments: Record<string | number, string>; // Changed from transcriptLines to segments
      segmentQuestionSpec: any[];
      model?: string;
    },
    @Res() res: Response,
  ) {
    try {
      const {segments, segmentQuestionSpec, model} = body;

      const questions = await this.aiContentService.generateQuestions({
        segments, // Changed from transcriptLines to segments
        segmentQuestionSpec,
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const {
      versionId,
      moduleId,
      sectionId,
      videoURL,
      segmentQuestionSpec, // Optional: spec for question generation
      videoItemBaseName, // Optional: base name for video segment items
      quizItemBaseName, // Optional: base name for quiz items
    } = req.body;

    if (!versionId || !moduleId || !sectionId || !videoURL) {
      return res.status(400).json({
        message: 'versionId, moduleId, sectionId, and videoURL are required.',
      });
    }

    const tempPaths: string[] = [];
    try {
      // 1. Video Processing & Transcription
      const videoPath = await this.videoService.downloadVideo(videoURL);
      tempPaths.push(videoPath);
      const audioPath = await this.audioService.extractAudio(videoPath);
      tempPaths.push(audioPath);
      const transcript = await this.transcriptionService.transcribe(audioPath);

      // 2. Segment Transcript
      const rawSegments =
        await this.aiContentService.segmentTranscript(transcript);
      const segmentsMap: Record<string, string> = Array.isArray(rawSegments)
        ? rawSegments.reduce((obj, seg, i) => {
            const key =
              typeof seg === 'object' && seg.endTime
                ? seg.endTime
                : `segment_id_${i + 1}`;
            const text = typeof seg === 'object' && seg.text ? seg.text : seg;
            return {...obj, [key]: text as string};
          }, {})
        : (rawSegments as Record<string, string>) || {};

      // 3. Generate Questions for all relevant segments
      const effectiveSegmentQuestionSpec = segmentQuestionSpec || [];
      const allQuestionsData = await this.aiContentService.generateQuestions({
        segments: segmentsMap,
        segmentQuestionSpec: effectiveSegmentQuestionSpec,
      });

      // 4. Group questions by segmentId (which is segment endTime or generated ID)
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

      // Prepare to create items for each segment that has text (even if no questions initially)
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

      const sortedSegmentIds = Object.keys(segmentsMap).sort((a, b) =>
        a.localeCompare(b),
      ); // Sort by endTime or generated ID
      let previousSegmentEndTime = '0:00:00';

      for (const currentSegmentId of sortedSegmentIds) {
        const segmentText = segmentsMap[currentSegmentId];
        const segmentStartTime = previousSegmentEndTime;
        const currentSegmentEndTime = currentSegmentId; // Assuming segmentId is the endTime or a sortable key
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
            points: 10, // 10 points for each video segment item
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

        // Create Quiz Item for the segment if questions exist for it
        const questionsForSegment =
          questionsGroupedBySegment[currentSegmentId] || [];
        if (questionsForSegment.length > 0) {
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
              questionVisibility: questionsForSegment.length,
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
          createdQuizItemsInfo.push({
            id: createdQuizItem.createdItem?._id?.toString(),
            name: quizSegName,
            segmentId: currentSegmentId,
            questionCount: questionsForSegment.length,
          });
        }
        previousSegmentEndTime = currentSegmentEndTime;
      }

      return res.json({
        message:
          'Video and Quiz items for segments generated successfully from video.',
        videoURL,
        transcriptPreview: transcript.substring(0, 200) + '...',
        generatedItemsSummary: {
          totalSegmentsProcessed: sortedSegmentIds.length,
          totalVideoItemsCreated: createdVideoItemsInfo.length,
          totalQuizItemsCreated: createdQuizItemsInfo.length,
          totalQuestionsGenerated: allQuestionsData?.length || 0,
        },
        createdVideoItems: createdVideoItemsInfo,
        createdQuizItems: createdQuizItemsInfo,
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
