// Funções do Quiz do Módulo 11
let quizM11Index = 0;
let quizM11Acertos = 0;
function mostrarQuizM11Pergunta() {
    const p = quizM11[quizM11Index];
    const perguntaEl = document.getElementById('quiz-m11-pergunta');
    const opcoesEl = document.getElementById('quiz-m11-opcoes');
    const feedbackEl = document.getElementById('quiz-m11-feedback');
    const btnProxima = document.getElementById('quiz-m11-proxima');
    perguntaEl.textContent = `Pergunta ${quizM11Index + 1} de ${quizM11.length}: ${p.pergunta}`;
    opcoesEl.innerHTML = '';
    feedbackEl.textContent = '';
    btnProxima.style.display = 'none';
    p.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.textContent = opcao;
        btn.onclick = () => quizM11Responder(btn, opcao, p.resposta);
        opcoesEl.appendChild(btn);
    });
}
function quizM11Responder(btn, selecionada, correta) {
    const opcoesEl = document.getElementById('quiz-m11-opcoes');
    const botoes = opcoesEl.querySelectorAll('button');
    const feedbackEl = document.getElementById('quiz-m11-feedback');
    const btnProxima = document.getElementById('quiz-m11-proxima');
    let acertou = (selecionada === correta);
    if (acertou) quizM11Acertos++;
    botoes.forEach(b => {
        b.disabled = true;
        if (b.textContent === correta) b.classList.add('correta');
        else if (b.textContent === selecionada) b.classList.add('incorreta');
    });
    feedbackEl.textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
    btnProxima.style.display = 'inline-block';
    btnProxima.onclick = quizM11ProximaPergunta;
}
function quizM11ProximaPergunta() {
    quizM11Index++;
    if (quizM11Index < quizM11.length) {
        mostrarQuizM11Pergunta();
    } else {
        mostrarQuizM11Resultado();
    }
}
function mostrarQuizM11Resultado() {
    const perguntaEl = document.getElementById('quiz-m11-pergunta');
    const opcoesEl = document.getElementById('quiz-m11-opcoes');
    const feedbackEl = document.getElementById('quiz-m11-feedback');
    const btnProxima = document.getElementById('quiz-m11-proxima');
    perguntaEl.textContent = 'Quiz finalizado!';
    opcoesEl.innerHTML = '';
    feedbackEl.textContent = quizM11Acertos === quizM11.length ? 'Parabéns! Você acertou tudo!' : `Você acertou ${quizM11Acertos} de ${quizM11.length}. Tente novamente para gabaritar!`;
    btnProxima.style.display = 'none';
}

// Funções do Quiz do Módulo 12
let quizM12Index = 0;
let quizM12Acertos = 0;
function mostrarQuizM12Pergunta() {
    const p = quizM12[quizM12Index];
    const perguntaEl = document.getElementById('quiz-m12-pergunta');
    const opcoesEl = document.getElementById('quiz-m12-opcoes');
    const feedbackEl = document.getElementById('quiz-m12-feedback');
    const btnProxima = document.getElementById('quiz-m12-proxima');
    perguntaEl.textContent = `Pergunta ${quizM12Index + 1} de ${quizM12.length}: ${p.pergunta}`;
    opcoesEl.innerHTML = '';
    feedbackEl.textContent = '';
    btnProxima.style.display = 'none';
    p.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.textContent = opcao;
        btn.onclick = () => quizM12Responder(btn, opcao, p.resposta);
        opcoesEl.appendChild(btn);
    });
}
function quizM12Responder(btn, selecionada, correta) {
    const opcoesEl = document.getElementById('quiz-m12-opcoes');
    const botoes = opcoesEl.querySelectorAll('button');
    const feedbackEl = document.getElementById('quiz-m12-feedback');
    const btnProxima = document.getElementById('quiz-m12-proxima');
    let acertou = (selecionada === correta);
    if (acertou) quizM12Acertos++;
    botoes.forEach(b => {
        b.disabled = true;
        if (b.textContent === correta) b.classList.add('correta');
        else if (b.textContent === selecionada) b.classList.add('incorreta');
    });
    feedbackEl.textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
    btnProxima.style.display = 'inline-block';
    btnProxima.onclick = quizM12ProximaPergunta;
}
function quizM12ProximaPergunta() {
    quizM12Index++;
    if (quizM12Index < quizM12.length) {
        mostrarQuizM12Pergunta();
    } else {
        mostrarQuizM12Resultado();
    }
}
function mostrarQuizM12Resultado() {
    const perguntaEl = document.getElementById('quiz-m12-pergunta');
    const opcoesEl = document.getElementById('quiz-m12-opcoes');
    const feedbackEl = document.getElementById('quiz-m12-feedback');
    const btnProxima = document.getElementById('quiz-m12-proxima');
    perguntaEl.textContent = 'Quiz finalizado!';
    opcoesEl.innerHTML = '';
    feedbackEl.textContent = quizM12Acertos === quizM12.length ? 'Parabéns! Você acertou tudo!' : `Você acertou ${quizM12Acertos} de ${quizM12.length}. Tente novamente para gabaritar!`;
    btnProxima.style.display = 'none';
}
// Quiz do Módulo 11
const quizM11 = [
    {
        pergunta: "Qual é o principal objetivo da inspeção estrutural em ambientes industriais?",
        opcoes: [
            "Reduzir custos de energia",
            "Garantir a integridade física das instalações e pessoas",
            "Aumentar a produção",
            "Melhorar a estética do ambiente"
        ],
        resposta: "Garantir a integridade física das instalações e pessoas"
    },
    {
        pergunta: "Qual destes NÃO é um sinal de alerta em inspeção de estruturas metálicas?",
        opcoes: [
            "Trincas",
            "Corrosão",
            "Estruturas vibrando",
            "Pintura nova"
        ],
        resposta: "Pintura nova"
    },
    {
        pergunta: "O que deve ser feito ao identificar uma fissura em solda estrutural?",
        opcoes: [
            "Ignorar se for pequena",
            "Isolar a área e acionar manutenção",
            "Pintar por cima",
            "Aumentar a carga na estrutura"
        ],
        resposta: "Isolar a área e acionar manutenção"
    }
];

