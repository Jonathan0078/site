import os
import uuid
import json
import mimetypes
import base64
import requests
import re
from urllib.parse import quote, urljoin
# from PIL import Image  # Removido: não há mais reconhecimento de imagem
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
# Removido: pdfplumber e pytesseract (OCR e PDF avançado)
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
# Remover funções e rotas de análise de imagem, OCR, upload de imagem, busca web e newsletter automática

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

# --- FUNÇÕES DE PROCESSAMENTO ---
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
        # if should_search_internet(user_message):
        #     print(f"Realizando pesquisa na internet para: {user_message}")
        #     search_results = search_internet(user_message, max_results=5)
        #     analyzed_results = analyze_search_content(search_results, user_message)
            
        #     # Se encontrou e analisou resultados, retorna eles
        #     if "results" in search_results and search_results["results"]:
        #         return jsonify({"response": analyzed_results})
            
        #     # Se não encontrou, continua para o LLM com uma nota sobre a pesquisa
        #     user_message += " (Pesquisa na internet não retornou resultados úteis)"
        
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
        # if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
        #     response_text = "📸 **ARQUIVO RECEBIDO, NO QUE POSSO AJUDAR?**"
        #     visual_analysis = None
        #     ocr_text = None
        #     # Análise visual da imagem
        #     try:
        #         visual_analysis = analyze_image(temp_path)
        #     except Exception as e:
        #         print(f"Erro na análise visual: {e}")
        #     # OCR (leitura de texto na imagem)
        #     try:
        #         if pytesseract:
        #             img = Image.open(temp_path)
        #             ocr_text = pytesseract.image_to_string(img, lang='por')
        #     except Exception as e:
        #         print(f"Erro no OCR da imagem: {e}")
        #     # Salva análise na sessão
        #     session['uploaded_file_content'] = {
        #         'filename': file.filename,
        #         'type': 'image',
        #         'content': (visual_analysis or '') + (f"\n\n📝 **Texto extraído por OCR:**\n{ocr_text}" if ocr_text and ocr_text.strip() else ''),
        #         'analysis_type': 'visual'
        #     }
        #     session.modified = True
        
        # Verifica se é PDF
        if ext == '.pdf' and (PyPDF2 or pdfplumber):
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

        # Monta prompt para IA
        user_text = request.form.get('text', '').strip() if 'text' in request.form else ''
        file_data = session.get('uploaded_file_content', {})
        file_name = file_data.get('filename', file.filename)
        file_type = file_data.get('type', ext)
        file_content = file_data.get('content', '')
        analysis_type = file_data.get('analysis_type', 'text')

        if analysis_type == 'visual':
            prompt = f"""Como A.E.M.I, especialista em manutenção industrial, analise esta imagem enviada pelo usuário{f' com o comentário: {user_text}' if user_text else ''} e forneça um resumo ou insights relevantes.\n\n📸 Arquivo: {file_name}\n🔍 Análise Visual e OCR:\n{file_content}"""
        else:
            prompt = f"""Como A.E.M.I, especialista em manutenção industrial, analise este documento enviado pelo usuário{f' com o comentário: {user_text}' if user_text else ''} e forneça um resumo ou insights relevantes.\n\n📄 Documento: {file_name} (tipo: {file_type})\n\nConteúdo extraído:\n{file_content}"""

        chat_history = [
            {"role": "system", "content": "Você é A.E.M.I, uma IA especialista em manutenção industrial, análise de documentos técnicos e imagens."},
            {"role": "user", "content": prompt}
        ]
        bot_response = generate_chat_response(chat_history)
        # Se a resposta da IA for genérica, force um aviso para o usuário
        if bot_response and re.search(r'ARQUIVO RECEBIDO|NO QUE POSSO AJUDAR|ARQUIVO PROCESSADO COM SUCESSO', bot_response, re.I):
            bot_response = "[Atenção: a IA retornou uma resposta genérica. O modelo pode não estar processando corretamente o conteúdo do arquivo. Por favor, revise o backend ou o prompt enviado à IA.]"
        return jsonify({
            'response': bot_response,
            'filename': file_name,
            'file_type': file_type
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
