
import os
import uuid
import json
import mimetypes
import base64
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
    return InferenceClient(model="microsoft/DiT-large-patch16-224", token=HUGGING_FACE_TOKEN)

def analyze_image(image_path):
    """Analisa uma imagem e retorna uma descrição detalhada."""
    try:
        # Abre e processa a imagem
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Análise detalhada da imagem
        img = Image.open(io.BytesIO(image_data))
        width, height = img.size
        format_img = img.format or "Desconhecido"
        mode = img.mode
        
        # Calcula tamanho do arquivo
        file_size = len(image_data)
        size_mb = file_size / (1024 * 1024)
        
        # Análise de cores dominantes
        colors_info = ""
        try:
            img_small = img.resize((50, 50))
            img_small = img_small.convert('RGB')
            pixels = list(img_small.getdata())
            
            # Conta cores predominantes
            from collections import Counter
            color_counts = Counter(pixels)
            most_common = color_counts.most_common(3)
            
            colors_info = f"\n🎨 Cores predominantes: "
            for i, (color, count) in enumerate(most_common):
                r, g, b = color
                colors_info += f"RGB({r},{g},{b})"
                if i < len(most_common) - 1:
                    colors_info += ", "
        except:
            colors_info = ""
        
        # Análise do nome do arquivo
        filename = os.path.basename(image_path).lower()
        context_analysis = ""
        
        # Palavras-chave relacionadas à manutenção industrial
        maintenance_keywords = {
            'motor': 'Motor elétrico/mecânico',
            'rolamento': 'Rolamento/bearing',
            'engrenagem': 'Sistema de engrenagens',
            'bomba': 'Bomba hidráulica/pneumática',
            'valvula': 'Válvula de controle',
            'manutencao': 'Manutenção industrial',
            'equipamento': 'Equipamento industrial',
            'falha': 'Análise de falha',
            'desgaste': 'Desgaste de componente',
            'vibração': 'Análise de vibração',
            'temperatura': 'Análise térmica',
            'pressao': 'Sistema de pressão',
            'hidraulica': 'Sistema hidráulico',
            'pneumatica': 'Sistema pneumático',
            'correia': 'Correias e transmissão',
            'polia': 'Polias e transmissão',
            'mancal': 'Mancais e suportes',
            'lubrificacao': 'Lubrificação',
            'oleo': 'Óleo lubrificante',
            'graxa': 'Graxa lubrificante'
        }
        
        found_keywords = []
        for keyword, description in maintenance_keywords.items():
            if keyword in filename:
                found_keywords.append(description)
        
        if found_keywords:
            context_analysis = f"\n🔧 Contexto identificado: {', '.join(found_keywords)}"
        
        # Monta a descrição completa
        description = f"""📸 **Análise de Imagem Completa:**

📊 **Informações Técnicas:**
- Formato: {format_img}
- Modo de cor: {mode}
- Dimensões: {width}x{height} pixels
- Tamanho: {size_mb:.2f} MB{colors_info}{context_analysis}

🤖 **Análise AEMI:**
Imagem recebida e processada com sucesso. Como especialista em manutenção industrial, posso te ajudar a:

• Identificar componentes e equipamentos
• Analisar possíveis falhas ou desgastes
• Sugerir procedimentos de manutenção
• Orientar sobre normas de segurança
• Recomendar ferramentas adequadas

💡 **Próximos passos:**
Descreva o que você gostaria de saber sobre esta imagem ou conte-me sobre o problema que está enfrentando."""
        
        return description
        
    except Exception as e:
        return f"❌ Erro ao analisar imagem: {str(e)}\n\nTente enviar a imagem novamente ou verifique se o formato é suportado (JPG, PNG, GIF, BMP, WEBP)."

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

        # 4. Se não encontrou na KB, usar o LLM
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