// Quiz do Módulo 12
const quizM12 = [
    {
        pergunta: "O que é um plano de inspeção?",
        opcoes: [
            "Um documento que define o que, quando, quem e como inspecionar",
            "Uma lista de compras",
            "Um relatório de falhas",
            "Um manual de operação de máquinas"
        ],
        resposta: "Um documento que define o que, quando, quem e como inspecionar"
    },
    {
        pergunta: "Qual ferramenta NÃO é típica da melhoria contínua em inspeção?",
        opcoes: [
            "PDCA",
            "Kaizen",
            "5W2H",
            "Desenho artístico"
        ],
        resposta: "Desenho artístico"
    },
    {
        pergunta: "Por que registrar as inspeções é importante?",
        opcoes: [
            "Para controle histórico e tomada de decisão",
            "Para aumentar o volume de papel",
            "Para dificultar auditorias",
            "Para evitar o uso de tecnologia"
        ],
        resposta: "Para controle histórico e tomada de decisão"
    }
];
    // Funções de interação para botões do módulo 3
    window.mostrarExemplo = function(id) {
        const exemplos = Array.from({length: 12}, (_, i) => `exemplo${i+1}`);
        const dicas = Array.from({length: 12}, (_, i) => `dica${i+1}`);
        const resumos = Array.from({length: 12}, (_, i) => `resumo${i+1}`);
        exemplos.forEach(eid => {
            document.getElementById(eid) && (document.getElementById(eid).style.display = (eid === id ? 'block' : 'none'));
        });
        dicas.forEach(did => { document.getElementById(did) && (document.getElementById(did).style.display = 'none'); });
        resumos.forEach(rid => { document.getElementById(rid) && (document.getElementById(rid).style.display = 'none'); });
    };
    window.mostrarDica = function(id) {
        const exemplos = Array.from({length: 12}, (_, i) => `exemplo${i+1}`);
        const dicas = Array.from({length: 12}, (_, i) => `dica${i+1}`);
        const resumos = Array.from({length: 12}, (_, i) => `resumo${i+1}`);
        exemplos.forEach(eid => { document.getElementById(eid) && (document.getElementById(eid).style.display = 'none'); });
        dicas.forEach(did => { document.getElementById(did) && (document.getElementById(did).style.display = (did === id ? 'block' : 'none')); });
        resumos.forEach(rid => { document.getElementById(rid) && (document.getElementById(rid).style.display = 'none'); });
    };
    window.mostrarResumo = function(id) {
        const exemplos = Array.from({length: 12}, (_, i) => `exemplo${i+1}`);
        const dicas = Array.from({length: 12}, (_, i) => `dica${i+1}`);
        const resumos = Array.from({length: 12}, (_, i) => `resumo${i+1}`);
        exemplos.forEach(eid => { document.getElementById(eid) && (document.getElementById(eid).style.display = 'none'); });
        dicas.forEach(did => { document.getElementById(did) && (document.getElementById(did).style.display = 'none'); });
        resumos.forEach(rid => { document.getElementById(rid) && (document.getElementById(rid).style.display = (rid === id ? 'block' : 'none')); });
    };

    // Quiz do Módulo 3
    const quizM3 = [
        {
            pergunta: "Qual a principal função de um checklist na inspeção?",
            opcoes: ["Aumentar o tempo da inspeção.", "Evitar esquecimentos e garantir que todos os itens sejam verificados.", "Reduzir a segurança.", "Substituir o inspetor."],
            resposta: "Evitar esquecimentos e garantir que todos os itens sejam verificados."
        },
        {
            pergunta: "Por que é importante seguir o procedimento padrão mesmo em tarefas rotineiras?",
            opcoes: ["Para garantir qualidade e segurança.", "Para ser mais rápido.", "Para evitar o uso de EPIs.", "Para economizar papel."],
            resposta: "Para garantir qualidade e segurança."
        },
        {
            pergunta: "O que deve ser registrado em uma inspeção?",
            opcoes: ["Apenas o nome do técnico.", "Somente falhas graves.", "Valores, fotos, observações e falhas encontradas.", "Nada, só observar."],
            resposta: "Valores, fotos, observações e falhas encontradas."
        }
    ];
    let quizM3Index = 0;
    let quizM3Acertos = 0;

