/**
 * parseSegments.ts
 *
 * Parses a transcript that includes [SEGMENT-START] and [SEGMENT-END] markers,
 * returning a dictionary mapping each segment's end time to its transcript content.
 */

/**
 * Parses annotated transcript into a map of end-time => segment text
 * @param transcriptWithMarkers Full transcript including segment markers
 * @returns Record where keys are end timestamps ("MM:SS.mmm") and values are the segment content
 */
export function parseSegments(
  transcriptWithMarkers: string
): Record<string, string> {
  const segments: Record<string, string> = {};
  const segmentRegex = /\[SEGMENT-START\s+(\d{2}:\d{2}\.\d{3})\][\s\S]*?\n([\s\S]*?)\[SEGMENT-END\s+(\d{2}:\d{2}\.\d{3})\]/g;
  let match: RegExpExecArray | null;

  while ((match = segmentRegex.exec(transcriptWithMarkers)) !== null) {
    // match[1] = start-time, match[2] = content, match[3] = end-time
    const endTime = match[3];
    const content = match[2].trim().replace(/^\s*\[\d{2}:\d{2}\.\d{3}\]\s*/, '');
    segments[endTime] = content;
  }

  return segments;
}
