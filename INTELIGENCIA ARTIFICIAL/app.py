# app.py - Versão com Memória de Conversa

import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from huggingface_hub import InferenceClient

# --- CONFIGURAÇÃO INICIAL ---
app = Flask(__name__)
CORS(app, supports_credentials=True) # Habilita credenciais para que as sessões funcionem entre domínios

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
SYSTEM_PROMPT = "Você é a AEMI, uma IA especialista em manutenção industrial e um projeto do canal 'Manutenção Industrial ARQUIVOS'. Seja direta e objetiva. Responda apenas a perguntas relacionadas a este domínio. Se a pergunta não for sobre manutenção industrial, diga que você só pode ajudar com tópicos relacionados à manutenção industrial."
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

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.form.get('message', '')
        if not user_message.strip():
            return jsonify({"error": "Nenhuma mensagem enviada."}), 400

        # --- MELHORIA: GERENCIAMENTO DE HISTÓRICO NA SESSÃO ---
        # 1. Recupera o histórico da sessão ou cria um novo
        if 'chat_history' not in session:
            session['chat_history'] = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # 2. Adiciona a mensagem do usuário ao histórico
        session['chat_history'].append({"role": "user", "content": user_message})

        # 3. Limita o tamanho do histórico para evitar exceder limites de token
        if len(session['chat_history']) > MAX_HISTORY_LENGTH:
            # Mantém o prompt do sistema e as N últimas interações
            session['chat_history'] = [session['chat_history'][0]] + session['chat_history'][-MAX_HISTORY_LENGTH:]

        print(f"Processando com histórico de {len(session['chat_history'])} mensagens...")

        # 4. Gera a resposta usando o histórico completo
        bot_response = generate_chat_response(session['chat_history'])

        # 5. Adiciona a resposta da IA ao histórico
        session['chat_history'].append({"role": "assistant", "content": bot_response})
        
        # Garante que a sessão seja salva
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
