
import os
import uuid
import json
import mimetypes
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
try:
    import docx
except ImportError:
    docx = None
from flask import Flask, request, jsonify, send_from_directory, session

# --- INICIALIZAÇÃO DO FLASK (deve vir antes das rotas) ---
app = Flask(__name__)


KB_DIR = os.path.join(os.path.dirname(__file__), 'knowledge_base')
KB_DB = os.path.join(KB_DIR, 'kb_data.json')
os.makedirs(KB_DIR, exist_ok=True)

def load_kb():
    if not os.path.exists(KB_DB):
        return []
    with open(KB_DB, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_kb(data):
    with open(KB_DB, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/kb/upload', methods=['POST'])
def kb_upload():
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
                extracted_text = ''
        elif ext in ['.docx'] and docx:
            try:
                doc = docx.Document(file_path)
                extracted_text = '\n'.join([p.text for p in doc.paragraphs])
            except Exception as e:
                extracted_text = ''
        elif ext in ['.txt', '.md', '.csv']:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    extracted_text = f.read()
            except Exception as e:
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

@app.route('/kb/list')
def kb_list():
    kb = load_kb()
    q = request.args.get('q', '').strip().lower()
    if q:
        kb = [item for item in kb if q in item.get('name','').lower() or q in item.get('content','').lower()]
    return jsonify(kb)

@app.route('/kb/remove/<item_id>', methods=['DELETE'])
def kb_remove(item_id):
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

@app.route('/kb/download/<item_id>')
def kb_download(item_id):
    kb = load_kb()
    item = next((i for i in kb if i['id'] == item_id and i['type'] == 'file'), None)
    if not item:
        return 'Arquivo não encontrado', 404
    return send_from_directory(KB_DIR, item['filename'], as_attachment=True, download_name=item['name'])


from flask_cors import CORS
from huggingface_hub import InferenceClient

# Permite apenas o domínio do GitHub Pages do seu projeto e o endereço do backend Render
CORS(app, supports_credentials=True, origins=[
    "https://jonathan0078.github.io",
    "https://aemi.onrender.com"
])

# Carrega as chaves da aplicação a partir de variáveis de ambiente
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
HUGGING_FACE_TOKEN = os.getenv("HF_TOKEN")

# Validação das chaves
if not FLASK_SECRET_KEY:
    raise ValueError("A chave secreta do Flask (FLASK_SECRET_KEY) não foi configurada.")
if not HUGGING_FACE_TOKEN:
    raise ValueError("O token da Hugging Face (HF_TOKEN) não foi configurado.")

app.secret_key = FLASK_SECRET_KEY

# --- CONSTANTES E CONFIGURAÇÕES ---
SYSTEM_PROMPT = "Você é a A.E.M.I, uma IA especialista em manutenção industrial e um projeto do canal 'Manutenção Industrial ARQUIVOS'. Seja direta e objetiva. Responda apenas a perguntas relacionadas a este domínio. Se a pergunta não for sobre manutenção industrial, diga que você só pode ajudar com tópicos relacionados à manutenção industrial."
MAX_HISTORY_LENGTH = 10 # Limita o histórico para evitar sobrecarga (5 perguntas do usuário + 5 respostas da IA)

# --- FUNÇÕES DE PROCESSAMENTO ---

def get_text_client():
    """Cria e retorna um cliente para o modelo de linguagem."""
    return InferenceClient(model="meta-llama/Meta-Llama-3-8B-Instruct", token=HUGGING_FACE_TOKEN)

def generate_chat_response(chat_history):
    """
    Processa um histórico de chat e retorna a resposta do modelo.
    """
    client = get_text_client()
    
    response_generator = client.chat_completion(
        messages=chat_history,
        max_tokens=1500,
        stream=False
    )
    return response_generator.choices[0].message.content

# --- ROTAS DA API ---

@app.route('/')
def index():
    return "Servidor da AEMI (versão com Llama 3 8B e memória) está no ar."


# --- Chat: Integração com a Base de Conhecimento ---
@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.form.get('message', '')
        if not user_message.strip():
            return jsonify({"error": "Nenhuma mensagem enviada."}), 400


        # 1. Buscar resposta na base de conhecimento (FAQ/texto) com correspondência inteligente
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

        # 3. Buscar por nome de arquivo/documento (substring ou similaridade)
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

        # 3. Se não encontrou, segue para o LLM/memória
        # --- GERENCIAMENTO DE HISTÓRICO NA SESSÃO ---
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

# --- MELHORIA: ROTA PARA LIMPAR O HISTÓRICO ---
@app.route('/clear-session', methods=['POST'])
def clear_session():
    """
    Limpa o histórico de chat da sessão do usuário.
    """
    if 'chat_history' in session:
        session.pop('chat_history', None)
        print("Sessão do usuário limpa.")
    return jsonify({"status": "success", "message": "Histórico de chat limpo."})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
