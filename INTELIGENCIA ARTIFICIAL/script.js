// --- Botão de voltar para o chat na base de conhecimento ---
document.addEventListener('DOMContentLoaded', function() {
    const kbBackBtn = document.getElementById('kb-back-btn');
    if (kbBackBtn) {
        kbBackBtn.addEventListener('click', function() {
            // Alterna para a aba do chat
            document.getElementById('chat-tab').style.display = '';
            document.getElementById('kb-tab').style.display = 'none';
            // Atualiza o estado do menu de alternância
            document.querySelectorAll('.tab-toggle-option').forEach(b => b.classList.remove('active'));
            document.querySelector('.tab-toggle-option[data-tab="chat-tab"]').classList.add('active');
        });
    }
    // Botão de limpar conversa (agora é um <button> e não mais <span>)
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async function() {
            if (confirm('Deseja realmente limpar a conversa?')) {
                await fetch('/clear-session', { method: 'POST' });
                location.reload();
            }
        });
    }
});


// --- Botão de alternância de modo (Assistente/KB) na área de input ---
document.addEventListener('DOMContentLoaded', function() {
    const tabToggleBtn = document.getElementById('tab-toggle-btn');
    const tabToggleMenu = document.getElementById('tab-toggle-menu');
    const tabToggleOptions = document.querySelectorAll('.tab-toggle-option');
    const tabContents = document.querySelectorAll('.tab-content');
    let menuOpen = false;
    // Remove qualquer resquício do modo Treinamento/Quiz
    if (tabToggleMenu) {
        const quizOption = tabToggleMenu.querySelector('.tab-toggle-option[data-tab="quiz-tab"]');
        if (quizOption) quizOption.remove();
    }
    const quizTab = document.getElementById('quiz-tab');
    if (quizTab) quizTab.remove();
    if (tabToggleBtn && tabToggleMenu) {
        tabToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            menuOpen = !menuOpen;
            tabToggleMenu.classList.toggle('open', menuOpen);
        });
        document.addEventListener('click', function(e) {
            if (menuOpen && !tabToggleMenu.contains(e.target) && e.target !== tabToggleBtn) {
                tabToggleMenu.classList.remove('open');
                menuOpen = false;
            }
        });
        tabToggleMenu.addEventListener('click', function(e) {
            const btn = e.target.closest('.tab-toggle-option');
            if (!btn) return;
            document.querySelectorAll('.tab-toggle-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
            const tab = document.getElementById(btn.dataset.tab);
            if (tab) tab.style.display = '';
            tabToggleMenu.classList.remove('open');
            menuOpen = false;
        });
    }
});

// --- Base de Conhecimento: Upload, Listagem, Busca, Remoção (Frontend) ---
const kbForm = document.getElementById('kb-upload-form');
const kbFile = document.getElementById('kb-file');
const kbFaq = document.getElementById('kb-faq');
const kbList = document.getElementById('kb-list');
const kbSearch = document.getElementById('kb-search');

async function fetchKbList(query = '') {
    const res = await fetch('/kb/list?q=' + encodeURIComponent(query));
    const data = await res.json();
    renderKbList(data);
}

function renderKbList(items) {
    kbList.innerHTML = '';
    if (!items.length) {
        kbList.innerHTML = '<div style="color:var(--cor-texto-secundario);padding:10px;">Nenhum item encontrado.</div>';
        return;
    }
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'kb-list-item';
        div.innerHTML = `<span>${item.type === 'file' ? '📄' : '💬'} <b>${item.name}</b></span>` +
            `<button data-id="${item.id}" class="kb-remove-btn" title="Remover">Remover</button>` +
            (item.type === 'file' ? ` <a href="/kb/download/${item.id}" target="_blank" style="margin-left:8px;">Baixar</a>` : '');
        kbList.appendChild(div);
    });
    document.querySelectorAll('.kb-remove-btn').forEach(btn => {
        btn.onclick = async function() {
            if (confirm('Remover este item da base de conhecimento?')) {
                await fetch('/kb/remove/' + btn.dataset.id, { method: 'DELETE' });
                fetchKbList(kbSearch.value);
            }
        };
    });
}

if (kbForm) {
    kbForm.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData();
        if (kbFile.files[0]) formData.append('file', kbFile.files[0]);
        if (kbFaq.value.trim()) formData.append('faq', kbFaq.value.trim());
        if (!kbFile.files[0] && !kbFaq.value.trim()) return alert('Adicione um arquivo ou texto!');
        const btn = kbForm.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Adicionando...';
        }
        try {
            const resp = await fetch('/kb/upload', { method: 'POST', body: formData });
            if (resp.ok) {
                kbFile.value = '';
                kbFaq.value = '';
                fetchKbList();
                // Feedback visual
                if (btn) {
                    btn.textContent = 'Adicionado!';
                    setTimeout(() => {
                        btn.textContent = 'Adicionar';
                        btn.disabled = false;
                    }, 1200);
                }
            } else {
                alert('Erro ao adicionar à base de conhecimento.');
                if (btn) {
                    btn.textContent = 'Adicionar';
                    btn.disabled = false;
                }
            }
        } catch (err) {
            alert('Erro ao adicionar à base de conhecimento.');
            if (btn) {
                btn.textContent = 'Adicionar';
                btn.disabled = false;
            }
        }
    };
}

