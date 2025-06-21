const timeToMs = (time: string): number => {
  const parts = time.split(/[:.]/);
  
  // Handle MM:SS format (convert to MM:SS.000)
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10) * 60 * 1000;
    const s = parseInt(parts[1], 10) * 1000;
    return m + s;
  }
  // Handle MM:SS.mmm format (transcript lines use this format)
  else if (parts.length === 3) {
    // Check if this looks like MM:SS.mmm (transcript format) or HH:MM:SS (AI format)
    if (time.includes('.')) {
      // MM:SS.mmm format (e.g., "00:07.760")
      const m = parseInt(parts[0], 10) * 60 * 1000;
      const s = parseInt(parts[1], 10) * 1000;
      const ms = parseInt(parts[2], 10);
      return m + s + ms;
    } else {
      // HH:MM:SS format (e.g., "00:05:00")
      const h = parseInt(parts[0], 10) * 60 * 60 * 1000;
      const m = parseInt(parts[1], 10) * 60 * 1000;
      const s = parseInt(parts[2], 10) * 1000;
      return h + m + s;
    }
  }
  // Handle HH:MM:SS.mmm format
  else if (parts.length === 4) {
    const h = parseInt(parts[0], 10) * 60 * 60 * 1000;
    const m = parseInt(parts[1], 10) * 60 * 1000;
    const s = parseInt(parts[2], 10) * 1000;
    const ms = parseInt(parts[3], 10);
    return h + m + s + ms;
  }
  
  return 0;
};

export function segmentTranscriptByTimes(
  endTimes: string[],
  transcript: string,
): {
  message: string;
  segments: Record<string, string>;
} {
  const segments: Record<string, string> = {};
  const transcriptLines = transcript.split('\n').filter(line => line.trim().includes('-->'));
  
  console.log('📋 Total transcript lines:', transcriptLines.length);
  
  // Show first few transcript lines with their time ranges
  console.log('📄 First 3 transcript lines:');
  transcriptLines.slice(0, 3).forEach((line, idx) => {
    const timeMatch = line.match(/\[(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})\]/);
    if (timeMatch) {
      console.log(`  Line ${idx + 1}: ${timeMatch[1]} --> ${timeMatch[2]} (${timeToMs(timeMatch[1])}ms - ${timeToMs(timeMatch[2])}ms)`);
    }
  });
  
  // Sort end times just in case they are not in order
  const sortedEndTimes = [...endTimes].sort((a, b) => timeToMs(a) - timeToMs(b));

  for (let i = 0; i < sortedEndTimes.length; i++) {
    const endTime = sortedEndTimes[i];
    const currentEndTimeMs = timeToMs(endTime);
    const previousEndTimeMs = i === 0 ? 0 : timeToMs(sortedEndTimes[i - 1]);
    const segmentLines: string[] = [];

    console.log(`🎯 Processing segment ${i + 1}: ${previousEndTimeMs}ms to ${currentEndTimeMs}ms (${endTime})`);

    for (const line of transcriptLines) {
      const timeMatch = line.match(/\[(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})\]/);
                       
      if (timeMatch) {
        const lineStartTimeMs = timeToMs(timeMatch[1]);
        const lineEndTimeMs = timeToMs(timeMatch[2]);

        // Include lines that start within the current segment's time range  
        if (lineStartTimeMs >= previousEndTimeMs && lineStartTimeMs <= currentEndTimeMs) {
          const text = line.replace(/\[.*?\]\s*/, '').trim();
          if (text) {
            segmentLines.push(text);
          }
        }
      }
    }
    
    console.log(`📊 Segment ${endTime}: Found ${segmentLines.length} lines`);
    if (segmentLines.length > 0) {
      segments[endTime] = segmentLines.join(' ').trim();
      console.log(`✅ Added segment ${endTime} with ${segments[endTime].length} characters`);
    } else {
      console.log(`❌ No content found for segment ending at ${endTime}`);
    }
  }

  console.log('🏁 Final segments:', Object.keys(segments));
  return {
    message: 'Transcript segmentation completed successfully.',
    segments: segments,
  };
}
