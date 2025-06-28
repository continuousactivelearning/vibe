import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import random
from scipy.signal import find_peaks

# Set random seed for reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
torch.cuda.manual_seed_all(SEED)

# Determine device to use consistently
DEVICE = torch.device('cpu')  # Force CPU usage to avoid GPU/CPU mismatch
# If you want to use GPU when available, uncomment the line below:
# DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class Encoder(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super(Encoder, self).__init__()
        self.hidden_dim = hidden_dim
        self.bigru = nn.GRU(input_dim, hidden_dim, bidirectional=True, batch_first=True)

    def forward(self, x):
        h, _ = self.bigru(x)
        return h  # h ∈ R^(N × 2H)


class Decoder(nn.Module):
    def __init__(self, hidden_dim):
        super(Decoder, self).__init__()
        self.hidden_dim = hidden_dim
        self.gru = nn.GRU(hidden_dim * 2, hidden_dim, batch_first=True)

    def forward(self, x, hidden_state):
        d, hidden_state = self.gru(x, hidden_state)
        return d, hidden_state


class Pointer(nn.Module):
    def __init__(self, encoder_hidden_dim, decoder_hidden_dim):
        super(Pointer, self).__init__()
        self.W1 = nn.Linear(encoder_hidden_dim, decoder_hidden_dim)
        self.W2 = nn.Linear(decoder_hidden_dim, decoder_hidden_dim)
        self.v = nn.Linear(decoder_hidden_dim, 1, bias=False)

    def forward(self, encoder_outputs, decoder_state):
        scores = self.v(torch.tanh(self.W1(encoder_outputs) + self.W2(decoder_state)))
        attention_weights = F.softmax(scores, dim=1)
        return attention_weights


class SEGBOT(nn.Module):
    def __init__(self, input_dim, hidden_dim, device=None):
        super(SEGBOT, self).__init__()
        self.device = device if device is not None else DEVICE
        self.encoder = Encoder(input_dim, hidden_dim)
        self.decoder = Decoder(hidden_dim)
        self.pointer = Pointer(hidden_dim * 2, hidden_dim)
        
        # Move model to specified device
        self.to(self.device)

    def forward(self, x, start_units):
        # Ensure input tensor is on the correct device
        x = x.to(self.device)
        
        encoder_outputs = self.encoder(x)
        decoder_hidden = torch.zeros(1, x.size(0), self.decoder.hidden_dim, device=self.device)
        decoder_inputs = encoder_outputs[:, start_units, :].unsqueeze(1)
        decoder_outputs, _ = self.decoder(decoder_inputs, decoder_hidden)
        attention_weights = self.pointer(encoder_outputs, decoder_outputs.squeeze(1))
        return attention_weights

    def segment_text(self, sentences, tokens, timestamps, attention_weights):
        """Segment text and get start/end timestamps."""
        # Ensure attention_weights is moved to CPU for numpy operations
        attention_weights = attention_weights.squeeze().detach().cpu().numpy()

        # Normalize attention weights
        if attention_weights.max() == attention_weights.min():
            # Handle case where all attention weights are the same
            normalized_weights = np.ones_like(attention_weights) * 0.5
        else:
            normalized_weights = (attention_weights - np.min(attention_weights)) / (
                np.max(attention_weights) - np.min(attention_weights)
            )

        # Find peaks in attention scores
        peak_indices, _ = find_peaks(normalized_weights, height=0.3, distance=15)

        if len(peak_indices) == 0:
            # If no peaks found, return the entire transcript as one segment
            if timestamps and len(timestamps) > 0:
                return [{
                    "text": " ".join(sentences), 
                    "start_time": timestamps[0][0], 
                    "end_time": timestamps[-1][1]
                }]
            else:
                return [{"text": " ".join(sentences), "start_time": 0.0, "end_time": 1.0}]

        segments = []
        start_idx = 0
        
        for i in peak_indices:
            if i > 0 and i - start_idx >= 3:  # Reduced minimum from 5 to 3 sentences per segment
                segment_text = " ".join(sentences[start_idx:i]).strip()

                if segment_text:
                    start_time = timestamps[start_idx][0] if start_idx < len(timestamps) else 0.0
                    
                    # Check if `i - 1` is within range to prevent out-of-bounds error
                    if i - 1 < len(timestamps):
                        end_time = timestamps[i - 1][1]
                    else:
                        end_time = timestamps[-1][1] if timestamps else 1.0

                    segments.append({
                        "text": segment_text, 
                        "start_time": start_time, 
                        "end_time": end_time
                    })

                start_idx = i

        # Add last segment
        last_segment = " ".join(sentences[start_idx:]).strip()
        if last_segment:
            start_time = timestamps[start_idx][0] if start_idx < len(timestamps) else 0.0
            end_time = timestamps[-1][1] if timestamps else 1.0
            segments.append({
                "text": last_segment, 
                "start_time": start_time, 
                "end_time": end_time
            })

        return segments if segments else [{
            "text": " ".join(sentences), 
            "start_time": timestamps[0][0] if timestamps else 0.0, 
            "end_time": timestamps[-1][1] if timestamps else 1.0
        }]
