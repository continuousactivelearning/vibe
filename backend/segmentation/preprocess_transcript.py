import re
import os

def convert_transcript_format(input_text):
    """
    Convert transcript from single line format with \n literals to proper multi-line format
    Input: Single line with \n as literal characters
    Output: Properly formatted multi-line transcript
    """
    # Replace literal \n with actual newlines
    formatted_text = input_text.replace('\\n', '\n')
    
    # Clean up any extra whitespace or formatting issues
    lines = formatted_text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if line:  # Only add non-empty lines
            cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def parse_transcript_line(line):
    """
    Parse a single transcript line to extract timestamp and text
    Format: [MM:SS.sss --> MM:SS.sss] text
    Returns: (start_time, end_time, text) or None if invalid
    """
    # Pattern matches: [MM:SS.sss --> MM:SS.sss] text
    timestamp_pattern = r'\[(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})\]\s*(.*)'
    match = re.match(timestamp_pattern, line.strip())
    
    if match:
        start_time_str, end_time_str, text = match.groups()
        
        # Convert timestamp to seconds
        start_time = convert_timestamp_to_seconds(start_time_str)
        end_time = convert_timestamp_to_seconds(end_time_str)
        
        return start_time, end_time, text.strip()
    
    return None

def convert_timestamp_to_seconds(timestamp_str):
    """Convert MM:SS.sss format to seconds"""
    parts = timestamp_str.split(':')
    minutes = int(parts[0])
    seconds_parts = parts[1].split('.')
    seconds = int(seconds_parts[0])
    milliseconds = int(seconds_parts[1])
    
    total_seconds = minutes * 60 + seconds + milliseconds / 1000.0
    return total_seconds

def preprocess_transcript(transcript_text):
    """
    Main preprocessing function that converts transcript to sentences, tokens, and timestamps
    Input: Raw transcript text (can be single line with \n literals or multi-line)
    Output: (sentences, tokens, timestamps)
    """
    # Step 1: Convert format if needed
    if '\\n' in transcript_text:
        transcript_text = convert_transcript_format(transcript_text)
    
    # Step 2: Parse lines
    lines = transcript_text.strip().split('\n')
    sentences = []
    timestamps = []
    
    for line in lines:
        if not line.strip():
            continue
            
        result = parse_transcript_line(line)
        if result:
            start_time, end_time, text = result
            if text:  # Only add if text is not empty
                sentences.append(text)
                timestamps.append([start_time, end_time])
    
    # Step 3: Create tokens
    tokens = []
    for sentence in sentences:
        words = sentence.split()
        tokens.extend(words)
    
    return sentences, tokens, timestamps

def preprocess_transcript_file(input_file_path, output_file_path=None):
    """
    Preprocess transcript from file and optionally save cleaned version
    """
    try:
        with open(input_file_path, 'r', encoding='utf-8') as f:
            transcript_text = f.read()
        
        # Preprocess the transcript
        sentences, tokens, timestamps = preprocess_transcript(transcript_text)
        
        # Save cleaned version if output path provided
        if output_file_path:
            save_cleaned_transcript(sentences, timestamps, output_file_path)
        
        return sentences, tokens, timestamps
        
    except FileNotFoundError:
        raise FileNotFoundError(f"Transcript file not found: {input_file_path}")
    except Exception as e:
        raise Exception(f"Error processing transcript file: {e}")

def save_cleaned_transcript(sentences, timestamps, output_file_path):
    """Save cleaned transcript to file"""
    try:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            for sentence, timestamp in zip(sentences, timestamps):
                start_time = timestamp[0]
                end_time = timestamp[1]
                
                # Convert seconds back to MM:SS.sss format
                start_str = seconds_to_timestamp(start_time)
                end_str = seconds_to_timestamp(end_time)
                
                f.write(f"[{start_str} --> {end_str}]  {sentence}\n")
        
    except Exception as e:
        raise Exception(f"Error saving cleaned transcript: {e}")

def seconds_to_timestamp(seconds):
    """Convert seconds to MM:SS.sss format"""
    minutes = int(seconds // 60)
    remaining_seconds = seconds % 60
    secs = int(remaining_seconds)
    millisecs = int((remaining_seconds - secs) * 1000)
    
    return f"{minutes:02d}:{secs:02d}.{millisecs:03d}"

# Optional debug function - only used when called explicitly
def debug_transcript_file(file_path):
    """Debug transcript file to see its format - for development use only"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"File: {file_path}")
        print(f"Size: {len(content)} characters")
        print(f"Lines: {len(content.splitlines())}")
        
        # Test timestamp pattern
        if '\\n' in content:
            print("Note: Contains literal \\n characters")
            converted = convert_transcript_format(content)
            lines = converted.split('\n')
        else:
            lines = content.splitlines()
        
        timestamp_pattern = r'\[(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})\]'
        matches = sum(1 for line in lines if re.search(timestamp_pattern, line))
        print(f"Timestamp matches: {matches}/{len(lines)}")
        
    except Exception as e:
        print(f"Debug error: {e}")

