/**
 * Utility functions for time formatting and conversion
 */

/**
 * Convert seconds to timestamp format MM:SS.sss
 * @param seconds Time in seconds (can include decimals)
 * @returns Formatted timestamp string in MM:SS.sss format
 * @example
 * secondsToTimestamp(2789.56) // returns "46:29.560"
 * secondsToTimestamp(125.123) // returns "02:05.123"
 */
export function secondsToTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(secs).padStart(2, '0');
  const paddedMillis = String(millis).padStart(3, '0');

  return `${paddedMinutes}:${paddedSeconds}.${paddedMillis}`;
}

/**
 * Convert timestamp format MM:SS.sss to seconds
 * @param timestamp Timestamp string in MM:SS.sss format
 * @returns Time in seconds
 * @example
 * timestampToSeconds("46:29.560") // returns 2789.56
 * timestampToSeconds("02:05.123") // returns 125.123
 */
export function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(':');
  const minutes = parseInt(parts[0], 10);
  const secondsParts = parts[1].split('.');
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1], 10);

  return minutes * 60 + seconds + milliseconds / 1000.0;
}

/**
 * Format duration in seconds to a human-readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 * @example
 * formatDuration(3661) // returns "1h 1m 1s"
 * formatDuration(125) // returns "2m 5s"
 * formatDuration(45) // returns "45s"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}