// Função unificada para abrir quiz de qualquer módulo
const quizzes = [null, quizM1, quizM2, quizM3, quizM4, quizM5, quizM6, quizM7, quizM8, quizM9, quizM10, quizM11, quizM12];
const quizIndex = Array(13).fill(0); // 0 a 12
const quizAcertos = Array(13).fill(0);
window.abrirQuizModulo = function(modulo) {
    for (let i = 1; i <= 12; i++) {
        const quizDiv = document.getElementById(`quiz-modulo-${i}`);
        if (quizDiv) quizDiv.style.display = 'none';
    }
    const quizAtual = document.getElementById(`quiz-modulo-${modulo}`);
    if (quizAtual) {
        quizAtual.style.display = 'block';
        // Cria elementos de quiz se não existirem
        if (!document.getElementById(`quiz-m${modulo}-pergunta`)) {
            const pergunta = document.createElement('div');
            pergunta.id = `quiz-m${modulo}-pergunta`;
            quizAtual.appendChild(pergunta);
            const opcoes = document.createElement('div');
            opcoes.id = `quiz-m${modulo}-opcoes`;
            quizAtual.appendChild(opcoes);
            const feedback = document.createElement('div');
            feedback.id = `quiz-m${modulo}-feedback`;
            quizAtual.appendChild(feedback);
            const btnProxima = document.createElement('button');
            btnProxima.id = `quiz-m${modulo}-proxima`;
            btnProxima.textContent = 'Próxima';
            btnProxima.style.display = 'none';
            quizAtual.appendChild(btnProxima);
        }
        // Inicia quiz do módulo
        if (typeof mostrarQuizPergunta === 'function' && quizzes && quizzes[modulo]) {
            quizIndex[modulo] = 0;
            quizAcertos[modulo] = 0;
            mostrarQuizPergunta(modulo);
        }
    }
};

function mostrarQuizPergunta(modulo) {
    const quiz = quizzes[modulo];
    const idx = quizIndex[modulo];
    const p = quiz[idx];
    const perguntaEl = document.getElementById(`quiz-m${modulo}-pergunta`);
    const opcoesEl = document.getElementById(`quiz-m${modulo}-opcoes`);
    const feedbackEl = document.getElementById(`quiz-m${modulo}-feedback`);
    const btnProxima = document.getElementById(`quiz-m${modulo}-proxima`);
    perguntaEl.textContent = `Pergunta ${idx + 1} de ${quiz.length}: ${p.pergunta}`;
    opcoesEl.innerHTML = '';
    feedbackEl.textContent = '';
    btnProxima.style.display = 'none';
    p.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.textContent = opcao;
        btn.onclick = () => quizResponder(modulo, btn, opcao, p.resposta);
        opcoesEl.appendChild(btn);
    });
}

