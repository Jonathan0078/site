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
    try {
        const res = await fetch('/kb/list?q=' + encodeURIComponent(query));
        if (!res.ok) throw new Error('Erro na resposta do servidor');
        const data = await res.json();
        renderKbList(data);
    } catch (error) {
        console.error('Erro ao buscar base de conhecimento:', error);
        renderKbList([]);
    }
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
    // Carrega a lista KB automaticamente
    fetchKbList('');

    // Adiciona evento para alternar para KB
    const kbToggleBtn = document.querySelector('.tab-toggle-option[data-tab="kb-tab"]');
    if (kbToggleBtn) {
        kbToggleBtn.addEventListener('click', () => {
            setTimeout(() => fetchKbList(kbSearch?.value || ''), 100);
        });
    }

    // Dica visual para FAQ
    const faqLabel = document.querySelector('label[for="kb-faq"]');
    if (faqLabel && !faqLabel.querySelector('span')) {
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
    const fileInput = document.getElementById("file-input");
    const fileBtn = document.getElementById("file-btn");

    // --- Configuração Dinâmica da URL do Backend ---
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const BACKEND_URL = isLocal ? "http://127.0.0.1:5000" : "https://aemi.onrender.com";
    const API_URL_CHAT = `${BACKEND_URL}/chat`;
    const API_URL_CLEAR = `${BACKEND_URL}/clear-session`;
    const API_URL_UPLOAD = `${BACKEND_URL}/upload-file`;

    let userMessage = null;
    let currentConvId = null;

    // Variável para controlar se a síntese de voz está ativada (desativada por padrão)
    let isVoiceOutputEnabled = false;

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
    if (micBtn && window.SpeechRecognition || window.webkitSpeechRecognition) {
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
            const chatInput = document.querySelector('.chat-input textarea');
            if (chatInput) {
                chatInput.value = transcript;
                chatInput.focus();
            }
        };
    } else if (micBtn) {
        micBtn.disabled = true;
        micBtn.title = 'Reconhecimento de voz não suportado neste navegador.';
    }

    // --- Síntese de fala para resposta da AEMI ---
    function speakText(text) {
        if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'pt-BR';
            utter.rate = 1;
            utter.pitch = 1;
            window.speechSynthesis.speak(utter);
        }
    }

    // --- Upload de Arquivo ---
    const handleFileUpload = (file) => {
        const formData = new FormData();
        formData.append('file', file);

        // Determina o tipo de arquivo
        const fileExt = file.name.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExt);
        const isDocument = ['pdf', 'doc', 'docx', 'txt', 'md', 'csv'].includes(fileExt);
        
        // Adiciona mensagem do usuário com ícone apropriado
        let fileIcon = '📎';
        if (isImage) fileIcon = '📸';
        else if (isDocument) fileIcon = '📄';
        
        const userMessage = `${fileIcon} Arquivo enviado: ${file.name}`;
        if(chatbox) {
            chatbox.appendChild(createChatLi(userMessage, "outgoing"));
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }

        // Cria mensagem de "analisando arquivo" com texto personalizado
        const incomingChatLi = createChatLi("typing", "incoming");
        const pElement = incomingChatLi.querySelector("p");
        
        let analysisText = "Analisando arquivo...";
        if (isImage) analysisText = "Analisando imagem...";
        else if (fileExt === 'pdf') analysisText = "Processando PDF...";
        else if (fileExt === 'docx') analysisText = "Processando documento...";
        
        if(pElement) {
            pElement.textContent = analysisText;
            pElement.classList.add("typing-animation");
        }

        if(chatbox) {
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }

        // Envia arquivo para análise
        fetch(API_URL_UPLOAD, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if(pElement) {
                pElement.classList.remove("typing-animation");
                pElement.textContent = "";
                
                if (data.response) {
                    typeText(pElement, data.response);
                } else if (data.error) {
                    pElement.textContent = `❌ Erro: ${data.error}`;
                } else {
                    pElement.textContent = "Arquivo processado com sucesso!";
                }
            }

            if (isVoiceOutputEnabled && data.response) {
                speakText(data.response);
            }
        })
        .catch(error => {
            console.error('Erro no upload:', error);
            if(pElement) {
                pElement.classList.remove("typing-animation");
                pElement.textContent = "❌ Erro ao processar arquivo. Verifique se o formato é suportado e tente novamente.";
            }
        })
        .finally(() => {
            if(chatbox) {
                chatbox.scrollTo(0, chatbox.scrollHeight);
            }
            saveCurrentConv();
        });
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
                if (isVoiceOutputEnabled) {
                    speakText(data.response); // Fala a resposta da AEMI se a voz estiver ativada
                }
            })
            .catch(() => {
                pElement.classList.remove("typing-animation");
                pElement.textContent = "[Erro ao obter resposta da IA]";
            })
            .finally(() => {
                chatInput.disabled = false; // Reabilita o input
                sendChatBtn.disabled = false; // Reabilita o botão de enviar
                chatbox.scrollTop = chatbox.scrollHeight;
            });
    };

    // --- Envio de Mensagem ---
    const handleChat = () => {
        if(!chatInput) return;
        userMessage = chatInput.value.trim();
        const lowerCaseMessage = userMessage.toLowerCase(); // Converte para minúsculas para comparação

        if (!lowerCaseMessage) return;

        chatInput.value = "";
        // chatInput.disabled = true; // Removido para permitir digitação enquanto a IA responde
        // sendChatBtn.disabled = true; // Removido para permitir digitação enquanto a IA responde

        // Verifica se é um comando de voz ou uma mensagem normal
        if (lowerCaseMessage === "ativar voz") {
            isVoiceOutputEnabled = true;
            if(chatbox) {
                 chatbox.appendChild(createChatLi(userMessage, "outgoing"));
                 chatbox.appendChild(createChatLi("Síntese de voz ativada.", "incoming"));
                 chatbox.scrollTo(0, chatbox.scrollHeight);
            }
            chatInput.disabled = false; // Reabilita o input após o comando
            sendChatBtn.disabled = false; // Reabilita o botão de enviar após o comando
        } else if (lowerCaseMessage === "desativar voz") {
            isVoiceOutputEnabled = false;
             if(chatbox) {
                 chatbox.appendChild(createChatLi(userMessage, "outgoing"));
                 chatbox.appendChild(createChatLi("Síntese de voz desativada.", "incoming"));
                 chatbox.scrollTo(0, chatbox.scrollHeight);
             }
            chatInput.disabled = false; // Reabilita o input após o comando
            sendChatBtn.disabled = false; // Reabilita o botão de enviar após o comando
        } else {
            // Se não for comando de voz, continua com a lógica normal
            if(chatbox) {
                chatbox.appendChild(createChatLi(userMessage, "outgoing"));
                chatbox.scrollTo(0, chatbox.scrollHeight);
                // Cria a mensagem de "typing" antes de chamar generateResponse
                const incomingChatLi = createChatLi("typing", "incoming");
            setTimeout(() => {
                chatbox.appendChild(incomingChatLi);
                chatbox.scrollTo(0, chatbox.scrollHeight);
                generateResponse(incomingChatLi);
            }, 600);
        }
        saveCurrentConv();
    };
    }

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

    // Eventos para upload de arquivo
    if(fileBtn && fileInput) {
        fileBtn.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if(file) {
                handleFileUpload(file);
                fileInput.value = ''; // Limpa o input
            }
        });
    }

    // Interromper a fala da IA ao começar a digitar
    if(chatInput && 'speechSynthesis' in window) {
        chatInput.addEventListener('input', () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        });
    }
    if(newConvBtn) newConvBtn.addEventListener("click", startNewConv);

    // --- Salvar Conversa ao Sair ---
    window.addEventListener("beforeunload", saveCurrentConv);

    // --- Inicia a aplicação ---
    init();

    // --- Pesquisa na Internet ---
    const performInternetSearch = async (query) => {
        const chatContainer = document.querySelector(".chatbox"); // Make sure this selector is correct
        const outgoingChatLi = createChatLi(`🔍 Pesquisando: "${query}"`, "outgoing");
        chatContainer.appendChild(outgoingChatLi);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);

        const incomingChatLi = createChatLi("typing", "incoming");
        chatContainer.appendChild(incomingChatLi);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);

        const pElement = incomingChatLi.querySelector("p");
        pElement.textContent = "Pesquisando na internet..."; // Updated message

        const formData = new FormData();
        formData.append('query', query);
        formData.append('max_results', '5');

        try {
            const response = await fetch(`${BACKEND_URL}/search-internet`, { // Updated API URL
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                pElement.classList.remove("typing-animation");
                pElement.textContent = `❌ Erro na pesquisa: ${data.error}`;
            } else if (data.results && data.results.length > 0) {
                let resultText = `🔍 **Resultados da pesquisa para "${query}"**\n\n`;
                resultText += `📊 Encontrei ${data.results.length} resultado(s):\n\n`;

                data.results.forEach((result, index) => {
                    resultText += `**${index + 1}. ${result.title}**\n`;
                    resultText += `🔗 ${result.url}\n`;
                    if (result.snippet) {
                        resultText += `📝 ${result.snippet}\n`;
                    }
                    resultText += `\n`;
                });

                resultText += `💡 **Como usar:** Clique nos links para mais detalhes ou me pergunte algo específico!`;

                pElement.classList.remove("typing-animation");
                typeText(pElement, resultText);

                if (isVoiceOutputEnabled) {
                    speakText(`Encontrei ${data.results.length} resultados para sua pesquisa sobre ${query}`);
                }
            } else {
                pElement.classList.remove("typing-animation");
                pElement.textContent = `🚫 Nenhum resultado encontrado para "${query}". Tente reformular sua pesquisa.`;
            }
        } catch (error) {
            console.error('Erro na pesquisa:', error);
            pElement.classList.remove("typing-animation");
            pElement.textContent = '❌ Erro ao realizar pesquisa na internet.';
        } finally {
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
            saveCurrentConv();
        }
    };
    const searchBtn = document.getElementById('search-btn');

    searchBtn.addEventListener('click', () => {
        const query = chatInput.value.trim();
        if (query) {
            performInternetSearch(query);
        } else {
            const searchQuery = prompt('Digite sua pesquisa:');
            if (searchQuery && searchQuery.trim()) {
                chatInput.value = `Pesquisar: ${searchQuery.trim()}`;
                performInternetSearch(searchQuery.trim());
            }
        }
    });
});