if (kbSearch) {
    kbSearch.oninput = function() {
        fetchKbList(kbSearch.value);
    };
}

// Carregar lista ao abrir a aba KB e dar feedback visual
document.addEventListener('DOMContentLoaded', function() {
    const kbTabBtn = document.querySelector('.tab-btn[data-tab="kb-tab"]');
    if (kbTabBtn) {
        kbTabBtn.addEventListener('click', () => fetchKbList(kbSearch.value));
    }
    // Dica visual para FAQ
    const faqLabel = document.querySelector('label[for="kb-faq"]');
    if (faqLabel) {
        faqLabel.innerHTML += ' <span style="color:var(--cor-destaque);font-size:0.95em;">(clique em Adicionar para salvar)</span>';
    }
});
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
    // INÍCIO: MENU LATERAL (SIDEBAR) - BOTÃO SEMPRE AO LADO DO MODO NOTURNO
    // ==================================================
    const sideMenu = document.getElementById("side-menu");
    const openMenuBtn = document.getElementById("open-menu-btn");
    const menuOverlay = document.getElementById("menu-overlay");
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // Função para garantir que o botão de menu fique ao lado do modo noturno em todas as telas
    function positionMenuBtn() {
        if (!openMenuBtn || !themeToggleBtn) return;
        // Remove o botão do local atual
        openMenuBtn.parentNode?.removeChild(openMenuBtn);
        // Insere logo antes do botão de tema
        themeToggleBtn.parentNode.insertBefore(openMenuBtn, themeToggleBtn);
        // Garante que ambos fiquem visíveis e alinhados
        openMenuBtn.style.display = 'inline-flex';
        openMenuBtn.style.verticalAlign = 'middle';
        themeToggleBtn.style.display = 'inline-flex';
        themeToggleBtn.style.verticalAlign = 'middle';
    }
    positionMenuBtn();
    window.addEventListener('resize', positionMenuBtn);

    // Eventos do menu lateral (iguais para desktop e mobile)
    if (sideMenu && openMenuBtn && menuOverlay) {
        openMenuBtn.addEventListener("click", () => {
            sideMenu.classList.add("open");
            menuOverlay.classList.add("show");
        });
        menuOverlay.addEventListener("click", () => {
            sideMenu.classList.remove("open");
            menuOverlay.classList.remove("show");
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && sideMenu.classList.contains('open')) {
                sideMenu.classList.remove("open");
                menuOverlay.classList.remove("show");
            }
        });
        // Swipe para abrir/fechar (mobile)
        let startX = null;
        document.addEventListener("touchstart", function(e) {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
            }
        }, { passive: true });
        document.addEventListener("touchend", function(e) {
            if (!startX) return;
            let endX = e.changedTouches[0].clientX;
            let diffX = endX - startX;
            if (startX < 50 && diffX > 60 && !sideMenu.classList.contains("open")) {
                sideMenu.classList.add("open");
                menuOverlay.classList.add("show");
            }
            if (diffX < -60 && sideMenu.classList.contains("open")) {
                sideMenu.classList.remove("open");
                menuOverlay.classList.remove("show");
            }
            startX = null;
        });
    }
    // ==================================================
    // FIM: MENU LATERAL (SIDEBAR)
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
            chatContent = `<span class="material-symbols-outlined" style="color:var(--cor-destaque);font-size:2.1em;">engineering</span><p class="typing-animation"><span></span><span></span><span></span></p>`;
        } else {
            chatContent = className === "incoming"
                ? `<span class="material-symbols-outlined" style="color:var(--cor-destaque);font-size:2.1em;">engineering</span><p></p>`
                : `<p></p>`;
        }
        chatLi.innerHTML = chatContent;
        if (message !== "typing") {
            const p = chatLi.querySelector("p");
            if (p) p.textContent = message;
        }
        return chatLi;
    };

    // --- Efeito de digitação na resposta da AEMI ---
    function typeText(element, text, delay = 18) {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, delay);
            }
        }
        type();
    }

    
    // --- Chat por voz: reconhecimento e síntese ---
const micBtn = document.getElementById('mic-btn');
const chatInput = document.querySelector('.chat-input textarea'); // Captura o chatInput aqui para uso posterior

// A SÍNTESE DE FALA ESTÁ AGORA DESATIVADA POR PADRÃO
let speechSynthesisEnabled = false;

