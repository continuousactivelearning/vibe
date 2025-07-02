import json
import numpy as np
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from hdbscan import HDBSCAN
from typing import List, Dict, Sequence

def segment_transcript(file_path: str, lam: float = 1.0, num_runs: int = 5) -> Dict[str, str]:
    """
    Main function to segment transcript and return segments dictionary
    
    Args:
        file_path: Path to the JSON file containing transcript chunks
        lam: Lambda parameter for DP segmentation (higher = longer segments)
        num_runs: Number of runs for consensus boundary detection
    
    Returns:
        Dictionary with endtime as keys and segment text as values
    """
    
    #extract from json
    with open(file_path, 'r') as f:
        data = json.load(f)

    chunks = data['chunks']

    transcript_sentences = []
    for chunk in chunks:
        transcript_sentences.append(chunk['text'])

    #Generate Embedding of transcript sentences and find topics
    sentences = transcript_sentences
    embedder = SentenceTransformer("all-mpnet-base-v2")
    embeddings = embedder.encode(sentences)
    topic_model = BERTopic(min_topic_size=2)

    def run_bertopic():
        topics, _ = topic_model.fit_transform(sentences, embeddings)
        return topics

    """
    dynaseg.py
    ==========

    Dynamic-programming text segmentation for BERTopic-style sentence labels.
    -------------------------------------------------------------------------

    Given a list of *topic IDs* (one per sentence), compute a **boundary
    vector** that marks the first sentence of every "clean" topic segment.

    Key idea
    --------
    We minimise a global objective:

        total_cost =  Σ  ( disagreement_cost(segment) + λ )

    where λ ("lambda") is the price of *starting* a new segment.
    The disagreement cost of a segment [i, j) is

        (#sentences in the span) − (count of most frequent topic in the span)

    → zero if the whole span is the same topic,
      positive if topics are mixed.

    The optimal segmentation can be found in O(n²) time with a classic
    dynamic programme (Utiyama & Isahara, 2001).  Here, n = #sentences,
    so runtime is negligible for typical documents.

    Public API
    ----------
    dp_segment(labels, lam=1.0, noise_id=-1) -> List[int]

    * labels   : List[int]  raw topic indices from BERTopic
    * lam      : float      cut penalty (higher = longer segments)
    * noise_id : int        label used for "noise"/outlier sentences
    * returns  : List[int]  boundary vector, 1 means "segment starts here"
    """



    # ---------------------------------------------------------------------
    # --------------  0.  tiny clean-up to remove -1 noise labels  ---------
    # ---------------------------------------------------------------------
    def _fix_noise(labels: Sequence[int], noise_id: int = -1) -> List[int]:
        """
        Replace every occurrence of *noise_id* with the most recent
        *non-noise* topic so that the DP does not have to deal with '-1'.
        """
        fixed: List[int] = []
        prev_valid = None
        for z in labels:
            if z == noise_id:
                # if we have seen a real topic before, reuse it; otherwise 0
                fixed.append(prev_valid if prev_valid is not None else 0)
            else:
                fixed.append(z)
                prev_valid = z
        return fixed


    # ---------------------------------------------------------------------
    # --------------  1.  build prefix topic counts (O(n·|T|)) -------------
    # ---------------------------------------------------------------------
    def _prefix_counts(labels: Sequence[int]) -> Dict[int, List[int]]:
        """
        freq[t][j] =   how many times topic *t* occurs in sentences 0…j-1
        Shape:  { topic_id → (n+1)-long list }.
        """
        n = len(labels)
        topics = set(labels)
        freq: Dict[int, List[int]] = {t: [0] * (n + 1) for t in topics}

        for j, z in enumerate(labels, start=1):        # 1-based prefix index
            for t in topics:
                freq[t][j] = freq[t][j - 1] + (1 if z == t else 0)

        return freq


    # ---------------------------------------------------------------------
    # --------------  2.  dynamic-programming segmentation  ----------------
    # ---------------------------------------------------------------------
    def dp_segment(labels: List[int],
                   lam: float = 1.0,
                   noise_id: int = -1) -> List[int]:
        """
        Perform DP segmentation and return a *boundary vector* of the
        same length as `labels`.  Entry i == 1  ⇒  sentence i starts a segment.
        """
        # -- Step 0  (optional) noise clean-up ---------------------------------
        clean = _fix_noise(labels, noise_id=noise_id)

        n = len(clean)
        if n == 0:
            return []

        # -- Step 1  prefix frequency table ------------------------------------
        freq = _prefix_counts(clean)
        topics = list(freq.keys())                    # stable order

        # helper: O(|topics|) cost of treating [i, j) as one block
        def span_cost(i: int, j: int) -> int:
            span_len = j - i
            max_same_topic = max(freq[t][j] - freq[t][i] for t in topics)
            return span_len - max_same_topic          # disagreement count

        # -- Step 2  dynamic programme -----------------------------------------
        dp = [float("inf")] * (n + 1)                 # best cost for prefix 0…j
        back = [0] * (n + 1)                          # best predecessor index
        dp[0] = -lam                                  # so first segment pays +λ once

        for j in range(1, n + 1):                     # end position (exclusive)
            for i in range(j):                        # candidate previous cut
                cost = dp[i] + span_cost(i, j) + lam  # block cost + λ
                if cost < dp[j]:
                    dp[j] = cost
                    back[j] = i

        # -- Step 3  back-trace to create boundary vector ----------------------
        boundaries = [0] * n
        k = n
        while k > 0:
            i = back[k]
            boundaries[i] = 1                         # sentence i starts segment
            k = i                                     # jump to previous cut
        return boundaries



    def consensus_boundaries(boundary_runs, min_sep=3, method="topk"):
        """
        Fuse N binary boundary vectors into one consensus vector.

        Parameters
        ----------
        boundary_runs : List[np.ndarray]  each shape (n,), entries 0/1
        min_sep       : int  hard minimum gap between consecutive cuts
        method        : "topk" | "threshold" | "localmax"
            topk       – take K = median #cuts and pick top-K probs
            threshold  – pick all positions with p ≥ 0.5
            localmax   – pick local maxima separated by ≥ min_sep

        Returns
        -------
        consensus : np.ndarray shape (n,), entries 0/1
        p         : np.ndarray shape (n,) probability profile
        """
        B = np.stack(boundary_runs)           # (N, n)
        p = B.mean(axis=0)                    # boundary probability at each index
        n = p.size
        consensus = np.zeros(n, dtype=int)

        if method == "topk":
            K = int(np.median(B.sum(axis=1)))        # median #cuts
            # indices sorted by probability, highest first
            idx = np.argsort(-p)
            chosen = []
            for j in idx:
                if all(abs(j - c) >= min_sep for c in chosen):
                    chosen.append(j)
                if len(chosen) == K:
                    break
            consensus[chosen] = 1

        elif method == "threshold":
            consensus[p >= 0.5] = 1

        elif method == "localmax":
            for j in range(1, n - 1):
                if p[j] > p[j - 1] and p[j] >= p[j + 1] and p[j] >= 0.2:
                    # enforce min_sep
                    if consensus[max(0, j - min_sep):j].sum() == 0:
                        consensus[j] = 1
        else:
            raise ValueError("unknown method")

        consensus[0] = 1                      # first sentence always a boundary
        return consensus, p

    # Run BERTopic multiple times for consensus
    boundary_runs = []
    for _ in range(num_runs):
        topics = run_bertopic()
        boundaries = dp_segment(topics, lam=lam)
        boundary_runs.append(np.array(boundaries))
    
    # Get consensus boundaries
    consensus, _ = consensus_boundaries(boundary_runs, min_sep=3, method="topk")
    
    # Get relevant chunk indices where segments start
    segment_start_indices = np.where(consensus)[0]
    
    # Create segments dictionary
    segments = {}
    
    for i, start_idx in enumerate(segment_start_indices):
        # Determine end index for this segment
        if i < len(segment_start_indices) - 1:
            end_idx = segment_start_indices[i + 1]
        else:
            end_idx = len(chunks)
        
        # Collect all text in this segment
        segment_text = ""
        segment_chunks = chunks[start_idx:end_idx]
        
        for chunk in segment_chunks:
            segment_text += chunk['text'] + " "
        
        # Use the endtime of the last chunk in the segment as the key
        last_chunk = chunks[end_idx - 1]
        # Handle the timestamp format: [start_time, end_time]
        if 'timestamp' in last_chunk:
            endtime = last_chunk['timestamp'][1]  # Get end_time from timestamp array
        else:
            # Fallback for other formats
            endtime = last_chunk.get('endtime', last_chunk.get('end_time', str(end_idx)))
        
        # Clean up the segment text
        segment_text = segment_text.strip()
        
        segments[str(endtime)] = segment_text
    
    return segments