// --- Tema claro/escuro ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
function setTheme(dark) {
    if (dark) {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('aemi_theme', 'dark');
        if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('aemi_theme', 'light');
        if (themeIcon) themeIcon.textContent = 'dark_mode';
    }
}
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        setTheme(!document.documentElement.classList.contains('dark-theme'));
    });
}
// Carrega tema salvo
const savedTheme = localStorage.getItem('aemi_theme');
if (savedTheme === 'dark') setTheme(true);
else setTheme(false);

// Sugestões rápidas (Se você as tiver no HTML)
document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        const chatInput = document.querySelector(".chat-input textarea");
        if (chatInput) {
            chatInput.value = btn.dataset.msg;
            chatInput.focus();
        }
    });
});


// =================================================================================
// Início do Bloco Principal do Script
// =================================================================================

document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // INÍCIO: NOVO CÓDIGO DO MENU LATERAL (SIDEBAR)
    // ==================================================
    const sideMenu = document.getElementById("side-menu");
    const openMenuBtn = document.getElementById("open-menu-btn");
    const menuOverlay = document.getElementById("menu-overlay");

    // Verifica se os elementos do menu existem antes de adicionar eventos
    if (sideMenu && openMenuBtn && menuOverlay) {
        // Abrir menu via botão
        openMenuBtn.addEventListener("click", () => {
            sideMenu.classList.add("open");
            menuOverlay.classList.add("show"); // Use 'show' ou 'active' dependendo do seu CSS
        });

        // Fechar menu via overlay
        menuOverlay.addEventListener("click", () => {
            sideMenu.classList.remove("open");
            menuOverlay.classList.remove("show"); // Use 'show' ou 'active' dependendo do seu CSS
        });

        // Fechar com a tecla 'Escape' para melhor acessibilidade
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && sideMenu.classList.contains('open')) {
                sideMenu.classList.remove("open");
                menuOverlay.classList.remove("show");
            }
        });

        // Swipe para abrir (mobile)
        let startX = null;
        document.addEventListener("touchstart", function(e) {
            // Pega apenas o primeiro toque
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
            }
        }, { passive: true }); // Otimização para rolagem suave

        document.addEventListener("touchend", function(e) {
            if (!startX) return; // Se o toque não começou, ignora

            let endX = e.changedTouches[0].clientX;
            let diffX = endX - startX;

            // Condições para abrir:
            // 1. O toque inicial foi perto da borda esquerda (startX < 50 pixels)
            // 2. O deslize foi para a direita e de tamanho suficiente (diffX > 60 pixels)
            // 3. O menu já não está aberto
            if (startX < 50 && diffX > 60 && !sideMenu.classList.contains("open")) {
                sideMenu.classList.add("open");
                menuOverlay.classList.add("show");
            }

            // Condições para fechar:
            // 1. O deslize foi da direita para a esquerda e de tamanho suficiente (diffX < -60 pixels)
            // 2. O menu está aberto
            if (diffX < -60 && sideMenu.classList.contains("open")) {
                sideMenu.classList.remove("open");
                menuOverlay.classList.remove("show");
            }

            startX = null; // Reseta a posição inicial do toque
        });
    }
    // ==================================================
    // FIM: NOVO CÓDIGO DO MENU LATERAL (SIDEBAR)
    // ==================================================


    // --- Seletores do DOM (Restante do código) ---
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector("#send-btn");
    const chatbox = document.querySelector(".chatbox");
    const clearChatBtn = document.querySelector("#clear-btn");
    const convsList = document.getElementById("convs-list");
    const newConvBtn = document.getElementById("new-conv-btn");

    // --- Configuração Dinâmica da URL do Backend ---
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const BACKEND_URL = isLocal ? "http://127.0.0.1:10000" : "https://aemi.onrender.com";
    const API_URL_CHAT = `${BACKEND_URL}/chat`;
    const API_URL_CLEAR = `${BACKEND_URL}/clear-session`;

    let userMessage = null;
    let currentConvId = null;

    // --- Conversas Salvas no LocalStorage ---
    function getConvs() {
        return JSON.parse(localStorage.getItem("aemi_convs") || "[]");
    }
    function saveConvs(convs) {
        localStorage.setItem("aemi_convs", JSON.stringify(convs));
    }
    function getConvById(id) {
        return getConvs().find(c => c.id === id);
    }
    function addConv(conv) {
        const convs = getConvs();
        convs.push(conv);
        saveConvs(convs);
    }
    function updateConv(id, data) {
        let convs = getConvs();
        convs = convs.map(c => c.id === id ? { ...c, ...data } : c);
        saveConvs(convs);
    }

    // --- UI Sidebar ---
    function renderSidebar() {
        const convs = getConvs();
        if(!convsList) return; // Segurança caso o elemento não exista
        convsList.innerHTML = "";
        if (convs.length === 0) {
            const li = document.createElement("li");
            li.textContent = "Nenhuma conversa";
            li.style.color = "#888";
            convsList.appendChild(li);
            return;
        }
        convs.forEach(conv => {
            const li = document.createElement("li");
            li.textContent = conv.title || `Conversa ${conv.id.slice(-4)}`;
            li.dataset.id = conv.id;
            if (conv.id === currentConvId) li.classList.add("ativo");
            li.addEventListener("click", () => {
                if (currentConvId !== conv.id) {
                    saveCurrentConv();
                    loadConv(conv.id);
                }
            });
            convsList.appendChild(li);
        });
    }

    // --- Conversa Atual ---
    function saveCurrentConv() {
        if (!currentConvId || !chatbox) return;
        const conv = { id: currentConvId, title: getConvTitle(), history: getCurrentHistory() };
        updateConv(currentConvId, conv);
    }
    function getCurrentHistory() {
        const lis = chatbox.querySelectorAll("li.chat");
        const history = [];
        lis.forEach(li => {
            const isUser = li.classList.contains("outgoing");
            const text = li.querySelector("p")?.textContent || "";
            if (text.trim() && !li.querySelector(".typing-animation")) { // Não salva "typing"
                history.push({ role: isUser ? "user" : "assistant", content: text });
            }
        });
        return history;
    }
    function getConvTitle() {
        const lis = chatbox.querySelectorAll("li.outgoing p");
        return lis.length > 0 ? lis[0].textContent.slice(0, 32) : "Nova Conversa";
    }
    function loadConv(id) {
        const conv = getConvById(id);
        if (!conv || !chatbox) return;
        currentConvId = id;
        chatbox.innerHTML = "";
        if (conv.history.length === 0) {
             chatbox.innerHTML = `<li class="chat incoming"><span class="material-symbols-outlined">smart_toy</span><p>Olá. Sou AEMI, uma IA da Manutenção Industrial. Envie uma mensagem para começarmos.</p></li>`;
        } else {
             conv.history.forEach(msg => {
                const li = createChatLi(msg.content, msg.role === "user" ? "outgoing" : "incoming");
                chatbox.appendChild(li);
            });
        }
        renderSidebar();
    }

    // --- Nova Conversa ---
    function startNewConv() {
        saveCurrentConv();
        const id = "conv-" + Date.now();
        const conv = { id, title: "Nova Conversa", history: [] };
        addConv(conv);
        currentConvId = id;
        if(chatbox) chatbox.innerHTML = `<li class="chat incoming"><span class="material-symbols-outlined">smart_toy</span><p>Olá. Sou AEMI, uma IA da Manutenção Industrial. Envie uma mensagem para começarmos.</p></li>`;
        renderSidebar();
    }

    // --- Criação de Mensagens do Chat ---
    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent;
        if (className === "incoming" && message === "typing") {
            chatContent = `<span class="material-symbols-outlined">smart_toy</span><div class="typing-animation"><span></span><span></span><span></span></div>`;
        } else {
            const icon = className === "outgoing" ? "" : `<span class="material-symbols-outlined">smart_toy</span>`;
            chatContent = `${icon}<p></p>`;
        }
        chatLi.innerHTML = chatContent;
        if (message !== "typing") {
            chatLi.querySelector("p").textContent = message;
        }
        return chatLi;
    };

    // --- Envio de Mensagem e Resposta ---
    const generateResponse = (incomingChatLi) => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ message: userMessage })
        };
        const pElement = incomingChatLi.querySelector("p") || document.createElement("p");
        if(!incomingChatLi.querySelector("p")){
            incomingChatLi.querySelector(".typing-animation").replaceWith(pElement);
        }
        
        fetch(API_URL_CHAT, requestOptions)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                pElement.textContent = data.response || "Desculpe, não recebi uma resposta válida.";
            })
            .catch(() => {
                pElement.classList.add("error");
                pElement.textContent = "Oops! Algo deu errado. Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.";
            })
            .finally(() => {
                if(chatInput) chatInput.disabled = false;
                if(sendChatBtn) sendChatBtn.disabled = false;
                if(chatbox) chatbox.scrollTo(0, chatbox.scrollHeight);
                saveCurrentConv();
            });
    };

    // --- Envio de Mensagem ---
    const handleChat = () => {
        if(!chatInput) return;
        userMessage = chatInput.value.trim();
        if (!userMessage) return;
        
        chatInput.value = "";
        chatInput.disabled = true;
        sendChatBtn.disabled = true;

        if(chatbox) {
            chatbox.appendChild(createChatLi(userMessage, "outgoing"));
            chatbox.scrollTo(0, chatbox.scrollHeight);
        
            setTimeout(() => {
                const incomingChatLi = createChatLi("typing", "incoming");
                chatbox.appendChild(incomingChatLi);
                chatbox.scrollTo(0, chatbox.scrollHeight);
                generateResponse(incomingChatLi);
            }, 600);
        }
        saveCurrentConv();
    };

    // --- Limpar Chat ---
    const clearChat = () => {
        if (confirm("Você tem certeza que deseja limpar o histórico desta conversa?")) {
            if(chatbox) chatbox.innerHTML = `<li class="chat incoming"><span class="material-symbols-outlined">smart_toy</span><p>Olá. Sou AEMI, uma IA da Manutenção Industrial. Envie uma mensagem para começarmos.</p></li>`;
            fetch(API_URL_CLEAR, { method: "POST" }).catch(() => {});
            saveCurrentConv();
        }
    };

    // --- Inicialização ---
    function init() {
        const convs = getConvs();
        if (convs.length === 0) {
            startNewConv();
        } else {
            const lastConvId = convs[convs.length - 1].id;
            loadConv(lastConvId);
        }
    }

    // --- Event Listeners ---
    if(sendChatBtn) sendChatBtn.addEventListener("click", handleChat);
    if(clearChatBtn) clearChatBtn.addEventListener("click", clearChat);
    if(chatInput) chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });
    if(newConvBtn) newConvBtn.addEventListener("click", startNewConv);
    
    // --- Salvar Conversa ao Sair ---
    window.addEventListener("beforeunload", saveCurrentConv);

    // --- Inicia a aplicação ---
    init();

    /* O CÓDIGO ANTIGO DO SIDEBAR QUE ESTAVA AQUI FOI REMOVIDO 
    PARA EVITAR CONFLITO COM A NOVA IMPLEMENTAÇÃO NO INÍCIO DO ARQUIVO.
    */
});
