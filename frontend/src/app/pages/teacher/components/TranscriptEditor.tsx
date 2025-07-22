import * as React from "react";
import { Plus, Minus } from "lucide-react";

interface TranscriptEditorProps {
  transcriptText: string;
  segmentSeconds: number[];
  onTranscriptChange?: (text: string) => void;
  onSegmentSecondsChange?: (seconds: number[]) => void;
}

// Helper: split transcript into segments based on segmentSeconds
const getSegmentsFromTranscript = (text: string, endpoints: number[]) => {
  const words = text.split(' ');
  const totalDuration = endpoints[endpoints.length - 1] || 1;
  return endpoints.map((end, i) => {
    const start = i === 0 ? 0 : endpoints[i - 1];
    const wordStart = Math.floor((start / totalDuration) * words.length);
    const wordEnd = Math.floor((end / totalDuration) * words.length);
    return {
      start,
      end,
      text: words.slice(wordStart, wordEnd).join(' '),
      wordStart,
      wordEnd,
    };
  });
};

// code to be added to AISectionPage.tsx 
// {showTranscriptSection && (
//   <TranscriptEditor
//     transcriptText={transcriptText}
//     segmentSeconds={segmentSeconds}
//     setTranscriptText={setTranscriptText}
//     setSegmentSeconds={setSegmentSeconds}
//   />
// )}
export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  transcriptText,
  segmentSeconds,
  onTranscriptChange,
  onSegmentSecondsChange,
}) => {
  const [editingWord, setEditingWord] = React.useState<{ segIdx: number; wordIdx: number } | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const handleWordDoubleClick = (segIdx: number, wordIdx: number, word: string) => {
    setEditingWord({ segIdx, wordIdx });
    setEditValue(word);
  };
  const handleWordEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  const handleWordEditSave = (segIdx: number, wordIdx: number) => {
    const segments = getSegmentsFromTranscript(transcriptText, segmentSeconds);
    const allWords = transcriptText.split(' ');
    const seg = segments[segIdx];
    const globalWordIdx = seg.wordStart + wordIdx;
    allWords[globalWordIdx] = editValue;
    const newText = allWords.join(' ');
    if (onTranscriptChange) onTranscriptChange(newText);
    setEditingWord(null);
    setEditValue('');
  };
  const handleWordEditCancel = () => {
    setEditingWord(null);
    setEditValue('');
  };

  // Segment drag logic
  const handleSegmentDrag = (idx: number, newValue: number) => {
    const min = idx === 0 ? 1 : segmentSeconds[idx - 1] + 1;
    const max = idx === segmentSeconds.length - 1 ? newValue : segmentSeconds[idx + 1] - 1;
    const clamped = Math.max(min, Math.min(newValue, max));
    if (onSegmentSecondsChange) {
      onSegmentSecondsChange(segmentSeconds.map((v, i) => (i === idx ? clamped : v)));
    }
  };
  const handleAddSegmentBetween = (idx: number) => {
    const prev = segmentSeconds[idx];
    const next = segmentSeconds[idx + 1] ?? prev + 10;
    const newVal = prev + (next - prev) / 2;
    if (onSegmentSecondsChange) {
      const arr = [...segmentSeconds];
      arr.splice(idx + 1, 0, newVal);
      onSegmentSecondsChange(arr);
    }
  };
  const handleRemoveSegment = (idx: number) => {
    if (segmentSeconds.length <= 1) return;
    if (onSegmentSecondsChange) {
      onSegmentSecondsChange(segmentSeconds.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="mb-8 p-6 bg-muted rounded-xl border shadow">
      <h3 className="text-lg font-semibold mb-2 text-foreground">Transcript Editor</h3>
      <div className="mb-4 p-3 bg-muted-foreground/10 rounded">
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
          <li>Each <span className="font-semibold text-primary">segment</span> is a part of your transcript, defined by a time range.</li>
          <li>To <span className="font-semibold text-primary">edit a word</span>, double-click it. Press <kbd>Enter</kbd> or click away to save, <kbd>Esc</kbd> to cancel.</li>
          <li>To <span className="font-semibold text-primary">add</span> or <span className="font-semibold text-primary">remove</span> a segment, use the <Plus className="inline w-4 h-4" /> or <Minus className="inline w-4 h-4" /> buttons.</li>
          <li>To <span className="font-semibold text-primary">adjust segment boundaries</span>, drag the slider below each segment.</li>
        </ol>
        <div className="mt-2 text-xs text-muted-foreground">Tip: Segments help organize your transcript for question generation and video navigation.</div>
      </div>
      <div className="space-y-6">
        {getSegmentsFromTranscript(transcriptText, segmentSeconds).map((seg, segIdx, arr) => (
          <React.Fragment key={segIdx}>
            <div
              className={
                `relative mb-4 p-4 border rounded-lg flex flex-col gap-2 transition-colors duration-150 ${
                  editingWord && editingWord.segIdx === segIdx ? 'bg-primary/10 border-primary' : 'bg-muted-foreground/10 border-muted'
                } hover:bg-primary/5 focus-within:bg-primary/10`
              }
            >
              {segmentSeconds.length > 1 && (
                <button
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors text-lg font-bold z-10"
                  onClick={() => handleRemoveSegment(segIdx)}
                  title="Remove this segment"
                  aria-label="Remove segment"
                >
                  <Minus className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center mb-2 gap-2">
                <span className="font-semibold text-primary mr-2">Segment {segIdx + 1}:</span>
                <span className="text-xs text-muted-foreground">{seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s</span>
              </div>
              {segIdx < segmentSeconds.length - 1 && (
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs text-muted-foreground mb-1" htmlFor={`slider-${segIdx}`}>Drag to adjust where this segment ends:</label>
                  <div className="flex items-center gap-3 bg-muted px-3 py-2 rounded">
                    <input
                      id={`slider-${segIdx}`}
                      type="range"
                      min={seg.start + 1}
                      max={segmentSeconds[segIdx + 1] - 1}
                      step="0.01"
                      value={segmentSeconds[segIdx]}
                      onChange={e => handleSegmentDrag(segIdx, parseFloat(e.target.value))}
                      className="w-64 accent-primary"
                      aria-label="Adjust segment end time"
                    />
                    <span className="text-xs text-muted-foreground">End: {segmentSeconds[segIdx].toFixed(2)}s</span>
                  </div>
                </div>
              )}
              <div className="p-3 bg-background rounded-lg shadow-sm min-h-[44px] text-base text-justify leading-relaxed break-words">
                {seg.text.split(' ').map((word, wordIdx) => (
                  editingWord && editingWord.segIdx === segIdx && editingWord.wordIdx === wordIdx ? (
                    <span key={wordIdx} className="inline-block bg-primary/20 rounded px-1 mr-1 mb-0.5 align-middle whitespace-nowrap">
                      <input
                        className="bg-transparent text-sm focus:outline-none focus:border-b-2 focus:border-primary border-0 p-0 m-0 align-middle min-w-[1ch] w-auto max-w-[8ch] user-select-text"
                        value={editValue}
                        onChange={handleWordEditChange}
                        onBlur={() => handleWordEditSave(segIdx, wordIdx)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleWordEditSave(segIdx, wordIdx);
                          if (e.key === 'Escape') handleWordEditCancel();
                        }}
                        autoFocus
                        aria-label="Edit word"
                        style={{ width: `${editValue.length + 2}ch` }}
                      />
                    </span>
                  ) : (
                    <span
                      key={wordIdx}
                      className="cursor-pointer hover:bg-primary/20 focus:bg-primary/20 rounded px-1 transition-colors duration-100 text-foreground mr-1 mb-0.5 align-middle whitespace-nowrap break-keep user-select-none"
                      onDoubleClick={e => { e.preventDefault(); e.stopPropagation(); handleWordDoubleClick(segIdx, wordIdx, word); }}
                      onMouseDown={e => e.preventDefault()}
                      title="Double-click to edit this word"
                      tabIndex={0}
                      aria-label={`Edit word: ${word}`}
                    >
                      {word}
                    </span>
                  )
                ))}
              </div>
            </div>
            {segIdx < arr.length - 1 && (
              <div className="flex justify-center my-4">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/80 transition-colors text-2xl font-bold border-2 border-white"
                  onClick={() => handleAddSegmentBetween(segIdx)}
                  title="Add segment after"
                  aria-label="Add segment after"
                >
                  +
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}; 