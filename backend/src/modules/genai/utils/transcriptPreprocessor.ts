export function preprocessTranscriptForAnalysis(transcript: string): string {
  const lines = transcript.split('\n').filter(line => line.trim().includes('-->'));
  
  // Extract just the text content with timestamps for reference
  const cleanedContent: string[] = [];
  
  for (const line of lines) {
    const timeMatch = line.match(/\[(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})\]\s*(.+)/);
    if (timeMatch) {
      const startTime = timeMatch[1];
      const text = timeMatch[3].trim();
      
      // Add timestamp reference and clean text
      cleanedContent.push(`[${startTime}] ${text}`);
    }
  }
  
  // Group sentences into larger paragraphs for better topic analysis
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];
  let currentStartTime = '';
  
  for (let i = 0; i < cleanedContent.length; i++) {
    const line = cleanedContent[i];
    const timeMatch = line.match(/\[(\d{2}:\d{2}\.\d{3})\] (.+)/);
    
    if (timeMatch) {
      const startTime = timeMatch[1];
      const text = timeMatch[2];
      
      if (currentParagraph.length === 0) {
        currentStartTime = startTime;
      }
      
      currentParagraph.push(text);
      
      // Create paragraph breaks at natural sentence endings or after ~3-4 lines
      const shouldBreak = text.endsWith('.') && currentParagraph.length >= 3;
      const isLastLine = i === cleanedContent.length - 1;
      
      if (shouldBreak || isLastLine) {
        const paragraphText = currentParagraph.join(' ');
        paragraphs.push(`[${currentStartTime}] ${paragraphText}`);
        currentParagraph = [];
      }
    }
  }
  
  return paragraphs.join('\n\n');
}