function quizResponder(modulo, btn, selecionada, correta) {
    const opcoesEl = document.getElementById(`quiz-m${modulo}-opcoes`);
    const botoes = opcoesEl.querySelectorAll('button');
    const feedbackEl = document.getElementById(`quiz-m${modulo}-feedback`);
    const btnProxima = document.getElementById(`quiz-m${modulo}-proxima`);
    let acertou = (selecionada === correta);
    if (acertou) quizAcertos[modulo]++;
    botoes.forEach(b => {
        b.disabled = true;
        if (b.textContent === correta) b.classList.add('correta');
        else if (b.textContent === selecionada) b.classList.add('incorreta');
    });
    feedbackEl.textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
    btnProxima.style.display = 'inline-block';
    btnProxima.onclick = () => quizProximaPergunta(modulo);
}

function quizProximaPergunta(modulo) {
    quizIndex[modulo]++;
    if (quizIndex[modulo] < quizzes[modulo].length) {
        mostrarQuizPergunta(modulo);
    } else {
        mostrarQuizResultado(modulo);
    }
}

function mostrarQuizResultado(modulo) {
    const perguntaEl = document.getElementById(`quiz-m${modulo}-pergunta`);
    const opcoesEl = document.getElementById(`quiz-m${modulo}-opcoes`);
    const feedbackEl = document.getElementById(`quiz-m${modulo}-feedback`);
    const btnProxima = document.getElementById(`quiz-m${modulo}-proxima`);
    perguntaEl.textContent = 'Quiz finalizado!';
    opcoesEl.innerHTML = '';
    feedbackEl.textContent = quizAcertos[modulo] === quizzes[modulo].length ? 'Parabéns! Você acertou tudo!' : `Você acertou ${quizAcertos[modulo]} de ${quizzes[modulo].length}. Tente novamente para gabaritar!`;
    btnProxima.style.display = 'none';
}

    function mostrarQuizM3Pergunta() {
        const p = quizM3[quizM3Index];
        const perguntaEl = document.getElementById('quiz-m3-pergunta');
        const opcoesEl = document.getElementById('quiz-m3-opcoes');
        const feedbackEl = document.getElementById('quiz-m3-feedback');
        const btnProxima = document.getElementById('quiz-m3-proxima');
        perguntaEl.textContent = `Pergunta ${quizM3Index + 1} de ${quizM3.length}: ${p.pergunta}`;
        opcoesEl.innerHTML = '';
        feedbackEl.textContent = '';
        btnProxima.style.display = 'none';
        p.opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.textContent = opcao;
            btn.onclick = () => quizM3Responder(btn, opcao, p.resposta);
            opcoesEl.appendChild(btn);
        });
    }

    function quizM3Responder(btn, selecionada, correta) {
        const opcoesEl = document.getElementById('quiz-m3-opcoes');
        const botoes = opcoesEl.querySelectorAll('button');
        const feedbackEl = document.getElementById('quiz-m3-feedback');
        const btnProxima = document.getElementById('quiz-m3-proxima');
        let acertou = (selecionada === correta);
        if (acertou) quizM3Acertos++;
        botoes.forEach(b => {
            b.disabled = true;
            if (b.textContent === correta) b.classList.add('correta');
            else if (b.textContent === selecionada) b.classList.add('incorreta');
        });
        feedbackEl.textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
        btnProxima.style.display = 'inline-block';
        btnProxima.onclick = quizM3ProximaPergunta;
    }

    function quizM3ProximaPergunta() {
        quizM3Index++;
        if (quizM3Index < quizM3.length) {
            mostrarQuizM3Pergunta();
        } else {
            mostrarQuizM3Resultado();
        }
    }

    function mostrarQuizM3Resultado() {
        const perguntaEl = document.getElementById('quiz-m3-pergunta');
        const opcoesEl = document.getElementById('quiz-m3-opcoes');
        const feedbackEl = document.getElementById('quiz-m3-feedback');
        const btnProxima = document.getElementById('quiz-m3-proxima');
        perguntaEl.textContent = 'Quiz finalizado!';
        opcoesEl.innerHTML = '';
        feedbackEl.textContent = quizM3Acertos === quizM3.length ? 'Parabéns! Você acertou tudo!' : `Você acertou ${quizM3Acertos} de ${quizM3.length}. Tente novamente para gabaritar!`;
        btnProxima.style.display = 'none';
    }
    // Funções de interação para botões do módulo 2
    window.mostrarExemplo = function(id) {
        if (id === 'exemplo1' || id === 'exemplo2') {
            document.getElementById('exemplo1') && (document.getElementById('exemplo1').style.display = (id === 'exemplo1' ? 'block' : 'none'));
            document.getElementById('exemplo2') && (document.getElementById('exemplo2').style.display = (id === 'exemplo2' ? 'block' : 'none'));
            document.getElementById('dica1') && (document.getElementById('dica1').style.display = 'none');
            document.getElementById('dica2') && (document.getElementById('dica2').style.display = 'none');
            document.getElementById('resumo1') && (document.getElementById('resumo1').style.display = 'none');
            document.getElementById('resumo2') && (document.getElementById('resumo2').style.display = 'none');
        }
    };
    window.mostrarDica = function(id) {
        if (id === 'dica1' || id === 'dica2') {
            document.getElementById('exemplo1') && (document.getElementById('exemplo1').style.display = 'none');
            document.getElementById('exemplo2') && (document.getElementById('exemplo2').style.display = 'none');
            document.getElementById('dica1') && (document.getElementById('dica1').style.display = (id === 'dica1' ? 'block' : 'none'));
            document.getElementById('dica2') && (document.getElementById('dica2').style.display = (id === 'dica2' ? 'block' : 'none'));
            document.getElementById('resumo1') && (document.getElementById('resumo1').style.display = 'none');
            document.getElementById('resumo2') && (document.getElementById('resumo2').style.display = 'none');
        }
    };
    window.mostrarResumo = function(id) {
        if (id === 'resumo1' || id === 'resumo2') {
            document.getElementById('exemplo1') && (document.getElementById('exemplo1').style.display = 'none');
            document.getElementById('exemplo2') && (document.getElementById('exemplo2').style.display = 'none');
            document.getElementById('dica1') && (document.getElementById('dica1').style.display = 'none');
            document.getElementById('dica2') && (document.getElementById('dica2').style.display = 'none');
            document.getElementById('resumo1') && (document.getElementById('resumo1').style.display = (id === 'resumo1' ? 'block' : 'none'));
            document.getElementById('resumo2') && (document.getElementById('resumo2').style.display = (id === 'resumo2' ? 'block' : 'none'));
        }
    };

    // Quiz do Módulo 2
    const quizM2 = [
        {
            pergunta: "Qual sentido é mais utilizado na inspeção sensitiva?",
            opcoes: ["Olfato", "Tato", "Visão", "Paladar"],
            resposta: "Visão"
        },
        {
            pergunta: "O que o ultrassom industrial permite identificar?",
            opcoes: ["Apenas temperatura", "Vazamentos e trincas internas", "Cor do óleo", "Ruídos audíveis"],
            resposta: "Vazamentos e trincas internas"
        },
        {
            pergunta: "Por que é importante registrar pequenos sinais, como cheiro de queimado?",
            opcoes: ["Porque não tem importância", "Para evitar falhas maiores", "Para aumentar o tempo de inspeção", "Para dificultar o trabalho"],
            resposta: "Para evitar falhas maiores"
        }
    ];
    let quizM2Index = 0;
    let quizM2Acertos = 0;

    window.abrirQuizModulo = function(modulo) {
        if (modulo === 1) {
            document.getElementById('quiz-modulo-1').style.display = 'block';
            quizM1Index = 0;
            quizM1Acertos = 0;
            mostrarQuizM1Pergunta();
        } else if (modulo === 2) {
            document.getElementById('quiz-modulo-2').style.display = 'block';
            quizM2Index = 0;
            quizM2Acertos = 0;
            mostrarQuizM2Pergunta();
        }
    };

    function mostrarQuizM2Pergunta() {
        const p = quizM2[quizM2Index];
        const perguntaEl = document.getElementById('quiz-m2-pergunta');
        const opcoesEl = document.getElementById('quiz-m2-opcoes');
        const feedbackEl = document.getElementById('quiz-m2-feedback');
        const btnProxima = document.getElementById('quiz-m2-proxima');
        perguntaEl.textContent = `Pergunta ${quizM2Index + 1} de ${quizM2.length}: ${p.pergunta}`;
        opcoesEl.innerHTML = '';
        feedbackEl.textContent = '';
        btnProxima.style.display = 'none';
        p.opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.textContent = opcao;
            btn.onclick = () => quizM2Responder(btn, opcao, p.resposta);
            opcoesEl.appendChild(btn);
        });
    }

    function quizM2Responder(btn, selecionada, correta) {
        const opcoesEl = document.getElementById('quiz-m2-opcoes');
        const botoes = opcoesEl.querySelectorAll('button');
        const feedbackEl = document.getElementById('quiz-m2-feedback');
        const btnProxima = document.getElementById('quiz-m2-proxima');
        let acertou = (selecionada === correta);
        if (acertou) quizM2Acertos++;
        botoes.forEach(b => {
            b.disabled = true;
            if (b.textContent === correta) b.classList.add('correta');
            else if (b.textContent === selecionada) b.classList.add('incorreta');
        });
        feedbackEl.textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
        btnProxima.style.display = 'inline-block';
        btnProxima.onclick = quizM2ProximaPergunta;
    }

    function quizM2ProximaPergunta() {
        quizM2Index++;
        if (quizM2Index < quizM2.length) {
            mostrarQuizM2Pergunta();
        } else {
            mostrarQuizM2Resultado();
        }
    }

    function mostrarQuizM2Resultado() {
        const perguntaEl = document.getElementById('quiz-m2-pergunta');
        const opcoesEl = document.getElementById('quiz-m2-opcoes');
        const feedbackEl = document.getElementById('quiz-m2-feedback');
        const btnProxima = document.getElementById('quiz-m2-proxima');
        perguntaEl.textContent = 'Quiz finalizado!';
        opcoesEl.innerHTML = '';
        feedbackEl.textContent = quizM2Acertos === quizM2.length ? 'Parabéns! Você acertou tudo!' : `Você acertou ${quizM2Acertos} de ${quizM2.length}. Tente novamente para gabaritar!`;
        btnProxima.style.display = 'none';
    }
