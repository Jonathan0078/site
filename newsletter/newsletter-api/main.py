import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "SUA_CHAVE_AQUI")
NEWS_QUERY = "engenharia OR manutenção industrial OR indústria 4.0"
NEWS_LANG = "pt"
ARTIGOS_DIR = os.path.join(os.path.dirname(__file__), "artigos_gerados")
MAX_ARTIGOS = 5

app = FastAPI()

os.makedirs(ARTIGOS_DIR, exist_ok=True)

def buscar_noticias():
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
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(f"<h1>{artigo['title']}</h1>\n")
        f.write(f"<p><em>{artigo['publishedAt']}</em></p>\n")
        f.write(f"<p>{artigo['description'] or ''}</p>\n")
        f.write(f"<a href='{artigo['url']}' target='_blank'>Leia na fonte original</a>\n")

# Cria um artigo ao iniciar
criar_artigo()

# Agenda para criar um novo artigo a cada 2 dias
scheduler = BackgroundScheduler()
scheduler.add_job(criar_artigo, 'interval', days=2)
scheduler.start()

@app.get("/artigos")
def listar_artigos():
    arquivos = sorted(os.listdir(ARTIGOS_DIR), reverse=True)
    return arquivos

@app.get("/artigo/{nome}", response_class=HTMLResponse)
def ler_artigo(nome: str):
    caminho = os.path.join(ARTIGOS_DIR, nome)
    if not os.path.exists(caminho):
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    with open(caminho, encoding="utf-8") as f:
        return f.read()
