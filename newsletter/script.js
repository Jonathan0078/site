const API_URL = "https://newsletter-2-gew3.onrender.com";

async function carregarListaArtigos() {
    const feed = document.querySelector('.newsletter-feed');
    feed.innerHTML = '<p>Carregando artigos...</p>';
    try {
        const resp = await fetch(`${API_URL}/artigos`);
        const artigos = await resp.json();
        if (!artigos.length) {
            feed.innerHTML = '<p>Nenhum artigo encontrado.</p>';
            return;
        }
        feed.innerHTML = '';
        artigos.forEach(nome => {
            const div = document.createElement('div');
            div.className = 'newsletter-item';
            div.innerHTML = `
                <h2>${nome.replace('.html', '').replace('_', ' ').toUpperCase()}</h2>
                <button class="article-button" onclick="carregarArtigoDinamico('${nome}', this)">Ler Artigo</button>
                <div class="article-container hidden"></div>
            `;
            feed.appendChild(div);
        });
    } catch (e) {
        feed.innerHTML = '<p style="color:red;">Erro ao carregar artigos.</p>';
    }
}

async function carregarArtigoDinamico(nome, btn) {
    const container = btn.nextElementSibling;
    if (!container.classList.contains('hidden') && container.innerHTML.trim() !== '') {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }
    container.innerHTML = '<p>Carregando artigo...</p>';
    container.classList.remove('hidden');
    try {
        const resp = await fetch(`${API_URL}/artigo/${nome}`);
        const html = await resp.text();
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<p style="color:red;">Erro ao carregar artigo.</p>';
    }
}

window.onload = carregarListaArtigos;