// Variáveis e funções do chat (algumas são apenas declarações para evitar ReferenceError)
// Substitua API_URL_CHAT, userMessage, API_URL_CLEAR, chatbox, createChatLi, typeText,
// saveCurrentConv, getConvs, startNewConv, loadConv, sendChatBtn, clearChatBtn, newConvBtn
// pelas suas declarações reais, caso ainda não estejam no seu escopo global ou superior.
// Exemplo de declarações dummy para que o código funcione isoladamente
const API_URL_CHAT = "https://example.com/api/chat"; // Substitua pela sua URL real
const API_URL_CLEAR = "https://example.com/api/clear"; // Substitua pela sua URL real
let userMessage = "";
const chatbox = document.getElementById('chatbox'); // Certifique-se de que este elemento existe no seu HTML
const sendChatBtn = document.getElementById('send-chat-btn'); // Certifique-se de que este elemento existe no seu HTML
const clearChatBtn = document.getElementById('clear-chat-btn'); // Certifique-se de que este elemento existe no seu HTML
const newConvBtn = document.getElementById('new-conv-btn'); // Certifique-se de que este elemento existe no seu HTML

// Funções dummy para que o código compile, substitua pelas suas reais
function createChatLi(message, className) {
    const li = document.createElement("li");
    li.classList.add("chat", className);
    if (className === "incoming") {
        const span = document.createElement("span");
        span.classList.add("material-symbols-outlined");
        span.textContent = "smart_toy";
        li.appendChild(span);
    }
    const p = document.createElement("p");
    p.textContent = message;
    li.appendChild(p);
    return li;
}
function typeText(element, text) {
    let i = 0;
    element.textContent = '';
    const interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 20); // Velocidade da digitação, ajuste conforme necessário
}
function saveCurrentConv() { console.log("Salvar conversa..."); }
function getConvs() { return []; } // Retorna array vazio para este exemplo
function startNewConv() { console.log("Iniciar nova conversa..."); }
function loadConv(id) { console.log(`Carregar conversa ${id}...`); }


if (micBtn && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let recognizing = false;

    micBtn.addEventListener('click', () => {
        if (!recognizing) {
            recognition.start();
            micBtn.classList.add('gravando');
            micBtn.querySelector('span').textContent = 'mic_off';
        } else {
            recognition.stop();
            micBtn.classList.remove('gravando');
            micBtn.querySelector('span').textContent = 'mic';
        }
    });

    recognition.onstart = () => {
        recognizing = true;
        micBtn.classList.add('gravando');
    };

    recognition.onend = () => {
        recognizing = false;
        micBtn.classList.remove('gravando');
        micBtn.querySelector('span').textContent = 'mic';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (chatInput) {
            chatInput.value = transcript;
            chatInput.focus();
            // Processa o comando de voz se for o caso. Se for um comando, ele será consumido.
            // Se não for um comando, o texto permanece no chatInput.
            processVoiceCommand(transcript);
        }
    };

    // --- Adiciona tratamento de erros para o reconhecimento de voz ---
    recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        recognizing = false;
        micBtn.classList.remove('gravando');
        micBtn.querySelector('span').textContent = 'mic';
        if (event.error === 'not-allowed') {
            console.warn('Permissão para usar o microfone negada. Habilite nas configurações do navegador.');
        }
    };

} else if (micBtn) {
    micBtn.disabled = true;
    micBtn.title = 'Reconhecimento de voz não suportado neste navegador.';
    console.warn('Reconhecimento de voz não suportado neste navegador.');
}

// --- Síntese de fala para resposta da AEMI ---
function speakText(text) {
    // Só fala se a síntese de fala estiver ativada
    if (!speechSynthesisEnabled) {
        console.log(`Síntese de fala desativada. Texto não falado: "${text}"`);
        return;
    }

    if ('speechSynthesis' in window) {
        // Cancela qualquer fala atual para evitar sobreposição
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'pt-BR';
        utter.rate = 1;
        utter.pitch = 1;

        utter.onerror = (event) => {
            console.error('Erro na síntese de fala:', event.error);
        };

        window.speechSynthesis.speak(utter);
    } else {
        console.warn('Síntese de fala não suportada neste navegador.');
    }
}

// --- Função para processar comandos de voz digitados/transcritos ---
// Esta função é chamada tanto pelo reconhecimento de voz quanto pela digitação.
function processVoiceCommand(commandText) {
    const cleanedCommand = commandText.trim().toLowerCase();

    if (cleanedCommand === 'ativar voz') {
        speechSynthesisEnabled = true;
        console.log('Comando recebido: "ativar voz". Síntese de voz ATIVADA.');
        speakText('Síntese de voz ativada.');
        // Limpa o campo de input após o comando
        if (chatInput) chatInput.value = '';
        return true; // Indica que um comando foi processado
    } else if (cleanedCommand === 'desativar voz') {
        speechSynthesisEnabled = false;
        window.speechSynthesis.cancel(); // Para qualquer fala em andamento imediatamente
        console.log('Comando recebido: "desativar voz". Síntese de voz DESATIVADA.');
        // Limpa o campo de input após o comando
        if (chatInput) chatInput.value = '';
        return true; // Indica que um comando foi processado
    }
    return false; // Indica que não foi um comando de voz
}

