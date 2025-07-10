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
# Novos imports para OCR e PDF avançado
try:
    import pdfplumber
except ImportError:
    pdfplumber = None
try:
    import pytesseract
except ImportError:
    pytesseract = None
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
try:
    from huggingface_hub import InferenceClient
except ImportError:
    InferenceClient = None

# --- INICIALIZAÇÃO DO FLASK ---
app = Flask(__name__)

# Permite qualquer origem (inclusive file:// e null) para uso local e web
CORS(app, supports_credentials=True, origins=[
    "*",
    "null",
    "file://",
    "http://localhost",
    "http://127.0.0.1",
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

def extract_page_content(url, max_chars=1000):
    """Extrai conteúdo de uma página web para análise."""
    try:
        response = requests.get(url, timeout=5)
        if not response.ok:
            return ""
        
        if BeautifulSoup is None:
            return ""
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove scripts, styles e tags desnecessárias
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()
            
        # Obtém o texto principal
        text = ' '.join(soup.stripped_strings)
        text = ' '.join(text.split())  # Remove espaços extras
        
        # Limita o tamanho do texto
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
            
        return text
    except Exception as e:
        print(f"Erro ao extrair conteúdo de {url}: {str(e)}")
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
    """Analisa o conteúdo dos resultados de pesquisa e gera uma resposta elaborada."""
    if "error" in search_data:
        return f"🔍 **Pesquisa na Internet**\n\n❌ {search_data['error']}\n\nComo alternativa, posso ajudar com base no meu conhecimento sobre manutenção industrial."
    
    results = search_data.get("results", [])
    if not results:
        return f"🔍 **Pesquisa na Internet**\n\n🚫 Nenhum resultado encontrado para: \"{original_query}\"\n\nComo alternativa, posso ajudar com base no meu conhecimento sobre manutenção industrial."
    
    # Extrai conteúdo dos primeiros resultados
    content_sources = []
    for result in results[:3]:  # Analisa os 3 primeiros resultados
        content = extract_page_content(result['url'], max_chars=800)
        if content.strip():
            content_sources.append({
                'title': result['title'],
                'url': result['url'],
                'content': content,
                'snippet': result.get('snippet', '')
            })
    
    if not content_sources:
        return f"🔍 **Pesquisa na Internet**\n\n⚠️ Encontrei resultados para \"{original_query}\", mas não consegui acessar o conteúdo dos sites.\n\nComo alternativa, posso ajudar com base no meu conhecimento sobre manutenção industrial."
    
    # Prepara o contexto para o LLM
    context = f"Pergunta do usuário: {original_query}\n\n"
    context += "Informações encontradas na internet:\n\n"
    
    for i, source in enumerate(content_sources, 1):
        context += f"Fonte {i} - {source['title']}:\n"
        context += f"URL: {source['url']}\n"
        context += f"Conteúdo: {source['content']}\n\n"
    
    # Gera resposta usando LLM
    try:
        client = get_text_client()
        if client:
            prompt = f"""Como A.E.M.I, especialista em manutenção industrial, responda à pergunta do usuário com base nas informações encontradas na internet. Seja detalhada e técnica.

{context}

Instruções:
1. Responda de forma completa e técnica sobre o assunto
2. Use as informações das fontes para embasar sua resposta
3. Mantenha o foco em manutenção industrial
4. No final, cite as fontes utilizadas
5. Seja prática e objetiva

Resposta:"""

            response = client.text_generation(
                prompt,
                max_new_tokens=1000,
                temperature=0.7,
                return_full_text=False
            )
            
            ai_response = response.strip()
            
            # Adiciona as fontes ao final
            sources_text = "\n\n📚 **Fontes consultadas:**\n"
            for i, source in enumerate(content_sources, 1):
                sources_text += f"{i}. {source['title']}\n   🔗 {source['url']}\n"
            
            return f"🔍 **Pesquisa na Internet - \"{original_query}\"**\n\n{ai_response}{sources_text}"
        
    except Exception as e:
        print(f"Erro ao gerar resposta com LLM: {e}")
    
    # Fallback: resposta baseada nos snippets
    response = f"🔍 **Pesquisa na Internet - \"{original_query}\"**\n\n"
    response += "📝 **Informações encontradas:**\n\n"
    
    for i, source in enumerate(content_sources, 1):
        response += f"**{i}. {source['title']}**\n"
        if source['snippet']:
            response += f"📋 {source['snippet']}\n"
        response += f"🔗 {source['url']}\n\n"
    
    response += "📚 **Fontes consultadas:**\n"
    for i, source in enumerate(content_sources, 1):
        response += f"{i}. {source['title']} - {source['url']}\n"
    
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
    """Analisa uma imagem e retorna uma descrição detalhada do conteúdo visual."""
    try:
        # 1. ANÁLISE VISUAL COM IA
        vision_analysis = ""
        try:
            client = get_vision_client()
            if client and HUGGING_FACE_TOKEN:
                # Converte imagem para base64
                with open(image_path, 'rb') as f:
                    image_data = f.read()
                
                # Prepara a imagem para análise
                img = Image.open(io.BytesIO(image_data))
                
                # Redimensiona se muito grande
                if img.width > 1024 or img.height > 1024:
                    img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                
                # Converte para RGB se necessário
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Salva temporariamente
                temp_buffer = io.BytesIO()
                img.save(temp_buffer, format='JPEG', quality=85)
                temp_buffer.seek(0)
                
                # Faz a análise visual com IA
                try:
                    result = client.image_to_text(temp_buffer.getvalue())
                    vision_analysis = result.get('generated_text', '') if isinstance(result, dict) else str(result)
                except Exception as e:
                    print(f"Erro na análise visual: {e}")
                    vision_analysis = ""
        except Exception as e:
            print(f"Erro no cliente de visão: {e}")
            vision_analysis = ""
        
        # 2. ANÁLISE TÉCNICA DA IMAGEM
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        img = Image.open(io.BytesIO(image_data))
        width, height = img.size
        format_img = img.format or "Desconhecido"
        
        # 3. ANÁLISE BASEADA EM CARACTERÍSTICAS VISUAIS
        visual_characteristics = analyze_visual_characteristics(img)
        
        # 4. ANÁLISE DO NOME DO ARQUIVO
        filename = os.path.basename(image_path).lower()
        context_hints = analyze_filename_context(filename)
        
        # 5. MONTA A RESPOSTA COMPLETA
        if vision_analysis:
            # Se temos análise de IA, usamos ela como base
            description = f"""🔍 **Análise Visual da Imagem:**

🤖 **O que vejo na imagem:**
{vision_analysis}

🔧 **Análise AEMI (Manutenção Industrial):**
{interpret_for_maintenance(vision_analysis)}

📊 **Características técnicas:**
- Formato: {format_img} | Dimensões: {width}x{height}px
{visual_characteristics}
{context_hints}

💡 **Como posso ajudar:**
Baseado no que vejo, posso te orientar sobre:
• Identificação de componentes
• Análise de falhas ou desgastes
• Procedimentos de manutenção
• Normas de segurança
• Ferramentas recomendadas

❓ **Próximo passo:** Me conte qual é sua dúvida específica sobre esta imagem."""
        else:
            # Fallback para análise baseada em características
            description = f"""📸 **Análise da Imagem:**

⚠️ **Análise Visual Limitada:**
Não foi possível fazer análise visual completa com IA no momento.

🔧 **Análise AEMI baseada em características:**
{visual_characteristics}
{context_hints}

📊 **Informações técnicas:**
- Formato: {format_img}
- Dimensões: {width}x{height} pixels

💡 **Como posso ajudar:**
Mesmo sem análise visual completa, posso te orientar sobre manutenção industrial se você me descrever:
• Que equipamento/componente está na imagem
• Qual problema você está enfrentando
• Que tipo de análise precisa

❓ **Me conte:** O que você vê na imagem e como posso te ajudar?"""
        
        return description
        
    except Exception as e:
        return f"❌ Erro ao analisar imagem: {str(e)}\n\nTente enviar novamente ou descreva o que você vê na imagem para que eu possa te ajudar."

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
    """Analisa o nome do arquivo para contexto."""
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
        'pneumatica': 'Pneumático'
    }
    
    found = []
    for keyword, description in maintenance_keywords.items():
        if keyword in filename:
            found.append(description)
    
    if found:
        return f"\n🏷️ **Contexto do arquivo:** {', '.join(found)}"
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
            visual_analysis = None
            ocr_text = None
            # Análise visual da imagem
            try:
                visual_analysis = analyze_image(temp_path)
            except Exception as e:
                print(f"Erro na análise visual: {e}")
            # OCR (leitura de texto na imagem)
            try:
                if pytesseract:
                    img = Image.open(temp_path)
                    ocr_text = pytesseract.image_to_string(img, lang='por')
            except Exception as e:
                print(f"Erro no OCR da imagem: {e}")
            # Salva análise na sessão
            session['uploaded_file_content'] = {
                'filename': file.filename,
                'type': 'image',
                'content': (visual_analysis or '') + (f"\n\n📝 **Texto extraído por OCR:**\n{ocr_text}" if ocr_text and ocr_text.strip() else ''),
                'analysis_type': 'visual'
            }
            session.modified = True
        
        # Verifica se é PDF
        elif ext == '.pdf' and (PyPDF2 or pdfplumber):
            response_text = "📄 **ARQUIVO RECEBIDO, NO QUE POSSO AJUDAR?**"
            text_content = ""
            # Tenta PyPDF2 primeiro
            if PyPDF2:
                try:
                    with open(temp_path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        pages_to_read = min(15, len(reader.pages))
                        for i in range(pages_to_read):
                            try:
                                page_text = reader.pages[i].extract_text() or ''
                                text_content += f"\n--- Página {i+1} ---\n{page_text}"
                            except:
                                continue
                except Exception as e:
                    print(f"Erro ao processar PDF com PyPDF2: {e}")
            # Se falhar ou não extrair nada, tenta pdfplumber
            if not text_content.strip() and pdfplumber:
                try:
                    with pdfplumber.open(temp_path) as pdf:
                        for i, page in enumerate(pdf.pages[:15]):
                            page_text = page.extract_text() or ''
                            text_content += f"\n--- Página {i+1} (plumber) ---\n{page_text}"
                except Exception as e:
                    print(f"Erro ao processar PDF com pdfplumber: {e}")
            # Salva na sessão
            session['uploaded_file_content'] = {
                'filename': file.filename,
                'type': 'pdf',
                'content': text_content[:15000],
                'analysis_type': 'text'
            }
            session.modified = True
        
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
    try:
        data = request.get_json()
        query = data.get('query')
        
        if not query:
            return jsonify({"error": "Query não fornecida"}), 400
            
        results = search_internet(query, max_results=5)
        
        return jsonify({
            "success": True,
            "results": results
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

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



# --- NEWSLETTER AUTOMÁTICA ---
@app.route('/newsletter/atualizar', methods=['POST'])
def atualizar_newsletter():
    """Atualiza automaticamente a newsletter com notícias de engenharia/manutenção industrial."""
    try:
        # 1. Busca notícias na internet
        termos = [
            'notícias manutenção industrial',
            'novidades engenharia industrial',
            'tendências manutenção preditiva',
            'tecnologia manutenção industrial',
            'inovação engenharia manutenção',
        ]
        noticias = []
        for termo in termos:
            resultado = search_internet(termo, max_results=2)
            if 'results' in resultado:
                noticias.extend(resultado['results'])

        # Remove duplicatas por URL
        urls_vistas = set()
        noticias_unicas = []
        for n in noticias:
            if n['url'] not in urls_vistas:
                noticias_unicas.append(n)
                urls_vistas.add(n['url'])

        # 2. Gera resumos usando IA (se disponível)
        client = get_text_client()
        conteudos = []
        for noticia in noticias_unicas[:5]:
            resumo = noticia.get('snippet', '')
            if client:
                prompt = f"Resuma a seguinte notícia de manutenção industrial para newsletter, de forma técnica e objetiva, em até 5 linhas:\nTítulo: {noticia['title']}\nConteúdo: {noticia.get('snippet','')}\nURL: {noticia['url']}"
                try:
                    resposta = client.text_generation(prompt, max_new_tokens=300, temperature=0.5, return_full_text=False)
                    resumo = resposta.strip()
                except Exception as e:
                    print(f'Erro ao resumir notícia: {e}')
            conteudos.append({
                'titulo': noticia['title'],
                'url': noticia['url'],
                'resumo': resumo
            })

        # 3. Monta o HTML da newsletter
        html = '<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Newsletter - Engenharia e Manutenção Industrial</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/newsletter/style.css"></head><body>'
        html += '<h1>Newsletter Automática - Engenharia e Manutenção Industrial</h1>'
        html += f'<p>Atualizado em: <b>{__import__("datetime").datetime.now().strftime("%d/%m/%Y %H:%M")}</b></p>'
        html += '<ul>'
        for c in conteudos:
            html += f'<li><a href="{c["url"]}" target="_blank"><b>{c["titulo"]}</b></a><br><span>{c["resumo"]}</span></li>'
        html += '</ul>'
        html += '<footer><small>Conteúdo gerado automaticamente por IA - AEMI</small></footer>'
        html += '</body></html>'

        # 4. Salva no arquivo da newsletter
        newsletter_dir = os.path.join(os.path.dirname(__file__), '..', 'newsletter')
        os.makedirs(newsletter_dir, exist_ok=True)
        newsletter_path = os.path.join(newsletter_dir, 'index.html')
        with open(newsletter_path, 'w', encoding='utf-8') as f:
            f.write(html)

        return jsonify({'success': True, 'msg': 'Newsletter atualizada com sucesso!', 'total_noticias': len(conteudos)})
    except Exception as e:
        print(f'Erro ao atualizar newsletter: {e}')
        return jsonify({'success': False, 'error': str(e)})

# --- SERVE NEWSLETTER HTML ---
@app.route('/newsletter')
def serve_newsletter():
    """Serve a newsletter HTML gerada automaticamente."""
    try:
        newsletter_dir = os.path.join(os.path.dirname(__file__), '..', 'newsletter')
        return send_from_directory(newsletter_dir, 'index.html')
    except Exception as e:
        return f"Erro ao servir newsletter: {e}", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
