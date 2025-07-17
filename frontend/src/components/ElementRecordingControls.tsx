import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Pause, Download, AlertCircle, Trash2 } from 'lucide-react';
import { useElementRecording } from '@/hooks/useElementRecording';
import { recordingStorage, type StoredRecording } from '@/utils/recordingStorage';

interface ElementRecordingControlsProps {
  targetElementRef: React.RefObject<HTMLElement | null>;
  autoStart?: boolean;
  autoStopOnExit?: boolean;
  isVisible?: boolean;
  className?: string;
}

const ElementRecordingControls: React.FC<ElementRecordingControlsProps> = ({
  targetElementRef,
  autoStart = false,
  autoStopOnExit = false,
  isVisible = true,
  className = ''
}) => {
  const [savedRecordings, setSavedRecordings] = useState<StoredRecording[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const {
    isRecording,
    isPaused,
    recordingTime,
    recordingData,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isSupported
  } = useElementRecording({
    videoBitsPerSecond: 2500000,
    frameRate: 30,
    captureAudio: false // We'll capture audio separately if needed
  });

  // Auto-start recording when component mounts and element is available
  useEffect(() => {
    if (autoStart && !hasStarted && targetElementRef.current && isVisible) {
      console.log('[ElementRecordingControls] Auto-starting element recording');
      setHasStarted(true);
      startRecording(targetElementRef.current);
    }
  }, [autoStart, hasStarted, targetElementRef, isVisible, startRecording]);

  // Auto-stop recording when component becomes invisible
  useEffect(() => {
    if (autoStopOnExit && isRecording && !isVisible) {
      console.log('[ElementRecordingControls] Auto-stopping recording due to visibility change');
      stopRecording();
    }
  }, [autoStopOnExit, isRecording, isVisible, stopRecording]);

  // Handle recording data when available
  useEffect(() => {
    if (recordingData) {
      const saveRecording = async () => {
        try {
          const recordingToStore: StoredRecording = {
            id: `element_recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            courseId: 'floating_element', // We can get this from context later
            sessionId: `session_${Date.now()}`,
            timestamp: recordingData.timestamp,
            duration: recordingData.duration,
            size: recordingData.size,
            blob: recordingData.blob,
            metadata: {
              userAgent: navigator.userAgent,
              screenResolution: `${window.screen.width}x${window.screen.height}`,
              recordingConfig: { type: 'element_recording' }
            }
          };
          
          await recordingStorage.storeRecording(recordingToStore);
          console.log(`[ElementRecordingControls] Recording saved with ID: ${recordingToStore.id}`);
          await loadSavedRecordings();
        } catch (error) {
          console.error('[ElementRecordingControls] Error saving recording:', error);
        }
      };
      saveRecording();
    }
  }, [recordingData]);

  // Load saved recordings
  const loadSavedRecordings = useCallback(async () => {
    try {
      const recordings = await recordingStorage.getAllRecordings();
      setSavedRecordings(recordings);
    } catch (error) {
      console.error('[ElementRecordingControls] Error loading recordings:', error);
    }
  }, []);

  // Load recordings on mount
  useEffect(() => {
    loadSavedRecordings();
  }, [loadSavedRecordings]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  // Handle start recording
  const handleStart = async () => {
    if (!targetElementRef.current) {
      console.error('[ElementRecordingControls] No target element available for recording');
      return;
    }
    await startRecording(targetElementRef.current);
  };

  // Handle download recording
  const handleDownload = (recording: StoredRecording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `element-recording-${new Date(recording.timestamp).toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle delete recording
  const handleDelete = async (id: string) => {
    try {
      await recordingStorage.deleteRecording(id);
      await loadSavedRecordings();
    } catch (error) {
      console.error('[ElementRecordingControls] Error deleting recording:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center space-x-2 p-2 bg-red-100 dark:bg-red-900 rounded-lg ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <span className="text-sm text-red-700 dark:text-red-300">
          Element recording not supported in this browser
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Recording Controls */}
      <div className="flex items-center space-x-2">
        {!isRecording ? (
          <Button
            size="sm"
            onClick={handleStart}
            disabled={!targetElementRef.current}
            className="flex items-center space-x-1"
          >
            <Play className="h-3 w-3" />
            <span>Record</span>
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            {!isPaused ? (
              <Button size="sm" onClick={pauseRecording} className="flex items-center space-x-1">
                <Pause className="h-3 w-3" />
                <span>Pause</span>
              </Button>
            ) : (
              <Button size="sm" onClick={resumeRecording} className="flex items-center space-x-1">
                <Play className="h-3 w-3" />
                <span>Resume</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={stopRecording}
              className="flex items-center space-x-1"
            >
              <Square className="h-3 w-3" />
              <span>Stop</span>
            </Button>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center space-x-2">
            <Badge variant={isPaused ? 'secondary' : 'destructive'}>
              {isPaused ? 'PAUSED' : 'REC'}
            </Badge>
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-2 bg-red-100 dark:bg-red-900 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Saved Recordings */}
      {savedRecordings.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Saved Recordings ({savedRecordings.length})
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {savedRecordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="font-mono text-green-600 dark:text-green-400">
                    {formatTime(recording.duration)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatSize(recording.size)}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 truncate">
                    {new Date(recording.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(recording)}
                    className="h-6 w-6 p-0"
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(recording.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recording Info */}
      {isRecording && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Recording floating overlay element content
        </div>
      )}
    </div>
  );
};

export default ElementRecordingControls;
