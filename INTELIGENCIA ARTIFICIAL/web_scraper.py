
import requests
from bs4 import BeautifulSoup
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import List, Dict, Tuple

class WebContentExtractor:
    """Pipeline estruturado para extração e análise de conteúdo web."""
    
    def __init__(self):
        # Inicializa o modelo de embeddings
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def scrape_content(self, url: str) -> str:
        """Extrai conteúdo limpo de uma URL."""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