document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const modules = document.querySelectorAll('.module');
    let currentModuleIndex = 0;

    // Exibe o primeiro módulo ao carregar
    modules.forEach((m, i) => m.classList.toggle('active', i === 0));

    const prevModuleBtn = document.getElementById('prev-module-btn');
    const nextModuleBtn = document.getElementById('next-module-btn');
    const moduleIndicator = document.getElementById('module-indicator');
    const floatingNav = document.querySelector('.floating-nav');

    function showModule(index) {
        if (index < 0 || index >= modules.length) return;
        currentModuleIndex = index;
        modules.forEach((m, i) => m.classList.toggle('active', i === currentModuleIndex));
        moduleIndicator.textContent = `${currentModuleIndex + 1} / ${modules.length}`;
        prevModuleBtn.disabled = (currentModuleIndex === 0);
        nextModuleBtn.disabled = (currentModuleIndex === modules.length - 1);
        floatingNav.classList.toggle('hidden', currentModuleIndex === modules.length - 1);
        window.scrollTo(0, 0);
    }
    prevModuleBtn.addEventListener('click', () => showModule(currentModuleIndex - 1));
    nextModuleBtn.addEventListener('click', () => showModule(currentModuleIndex + 1));
    showModule(0);

    // --- Funções de interação para botões interativos ---
    window.mostrarExemplo = function(id) {
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`exemplo${i}`);
            if (el) el.style.display = (id === `exemplo${i}` ? 'block' : 'none');
        }
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`dica${i}`);
            if (el) el.style.display = 'none';
        }
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`resumo${i}`);
            if (el) el.style.display = 'none';
        }
    };
    window.mostrarDica = function(id) {
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`exemplo${i}`);
            if (el) el.style.display = 'none';
        }
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`dica${i}`);
            if (el) el.style.display = (id === `dica${i}` ? 'block' : 'none');
        }
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`resumo${i}`);
            if (el) el.style.display = 'none';
        }
    };
    window.mostrarResumo = function(id) {
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`exemplo${i}`);
            if (el) el.style.display = 'none';
        }
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`dica${i}`);
            if (el) el.style.display = 'none';
        }
        for (let i = 1; i <= 12; i++) {
            const el = document.getElementById(`resumo${i}`);
            if (el) el.style.display = (id === `resumo${i}` ? 'block' : 'none');
        }
    };

    // --- Função global para abrir quiz de qualquer módulo ---
    window.abrirQuizModulo = function(modulo) {
        for (let i = 1; i <= 13; i++) {
            const quizDiv = document.getElementById(`quiz-modulo-${i}`);
            if (quizDiv) quizDiv.style.display = 'none';
        }
        const quizAtual = document.getElementById(`quiz-modulo-${modulo}`);
        if (quizAtual) {
            quizAtual.style.display = 'block';
            // Cria elementos de quiz se não existirem
            if (!document.getElementById(`quiz-m${modulo}-pergunta`)) {
                const pergunta = document.createElement('div');
                pergunta.id = `quiz-m${modulo}-pergunta`;
                quizAtual.appendChild(pergunta);
                const opcoes = document.createElement('div');
                opcoes.id = `quiz-m${modulo}-opcoes`;
                quizAtual.appendChild(opcoes);
                const feedback = document.createElement('div');
                feedback.id = `quiz-m${modulo}-feedback`;
                quizAtual.appendChild(feedback);
                const btnProxima = document.createElement('button');
                btnProxima.id = `quiz-m${modulo}-proxima`;
                btnProxima.textContent = 'Próxima';
                btnProxima.style.display = 'none';
                quizAtual.appendChild(btnProxima);
            }
            // Inicia quiz do módulo
            if (typeof mostrarQuizPergunta === 'function' && quizzes && quizzes[modulo]) {
                quizIndex[modulo] = 0;
                quizAcertos[modulo] = 0;
                mostrarQuizPergunta(modulo);
            }
        }
    };

    // --- Lógica para o campo de documento (BI/CPF) ---
    const paisSelect = document.getElementById('pais-aluno');
    const documentoLabel = document.getElementById('documento-label');
    const documentoInput = document.getElementById('documento-aluno');

    if (paisSelect && documentoLabel && documentoInput) {
        paisSelect.addEventListener('change', function() {
            const paisSelecionado = paisSelect.value;

            if (paisSelecionado === 'angola') {
                documentoLabel.textContent = 'Seu BI:';
                documentoInput.placeholder = 'Digite seu BI (Bilhete de Identidade)';
                documentoInput.maxLength = 14; // Definindo o comprimento máximo para o BI
                documentoInput.setAttribute('pattern', '[A-Za-z0-9]+'); // Permite letras e números
            } else {
                documentoLabel.textContent = 'Seu CPF:';
                documentoInput.placeholder = 'Digite seu CPF (apenas números)';
                documentoInput.maxLength = 14; // CPF formatado pode ter 14 caracteres (incluindo . e -)
                documentoInput.setAttribute('pattern', '[0-9]{3}\\.?[0-9]{3}\\.?[0-9]{3}\\-?[0-9]{2}'); // Padrão para CPF
            }

            documentoInput.value = ''; // Limpa o campo ao mudar o tipo de documento
            // Dispara o evento 'input' para aplicar formatação inicial se houver algum valor padrão
            documentoInput.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Adiciona um evento para formatar o CPF/BI enquanto o usuário digita
        documentoInput.addEventListener('input', function() {
            const paisSelecionado = paisSelect.value;
            let valor = this.value;

            if (paisSelecionado !== 'angola') { // Se for CPF, aplica formatação e limpa não-dígitos
                valor = valor.replace(/\D/g, ''); // Remove tudo que não é dígito APENAS para CPF
                if (valor.length > 3 && valor.length <= 6) {
                    valor = `${valor.slice(0, 3)}.${valor.slice(3)}`;
                } else if (valor.length > 6 && valor.length <= 9) {
                    valor = `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6)}`;
                } else if (valor.length > 9) {
                    valor = `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6, 9)}-${valor.slice(9, 11)}`;
                }
            } else { // Se for BI, garante que não há caracteres inválidos (opcional, pode ser relaxado)
                // Você pode adicionar uma validação mais específica para BI aqui se necessário,
                // mas por enquanto, apenas permite qualquer caractere que não seja proibido pelo HTML5 input type="text"
                // ou simplesmente deixa o valor como está, já que o maxLength lida com o tamanho.
            }
            this.value = valor;
        });

        // Garante que o estado inicial do campo de documento esteja correto
        paisSelect.dispatchEvent(new Event('change'));

    } else {
        console.error('Algum elemento do formulário de documento (país, label ou input) não foi encontrado.');
    }


    // Funções de interação para botões do módulo 1
    window.mostrarExemplo = function(id) {
        document.getElementById('exemplo1').style.display = 'block';
        document.getElementById('dica1').style.display = 'none';
        document.getElementById('resumo1').style.display = 'none';
    };
    window.mostrarDica = function(id) {
        document.getElementById('exemplo1').style.display = 'none';
        document.getElementById('dica1').style.display = 'block';
        document.getElementById('resumo1').style.display = 'none';
    };
    window.mostrarResumo = function(id) {
        document.getElementById('exemplo1').style.display = 'none';
        document.getElementById('dica1').style.display = 'none';
        document.getElementById('resumo1').style.display = 'block';
    };

    // Quiz do Módulo 1
    const quizM1 = [
        {
            pergunta: "Qual o principal objetivo da inspeção preventiva?",
            opcoes: ["Corrigir falhas já existentes.", "Prever falhas usando sensores.", "Realizar verificações programadas para evitar falhas.", "Aumentar o custo da manutenção."],
            resposta: "Realizar verificações programadas para evitar falhas."
        },
        {
            pergunta: "O que caracteriza a inspeção corretiva?",
            opcoes: ["É feita antes de qualquer falha.", "É realizada após o surgimento de um problema.", "Usa apenas instrumentos digitais.", "É sempre a mais barata."],
            resposta: "É realizada após o surgimento de um problema."
        },
        {
            pergunta: "Por que registrar pequenas anomalias?",
            opcoes: ["Porque não faz diferença.", "Para evitar que pequenos problemas virem grandes falhas.", "Para aumentar o trabalho do inspetor.", "Para reduzir o tempo de inspeção."],
            resposta: "Para evitar que pequenos problemas virem grandes falhas."
        }
    ];
    let quizM1Index = 0;
    let quizM1Acertos = 0;

    window.abrirQuizModulo = function(modulo) {
        if (modulo === 1) {
            document.getElementById('quiz-modulo-1').style.display = 'block';
            quizM1Index = 0;
            quizM1Acertos = 0;
            mostrarQuizM1Pergunta();
        }
    };

    function mostrarQuizM1Pergunta() {
        const p = quizM1[quizM1Index];
        const perguntaEl = document.getElementById('quiz-m1-pergunta');
        const opcoesEl = document.getElementById('quiz-m1-opcoes');
        const feedbackEl = document.getElementById('quiz-m1-feedback');
        const btnProxima = document.getElementById('quiz-m1-proxima');
        perguntaEl.textContent = `Pergunta ${quizM1Index + 1} de ${quizM1.length}: ${p.pergunta}`;
        opcoesEl.innerHTML = '';
        feedbackEl.textContent = '';
        btnProxima.style.display = 'none';
        p.opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.textContent = opcao;
            btn.onclick = () => quizM1Responder(btn, opcao, p.resposta);
            opcoesEl.appendChild(btn);
        });
    }

    function quizM1Responder(btn, selecionada, correta) {
        const opcoesEl = document.getElementById('quiz-m1-opcoes');
        const botoes = opcoesEl.querySelectorAll('button');
        const feedbackEl = document.getElementById('quiz-m1-feedback');
        const btnProxima = document.getElementById('quiz-m1-proxima');
        let acertou = (selecionada === correta);
        if (acertou) quizM1Acertos++;
        botoes.forEach(b => {
            b.disabled = true;
            if (b.textContent === correta) b.classList.add('correta');
            else if (b.textContent === selecionada) b.classList.add('incorreta');
        });
        feedbackEl.textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
        btnProxima.style.display = 'inline-block';
        btnProxima.onclick = quizM1ProximaPergunta;
    }

    function quizM1ProximaPergunta() {
        quizM1Index++;
        if (quizM1Index < quizM1.length) {
            mostrarQuizM1Pergunta();
        } else {
            mostrarQuizM1Resultado();
        }
    }

    function mostrarQuizM1Resultado() {
        const perguntaEl = document.getElementById('quiz-m1-pergunta');
        const opcoesEl = document.getElementById('quiz-m1-opcoes');
        const feedbackEl = document.getElementById('quiz-m1-feedback');
        const btnProxima = document.getElementById('quiz-m1-proxima');
        perguntaEl.textContent = 'Quiz finalizado!';
        opcoesEl.innerHTML = '';
        feedbackEl.textContent = quizM1Acertos === quizM1.length ? 'Parabéns! Você acertou tudo!' : `Você acertou ${quizM1Acertos} de ${quizM1.length}. Tente novamente para gabaritar!`;
        btnProxima.style.display = 'none';
    }

    // --- INICIALIZAÇÃO ---
    showModule(0);
    iniciarQuiz();

});

