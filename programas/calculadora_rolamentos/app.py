# -*- coding: utf-8 -*-
import json
from flask import Flask, jsonify, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite que o frontend (HTML) acesse esta API

# --- Carregamento dos dados ---
def carregar_banco_dados():
    """Carrega os dados dos rolamentos do arquivo JSON."""
    try:
        with open('rolamentos.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Erro: Arquivo 'rolamentos.json' não encontrado.")
        return []
    except json.JSONDecodeError:
        print("Erro: Arquivo 'rolamentos.json' contém um JSON inválido.")
        return []

rolamentos_db = carregar_banco_dados()

# --- API Endpoints ---

@app.route('/api/rolamentos', methods=['GET'])
def get_rolamentos():
    """Retorna a lista completa de todos os rolamentos."""
    return jsonify(rolamentos_db)

@app.route('/api/rolamento/<string:designacao>', methods=['GET'])
def get_rolamento_por_designacao(designacao):
    """Busca um rolamento específico pela sua designação."""
    # Busca case-insensitive
    spec_upper = designacao.upper()
    rolamento = next((r for r in rolamentos_db if r['designacao'].upper() == spec_upper), None)
    
    if rolamento is None:
        abort(404, description=f"Rolamento com designação '{designacao}' não encontrado.")
    
    return jsonify(rolamento)

# Rota principal para informar que a API está funcionando
@app.route('/')
def index():
    return "<h1>API EspecCalc Rolamentos</h1><p>A API está funcionando. Use os endpoints /api/rolamentos ou /api/rolamento/<spec>.</p>"

if __name__ == '__main__':
    if not rolamentos_db:
        print("AVISO: A base de dados de rolamentos não foi carregada. A API funcionará com dados vazios.")
    app.run(debug=True, port=5000)
