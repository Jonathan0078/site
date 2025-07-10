
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
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove elementos irrelevantes
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 
                               'aside', 'iframe', 'noscript']):
                element.decompose()
            
            # Extrai texto principal
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
            if main_content:
                text = main_content.get_text()
            else:
                text = soup.get_text()
            
            # Limpa o texto
            text = re.sub(r'\s+', ' ', text).strip()
            return text
            
        except Exception as e:
            return f"Erro ao extrair conteúdo: {str(e)}"
    
    def chunk_text(self, text: str, chunk_size: int = 300) -> List[str]:
        """Divide o texto em chunks menores."""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            if len(chunk.strip()) > 50:  # Ignora chunks muito pequenos
                chunks.append(chunk.strip())
        
        return chunks
    
    def find_relevant_chunk(self, chunks: List[str], query: str) -> Tuple[str, float]:
        """Encontra o chunk mais relevante usando busca semântica."""
        if not chunks:
            return "", 0.0
        
        # Gera embeddings
        query_embedding = self.embedding_model.encode([query])
        chunk_embeddings = self.embedding_model.encode(chunks)
        
        # Calcula similaridade
        similarities = cosine_similarity(query_embedding, chunk_embeddings)[0]
        
        # Encontra o chunk mais similar
        best_idx = np.argmax(similarities)
        best_chunk = chunks[best_idx]
        best_score = similarities[best_idx]
        
        return best_chunk, best_score
    
    def extract_focused_content(self, url: str, query: str, min_similarity: float = 0.3) -> Dict:
        """Pipeline completo: scraping -> chunking -> busca semântica."""
        print(f"🔍 Extraindo conteúdo de: {url}")
        
        # 1. Scraping
        content = self.scrape_content(url)
        if content.startswith("Erro"):
            return {"error": content}
        
        # 2. Chunking
        chunks = self.chunk_text(content)
        print(f"📄 Dividido em {len(chunks)} chunks")
        
        # 3. Busca semântica
        relevant_chunk, similarity = self.find_relevant_chunk(chunks, query)
        
        if similarity < min_similarity:
            return {
                "error": f"Nenhum conteúdo relevante encontrado (similaridade: {similarity:.2f})",
                "similarity": similarity
            }
        
        return {
            "success": True,
            "relevant_content": relevant_chunk,
            "similarity": similarity,
            "source_url": url,
            "total_chunks": len(chunks)
        }

def generate_maintenance_response(content_data: Dict, original_query: str) -> str:
    """Gera resposta focada usando apenas o conteúdo extraído."""
    if "error" in content_data:
        return f"❌ {content_data['error']}"
    
    relevant_content = content_data["relevant_content"]
    source_url = content_data["source_url"]
    similarity = content_data["similarity"]
    
    # Template de resposta estruturada
    response = f"""🔧 **Resposta baseada em fonte confiável:**

{relevant_content}

📊 **Análise da informação:**
• Relevância: {similarity:.1%}
• Fonte verificada: ✅
• Contexto: Manutenção Industrial

🔗 **Referência:** {source_url}

💡 **Aplicação prática:** Esta informação pode ser aplicada diretamente em procedimentos de manutenção preditiva e corretiva."""
    
    return response

# Função principal para integração com a aplicação existente
def analyze_web_content_for_maintenance(query: str, urls: List[str]) -> str:
    """Analisa conteúdo web com foco em manutenção industrial."""
    extractor = WebContentExtractor()
    
    best_result = None
    best_similarity = 0
    
    for url in urls:
        try:
            result = extractor.extract_focused_content(url, query)
            if result.get("success") and result.get("similarity", 0) > best_similarity:
                best_result = result
                best_similarity = result["similarity"]
        except Exception as e:
            continue
    
    if best_result:
        return generate_maintenance_response(best_result, query)
    else:
        return """❌ **Nenhum conteúdo relevante encontrado**

🔄 **Sugestões:**
• Reformule a pergunta com termos mais específicos
• Verifique se as URLs estão acessíveis
• Tente incluir palavras-chave técnicas da área de manutenção

💬 **Alternativa:** Descreva sua dúvida específica sobre manutenção industrial."""
