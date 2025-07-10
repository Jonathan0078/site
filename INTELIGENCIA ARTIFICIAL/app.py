
import os
import uuid
import json
import mimetypes
import base64
import requests
import re
from urllib.parse import quote, urljoin
from PIL import Image
import io
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
try:
    import docx
except ImportError:
    docx = None
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
try:
    from huggingface_hub import InferenceClient
except ImportError:
    InferenceClient = None

# --- INICIALIZAÇÃO DO FLASK ---
app = Flask(__name__)

# Permite apenas o domínio do GitHub Pages do seu projeto e o endereço do backend Render
CORS(app, supports_credentials=True, origins=[
    "https://jonathan0078.github.io",
    "https://aemi.onrender.com"
])

# Carrega as chaves da aplicação a partir de variáveis de ambiente
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-key-change-in-production")
HUGGING_FACE_TOKEN = os.getenv("HF_TOKEN")

# Validação das chaves
if not HUGGING_FACE_TOKEN:
    print("AVISO: Token da Hugging Face não configurado. Chat com IA não funcionará.")

app.secret_key = FLASK_SECRET_KEY

# --- CONFIGURAÇÕES DA BASE DE CONHECIMENTO ---
KB_DIR = os.path.join(os.path.dirname(__file__), 'knowledge_base')
KB_DB = os.path.join(KB_DIR, 'kb_data.json')
os.makedirs(KB_DIR, exist_ok=True)

