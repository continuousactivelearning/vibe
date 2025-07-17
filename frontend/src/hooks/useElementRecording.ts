import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';

export interface ElementRecordingConfig {
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  mimeType?: string;
  timeSlice?: number;
  frameRate?: number;
  captureAudio?: boolean;
}

export interface ElementRecordingData {
  blob: Blob;
  duration: number;
  timestamp: number;
  size: number;
}

export interface UseElementRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  recordingData: ElementRecordingData | null;
  error: string | null;
  startRecording: (element: HTMLElement) => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  isSupported: boolean;
}

const DEFAULT_CONFIG: ElementRecordingConfig = {
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000,  // 128 kbps
  mimeType: 'video/webm;codecs=vp9,opus',
  timeSlice: 1000, // 1 second chunks
  frameRate: 30,
  captureAudio: false, // We'll handle audio separately if needed
};

export const useElementRecording = (config: ElementRecordingConfig = {}): UseElementRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingData, setRecordingData] = useState<ElementRecordingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Check if the browser supports the required APIs
  const isSupported = typeof MediaRecorder !== 'undefined' && 
                     typeof HTMLCanvasElement !== 'undefined' &&
                     HTMLCanvasElement.prototype.captureStream !== undefined;

  // Start timer for recording duration
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setRecordingTime(elapsed);
    }, 1000);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Capture element to canvas using html2canvas
  const captureElementToCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const element = targetElementRef.current;

    if (!canvas || !context || !element) return;

    try {
      // Use html2canvas to capture the element
      const capturedCanvas = await html2canvas(element, {
        backgroundColor: null,
        allowTaint: true,
        useCORS: true,
        scale: 1,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Get element's bounding rect
      const rect = element.getBoundingClientRect();
      
      // Set canvas size to match element
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      // Clear canvas and draw the captured image
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(capturedCanvas, 0, 0, canvas.width, canvas.height);

    } catch (error) {
      console.error('[ElementRecording] Error capturing element with html2canvas:', error);
      
      // Fallback rendering
      context.fillStyle = '#1a1a1a';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#fff';
      context.font = '14px Arial';
      context.fillText('Element Recording Active', 10, 30);
      context.fillText(`Recording Time: ${recordingTime}s`, 10, 60);
      context.fillText('Fallback Mode', 10, 90);
    }

    // Continue capturing
    if (isRecording && !isPaused) {
      // Use setTimeout for better performance than requestAnimationFrame
      setTimeout(() => {
        captureElementToCanvas();
      }, 1000 / (mergedConfig.frameRate || 30)); // Convert fps to milliseconds
    }
  }, [isRecording, isPaused, recordingTime, mergedConfig.frameRate]);

  // Start recording
  const startRecording = useCallback(async (element: HTMLElement) => {
    if (!isSupported) {
      setError('Element recording is not supported in this browser');
      return;
    }

    try {
      setError(null);
      targetElementRef.current = element;

      // Create canvas for capturing
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      canvasRef.current = canvas;
      contextRef.current = context;

      // Get element dimensions
      const rect = element.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Get canvas stream
      const stream = canvas.captureStream(mergedConfig.frameRate);
      streamRef.current = stream;
      chunksRef.current = [];

      // If we want to capture audio from the page (optional)
      if (mergedConfig.captureAudio) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            } 
          });
          
          // Combine video and audio streams
          const combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...audioStream.getAudioTracks()
          ]);
          streamRef.current = combinedStream;
        } catch (audioError) {
          console.warn('[ElementRecording] Could not capture audio, continuing with video only:', audioError);
        }
      }

      // Check if the chosen mime type is supported
      let mimeType = mergedConfig.mimeType!;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        const fallbackTypes = [
          'video/webm;codecs=vp8,opus',
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4'
        ];
        
        mimeType = fallbackTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      }

      // Create MediaRecorder
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType,
        videoBitsPerSecond: mergedConfig.videoBitsPerSecond,
        audioBitsPerSecond: mergedConfig.audioBitsPerSecond,
      });

      // Handle data available
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: mimeType });
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        setRecordingData({
          blob: recordedBlob,
          duration,
          timestamp: Date.now(),
          size: recordedBlob.size,
        });

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        setIsRecording(false);
        setIsPaused(false);
        stopTimer();
        
        console.log(`[ElementRecording] Recording completed: ${duration}s, ${(recordedBlob.size / 1024 / 1024).toFixed(2)}MB`);
      };

      // Handle errors
      recorder.onerror = (event) => {
        console.error('[ElementRecording] MediaRecorder error:', event);
        setError('Recording failed due to an error');
        setIsRecording(false);
        setIsPaused(false);
        stopTimer();
      };

      mediaRecorderRef.current = recorder;

      // Start recording
      recorder.start(mergedConfig.timeSlice);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setRecordingData(null);
      startTimer();

      // Start capturing element
      await captureElementToCanvas();

      console.log('[ElementRecording] Recording started successfully');

    } catch (err) {
      console.error('[ElementRecording] Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
    }
  }, [isSupported, mergedConfig, startTimer, stopTimer, captureElementToCanvas]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) {
      return;
    }

    try {
      // Stop the recorder
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      console.log('[ElementRecording] Recording stopped by user');
    } catch (err) {
      console.error('[ElementRecording] Error stopping recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording || isPaused) {
      return;
    }

    try {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();

      console.log('[ElementRecording] Recording paused');
    } catch (err) {
      console.error('[ElementRecording] Error pausing recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to pause recording');
    }
  }, [isRecording, isPaused, stopTimer]);

  // Resume recording
  const resumeRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording || !isPaused) {
      return;
    }

    try {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();

      // Resume capturing
      await captureElementToCanvas();

      console.log('[ElementRecording] Recording resumed');
    } catch (err) {
      console.error('[ElementRecording] Error resuming recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to resume recording');
    }
  }, [isRecording, isPaused, startTimer, captureElementToCanvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      stopTimer();
    };
  }, [isRecording, stopRecording, stopTimer]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    recordingData,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isSupported,
  };
};
