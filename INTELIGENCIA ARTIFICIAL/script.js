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

    // Sugestões rápidas
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            chatInput.value = btn.dataset.msg;
            chatInput.focus();
        });
    });
// script.js - Versão com URL de Backend Dinâmica


// script.js - Versão com Sidebar, Animações e Conversas Salvas
document.addEventListener("DOMContentLoaded", () => {
    // --- Seletores do DOM ---
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
        if (!currentConvId) return;
        const conv = { id: currentConvId, title: getConvTitle(), history: getCurrentHistory() };
        updateConv(currentConvId, conv);
    }
    function getCurrentHistory() {
        // Extrai mensagens do chatbox
        const lis = chatbox.querySelectorAll("li.chat");
        const history = [];
        lis.forEach(li => {
            const isUser = li.classList.contains("outgoing");
            const text = li.querySelector("p")?.textContent || "";
            if (text.trim()) {
                history.push({ role: isUser ? "user" : "assistant", content: text });
            }
        });
        return history;
    }
    function getConvTitle() {
        // Usa a primeira mensagem do usuário como título
        const lis = chatbox.querySelectorAll("li.outgoing p");
        return lis.length > 0 ? lis[0].textContent.slice(0, 32) : "Nova Conversa";
    }
    function loadConv(id) {
        const conv = getConvById(id);
        if (!conv) return;
        currentConvId = id;
        chatbox.innerHTML = "";
        conv.history.forEach(msg => {
            const li = createChatLi(msg.content, msg.role === "user" ? "outgoing" : "incoming");
            chatbox.appendChild(li);
        });
        renderSidebar();
    }

    // --- Nova Conversa ---
    function startNewConv() {
        saveCurrentConv();
        const id = "conv-" + Date.now();
        const conv = { id, title: "Nova Conversa", history: [] };
        addConv(conv);
        currentConvId = id;
        chatbox.innerHTML = `<li class="chat incoming"><span class="material-symbols-outlined">smart_toy</span><p>Olá. Sou AEMI, uma IA da Manutenção Industrial. Envie uma mensagem para começarmos.</p></li>`;
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
        const typingElement = incomingChatLi.querySelector(".typing-animation");
        fetch(API_URL_CHAT, requestOptions)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                const pElement = document.createElement("p");
                pElement.textContent = data.response || "Desculpe, não recebi uma resposta válida.";
                if (typingElement) {
                    typingElement.replaceWith(pElement);
                }
                saveCurrentConv();
            })
            .catch(() => {
                const errorPElement = document.createElement("p");
                errorPElement.classList.add("error");
                errorPElement.textContent = "Oops! Algo deu errado. Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.";
                if (typingElement) {
                    typingElement.replaceWith(errorPElement);
                }
            })
            .finally(() => {
                chatInput.disabled = false;
                sendChatBtn.disabled = false;
                chatbox.scrollTo(0, chatbox.scrollHeight);
            });
    };

    // --- Envio de Mensagem ---
    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;
        chatInput.value = "";
        chatInput.disabled = true;
        sendChatBtn.disabled = true;
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        setTimeout(() => {
            const incomingChatLi = createChatLi("typing", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
        saveCurrentConv();
    };

    // --- Limpar Chat ---
    const clearChat = () => {
        if (confirm("Você tem certeza que deseja limpar o histórico desta conversa?")) {
            chatbox.innerHTML = `<li class="chat incoming"><span class="material-symbols-outlined">smart_toy</span><p>Olá. Sou AEMI, uma IA da Manutenção Industrial. Envie uma mensagem para começarmos.</p></li>`;
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
            currentConvId = convs[convs.length - 1].id;
            loadConv(currentConvId);
        }
        renderSidebar();
    }

    // --- Event Listeners ---
    sendChatBtn.addEventListener("click", handleChat);
    clearChatBtn.addEventListener("click", clearChat);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });
    newConvBtn.addEventListener("click", startNewConv);

    // Sidebar toggle para mobile
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('aberta');
        });
    }
    // Fecha sidebar ao clicar fora (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && sidebar.classList.contains('aberta')) {
            if (!sidebar.contains(e.target) && e.target !== sidebarToggleBtn) {
                sidebar.classList.remove('aberta');
            }
        }
    });

    window.addEventListener("beforeunload", saveCurrentConv);

    init();
});
