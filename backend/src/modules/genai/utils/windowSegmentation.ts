// /**
//  * windowSegmentation.ts
//  *
//  * Utilities for breaking transcripts into fixed-size windows
//  * and detecting topic boundaries between adjacent windows.
//  */

// export interface TranscriptWindow {
//   startTime: string;
//   endTime: string;
//   content: string;
//   windowIndex: number;
// }

// export interface LabeledWindow extends TranscriptWindow {
//   topicLabel: string;
// }

// /**
//  * Breaks a transcript into fixed-size windows based on time duration
//  * @param transcript The full transcript text
//  * @param windowDurationMinutes Duration of each window in minutes (default: 1.5)
//  * @returns Array of transcript windows
//  */
// export function createTimeBasedWindows(
//   transcript: string,
//   windowDurationMinutes: number = 1.5
// ): TranscriptWindow[] {
//   const lines = transcript.split('\n').filter(line => line.trim());
//   // Updated regex to match the actual format: [MM:SS.mmm --> MM:SS.mmm]
//   const timestampRegex = /^\[(\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}\.\d{3})\]/;
//   const windows: TranscriptWindow[] = [];
  
//   console.log(`🔧 DEBUG: Processing ${lines.length} lines for windowing`);
//   console.log(`🔧 DEBUG: First few lines:`, lines.slice(0, 3));
  
//   let currentWindow: string[] = [];
//   let windowStartTime: string = '';
//   let windowEndTime: string = '';
//   let windowIndex = 0;
  
//   const windowDurationMs = windowDurationMinutes * 60 * 1000;
//   console.log(`🔧 DEBUG: Window duration: ${windowDurationMs}ms (${windowDurationMinutes} minutes)`);
  
//   for (const line of lines) {
//     const match = line.match(timestampRegex);
//     if (!match) {
//       console.log(`🔧 DEBUG: Line doesn't match timestamp pattern: "${line}"`);
//       continue;
//     }
    
//     const startTimestamp = match[1]; // Start time of this line
//     const endTimestamp = match[2];   // End time of this line
//     const timeMs = parseTimestamp(startTimestamp);
//     console.log(`🔧 DEBUG: Processing timestamp ${startTimestamp} --> ${endTimestamp} (${timeMs}ms)`);
    
//     // Initialize first window
//     if (!windowStartTime) {
//       windowStartTime = startTimestamp;
//       windowEndTime = endTimestamp;
//       console.log(`🔧 DEBUG: Started first window at ${windowStartTime}`);
//     }
    
//     const windowStartMs = parseTimestamp(windowStartTime);
    
//     // Check if we should start a new window
//     if (timeMs - windowStartMs >= windowDurationMs && currentWindow.length > 0) {
//       // Finalize current window
//       console.log(`🔧 DEBUG: Finalizing window ${windowIndex} from ${windowStartTime} to ${windowEndTime}`);
//       windows.push({
//         startTime: windowStartTime,
//         endTime: windowEndTime,
//         content: currentWindow.join('\n'),
//         windowIndex: windowIndex++
//       });
      
//       // Start new window
//       currentWindow = [line];
//       windowStartTime = startTimestamp;
//       windowEndTime = endTimestamp;
//       console.log(`🔧 DEBUG: Started new window ${windowIndex} at ${windowStartTime}`);
//     } else {
//       // Add to current window
//       currentWindow.push(line);
//       windowEndTime = endTimestamp; // Update to the end time of the latest line
//     }
//   }
  
//   // Add final window if it has content
//   if (currentWindow.length > 0) {
//     console.log(`🔧 DEBUG: Adding final window ${windowIndex} from ${windowStartTime} to ${windowEndTime}`);
//     windows.push({
//       startTime: windowStartTime,
//       endTime: windowEndTime,
//       content: currentWindow.join('\n'),
//       windowIndex: windowIndex
//     });
//   }
  
//   console.log(`🔧 DEBUG: Created ${windows.length} total windows`);
//   return windows;
// }

// /**
//  * Breaks a transcript into fixed-size windows based on token count
//  * @param transcript The full transcript text
//  * @param maxTokensPerWindow Maximum tokens per window (default: 2000)
//  * @returns Array of transcript windows
//  */
// export function createTokenBasedWindows(
//   transcript: string,
//   maxTokensPerWindow: number = 2000
// ): TranscriptWindow[] {
//   const lines = transcript.split('\n').filter(line => line.trim());
//   // Updated regex to match the actual format: [MM:SS.mmm --> MM:SS.mmm]
//   const timestampRegex = /^\[(\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}\.\d{3})\]/;
//   const windows: TranscriptWindow[] = [];
  
//   let currentWindow: string[] = [];
//   let currentTokenCount = 0;
//   let windowStartTime: string = '';
//   let windowEndTime: string = '';
//   let windowIndex = 0;
  
//   for (const line of lines) {
//     const match = line.match(timestampRegex);
//     if (!match) continue;
    
//     const startTimestamp = match[1];
//     const endTimestamp = match[2];
//     const lineTokens = estimateTokenCount(line);
    
//     // Initialize first window
//     if (!windowStartTime) {
//       windowStartTime = startTimestamp;
//       windowEndTime = endTimestamp;
//     }
    
//     // Check if adding this line would exceed token limit
//     if (currentTokenCount + lineTokens > maxTokensPerWindow && currentWindow.length > 0) {
//       // Finalize current window
//       windows.push({
//         startTime: windowStartTime,
//         endTime: windowEndTime,
//         content: currentWindow.join('\n'),
//         windowIndex: windowIndex++
//       });
      
