import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.middleware.cors import CORSMiddleware

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "SUA_CHAVE_AQUI")
NEWS_QUERY = "manutenção industrial"  # restringe a busca
NEWS_LANG = "pt"
ARTIGOS_DIR = os.path.join("/tmp", "artigos_gerados")
ARTIGOS_FIXOS_DIR = os.path.join(os.path.dirname(__file__), "../artigos_fixos")
MAX_ARTIGOS = 5

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ou especifique ["https://jonathan0078.github.io"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(ARTIGOS_DIR, exist_ok=True)

def buscar_noticias():
    if not NEWS_API_KEY or NEWS_API_KEY == "SUA_CHAVE_AQUI":
        # Gera artigo fake para teste
        return [{
            "title": "Exemplo de Artigo Técnico Industrial",
            "publishedAt": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
            "description": "Este é um artigo de exemplo gerado localmente para testes.",
            "url": "https://www.exemplo.com/artigo-industrial"
        }]
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": NEWS_QUERY,
        "language": NEWS_LANG,
        "sortBy": "publishedAt",
        "apiKey": NEWS_API_KEY,
        "pageSize": 1
    }
    resp = requests.get(url, params=params)
    if resp.status_code != 200:
        return []
    data = resp.json()
    return data.get("articles", [])

def criar_artigo():
    artigos = buscar_noticias()
    if not artigos:
        return
    artigo = artigos[0]
    titulo = artigo["title"].replace("/", "-").replace("\\", "-")
    nome_arquivo = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{titulo[:30].replace(' ', '_')}.html"
    caminho = os.path.join(ARTIGOS_DIR, nome_arquivo)
    # Tenta pegar o conteúdo mais completo possível
    descricao = artigo.get('content') or artigo.get('description') or 'Artigo sem descrição disponível.'
    if descricao.strip() == '':
        descricao = 'Artigo sem descrição disponível.'
    fonte = artigo.get('url', '#')
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(f"""
<!DOCTYPE html>
<html lang='pt-BR'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{artigo['title']} | Newsletter Industrial</title>
    <style>
        body {{ font-family: 'Lato', Arial, sans-serif; background: #f8f9fa; color: #222; margin: 0; padding: 0; }}
        .artigo-container {{ max-width: 700px; margin: 40px auto; background: #fff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); padding: 32px 24px; }}
        header {{ text-align: center; margin-bottom: 32px; }}
        .site-title {{ font-family: 'Oswald', Arial, sans-serif; font-size: 2.2rem; color: #003366; margin-bottom: 0.2em; }}
        .site-sub {{ color: #005a9c; font-size: 1.1rem; margin-bottom: 0.8em; }}
        h1 {{ font-size: 2rem; color: #222; margin-bottom: 0.5em; }}
        .meta {{ color: #888; font-size: 1em; margin-bottom: 1.5em; }}
        p {{ font-size: 1.15em; line-height: 1.7; margin-bottom: 1.2em; }}
        .fonte {{ margin-top: 2em; font-size: 1em; color: #005a9c; font-weight: bold; }}
        a {{ color: #005a9c; text-decoration: underline; }}
        a:hover {{ color: #003366; }}
        @media (max-width: 600px) {{
            .artigo-container {{ padding: 16px 4vw; }}
            h1 {{ font-size: 1.3rem; }}
        }}
    </style>
</head>
<body>
    <div class='artigo-container'>
        <header>
            <div class='site-title'>Newsletter Industrial</div>
            <div class='site-sub'>Artigos Técnicos &amp; Atualizações</div>
        </header>
        <h1>{artigo['title']}</h1>
        <div class='meta'>Publicado em: {artigo['publishedAt']}</div>
        <p>{descricao}</p>
        <div class='fonte'>Fonte: <a href='{fonte}' target='_blank'>{fonte}</a></div>
    </div>
</body>
</html>
""")

# Remova ou comente esta linha para NÃO criar artigo ao iniciar:
# if not os.listdir(ARTIGOS_DIR):
#     criar_artigo()

# Agenda para criar um novo artigo a cada 2 dias
scheduler = BackgroundScheduler()
scheduler.add_job(criar_artigo, 'interval', days=2)
scheduler.start()


@app.get("/artigos")
def listar_artigos():
    # Lista artigos das duas pastas
    arquivos_tmp = [
        f for f in os.listdir(ARTIGOS_DIR)
        if f.endswith('.html') and not f.startswith('@') and not f.startswith('.')
    ]
    try:
        arquivos_fixos = [
            f for f in os.listdir(ARTIGOS_FIXOS_DIR)
            if f.endswith('.html') and not f.startswith('@') and not f.startswith('.')
        ]
    except FileNotFoundError:
        arquivos_fixos = []
    # Junta e ordena (fixos primeiro, depois os temporários)
    arquivos = sorted(arquivos_fixos) + sorted(arquivos_tmp, reverse=True)
    return arquivos

from urllib.parse import unquote

@app.get("/artigo/{nome}", response_class=HTMLResponse)
def ler_artigo(nome: str):
    nome = unquote(nome)
    # Procura primeiro nos fixos, depois nos temporários
    caminho_fixo = os.path.join(ARTIGOS_FIXOS_DIR, nome)
    caminho_tmp = os.path.join(ARTIGOS_DIR, nome)
    if os.path.exists(caminho_fixo) and nome.endswith('.html'):
        with open(caminho_fixo, encoding="utf-8") as f:
            return f.read()
    elif os.path.exists(caminho_tmp) and nome.endswith('.html'):
        with open(caminho_tmp, encoding="utf-8") as f:
            return f.read()
    else:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")

# Endpoint para forçar atualização manual
@app.get("/atualizar")
def atualizar_artigo():
    criar_artigo()
    return {"status": "ok", "msg": "Artigo gerado"}
