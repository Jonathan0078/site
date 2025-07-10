import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from datetime import datetime, timedelta
from typing import List

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "SUA_CHAVE_AQUI")
NEWS_QUERY = "engenharia OR manutenção industrial OR indústria 4.0"
NEWS_LANG = "pt"
ARTIGOS_DIR = os.path.join(os.path.dirname(__file__), "artigos_gerados")
MAX_ARTIGOS = 5

app = FastAPI()

# Cria a pasta de artigos se não existir
ios.makedirs(ARTIGOS_DIR, exist_ok=True)

def buscar_noticias():
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": NEWS_QUERY,
        "language": NEWS_LANG,
        "sortBy": "publishedAt",
        "apiKey": NEWS_API_KEY,
        "pageSize": MAX_ARTIGOS
    }
    resp = requests.get(url, params=params)
    if resp.status_code != 200:
        raise Exception(f"Erro ao buscar notícias: {resp.text}")
    return resp.json().get("articles", [])

def gerar_html_noticia(noticia):
    titulo = noticia["title"]
    descricao = noticia.get("description", "")
    conteudo = noticia.get("content", "")
    url = noticia.get("url", "")
    fonte = noticia.get("source", {}).get("name", "")
    data = noticia.get("publishedAt", "")
    html = f"""
    <h1>{titulo}</h1>
    <p><strong>Fonte:</strong> {fonte} | <strong>Data:</strong> {data[:10]}</p>
    <p>{descricao}</p>
    <p>{conteudo}</p>
    <p><a href='{url}' target='_blank'>Leia na fonte original</a></p>
    """
    return html

def atualizar_artigos():
    # Remove artigos antigos
    for f in os.listdir(ARTIGOS_DIR):
        os.remove(os.path.join(ARTIGOS_DIR, f))
    # Busca e salva novos artigos
    noticias = buscar_noticias()
    for i, noticia in enumerate(noticias):
        html = gerar_html_noticia(noticia)
        with open(os.path.join(ARTIGOS_DIR, f"artigo_{i+1}.html"), "w", encoding="utf-8") as f:
            f.write(html)
    return len(noticias)

@app.get("/atualizar", response_class=HTMLResponse)
def atualizar():
    try:
        qtd = atualizar_artigos()
        return f"<p>{qtd} artigos atualizados com sucesso!</p>"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/artigos", response_model=List[str])
def listar_artigos():
    arquivos = sorted(os.listdir(ARTIGOS_DIR))
    return arquivos

@app.get("/artigo/{nome}", response_class=HTMLResponse)
def ler_artigo(nome: str):
    caminho = os.path.join(ARTIGOS_DIR, nome)
    if not os.path.exists(caminho):
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    with open(caminho, encoding="utf-8") as f:
        return f.read()

# Atualização automática (exemplo simples, pode ser melhorado com APScheduler)
@app.on_event("startup")
def startup_event():
    atualizar_artigos()