//       // Start new window
//       currentWindow = [line];
//       currentTokenCount = lineTokens;
//       windowStartTime = startTimestamp;
//       windowEndTime = endTimestamp;
//     } else {
//       // Add to current window
//       currentWindow.push(line);
//       currentTokenCount += lineTokens;
//       windowEndTime = endTimestamp;
//     }
//   }
  
//   // Add final window if it has content
//   if (currentWindow.length > 0) {
//     windows.push({
//       startTime: windowStartTime,
//       endTime: windowEndTime,
//       content: currentWindow.join('\n'),
//       windowIndex: windowIndex
//     });
//   }
  
//   return windows;
// }

// /**
//  * Detects topic boundaries by comparing adjacent window labels
//  * @param labeledWindows Array of windows with topic labels
//  * @returns Array of boundary timestamps where topics change
//  */
// export function detectTopicBoundaries(labeledWindows: LabeledWindow[]): string[] {
//   const boundaries: string[] = [];
  
//   for (let i = 1; i < labeledWindows.length; i++) {
//     const prevWindow = labeledWindows[i - 1];
//     const currentWindow = labeledWindows[i];
    
//     // Compare topic labels - if they're different, mark a boundary
//     if (prevWindow.topicLabel.toLowerCase().trim() !== currentWindow.topicLabel.toLowerCase().trim()) {
//       boundaries.push(prevWindow.endTime);
//     }
//   }
  
//   return boundaries;
// }

// /**
//  * Converts topic boundaries into segment markers
//  * @param transcript Original transcript
//  * @param boundaries Array of boundary timestamps
//  * @returns Segments dictionary with end timestamps as keys
//  */
// export function createSegmentsFromBoundaries(
//   transcript: string,
//   boundaries: string[]
// ): Record<string, string> {
//   const lines = transcript.split('\n').filter(line => line.trim());
//   const timestampRegex = /^\[(\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}\.\d{3})\]/;
//   const segments: Record<string, string> = {};
  
//   console.log(`🔧 DEBUG: Creating segments with boundaries:`, boundaries);
  
//   if (boundaries.length === 0) {
//     // If no boundaries, return the entire transcript as one segment
//     const allContent: string[] = [];
//     let lastEndTime = '';
    
//     for (const line of lines) {
//       const match = line.match(timestampRegex);
//       if (match) {
//         const cleanedLine = line.replace(timestampRegex, '').trim();
//         if (cleanedLine) {
//           allContent.push(cleanedLine);
//         }
//         lastEndTime = match[2];
//       }
//     }
    
//     if (allContent.length > 0 && lastEndTime) {
//       segments[lastEndTime] = allContent.join('\n');
//     }
//     return segments;
//   }
  
//   let currentSegment: string[] = [];
//   let segmentEndTime = '';
//   let boundaryIndex = 0;
  
//   // Add the final timestamp as a boundary to capture the last segment
//   const sortedBoundaries = [...boundaries].sort();
//   const lastLine = lines[lines.length - 1];
//   const lastMatch = lastLine?.match(timestampRegex);
//   if (lastMatch) {
//     sortedBoundaries.push(lastMatch[2]);
//   }
  
//   console.log(`🔧 DEBUG: Processing with sorted boundaries:`, sortedBoundaries);
  
//   for (const line of lines) {
//     const match = line.match(timestampRegex);
//     if (!match) continue;
    
//     const startTimestamp = match[1];
//     const endTimestamp = match[2];
    
//     // Clean the line content
//     const cleanedLine = line.replace(timestampRegex, '').trim();
//     if (cleanedLine) {
//       currentSegment.push(cleanedLine);
//     }
    
//     // Check if we've reached the next boundary
//     if (boundaryIndex < sortedBoundaries.length) {
//       const nextBoundary = sortedBoundaries[boundaryIndex];
      
//       // Convert timestamps to seconds for comparison
//       const endTimeSeconds = parseTimestamp(endTimestamp) / 1000;
//       const boundarySeconds = parseTimestamp(nextBoundary) / 1000;
      
//       // If we've reached or passed this boundary, finalize the segment
//       if (endTimeSeconds >= boundarySeconds) {
//         if (currentSegment.length > 0) {
//           segments[endTimestamp] = currentSegment.join('\n');
//           console.log(`🔧 DEBUG: Created segment ending at ${endTimestamp} with ${currentSegment.length} lines`);
//           currentSegment = [];
//         }
//         boundaryIndex++;
//       }
//     }
    
//     segmentEndTime = endTimestamp;
//   }
  
//   // Add any remaining content as the final segment
//   if (currentSegment.length > 0 && segmentEndTime) {
//     segments[segmentEndTime] = currentSegment.join('\n');
//     console.log(`🔧 DEBUG: Created final segment ending at ${segmentEndTime} with ${currentSegment.length} lines`);
//   }
  
//   console.log(`🔧 DEBUG: Total segments created:`, Object.keys(segments).length);
//   return segments;
// }

// // Helper functions
// function parseTimestamp(timestamp: string): number {
//   const [minutes, seconds] = timestamp.split(':');
//   const [secs, millisecs] = seconds.split('.');
//   return parseInt(minutes) * 60 * 1000 + parseInt(secs) * 1000 + parseInt(millisecs);
// }

// function estimateTokenCount(text: string): number {
//   // Rough estimation: ~4 characters per token
//   return Math.ceil(text.length / 4);
// }