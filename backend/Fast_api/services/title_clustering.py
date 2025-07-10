from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering
import numpy as np


def cluster_titles(titles):
    """
    Cluster video titles into modules and sections for course organization.
    
    Args:
        titles (List[str]): List of video titles to cluster
    
    Returns:
        List[List[List[str]]]: Nested structure of modules containing sections containing titles
    """
    if not titles or len(titles) == 0:
        return []
    
    # Initialize model
    model = SentenceTransformer('all-mpnet-base-v2')
    embeddings = model.encode(titles)

    # Handle single title case
    if len(titles) == 1:
        return [[[titles[0]]]]

    # Handle two titles case
    if len(titles) == 2:
        return [[[titles[0]], [titles[1]]]]

    # Calculate sequential similarities (only between consecutive videos)
    similarities = []
    for i in range(len(embeddings) - 1):
        sim = cosine_similarity(
            embeddings[i].reshape(1, -1), 
            embeddings[i + 1].reshape(1, -1)
        )[0][0]
        similarities.append(sim)
    
    if not similarities:
        return [[[titles[0]]]]
        
    # Find module boundaries (major topic changes)
    median_sim = np.median(similarities)
    std_sim = np.std(similarities)
    module_threshold = median_sim - 1.5 * std_sim
    
    # Identify module boundaries
    module_boundaries = [0]
    for i, sim in enumerate(similarities):
        if sim < module_threshold:
            module_boundaries.append(i + 1)
    module_boundaries.append(len(titles))
    
    # Remove duplicate boundaries and ensure they're sorted
    module_boundaries = sorted(list(set(module_boundaries)))
    
    def create_sections_within_module(start_idx, end_idx, max_section_size=5):
        """Create sections within a module, ensuring no duplicates or overlaps"""
        module_titles = titles[start_idx:end_idx]
        module_size = len(module_titles)
        
        if module_size <= max_section_size:
            # Small module becomes one section
            return [module_titles]
        
        # For larger modules, find natural section breaks
        module_embeddings = embeddings[start_idx:end_idx]
        section_similarities = []
        
        for i in range(len(module_embeddings) - 1):
            sim = cosine_similarity(
                module_embeddings[i].reshape(1, -1),
                module_embeddings[i + 1].reshape(1, -1)
            )[0][0]
            section_similarities.append(sim)
        
        if not section_similarities:
            return [module_titles]
        
        # Find section boundaries within the module
        section_median = np.median(section_similarities)
        section_std = np.std(section_similarities)
        section_threshold = section_median - 1.0 * section_std
        
        section_boundaries = [0]
        for i, sim in enumerate(section_similarities):
            if sim < section_threshold and (i + 1) < len(module_titles):
                section_boundaries.append(i + 1)
        section_boundaries.append(len(module_titles))
        
        # Remove duplicates and ensure proper ordering
        section_boundaries = sorted(list(set(section_boundaries)))
        
        # Create sections ensuring no overlaps
        sections = []
        for i in range(len(section_boundaries) - 1):
            section_start = section_boundaries[i]
            section_end = section_boundaries[i + 1]
            
            # Ensure we don't exceed module bounds
            if section_start < len(module_titles) and section_end <= len(module_titles):
                section_titles = module_titles[section_start:section_end]
                if section_titles:  # Only add non-empty sections
                    sections.append(section_titles)
        
        # If no valid sections were created, return the whole module as one section
        if not sections:
            sections = [module_titles]
        
        # Ensure sections don't exceed max size by splitting large ones
        final_sections = []
        for section in sections:
            if len(section) > max_section_size:
                # Split large sections into smaller chunks
                for i in range(0, len(section), max_section_size):
                    chunk = section[i:i + max_section_size]
                    if chunk:
                        final_sections.append(chunk)
            else:
                final_sections.append(section)
        
        return final_sections
    
    # Build final cluster structure
    clustered_titles = []
    for i in range(len(module_boundaries) - 1):
        module_start = module_boundaries[i]
        module_end = module_boundaries[i + 1]
        
        # Ensure valid module boundaries
        if module_start < len(titles) and module_end <= len(titles) and module_start < module_end:
            sections = create_sections_within_module(module_start, module_end)
            if sections:  # Only add modules with valid sections
                clustered_titles.append(sections)
    
    # Fallback: if no valid clusters were created, create a simple structure
    if not clustered_titles:
        # Create simple sequential grouping
        chunk_size = 5
        sections = []
        for i in range(0, len(titles), chunk_size):
            chunk = titles[i:i + chunk_size]
            if chunk:
                sections.append(chunk)
        clustered_titles = [sections]
    
    # Validation: ensure no title appears multiple times
    all_used_titles = set()
    validated_clusters = []
    
    for module in clustered_titles:
        validated_module = []
        for section in module:
            validated_section = []
            for title in section:
                if title not in all_used_titles:
                    validated_section.append(title)
                    all_used_titles.add(title)
            if validated_section:  # Only add non-empty sections
                validated_module.append(validated_section)
        if validated_module:  # Only add non-empty modules
            validated_clusters.append(validated_module)
    
    # Final fallback if validation removed everything
    if not validated_clusters:
        chunk_size = 5
        sections = []
        for i in range(0, len(titles), chunk_size):
            chunk = titles[i:i + chunk_size]
            if chunk:
                sections.append(chunk)
        validated_clusters = [sections]
    
    print("--- Generated Course Structure ---")
    for i, module in enumerate(validated_clusters):
        print(f"Module {i+1}: ({len(module)} sections)")
        for j, section in enumerate(module):
            print(f"  Section {j+1}: {len(section)} videos")
            for k, title in enumerate(section):
                print(f"    {k+1}. {title}")
    print("---------------------------------")
    
    return validated_clusters