def load_kb():
    if not os.path.exists(KB_DB):
        return []
    try:
        with open(KB_DB, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Erro ao carregar KB: {e}")
        return []

def save_kb(data):
    try:
        with open(KB_DB, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Erro ao salvar KB: {e}")

# --- ROTAS DA BASE DE CONHECIMENTO ---
@app.route('/kb/upload', methods=['POST'])
def kb_upload():
    try:
        kb = load_kb()
        
        # Upload de arquivo
        if 'file' in request.files and request.files['file'].filename:
            file = request.files['file']
            ext = os.path.splitext(file.filename)[1].lower()
            file_id = str(uuid.uuid4())
            filename = f"{file_id}{ext}"
            file_path = os.path.join(KB_DIR, filename)
            file.save(file_path)
            
            # Extração de texto
            extracted_text = ''
            if ext == '.pdf' and PyPDF2:
                try:
                    with open(file_path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        for page in reader.pages:
                            extracted_text += page.extract_text() or ''
                except Exception as e:
                    print(f"Erro ao extrair PDF: {e}")
                    extracted_text = ''
            elif ext in ['.docx'] and docx:
                try:
                    doc = docx.Document(file_path)
                    extracted_text = '\n'.join([p.text for p in doc.paragraphs])
                except Exception as e:
                    print(f"Erro ao extrair DOCX: {e}")
                    extracted_text = ''
            elif ext in ['.txt', '.md', '.csv']:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        extracted_text = f.read()
                except Exception as e:
                    print(f"Erro ao extrair texto: {e}")
                    extracted_text = ''
            
            kb.append({
                'id': file_id,
                'type': 'file',
                'name': file.filename,
                'filename': filename,
                'content': extracted_text[:20000] if extracted_text else ''
            })
        
        # Cadastro de FAQ/manual (texto)
        faq = request.form.get('faq', '').strip()
        if faq:
            faq_id = str(uuid.uuid4())
            kb.append({
                'id': faq_id,
                'type': 'faq',
                'name': faq[:40] + ('...' if len(faq) > 40 else ''),
                'content': faq
            })
        
        save_kb(kb)
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Erro ao fazer upload para KB: {e}")
        return jsonify({'error': 'Erro ao processar upload'}), 500

@app.route('/kb/list')
def kb_list():
    try:
        kb = load_kb()
        q = request.args.get('q', '').strip().lower()
        if q:
            kb = [item for item in kb if q in item.get('name','').lower() or q in item.get('content','').lower()]
        return jsonify(kb)
    except Exception as e:
        print(f"Erro ao listar KB: {e}")
        return jsonify([])

@app.route('/kb/remove/<item_id>', methods=['DELETE'])
def kb_remove(item_id):
    try:
        kb = load_kb()
        item = next((i for i in kb if i['id'] == item_id), None)
        if not item:
            return jsonify({'error': 'Item não encontrado'}), 404
        
        kb = [i for i in kb if i['id'] != item_id]
        
        if item['type'] == 'file' and 'filename' in item:
            try:
                os.remove(os.path.join(KB_DIR, item['filename']))
            except Exception:
                pass
        
        save_kb(kb)
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Erro ao remover item da KB: {e}")
        return jsonify({'error': 'Erro ao remover item'}), 500

@app.route('/kb/download/<item_id>')
def kb_download(item_id):
    try:
        kb = load_kb()
        item = next((i for i in kb if i['id'] == item_id and i['type'] == 'file'), None)
        if not item:
            return 'Arquivo não encontrado', 404
        return send_from_directory(KB_DIR, item['filename'], as_attachment=True, download_name=item['name'])
    except Exception as e:
        print(f"Erro ao fazer download: {e}")
        return 'Erro interno', 500

# --- CONSTANTES E CONFIGURAÇÕES DO CHAT ---
SYSTEM_PROMPT = "Você é a A.E.M.I, uma IA especialista em manutenção industrial e um projeto do canal 'Manutenção Industrial ARQUIVOS'. Seja direta e objetiva. Responda apenas a perguntas relacionadas a este domínio. Se a pergunta não for sobre manutenção industrial, diga que você só pode ajudar com tópicos relacionados à manutenção industrial."
MAX_HISTORY_LENGTH = 10

# --- FUNÇÕES DE PESQUISA NA INTERNET ---
def search_internet(query, max_results=5):
    """Pesquisa na internet usando DuckDuckGo e retorna resultados com links."""
    try:
        # Remove caracteres especiais da query
        clean_query = re.sub(r'[^\w\s-]', '', query).strip()
        
        # URL da API do DuckDuckGo
        search_url = f"https://html.duckduckgo.com/html/?q={quote(clean_query)}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return {"error": "Erro ao conectar com o serviço de pesquisa"}
        
        # Parse do HTML se BeautifulSoup estiver disponível
        if BeautifulSoup:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            results = []
            result_divs = soup.find_all('div', class_='result__body')
            
            for i, div in enumerate(result_divs[:max_results]):
                title_elem = div.find('a', class_='result__a')
                snippet_elem = div.find('a', class_='result__snippet')
                
                if title_elem and snippet_elem:
                    title = title_elem.get_text(strip=True)
                    url = title_elem.get('href', '')
                    snippet = snippet_elem.get_text(strip=True)
                    
                    # Limpa URLs malformadas
                    if url.startswith('//'):
                        url = 'https:' + url
                    elif not url.startswith('http'):
                        continue
                    
                    results.append({
                        'title': title,
                        'url': url,
                        'snippet': snippet
                    })
            
            return {"results": results, "query": clean_query}
        else:
            return {"error": "Biblioteca de parsing não disponível"}
            
    except Exception as e:
        print(f"Erro na pesquisa: {e}")
        return {"error": f"Erro durante a pesquisa: {str(e)}"}

def extract_page_content(url, max_chars=2000):
    """Extrai conteúdo aprimorado de uma página web para análise profunda."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }
        
        print(f"🌐 Acessando: {url}")
        response = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
        
        if response.status_code == 200 and BeautifulSoup:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove elementos desnecessários de forma mais abrangente
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 
                               'iframe', 'noscript', 'form', 'button', 'input', 
                               'select', 'textarea', 'label', 'fieldset']):
                element.decompose()
            
            # Remove divs com classes comuns de navegação e ads
            unwanted_classes = ['nav', 'menu', 'sidebar', 'footer', 'header', 'ad', 
                              'advertisement', 'banner', 'social', 'share', 'comment',
                              'related', 'recommendation', 'popup', 'modal']
            
            for class_name in unwanted_classes:
                for element in soup.find_all(attrs={'class': lambda x: x and any(cls in str(x).lower() for cls in [class_name])}):
                    element.decompose()
            
            # Estratégia melhorada para encontrar conteúdo principal
            content_selectors = [
                'article', 'main', '[role="main"]',
                '.content', '.post', '.article', '.entry',
                '.main-content', '.post-content', '.article-content',
                '.description', '.summary', '.abstract',
                'div[id*="content"]', 'div[class*="content"]',
                'section', '.section'
            ]
            
            main_content = None
            for selector in content_selectors:
                try:
                    found = soup.select_one(selector)
                    if found and len(found.get_text().strip()) > 200:
                        main_content = found
                        break
                except:
                    continue
            
            # Se não encontrou conteúdo principal, usa o body mas filtra melhor
            if not main_content:
                main_content = soup.find('body') or soup
            
            # Extrai o texto de forma mais inteligente
            text_parts = []
            
            # Prioriza parágrafos, títulos e listas
            for element in main_content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td']):
                text = element.get_text().strip()
                if len(text) > 10 and text not in text_parts:  # Evita duplicatas
                    text_parts.append(text)
            
            # Se não encontrou texto suficiente, pega todo o texto
            if len(' '.join(text_parts)) < 300:
                text_parts = [main_content.get_text()]
            
            # Junta e limpa o texto
            full_text = ' '.join(text_parts)
            
            # Limpeza avançada do texto
            lines = (line.strip() for line in full_text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk and len(chunk) > 3)
            
            # Remove caracteres especiais em excesso
            import re
            text = re.sub(r'\s+', ' ', text)  # Múltiplos espaços
            text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\"\'\/]', '', text)  # Caracteres especiais
            
            # Filtra sentenças por qualidade
            sentences = text.split('.')
            quality_sentences = []
            
            for sentence in sentences:
                sentence = sentence.strip()
                # Filtros de qualidade
                if (len(sentence) > 15 and 
                    len(sentence) < 500 and 
                    sentence.count(' ') > 3 and  # Pelo menos 4 palavras
                    not sentence.lower().startswith(('clique', 'click', 'more', 'read', 'ver mais', 'saiba mais')) and
                    sentence not in quality_sentences):
                    quality_sentences.append(sentence)
            
            # Reconstrói o texto limpo
            cleaned_text = '. '.join(quality_sentences[:20])  # Primeiras 20 sentenças de qualidade
            
            if len(cleaned_text) < 100:
                # Fallback: pega texto bruto se a limpeza foi muito agressiva
                cleaned_text = text[:max_chars]
            
            result = cleaned_text[:max_chars]
            print(f"✅ Extraído {len(result)} caracteres de conteúdo útil")
            
            return result
        
        print(f"❌ Erro HTTP {response.status_code} ao acessar {url}")
        return ""
        
    except requests.exceptions.Timeout:
        print(f"⏰ Timeout ao acessar {url}")
        return ""
    except requests.exceptions.RequestException as e:
        print(f"🌐 Erro de conexão ao acessar {url}: {e}")
        return ""
    except Exception as e:
        print(f"❌ Erro geral ao extrair conteúdo de {url}: {e}")
        return ""

def should_search_internet(message):
    """Determina se a mensagem requer pesquisa na internet."""
    search_triggers = [
        'pesquisar', 'buscar', 'procurar', 'pesquise', 'busque', 'procure',
        'últimas', 'recente', 'atual', 'hoje', 'agora', 'notícias',
        'preço', 'valor', 'custo', 'onde comprar', 'fornecedor',
        'norma', 'regulamento', 'lei', 'nbr', 'iso', 'abnt',
        'fabricante', 'marca', 'modelo', 'especificação',
        'curso', 'treinamento', 'certificação', 'capacitação',
        'empresa', 'fábrica', 'catálogo', 'manual',
        'novidade', 'lançamento', 'tecnologia', 'inovação',
        'mercado', 'tendência', 'estatística', 'dados',
        'comparar', 'diferença', 'vantagem', 'desvantagem'
    ]
    
    message_lower = message.lower()
    
    # Busca por gatilhos diretos
    if any(trigger in message_lower for trigger in search_triggers):
        return True
    
    # Busca por padrões de perguntas que podem precisar de informações atuais
    current_info_patterns = [
        'qual', 'quais', 'como', 'onde', 'quando', 'por que', 'porque',
        'existe', 'tem', 'há', 'possui', 'funciona', 'serve'
    ]
    
    # Se a mensagem contém padrões de pergunta E palavras técnicas, pode precisar de pesquisa
    if any(pattern in message_lower for pattern in current_info_patterns):
        technical_words = [
            'equipamento', 'máquina', 'motor', 'bomba', 'válvula', 'sensor',
            'automação', 'industrial', 'manutenção', 'falha', 'diagnóstico',
            'lubrificação', 'rolamento', 'correia', 'engrenagem', 'hidráulica',
            'pneumática', 'elétrica', 'eletrônica', 'software', 'sistema'
        ]
        
        if any(word in message_lower for word in technical_words):
            return True
    
    return False

def analyze_search_content(search_data, original_query):
    """Analisa profundamente o conteúdo dos resultados de pesquisa e gera uma resposta elaborada."""
    if "error" in search_data:
        return f"🔍 **Pesquisa na Internet**\n\n❌ {search_data['error']}\n\nComo alternativa, posso ajudar com base no meu conhecimento sobre manutenção industrial."
    
    results = search_data.get("results", [])
    if not results:
        return f"🔍 **Pesquisa na Internet**\n\n🚫 Nenhum resultado encontrado para: \"{original_query}\"\n\nComo alternativa, posso ajudar com base no meu conhecimento sobre manutenção industrial."
    
    # Extrai e analisa conteúdo dos primeiros resultados com mais profundidade
    content_sources = []
    total_content = ""
    
    print(f"🔍 Analisando {len(results[:5])} resultados para: {original_query}")
    
    for i, result in enumerate(results[:5], 1):  # Analisa os 5 primeiros resultados
        print(f"📖 Extraindo conteúdo do site {i}/5: {result['title']}")
        content = extract_page_content(result['url'], max_chars=2000)  # Aumenta limite para mais conteúdo
        
        if content.strip() and len(content) > 100:  # Só considera conteúdo substancial
            content_sources.append({
                'title': result['title'],
                'url': result['url'],
                'content': content,
                'snippet': result.get('snippet', '')
            })
            total_content += f"\n=== {result['title']} ===\n{content}\n"
    
    if not content_sources:
        return f"🔍 **Pesquisa na Internet**\n\n⚠️ Encontrei {len(results)} resultados para \"{original_query}\", mas não consegui extrair conteúdo útil dos sites.\n\n💡 **Isso pode acontecer quando:**\n• Os sites têm proteção anti-bot\n• O conteúdo é carregado por JavaScript\n• Sites requerem login\n\nComo alternativa, posso ajudar com base no meu conhecimento sobre manutenção industrial."
    
    print(f"✅ Conteúdo extraído de {len(content_sources)} fontes. Gerando análise...")
    
    # Gera resposta inteligente usando LLM com todo o conteúdo extraído
    try:
        client = get_text_client()
        if client:
            # Cria um prompt mais elaborado para análise profunda
            prompt = f"""Como A.E.M.I, assistente especialista em manutenção industrial, analise profundamente o conteúdo extraído da internet e forneça uma resposta completa e técnica para a pergunta do usuário.

**PERGUNTA DO USUÁRIO:** {original_query}

**CONTEÚDO EXTRAÍDO DA INTERNET:**
{total_content[:12000]}  # Limita para não sobrecarregar

**INSTRUÇÕES PARA RESPOSTA:**
1. **Análise Técnica Completa:** Forneça uma resposta detalhada e técnica baseada no conteúdo real extraído
2. **Síntese Inteligente:** Combine informações de múltiplas fontes para criar uma resposta coerente
3. **Foco em Manutenção Industrial:** Relacione tudo com práticas de manutenção, equipamentos e procedimentos
4. **Informações Práticas:** Inclua dados específicos, especificações, procedimentos ou recomendações encontradas
5. **Estrutura Clara:** Organize a resposta com tópicos e subtópicos quando relevante
6. **Credibilidade:** Mencione dados específicos e técnicos encontrados nas fontes

**FORMATO DA RESPOSTA:**
- Comece com um resumo executivo
- Desenvolva os pontos técnicos principais
- Inclua informações práticas específicas
- Termine com recomendações ou conclusões

**NÃO APENAS CITE AS FONTES - ANALISE E SINTETIZE O CONTEÚDO REAL!**

Resposta técnica detalhada:"""

            response = client.text_generation(
                prompt,
                max_new_tokens=1500,  # Aumenta limite para respostas mais completas
                temperature=0.6,  # Diminui temperatura para respostas mais focadas
                return_full_text=False
            )
            
            ai_response = response.strip()
            
            # Adiciona resumo das fontes analisadas
            sources_summary = "\n\n" + "="*50 + "\n"
            sources_summary += "📚 **FONTES ANALISADAS E PROCESSADAS:**\n\n"
            
            for i, source in enumerate(content_sources, 1):
                word_count = len(source['content'].split())
                sources_summary += f"**{i}. {source['title']}**\n"
                sources_summary += f"   📊 Conteúdo analisado: ~{word_count} palavras\n"
                sources_summary += f"   🔗 URL: {source['url']}\n"
                if source['snippet']:
                    sources_summary += f"   📝 Resumo: {source['snippet'][:100]}...\n"
                sources_summary += "\n"
            
            sources_summary += f"💡 **Total:** {len(content_sources)} fontes com conteúdo real analisado pela IA"
            
            final_response = f"🔍 **ANÁLISE COMPLETA DA INTERNET - \"{original_query}\"**\n\n{ai_response}{sources_summary}"
            
            print(f"✅ Resposta gerada com sucesso! {len(final_response)} caracteres")
            return final_response
            
    except Exception as e:
        print(f"❌ Erro ao gerar resposta com LLM: {e}")
    
    # Fallback melhorado: cria um resumo manual mais inteligente
    print("🔄 Usando fallback para gerar resumo manual...")
    
    response = f"🔍 **PESQUISA E ANÁLISE NA INTERNET - \"{original_query}\"**\n\n"
    response += f"📊 **Analisei {len(content_sources)} fontes com conteúdo real:**\n\n"
    
    # Cria resumo mais inteligente do conteúdo
    for i, source in enumerate(content_sources, 1):
        response += f"**📖 Fonte {i}: {source['title']}**\n"
        
        # Extrai trechos mais relevantes do conteúdo
        content_words = source['content'].split()
        if len(content_words) > 50:
            # Pega primeiras e últimas partes para melhor contexto
            summary_start = ' '.join(content_words[:30])
            summary_end = ' '.join(content_words[-20:])
            content_summary = f"{summary_start}... {summary_end}"
        else:
            content_summary = source['content']
        
        response += f"📋 **Conteúdo analisado:** {content_summary[:300]}...\n"
        response += f"🔗 **Link:** {source['url']}\n\n"
    
    response += "💡 **IMPORTANTE:** Esta análise foi baseada no conteúdo REAL extraído dos sites, não apenas nos títulos ou links!"
    
    return response

# --- FUNÇÕES DE PROCESSAMENTO ---
def get_text_client():
    """Cria e retorna um cliente para o modelo de linguagem."""
    if not HUGGING_FACE_TOKEN or not InferenceClient:
        return None
    return InferenceClient(model="meta-llama/Meta-Llama-3-8B-Instruct", token=HUGGING_FACE_TOKEN)

def get_vision_client():
    """Cria e retorna um cliente para análise de imagens."""
    if not HUGGING_FACE_TOKEN or not InferenceClient:
        return None
    return InferenceClient(model="microsoft/kosmos-2-patch14-224", token=HUGGING_FACE_TOKEN)

def analyze_image(image_path):
    """Analisa uma imagem com múltiplos métodos para máxima precisão."""
    try:
        print(f"🖼️ Iniciando análise completa da imagem: {os.path.basename(image_path)}")
        
        # 1. ANÁLISE VISUAL COM IA AVANÇADA
        vision_analysis = ""
        detailed_analysis = ""
        
        try:
            client = get_vision_client()
            if client and HUGGING_FACE_TOKEN:
                print("🤖 Tentando análise visual com IA...")
                
                # Prepara a imagem otimizada
                with open(image_path, 'rb') as f:
                    image_data = f.read()
                
                img = Image.open(io.BytesIO(image_data))
                original_size = img.size
                
                # Otimiza a imagem para melhor análise
                if img.width > 1024 or img.height > 1024:
                    img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Melhora a qualidade da imagem para análise
                from PIL import ImageEnhance
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1.2)  # Aumenta contraste
                
                enhancer = ImageEnhance.Sharpness(img)
                img = enhancer.enhance(1.1)  # Aumenta nitidez
                
                # Salva em alta qualidade
                temp_buffer = io.BytesIO()
                img.save(temp_buffer, format='JPEG', quality=95, optimize=True)
                temp_buffer.seek(0)
                
                # Múltiplas tentativas com diferentes modelos/configurações
                vision_models = [
                    "microsoft/kosmos-2-patch14-224",
                    "Salesforce/blip-image-captioning-large",
                    "nlpconnect/vit-gpt2-image-captioning"
                ]
                
                for model_name in vision_models:
                    try:
                        print(f"🔍 Testando modelo: {model_name}")
                        vision_client = InferenceClient(model=model_name, token=HUGGING_FACE_TOKEN)
                        
                        temp_buffer.seek(0)
                        result = vision_client.image_to_text(temp_buffer.getvalue())
                        
                        if result:
                            if isinstance(result, dict):
                                vision_analysis = result.get('generated_text', '')
                            else:
                                vision_analysis = str(result)
                            
                            if len(vision_analysis) > 20:  # Se obteve análise útil
                                print(f"✅ Análise visual obtida com {model_name}")
                                break
                                
                    except Exception as e:
                        print(f"❌ Modelo {model_name} falhou: {e}")
                        continue
                
                # Se conseguiu análise visual, faz análise mais detalhada
                if vision_analysis and len(vision_analysis) > 20:
                    try:
                        text_client = get_text_client()
                        if text_client:
                            enhancement_prompt = f"""Como especialista em manutenção industrial, analise esta descrição visual de uma imagem e forneça uma interpretação técnica detalhada:

DESCRIÇÃO VISUAL: {vision_analysis}

Forneça uma análise técnica focada em:
1. Identificação de equipamentos/componentes
2. Estado/condição dos equipamentos
3. Possíveis problemas ou anomalias
4. Recomendações de manutenção
5. Aspectos de segurança

Seja específico e técnico:"""

                            enhanced_result = text_client.text_generation(
                                enhancement_prompt,
                                max_new_tokens=800,
                                temperature=0.6,
                                return_full_text=False
                            )
                            
                            detailed_analysis = enhanced_result.strip()
                            print("✅ Análise técnica detalhada gerada")
                            
                    except Exception as e:
                        print(f"⚠️ Erro na análise detalhada: {e}")
                        
        except Exception as e:
            print(f"❌ Erro no sistema de visão: {e}")
            vision_analysis = ""
        
        # 2. ANÁLISE TÉCNICA E METADADOS DA IMAGEM
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        img = Image.open(io.BytesIO(image_data))
        width, height = img.size
        format_img = img.format or "Desconhecido"
        
        print(f"📊 Analisando características da imagem {width}x{height}")
        
        # 3. ANÁLISE AVANÇADA DE CARACTERÍSTICAS VISUAIS
        visual_characteristics = analyze_visual_characteristics(img)
        color_analysis = analyze_image_colors(img)
        
        # 4. ANÁLISE DO CONTEXTO DO ARQUIVO
        filename = os.path.basename(image_path).lower()
        context_hints = analyze_filename_context(filename)
        
        # 5. ANÁLISE DE METADADOS EXIF (se disponível)
        metadata_info = extract_image_metadata(image_path)
        
        # 6. MONTA A RESPOSTA COMPLETA E INTELIGENTE
        if vision_analysis and len(vision_analysis) > 20:
            # Resposta completa com IA
            description = f"""🔍 **ANÁLISE COMPLETA DA IMAGEM**

🤖 **VISÃO COMPUTACIONAL - O que a IA identificou:**
{vision_analysis}

🔧 **ANÁLISE TÉCNICA AEMI:**"""
            
            if detailed_analysis:
                description += f"\n{detailed_analysis}"
            else:
                description += f"\n{interpret_for_maintenance(vision_analysis)}"
            
            description += f"""

📊 **DADOS TÉCNICOS:**
• Formato: {format_img} | Resolução: {width}x{height}px
• Tamanho do arquivo: {len(image_data)/1024:.1f} KB
{visual_characteristics}
{color_analysis}
{context_hints}
{metadata_info}

🔬 **CAPACIDADES DE ANÁLISE ATIVADAS:**
✅ Análise visual com IA
✅ Reconhecimento de equipamentos
✅ Detecção de anomalias
✅ Análise de cores e texturas
✅ Contextualização industrial

💬 **PRÓXIMOS PASSOS:**
Agora posso responder perguntas específicas como:
• "Que tipo de falha você identifica?"
• "Quais os procedimentos de manutenção?"
• "Este equipamento está em bom estado?"
• "Que ferramentas são necessárias?"

❓ **Sua pergunta:** O que você gostaria de saber sobre esta imagem?"""

        elif vision_analysis and len(vision_analysis) > 5:
            # Análise básica
            description = f"""🔍 **ANÁLISE DA IMAGEM**

🤖 **Análise Visual Básica:**
{vision_analysis}

🔧 **Interpretação Técnica:**
{interpret_for_maintenance(vision_analysis)}

📊 **Informações Técnicas:**
• Formato: {format_img} | Dimensões: {width}x{height}px
• Tamanho: {len(image_data)/1024:.1f} KB
{visual_characteristics}
{color_analysis}
{context_hints}

💡 **Como posso ajudar mais:**
Descreva sua dúvida específica sobre a imagem para uma análise mais direcionada."""

        else:
            # Fallback robusto com análise alternativa
            description = f"""📸 **ANÁLISE DA IMAGEM (Modo Alternativo)**

⚠️ **Status da Análise Visual:**
A análise automática com IA não está disponível no momento, mas posso ajudar de outras formas:

🔧 **ANÁLISE BASEADA EM CARACTERÍSTICAS:**
{visual_characteristics}
{color_analysis}
{context_hints}
{metadata_info}

📊 **Dados Técnicos:**
• Formato: {format_img} | Resolução: {width}x{height}px  
• Tamanho: {len(image_data)/1024:.1f} KB

🎯 **COMO POSSO AJUDAR:**
Mesmo sem análise visual automática, sou especialista em:
• Procedimentos de manutenção para equipamentos específicos
• Análise de falhas com base em sua descrição
• Recomendações de ferramentas e métodos
• Normas de segurança industrial
• Especificações técnicas

📝 **Para melhor ajuda, me informe:**
1. Que equipamento/componente você vê na imagem?
2. Qual problema ou dúvida você tem?
3. Que tipo de análise precisa?

💬 **Exemplo:** "Vejo um motor elétrico com ruído anormal" ou "Rolamento apresentando desgaste unusual\""""

        print("✅ Análise completa da imagem finalizada")
        return description
        
    except Exception as e:
        error_msg = f"❌ Erro ao analisar imagem: {str(e)}"
        print(error_msg)
        return f"""{error_msg}

🔄 **Soluções possíveis:**
• Verifique se o arquivo não está corrompido
• Tente enviar em formato JPG ou PNG
• Reduza o tamanho da imagem se for muito grande

💬 **Alternativa:** Descreva o que você vê na imagem e eu posso ajudar com base na descrição!"""

def analyze_visual_characteristics(img):
    """Analisa características visuais básicas da imagem."""
    try:
        # Análise de cores
        colors = img.getcolors(maxcolors=256*256*256)
        if colors:
            dominant_colors = sorted(colors, key=lambda x: x[0], reverse=True)[:3]
            
            # Interpretação das cores para contexto industrial
            color_hints = []
            for count, color in dominant_colors:
                if isinstance(color, tuple) and len(color) >= 3:
                    r, g, b = color[:3]
                    if r > 200 and g < 100 and b < 100:  # Vermelho
                        color_hints.append("Possível indicação de perigo/parada")
                    elif r > 200 and g > 200 and b < 100:  # Amarelo
                        color_hints.append("Possível sinalização de atenção")
                    elif r < 100 and g > 150 and b < 100:  # Verde
                        color_hints.append("Possível indicação de funcionamento normal")
                    elif r < 100 and g < 100 and b > 150:  # Azul
                        color_hints.append("Possível componente hidráulico")
            
            if color_hints:
                return f"\n🎨 **Indicações visuais:** {', '.join(color_hints)}"
        
        return "\n🎨 **Análise de cores:** Variadas (equipamento/ambiente industrial)"
    except:
        return ""

def analyze_filename_context(filename):
    """Analisa o nome do arquivo para contexto industrial."""
    maintenance_keywords = {
        'motor': 'Motor elétrico/mecânico',
        'rolamento': 'Rolamento/bearing',
        'bearing': 'Rolamento',
        'engrenagem': 'Sistema de engrenagens',
        'gear': 'Engrenagem',
        'bomba': 'Bomba hidráulica/pneumática',
        'pump': 'Bomba',
        'valvula': 'Válvula',
        'valve': 'Válvula',
        'correia': 'Correia/belt',
        'belt': 'Correia',
        'polia': 'Polia',
        'pulley': 'Polia',
        'falha': 'Análise de falha',
        'failure': 'Falha',
        'desgaste': 'Desgaste',
        'wear': 'Desgaste',
        'manutencao': 'Manutenção',
        'maintenance': 'Manutenção',
        'hidraulica': 'Sistema hidráulico',
        'hydraulic': 'Hidráulico',
        'pneumatic': 'Pneumático',
        'pneumatica': 'Pneumático',
        'eletrica': 'Sistema elétrico',
        'electric': 'Elétrico',
        'sensor': 'Sensor/instrumento',
        'temperatura': 'Monitoramento térmico',
        'pressure': 'Sistema de pressão',
        'pressao': 'Sistema de pressão',
        'vibration': 'Análise de vibração',
        'vibracao': 'Análise de vibração'
    }
    
    found = []
    for keyword, description in maintenance_keywords.items():
        if keyword in filename:
            found.append(description)
    
    if found:
        return f"\n🏷️ **Contexto identificado:** {', '.join(found)}"
    return ""

def analyze_image_colors(img):
    """Analisa as cores da imagem para contexto industrial."""
    try:
        # Converte para RGB se necessário
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Redimensiona para análise mais rápida
        img_small = img.resize((100, 100))
        
        # Obtém cores dominantes
        colors = img_small.getcolors(maxcolors=256*256*256)
        if not colors:
            return ""
        
        # Ordena por frequência
        dominant_colors = sorted(colors, key=lambda x: x[0], reverse=True)[:5]
        
        color_interpretations = []
        for count, color in dominant_colors:
            if isinstance(color, tuple) and len(color) >= 3:
                r, g, b = color[:3]
                
                # Interpretação industrial das cores
                if r > 180 and g < 80 and b < 80:  # Vermelho forte
                    color_interpretations.append("🔴 Vermelho predominante (indicação de perigo/parada)")
                elif r > 200 and g > 150 and b < 100:  # Amarelo/laranja
                    color_interpretations.append("🟡 Amarelo/laranja (sinalização de atenção)")
                elif r < 100 and g > 120 and b < 100:  # Verde
                    color_interpretations.append("🟢 Verde detectado (operação normal)")
                elif r < 100 and g < 100 and b > 120:  # Azul
                    color_interpretations.append("🔵 Azul presente (sistemas hidráulicos)")
                elif r > 150 and g > 100 and b < 80:  # Marrom/ferrugem
                    color_interpretations.append("🟤 Tons marrons (possível oxidação)")
                elif r > 120 and g > 120 and b > 120:  # Tons metálicos
                    color_interpretations.append("⚪ Tons metálicos (estruturas/equipamentos)")
        
        if color_interpretations:
            return f"\n🎨 **Análise de cores:** {'; '.join(color_interpretations[:3])}"
        return ""
        
    except Exception as e:
        print(f"Erro na análise de cores: {e}")
        return ""

def extract_image_metadata(image_path):
    """Extrai metadados EXIF da imagem quando disponível."""
    try:
        from PIL.ExifTags import TAGS
        
        img = Image.open(image_path)
        
        if hasattr(img, '_getexif'):
            exifdata = img.getexif()
            
            if exifdata:
                metadata = []
                for tag_id in exifdata:
                    tag = TAGS.get(tag_id, tag_id)
                    data = exifdata.get(tag_id)
                    
                    if tag in ['DateTime', 'DateTimeOriginal']:
                        metadata.append(f"📅 Data: {data}")
                    elif tag == 'Make':
                        metadata.append(f"📱 Dispositivo: {data}")
                    elif tag == 'Software':
                        metadata.append(f"💻 Software: {data}")
                
                if metadata:
                    return f"\n📋 **Metadados:** {'; '.join(metadata[:2])}"
        
        return ""
        
    except Exception:
        return ""

def interpret_for_maintenance(vision_text):
    """Interpreta a análise visual no contexto de manutenção industrial."""
    vision_lower = vision_text.lower()
    
    interpretations = []
    
    # Identifica equipamentos
    if any(word in vision_lower for word in ['motor', 'engine', 'máquina', 'machine']):
        interpretations.append("🔧 **Motor/Máquina identificado** - Posso ajudar com análise de vibração, alinhamento, lubrificação")
    
    if any(word in vision_lower for word in ['rolamento', 'bearing', 'roda', 'wheel']):
        interpretations.append("⚙️ **Rolamento detectado** - Posso orientar sobre montagem, desmontagem e análise de falhas")
    
    if any(word in vision_lower for word in ['tubo', 'pipe', 'mangueira', 'hose']):
        interpretations.append("🔧 **Sistema hidráulico/pneumático** - Posso ajudar com pressões, vedações e conexões")
    
    if any(word in vision_lower for word in ['parafuso', 'bolt', 'rosca', 'thread']):
        interpretations.append("🔩 **Fixação detectada** - Posso orientar sobre torques e procedimentos de aperto")
    
    if any(word in vision_lower for word in ['óleo', 'oil', 'graxa', 'grease', 'lubrificante']):
        interpretations.append("🛢️ **Lubrificação identificada** - Posso ajudar com intervalos e tipos de lubrificantes")
    
    # Identifica problemas
    if any(word in vision_lower for word in ['rachadura', 'crack', 'quebrado', 'broken']):
        interpretations.append("⚠️ **Possível falha estrutural** - Recomendo inspeção detalhada e avaliação de segurança")
    
    if any(word in vision_lower for word in ['oxidação', 'rust', 'corrosão', 'corrosion']):
        interpretations.append("🔴 **Corrosão detectada** - Posso orientar sobre tratamento e prevenção")
    
    if any(word in vision_lower for word in ['desgaste', 'wear', 'gasto', 'worn']):
        interpretations.append("📉 **Desgaste identificado** - Posso ajudar a avaliar vida útil restante")
    
    if interpretations:
        return '\n'.join(interpretations)
    else:
        return "📋 **Análise geral:** Identifiquei elementos industriais. Me descreva sua dúvida específica para orientação detalhada."

def generate_chat_response(chat_history):
    """Processa um histórico de chat e retorna a resposta do modelo."""
    client = get_text_client()
    if not client:
        return "Desculpe, o serviço de IA não está disponível no momento."
    
    try:
        response_generator = client.chat_completion(
            messages=chat_history,
            max_tokens=1500,
            stream=False
        )
        return response_generator.choices[0].message.content
    except Exception as e:
        print(f"Erro na geração de resposta: {e}")
        return "Desculpe, ocorreu um erro ao gerar a resposta."

# --- ROTAS PRINCIPAIS ---
@app.route('/')
def index():
    return "Servidor da AEMI (versão com Llama 3 8B e memória) está no ar."

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.form.get('message', '')
        if not user_message.strip():
            return jsonify({"error": "Nenhuma mensagem enviada."}), 400

        # 1. Buscar resposta na base de conhecimento
        kb = load_kb()
        user_message_lower = user_message.lower()
        import difflib
        
        # Busca exata ou substring em FAQ
        for item in kb:
            if item['type'] == 'faq' and user_message_lower in item.get('content','').lower():
                return jsonify({'response': f"[Base de Conhecimento]\n{item['content'][:600]}"})
        
        # Busca fuzzy em FAQ
        best_match = None
        best_ratio = 0.0
        for item in kb:
            if item['type'] == 'faq':
                content = item.get('content','').lower()
                ratio = difflib.SequenceMatcher(None, user_message_lower, content).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match = item
        
        if best_match and best_ratio > 0.45:
            return jsonify({'response': f"[Base de Conhecimento - resposta aproximada]\n{best_match['content'][:600]}"})

        # 2. Buscar por conteúdo extraído de arquivos
        for item in kb:
            if item['type'] == 'file' and item.get('content') and user_message_lower in item['content'].lower():
                return jsonify({'response': f"[Arquivo: {item['name']}]\n{item['content'][:600]}..."})
        
        # Busca fuzzy no conteúdo de arquivos
        best_file_match = None
        best_file_ratio = 0.0
        for item in kb:
            if item['type'] == 'file' and item.get('content'):
                content = item['content'].lower()
                ratio = difflib.SequenceMatcher(None, user_message_lower, content).ratio()
                if ratio > best_file_ratio:
                    best_file_ratio = ratio
                    best_file_match = item
        
        if best_file_match and best_file_ratio > 0.45:
            return jsonify({'response': f"[Arquivo (aprox.): {best_file_match['name']}]\n{best_file_match['content'][:600]}..."})

        # 3. Buscar por nome de arquivo/documento
        for item in kb:
            if item['type'] == 'file' and user_message_lower in item.get('name','').lower():
                return jsonify({'response': f"Encontrei um documento relacionado: {item['name']}\nClique para baixar: /kb/download/{item['id']}"})
        
        # Fuzzy para nome de arquivo
        best_file = None
        best_file_ratio = 0.0
        for item in kb:
            if item['type'] == 'file':
                name = item.get('name','').lower()
                ratio = difflib.SequenceMatcher(None, user_message_lower, name).ratio()
                if ratio > best_file_ratio:
                    best_file_ratio = ratio
                    best_file = item
        
        if best_file and best_file_ratio > 0.45:
            return jsonify({'response': f"Encontrei um documento relacionado: {best_file['name']}\nClique para baixar: /kb/download/{best_file['id']}"})

        # 4. Verificar se precisa de pesquisa na internet
        if should_search_internet(user_message):
            print(f"Realizando pesquisa na internet para: {user_message}")
            search_results = search_internet(user_message, max_results=5)
            analyzed_results = analyze_search_content(search_results, user_message)
            
            # Se encontrou e analisou resultados, retorna eles
            if "results" in search_results and search_results["results"]:
                return jsonify({"response": analyzed_results})
            
            # Se não encontrou, continua para o LLM com uma nota sobre a pesquisa
            user_message += " (Pesquisa na internet não retornou resultados úteis)"
        
        # 5. Se não encontrou na KB nem precisou pesquisar, usar o LLM
        if 'chat_history' not in session:
            session['chat_history'] = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Verifica se há conteúdo de arquivo enviado para incluir na análise
        enhanced_message = user_message
        if 'uploaded_file_content' in session and session['uploaded_file_content']:
            file_data = session['uploaded_file_content']
            
            # Cria contexto baseado no tipo de análise
            if file_data.get('analysis_type') == 'visual':
                enhanced_message = f"""Como A.E.M.I, especialista em manutenção industrial, analise esta imagem e responda: {user_message}

📸 **Arquivo de Imagem:** {file_data['filename']}
🔍 **Análise Visual Completa:**
{file_data['content']}

**Instruções:**
- Responda com base na análise visual da imagem
- Foque em aspectos de manutenção industrial
- Seja técnica e detalhada
- Se identificar problemas, sugira soluções"""
            
            elif file_data.get('analysis_type') == 'text':
                enhanced_message = f"""Como A.E.M.I, especialista em manutenção industrial, analise este documento e responda: {user_message}

📄 **Documento:** {file_data['filename']} (tipo: {file_data['type']})

**Conteúdo do Documento:**
{file_data['content']}

**Instruções:**
- Analise o conteúdo do documento em detalhes
- Responda à pergunta com base nas informações do arquivo
- Seja específica e técnica
- Cite trechos relevantes do documento quando apropriado"""
            
            else:
                enhanced_message = f"""Pergunta sobre o arquivo enviado: {user_message}

Arquivo: {file_data['filename']} (tipo: {file_data['type']})

Conteúdo do arquivo:
{file_data['content']}

Instruções: Analise o conteúdo do arquivo e responda à pergunta do usuário com base nessas informações."""
        
        session['chat_history'].append({"role": "user", "content": enhanced_message})
        
        if len(session['chat_history']) > MAX_HISTORY_LENGTH:
            session['chat_history'] = [session['chat_history'][0]] + session['chat_history'][-MAX_HISTORY_LENGTH:]
        
        print(f"Processando com histórico de {len(session['chat_history'])} mensagens...")
        bot_response = generate_chat_response(session['chat_history'])
        
        session['chat_history'].append({"role": "assistant", "content": bot_response})
        session.modified = True
        
        print("Resposta da IA gerada e histórico atualizado.")
        return jsonify({"response": bot_response})

    except Exception as e:
        print(f"ERRO GERAL na rota /chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Ocorreu um erro inesperado no servidor. Detalhes: {str(e)}"}), 500

@app.route('/upload-file', methods=['POST'])
def upload_file():
    """Upload de arquivo para análise no chat."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Salva o arquivo temporariamente
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1].lower()
        filename = f"{file_id}{ext}"
        temp_path = os.path.join(KB_DIR, filename)
        file.save(temp_path)
        
        # Analisa o arquivo baseado no tipo
        response_text = ""
        file_content = ""
        
        # Verifica se é imagem
        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            response_text = "📸 **ARQUIVO RECEBIDO, NO QUE POSSO AJUDAR?**"
            
            # Análise visual da imagem
            try:
                visual_analysis = analyze_image(temp_path)
                if visual_analysis:
                    # Salva análise na sessão
                    session['uploaded_file_content'] = {
                        'filename': file.filename,
                        'type': 'image',
                        'content': visual_analysis,
                        'analysis_type': 'visual'
                    }
                    session.modified = True
            except Exception as e:
                print(f"Erro na análise visual: {e}")
        
        # Verifica se é PDF
        elif ext == '.pdf' and PyPDF2:
            response_text = "📄 **DOCUMENTO PDF RECEBIDO - ANALISANDO CONTEÚDO...**"
            
            try:
                print(f"📄 Processando PDF: {file.filename}")
                
                with open(temp_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    text_content = ""
                    pdf_info = {
                        'total_pages': len(reader.pages),
                        'processed_pages': 0,
                        'tables_found': 0,
                        'images_found': 0
                    }
                    
                    print(f"📊 PDF tem {pdf_info['total_pages']} páginas")
                    
                    # Extrai texto de forma mais inteligente
                    pages_to_read = min(20, len(reader.pages))  # Aumenta para 20 páginas
                    
                    for i in range(pages_to_read):
                        try:
                            page = reader.pages[i]
                            page_text = page.extract_text() or ''
                            
                            if len(page_text.strip()) > 50:  # Só processa páginas com conteúdo substancial
                                # Limpa e formata o texto da página
                                cleaned_page = clean_pdf_text(page_text)
                                text_content += f"\n=== PÁGINA {i+1} ===\n{cleaned_page}\n"
                                pdf_info['processed_pages'] += 1
                                
                                # Detecta tabelas (texto com muitos espaços/tabs)
                                if count_table_patterns(page_text) > 3:
                                    pdf_info['tables_found'] += 1
                                    
                        except Exception as e:
                            print(f"Erro na página {i+1}: {e}")
                            continue
                    
                    # Gera resumo inteligente do PDF
                    if text_content.strip():
                        pdf_summary = generate_pdf_summary(text_content, file.filename)
                        
                        full_content = f"""📋 **RESUMO DO DOCUMENTO:**
{pdf_summary}

📊 **ESTATÍSTICAS DO PDF:**
• Total de páginas: {pdf_info['total_pages']}
• Páginas processadas: {pdf_info['processed_pages']}
• Tabelas detectadas: {pdf_info['tables_found']}
• Tamanho do conteúdo: ~{len(text_content.split())} palavras

📄 **CONTEÚDO COMPLETO EXTRAÍDO:**
{text_content[:20000]}"""  # Aumenta limite significativamente
                        
                        # Salva na sessão com análise aprimorada
                        session['uploaded_file_content'] = {
                            'filename': file.filename,
                            'type': 'pdf',
                            'content': full_content,
                            'analysis_type': 'document',
                            'metadata': pdf_info
                        }
                        session.modified = True
                        
                        response_text = f"📄 **PDF PROCESSADO COM SUCESSO!**\n\n{pdf_summary}\n\n💬 **Agora você pode perguntar sobre qualquer aspecto do documento!**"
                        
                    else:
                        response_text = "📄 **PDF processado, mas pouco texto foi extraído. Pode ser um documento com muitas imagens ou texto digitalizado.**"
                        
            except Exception as e:
                print(f"Erro ao processar PDF: {e}")
                response_text = f"❌ **Erro ao processar PDF:** {str(e)}\n\n💡 **Dica:** Verifique se o PDF não está protegido ou corrompido."
        
        # Verifica se é documento Word
        elif ext in ['.docx'] and docx:
            response_text = "📄 **ARQUIVO RECEBIDO, NO QUE POSSO AJUDAR?**"
            
            try:
                doc = docx.Document(temp_path)
                paragraphs = []
                
                # Extrai parágrafos com formatação
                for i, para in enumerate(doc.paragraphs):
                    if para.text.strip():
                        paragraphs.append(f"Parágrafo {i+1}: {para.text.strip()}")
                
                text_content = '\n'.join(paragraphs[:30])  # Primeiros 30 parágrafos
                
                # Salva na sessão
                session['uploaded_file_content'] = {
                    'filename': file.filename,
                    'type': 'docx',
                    'content': text_content[:15000],  # Aumenta limite
                    'analysis_type': 'text'
                }
                session.modified = True
            except Exception as e:
                print(f"Erro ao processar documento: {e}")
        
        # Arquivo de texto
        elif ext in ['.txt', '.md', '.csv']:
            response_text = "📝 **ARQUIVO RECEBIDO, NO QUE POSSO AJUDAR?**"
            
            try:
                with open(temp_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(15000)  # Aumenta limite
                    
                    # Salva na sessão
                    session['uploaded_file_content'] = {
                        'filename': file.filename,
                        'type': ext,
                        'content': content,
                        'analysis_type': 'text'
                    }
                    session.modified = True
            except Exception as e:
                print(f"Erro ao processar arquivo: {e}")
        
        else:
            response_text = "📎 **ARQUIVO RECEBIDO, NO QUE POSSO AJUDAR?**"
        
        # Remove o arquivo temporário
        try:
            os.remove(temp_path)
        except:
            pass
        
        return jsonify({
            'response': response_text,
            'filename': file.filename,
            'file_type': ext
        })
    
    except Exception as e:
        print(f"Erro no upload de arquivo: {e}")
        return jsonify({'error': 'Erro ao processar arquivo'}), 500

@app.route('/search-internet', methods=['POST'])
def search_internet_route():
    """Rota para pesquisa manual na internet."""
    try:
        query = request.form.get('query', '').strip()
        if not query:
            return jsonify({"error": "Query de pesquisa não fornecida"}), 400
        
        max_results = int(request.form.get('max_results', 5))
        search_results = search_internet(query, max_results)
        
        return jsonify(search_results)
    
    except Exception as e:
        print(f"Erro na pesquisa manual: {e}")
        return jsonify({"error": "Erro ao realizar pesquisa"}), 500

@app.route('/extract-content', methods=['POST'])
def extract_content_route():
    """Rota para extrair conteúdo de uma URL."""
    try:
        url = request.form.get('url', '').strip()
        if not url:
            return jsonify({"error": "URL não fornecida"}), 400
        
        max_chars = int(request.form.get('max_chars', 1000))
        content = extract_page_content(url, max_chars)
        
        return jsonify({"content": content, "url": url})
    
    except Exception as e:
        print(f"Erro na extração de conteúdo: {e}")
        return jsonify({"error": "Erro ao extrair conteúdo"}), 500

@app.route('/clear-session', methods=['POST'])
def clear_session():
    """Limpa o histórico de chat da sessão do usuário."""
    try:
        if 'chat_history' in session:
            session.pop('chat_history', None)
            print("Sessão do usuário limpa.")
        return jsonify({"status": "success", "message": "Histórico de chat limpo."})
    except Exception as e:
        print(f"Erro ao limpar sessão: {e}")
        return jsonify({"error": "Erro ao limpar sessão"}), 500

def clean_pdf_text(text):
    """Limpa e formata texto extraído de PDF."""
    import re
    
    # Remove quebras de linha excessivas
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    # Remove espaços múltiplos
    text = re.sub(r' +', ' ', text)
    
    # Remove caracteres especiais problemáticos
    text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\"\'\/\%\$\@\#\&\*\+\=\~\`]', '', text)
    
    # Corrige quebras de linha no meio de palavras
    text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)
    
    return text.strip()

def count_table_patterns(text):
    """Conta padrões que indicam presença de tabelas."""
    import re
    
    # Conta linhas com múltiplas sequências de espaços (indicativo de colunas)
    tab_patterns = len(re.findall(r'.*\s{3,}.*\s{3,}.*', text))
    
    # Conta linhas com números seguidos de espaços (típico de tabelas)
    num_patterns = len(re.findall(r'\d+\s+\d+', text))
    
    return tab_patterns + num_patterns

def generate_pdf_summary(content, filename):
    """Gera um resumo inteligente do conteúdo do PDF."""
    try:
        client = get_text_client()
        if not client:
            return "Documento processado - conteúdo disponível para consulta."
        
        # Pega uma amostra representativa do conteúdo
        content_sample = content[:8000]  # Primeiros 8000 caracteres
        
        summary_prompt = f"""Como A.E.M.I, especialista em manutenção industrial, analise este documento PDF e forneça um resumo técnico detalhado:

ARQUIVO: {filename}

CONTEÚDO DO DOCUMENTO:
{content_sample}

INSTRUÇÕES:
1. Identifique o tipo de documento (manual, norma, procedimento, etc.)
2. Liste os principais tópicos técnicos abordados
3. Destaque informações relevantes para manutenção industrial
4. Identifique especificações, procedimentos ou dados importantes
5. Seja conciso mas técnico

FORMATO DO RESUMO:
📋 **Tipo de documento:** [tipo identificado]
🔧 **Principais tópicos:** [lista dos principais assuntos]
⚙️ **Aspectos técnicos relevantes:** [informações técnicas importantes]
💡 **Aplicação prática:** [como usar este documento na manutenção]

Resumo:"""

        response = client.text_generation(
            summary_prompt,
            max_new_tokens=800,
            temperature=0.5,
            return_full_text=False
        )
        
        return response.strip()
        
    except Exception as e:
        print(f"Erro ao gerar resumo: {e}")
        return f"📄 **Documento processado:** {filename}\n\n🔍 **Conteúdo disponível para análise** - Faça perguntas específicas sobre o documento!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