// --- Monitora o campo de chat para comandos digitados ---
// Este listener é importante para capturar comandos digitados antes do handleChat.
if (chatInput) {
    // O evento 'change' é acionado quando o valor do elemento muda e ele perde o foco
    // Isso é útil para quando o usuário digita e clica fora, ou envia de alguma outra forma
    chatInput.addEventListener('change', (event) => {
        const typedText = event.target.value;
        if (typedText.trim() !== '') {
            // Se o texto digitado for um comando de voz, ele será processado aqui.
            // Se processVoiceCommand retornar true, o comando foi tratado e não precisa ir para o handleChat normal.
            processVoiceCommand(typedText);
        }
    });

    // Monitora o 'keydown' para o Enter, permitindo processar comandos digitados
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Impede a quebra de linha padrão no textarea
            const typedText = chatInput.value;
            if (typedText.trim() !== '') {
                // Se o texto digitado for um comando de voz, ele será processado.
                const isCommand = processVoiceCommand(typedText);
                if (!isCommand) {
                    // Se não for um comando de voz, então é uma mensagem normal para o chat.
                    // Chama a função handleChat para enviar a mensagem.
                    handleChat();
                }
            }
        }
    });
}

// --- Envio de Mensagem e Resposta ---
const generateResponse = (incomingChatLi) => {
    // Certifique-se de que 'userMessage' esteja definida antes de 'requestOptions'
    // userMessage é definida em handleChat, então este trecho é chamado após handleChat.
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ message: userMessage }) // userMessage deve ser do escopo externo
    };
    const pElement = incomingChatLi.querySelector("p") || document.createElement("p");
    if(!incomingChatLi.querySelector("p")){
        incomingChatLi.appendChild(pElement);
    }
    // Efeito de "digitando..."
    pElement.textContent = "";
    pElement.classList.add("typing-animation");
    fetch(API_URL_CHAT, requestOptions)
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => {
            pElement.classList.remove("typing-animation");
            pElement.textContent = "";
            typeText(pElement, data.response);
            speakText(data.response); // Fala a resposta da AEMI (se estiver ativada)
        })
        .catch(() => {
            pElement.classList.remove("typing-animation");
            pElement.textContent = "[Erro ao obter resposta da IA]";
        })
        .finally(() => {
            chatbox.scrollTop = chatbox.scrollHeight;
        });
};

// --- Envio de Mensagem ---
const handleChat = () => {
    if(!chatInput) return;
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // AQUI É A PARTE CRÍTICA: Não chamamos processVoiceCommand aqui, pois ele já é chamado no keydown.
    // Se um comando de voz foi digitado e processado pelo keydown, o chatInput.value já terá sido limpo.
    // Se o chatInput.value NÃO estiver vazio aqui, significa que era uma mensagem normal.

    // Se a mensagem for um comando, ele já terá sido consumido e o input limpo.
    // Se o input não estiver vazio, é uma mensagem para a IA.
    if (chatInput.value.trim() === '') {
        // O comando de voz foi processado e o input limpo, então não há mensagem para enviar à IA.
        chatInput.disabled = false; // Habilita o input novamente
        if(sendChatBtn) sendChatBtn.disabled = false; // Habilita o botão de enviar
        return;
    }

    // Se chegou até aqui, é uma mensagem normal para a IA.
    chatInput.value = "";
    chatInput.disabled = true;
    if(sendChatBtn) sendChatBtn.disabled = true;


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
// window.onload para garantir que todos os elementos estejam disponíveis
window.addEventListener("load", () => {
    if(sendChatBtn) sendChatBtn.addEventListener("click", handleChat);
    if(clearChatBtn) clearChatBtn.addEventListener("click", clearChat);
    // O chatInput.addEventListener("keydown") foi movido para o bloco do processVoiceCommand
    // para melhor integração da lógica de comando antes do handleChat.
    if(newConvBtn) newConvBtn.addEventListener("click", startNewConv);

    // --- Salvar Conversa ao Sair ---
    window.addEventListener("beforeunload", saveCurrentConv);

    // --- Inicia a aplicação ---
    init();
});

// O CÓDIGO ANTIGO DO SIDEBAR QUE ESTAVA AQUI FOI REMOVIDO
// PARA EVITAR CONFLITO COM A NOVA IMPLEMENTAÇÃO NO INÍCIO DO ARQUIVO.
                          
