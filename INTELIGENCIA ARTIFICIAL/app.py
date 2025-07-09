
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

def extract_page_content(url, max_chars=1000):
    """Extrai conteúdo de uma página web para análise."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=8)
        
        if response.status_code == 200 and BeautifulSoup:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove scripts e estilos
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Pega o texto principal
            text = soup.get_text()
            
            # Limpa o texto
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text[:max_chars]
        
        return ""
    except Exception as e:
        print(f"Erro ao extrair conteúdo de {url}: {e}")
        return ""

def should_search_internet(message):
    """Determina se a mensagem requer pesquisa na internet."""
    search_triggers = [
        'pesquisar', 'buscar', 'procurar', 'pesquise', 'busque', 'procure',
        'últimas', 'recente', 'atual', 'hoje', 'agora', 'notícias',
        'preço', 'valor', 'custo', 'onde comprar', 'fornecedor',
        'norma', 'regulamento', 'lei', 'nbr', 'iso', 'abnt',
        'fabricante', 'marca', 'modelo', 'especificação',
        'curso', 'treinamento', 'certificação', 'capacitação'
    ]
    
    message_lower = message.lower()
    return any(trigger in message_lower for trigger in search_triggers)

def format_search_results(search_data, original_query):
    """Formata os resultados de pesquisa para apresentação."""
    if "error" in search_data:
        return f"🔍 **Pesquisa na Internet**\n\n❌ {search_data['error']}\n\nComo alternativa, posso ajudar com base no meu conhecimento sobre manutenção industrial."
    
    results = search_data.get("results", [])
    if not results:
        return f"🔍 **Pesquisa na Internet**\n\n🚫 Nenhum resultado encontrado para: \"{original_query}\"\n\nComo alternativa, posso ajudar com base no meu conhecimento sobre manutenção industrial."
    
    formatted = f"🔍 **Pesquisa na Internet - \"{search_data['query']}\"**\n\n"
    formatted += f"📊 **Encontrei {len(results)} resultado(s) relevante(s):**\n\n"
    
    for i, result in enumerate(results, 1):
        formatted += f"**{i}. {result['title']}**\n"
        formatted += f"🔗 {result['url']}\n"
        if result['snippet']:
            formatted += f"📝 {result['snippet']}\n"
        formatted += "\n"
    
    formatted += "💡 **Como usar essas informações:**\n"
    formatted += "• Clique nos links para acessar o conteúdo completo\n"
    formatted += "• Se precisar de análise específica, me envie o conteúdo\n"
    formatted += "• Posso ajudar a interpretar informações técnicas\n\n"
    formatted += "🔧 **Próximo passo:** Me conte se encontrou o que precisava ou se posso ajudar de outra forma!"
    
    return formatted

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
            formatted_results = format_search_results(search_results, user_message)
            
            # Se encontrou resultados, retorna eles
            if "results" in search_results and search_results["results"]:
                return jsonify({"response": formatted_results})
            
            # Se não encontrou, continua para o LLM com uma nota sobre a pesquisa
            user_message += " (Pesquisa na internet não retornou resultados úteis)"
        
        # 5. Se não encontrou na KB nem precisou pesquisar, usar o LLM
        if 'chat_history' not in session:
            session['chat_history'] = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        session['chat_history'].append({"role": "user", "content": user_message})
        
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
        
        # Analisa o arquivo
        response_text = ""
        
        # Verifica se é imagem
        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            response_text = f"📸 **Imagem recebida:** {file.filename}\n\n"
            response_text += analyze_image(temp_path)
            response_text += "\n\n🔧 **Análise AEMI:** Como especialista em manutenção industrial, posso te ajudar a analisar equipamentos, falhas, ou procedimentos mostrados na imagem. Descreva o que você gostaria de saber sobre esta imagem."
        
        # Verifica se é PDF
        elif ext == '.pdf' and PyPDF2:
            response_text = f"📄 **PDF recebido:** {file.filename}\n\n"
            try:
                with open(temp_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    num_pages = len(reader.pages)
                    text_content = ""
                    
                    # Extrai texto de até 5 páginas
                    pages_to_read = min(5, num_pages)
                    for i in range(pages_to_read):
                        page_text = reader.pages[i].extract_text() or ''
                        text_content += page_text
                    
                    if text_content.strip():
                        response_text += f"📊 **Informações do PDF:**\n"
                        response_text += f"• Número de páginas: {num_pages}\n"
                        response_text += f"• Páginas analisadas: {pages_to_read}\n"
                        response_text += f"• Caracteres extraídos: {len(text_content)}\n\n"
                        response_text += f"📝 **Conteúdo extraído:**\n{text_content[:800]}..."
                        
                        # Análise de contexto
                        content_lower = text_content.lower()
                        if any(word in content_lower for word in ['manutenção', 'equipamento', 'motor', 'rolamento', 'bomba']):
                            response_text += f"\n\n🔧 **Análise AEMI:** Este documento parece conter informações sobre manutenção industrial. Posso te ajudar a interpretar procedimentos, especificações técnicas ou análise de falhas."
                    else:
                        response_text += "⚠️ Não foi possível extrair texto do PDF. Pode ser um documento com imagens ou protegido."
            except Exception as e:
                response_text += f"❌ Erro ao processar PDF: {str(e)}"
        
        # Verifica se é documento Word
        elif ext in ['.docx'] and docx:
            response_text = f"📄 **Documento Word recebido:** {file.filename}\n\n"
            try:
                doc = docx.Document(temp_path)
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                
                if paragraphs:
                    text_content = '\n'.join(paragraphs[:15])  # Primeiros 15 parágrafos
                    response_text += f"📊 **Informações do documento:**\n"
                    response_text += f"• Número de parágrafos: {len(paragraphs)}\n"
                    response_text += f"• Parágrafos analisados: {min(15, len(paragraphs))}\n\n"
                    response_text += f"📝 **Conteúdo extraído:**\n{text_content[:800]}..."
                    
                    # Análise de contexto
                    content_lower = text_content.lower()
                    if any(word in content_lower for word in ['manutenção', 'equipamento', 'motor', 'rolamento', 'bomba']):
                        response_text += f"\n\n🔧 **Análise AEMI:** Este documento parece conter informações sobre manutenção industrial. Posso te ajudar a interpretar procedimentos, especificações técnicas ou análise de falhas."
                else:
                    response_text += "⚠️ Documento vazio ou não foi possível extrair texto."
            except Exception as e:
                response_text += f"❌ Erro ao processar documento: {str(e)}"
        
        # Arquivo de texto
        elif ext in ['.txt', '.md', '.csv']:
            response_text = f"📝 **Arquivo de texto recebido:** {file.filename}\n\n"
            try:
                with open(temp_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(2000)  # Primeiros 2000 caracteres
                    
                    if content.strip():
                        response_text += f"📊 **Informações do arquivo:**\n"
                        response_text += f"• Tamanho: {len(content)} caracteres\n"
                        response_text += f"• Tipo: {ext.upper()}\n\n"
                        response_text += f"📝 **Conteúdo:**\n{content}"
                        
                        # Análise de contexto
                        content_lower = content.lower()
                        if any(word in content_lower for word in ['manutenção', 'equipamento', 'motor', 'rolamento', 'bomba']):
                            response_text += f"\n\n🔧 **Análise AEMI:** Este arquivo contém informações sobre manutenção industrial. Posso te ajudar a interpretar os dados, procedimentos ou especificações técnicas."
                    else:
                        response_text += "⚠️ Arquivo vazio ou não foi possível extrair conteúdo."
            except Exception as e:
                response_text += f"❌ Erro ao processar arquivo: {str(e)}"
        
        else:
            response_text = f"📎 **Arquivo recebido:** {file.filename}\n\nTipo de arquivo não suportado para análise automática. Posso ajudar com informações sobre o arquivo se você me disser do que se trata."
        
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
