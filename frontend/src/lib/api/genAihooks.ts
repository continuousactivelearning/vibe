import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: "http://localhost:3000/api/genai", // Set your API base URL if needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Centralized error handling function
const handleApiError = (error: any, message: string) => {
  console.error(error);
  toast.error(message);
};

type TranscriptResponse = {
  message: string;
  youtubeUrl: string;
  generatedTranscript: string;
};
type TranscriptInput = { youtubeUrl: string };

export function useGenerateTranscript(
  onSuccess: (data: TranscriptResponse) => void,
  onError?: (error: any) => void
) {
  return useMutation<TranscriptResponse, unknown, FormData | TranscriptInput>({
    mutationFn: async (input) => {
      try {
        const isFormData = input instanceof FormData;
        const response = await api.post<TranscriptResponse>(
          "/generate/transcript",
          input,
          {
            headers: {
              "Content-Type": isFormData
                ? "multipart/form-data"
                : "application/json",
            },
          }
        );
        return response.data;
      } catch (error: any) {
        handleApiError(error, "Failed to generate transcript");
        throw error;
      }
    },
    onSuccess,
    onError,
  });
}

type SegmentResponse = {
  message: string;
  segments: Record<string, string>;
  segmentCount: number;
};

export function useSegmentTranscript(
  onSuccess: (segment: SegmentResponse) => void,
  onError?: (error: any) => void
) {
  return useMutation<SegmentResponse, unknown, { transcript: string }>({
    mutationFn: async ({ transcript }) => {
      const response = await api.post<SegmentResponse>("/generate/transcript/segment", {
        transcript,
      });
      return response.data;
    },
    onSuccess,
    onError,
  });
}

type GenerateQuestionsInput = {
  segments: Record<string, string>;
  questionsPerSegment?: number;
  model?: string;
};
type GenerateQuestionsResponse = {
  message: string;
  totalQuestions: number;
  questions: string[];
};

export function useGenerateQuestions(
  onSuccess: (questions: string[]) => void,
  onError?: (error: any) => void
) {
  return useMutation<GenerateQuestionsResponse, unknown, GenerateQuestionsInput>({
    mutationFn: async ({segments, questionsPerSegment = 2, model }) => {
      try {
        const response = await api.post<GenerateQuestionsResponse>("/generate/questions", {
          segments,
          globalQuestionSpecification: [{ count: questionsPerSegment }],
          model,
        });
        return response.data;
      } catch (error: any) {
        handleApiError(error, "Failed to generate questions");
        throw error;
      }
    },
    onSuccess: (data) => onSuccess(data.questions), // only pass questions to UI
    onError,
  });
}
