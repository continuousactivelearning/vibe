import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  useGenerateQuestions,
  useGenerateTranscript,
  useSegmentTranscript
} from "@/lib/api/genAihooks";

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GenAIHomePage() {
  const [inputMode, setInputMode] = useState<"youtube" | "upload" | "record">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<string[]>([]);
  const [editedTranscript, setEditedTranscript] = useState("");

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [questionsPerSegment, setQuestionsPerSegment] = useState(2);

  const { mutate: generateTranscript, isPending: isTranscriptPending } =
    useGenerateTranscript(
      (data) => {
        toast.success("Transcript generated successfully!");
        setTranscript(data.generatedTranscript);
        setEditedTranscript(data.generatedTranscript);
        setSegments({});
        setQuestions([]);
      },
      (_error) => {
        toast.error("Failed to generate transcript");
      }
    );

  const { mutate: segmentTranscript, isPending: isSegmentPending } =
    useSegmentTranscript((data) => {
      toast.success("Transcript segmented");
      setSegments(data.segments);
    });

  const { mutate: generateQuestions, isPending: isQuestionsPending } =
    useGenerateQuestions((data) => {
      toast.success("Questions generated");
      setQuestions(data);
    });

  // --- Handlers ---
  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      toast.warning("Enter a YouTube link");
      return;
    }
    generateTranscript({ youtubeUrl });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.warning("Please select a video or audio file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadFile);
    generateTranscript(formData as any);
  };

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    setAudioBlob(null);
    setIsPaused(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // Update audioBlob so "Generate Transcript" is enabled as soon as there's data
          setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Could not access microphone.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  // Allow transcript generation at any time during recording
  const handleSendAudio = () => {
    const currentChunks = audioChunksRef.current;
    if (!currentChunks.length) {
      toast.warning("No audio recorded yet.");
      return;
    }
    const blob = new Blob(currentChunks, { type: "audio/webm" });
    setAudioBlob(blob);
    const formData = new FormData();
    formData.append("file", new File([blob], "recording.webm", { type: "audio/webm" }));
    generateTranscript(formData as any);
  };

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4 space-y-10">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold">AI Content Generator</h1>
        <p className="text-muted-foreground mt-2">
          Convert a video or voice to a full set of learning materials.
        </p>
      </header>

      <div className="flex space-x-4 justify-center">
        <Button
          variant={inputMode === "youtube" ? "default" : "outline"}
          onClick={() => setInputMode("youtube")}
        >
          Use YouTube URL
        </Button>
        <Button
          variant={inputMode === "upload" ? "default" : "outline"}
          onClick={() => setInputMode("upload")}
        >
          Upload Video/Audio
        </Button>
        <Button
          variant={inputMode === "record" ? "default" : "outline"}
          onClick={() => setInputMode("record")}
        >
          Record Voice
        </Button>
      </div>

      {inputMode === "youtube" && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Enter YouTube URL</CardTitle>
            <CardDescription>We'll transcribe the video.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleYouTubeSubmit} className="space-y-4">
              <label htmlFor="youtube-link" className="block text-sm font-medium">
                YouTube Link
              </label>
              <Input
                id="youtube-link"
                placeholder="https://youtube.com/..."
                title="Paste YouTube link"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isTranscriptPending}
              />
              <Button type="submit" disabled={isTranscriptPending || !youtubeUrl}>
                {isTranscriptPending ? "Generating..." : "Generate Transcript"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {inputMode === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Upload Video or Audio File</CardTitle>
            <CardDescription>
              Upload a video or audio file to generate a transcript.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <Input
                type="file"
                accept="video/*,audio/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                disabled={isTranscriptPending}
                required
              />
              <Button type="submit" disabled={isTranscriptPending || !uploadFile}>
                {isTranscriptPending ? "Generating..." : "Generate Transcript"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {inputMode === "record" && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Record Your Voice</CardTitle>
            <CardDescription>
              Record your voice and generate a transcript. You can pause and resume as needed, or generate a transcript at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {!isRecording && (
                <Button
                  onClick={startRecording}
                  disabled={isTranscriptPending}
                >
                  Start Recording
                </Button>
              )}
              {isRecording && !isPaused && (
                <>
                  <Button
                    onClick={pauseRecording}
                    variant="secondary"
                    disabled={isTranscriptPending}
                  >
                    Pause
                  </Button>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    disabled={isTranscriptPending}
                  >
                    Stop
                  </Button>
                </>
              )}
              {isRecording && isPaused && (
                <>
                  <Button
                    onClick={resumeRecording}
                    variant="default"
                    disabled={isTranscriptPending}
                  >
                    Resume
                  </Button>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    disabled={isTranscriptPending}
                  >
                    Stop
                  </Button>
                </>
              )}
              {/* Show audio preview if any audio has been recorded */}
              {audioChunksRef.current.length > 0 && (
                <audio controls src={URL.createObjectURL(new Blob(audioChunksRef.current, { type: "audio/webm" }))} />
              )}
            </div>
            <Button
              onClick={handleSendAudio}
              disabled={isTranscriptPending || audioChunksRef.current.length === 0}
            >
              {isTranscriptPending ? "Generating..." : "Generate Transcript"}
            </Button>
          </CardContent>
        </Card>
      )}

      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Edit & Segment Transcript</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              rows={10}
            />
            <Button
              onClick={() => segmentTranscript({ transcript: editedTranscript })}
              disabled={isSegmentPending}
            >
              {isSegmentPending ? "Segmenting..." : "Segment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.keys(segments).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Generate Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-4 text-sm space-y-1">
              {Object.entries(segments).map(([endTime, seg], i) => (
                <li key={i}>
                  <strong>{endTime}</strong>: {seg}
                </li>
              ))}
            </ol>
            <label htmlFor="qps" className="text-sm font-medium">Questions per Segment</label>
            <Input
            id="qps"
            type="number"
            min={1}
            value={questionsPerSegment}
            onChange={(e) => setQuestionsPerSegment(parseInt(e.target.value) || 1)}
            className="border rounded p-2 text-sm w-24"
            placeholder="e.g. 2"
            />
          <Button
            onClick={() =>
              generateQuestions({
                segments,
                questionsPerSegment,
              })}
            disabled={isQuestionsPending}
          >
            {isQuestionsPending ? "Generating..." : "Generate Questions"}
          </Button>
        </CardContent>
      </Card>
    )}

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Generated Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-4 space-y-2 text-sm">
              {questions.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
