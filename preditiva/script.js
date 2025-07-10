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
        const ids = ['exemplo1','exemplo2','exemplo3','exemplo4','exemplo5','exemplo6','exemplo7','exemplo8','exemplo9','exemplo10','exemplo11','exemplo12'];
        ids.forEach(eid => {
            document.getElementById(eid) && (document.getElementById(eid).style.display = (eid === id ? 'block' : 'none'));
        });
        const dicas = ['dica1','dica2','dica3','dica4','dica5','dica6','dica7','dica8','dica9','dica10','dica11','dica12'];
        dicas.forEach(did => { document.getElementById(did) && (document.getElementById(did).style.display = 'none'); });
        const resumos = ['resumo1','resumo2','resumo3','resumo4','resumo5','resumo6','resumo7','resumo8','resumo9','resumo10','resumo11','resumo12'];
        resumos.forEach(rid => { document.getElementById(rid) && (document.getElementById(rid).style.display = 'none'); });
    };
    window.mostrarDica = function(id) {
        const ids = ['exemplo1','exemplo2','exemplo3','exemplo4','exemplo5','exemplo6','exemplo7','exemplo8','exemplo9','exemplo10','exemplo11','exemplo12'];
        ids.forEach(eid => { document.getElementById(eid) && (document.getElementById(eid).style.display = 'none'); });
        const dicas = ['dica1','dica2','dica3','dica4','dica5','dica6','dica7','dica8','dica9','dica10','dica11','dica12'];
        dicas.forEach(did => { document.getElementById(did) && (document.getElementById(did).style.display = (did === id ? 'block' : 'none')); });
        const resumos = ['resumo1','resumo2','resumo3','resumo4','resumo5','resumo6','resumo7','resumo8','resumo9','resumo10','resumo11','resumo12'];
        resumos.forEach(rid => { document.getElementById(rid) && (document.getElementById(rid).style.display = 'none'); });
    };
    window.mostrarResumo = function(id) {
        const ids = ['exemplo1','exemplo2','exemplo3','exemplo4','exemplo5','exemplo6','exemplo7','exemplo8','exemplo9','exemplo10','exemplo11','exemplo12'];
        ids.forEach(eid => { document.getElementById(eid) && (document.getElementById(eid).style.display = 'none'); });
        const dicas = ['dica1','dica2','dica3','dica4','dica5','dica6','dica7','dica8','dica9','dica10','dica11','dica12'];
        dicas.forEach(did => { document.getElementById(did) && (document.getElementById(did).style.display = 'none'); });
        const resumos = ['resumo1','resumo2','resumo3','resumo4','resumo5','resumo6','resumo7','resumo8','resumo9','resumo10','resumo11','resumo12'];
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

window.abrirQuizModulo = function(modulo) {
    // Esconde todos os quizzes
    for (let i = 1; i <= 12; i++) {
        const quizDiv = document.getElementById(`quiz-modulo-${i}`);
        if (quizDiv) quizDiv.style.display = 'none';
    }
    // Mostra o quiz do módulo selecionado
    const quizAtual = document.getElementById(`quiz-modulo-${modulo}`);
    if (quizAtual) quizAtual.style.display = 'block';
    // Inicia o quiz do módulo
    switch (modulo) {
        case 1:
            quizM1Index = 0; quizM1Acertos = 0; mostrarQuizM1Pergunta(); break;
        case 2:
            quizM2Index = 0; quizM2Acertos = 0; mostrarQuizM2Pergunta(); break;
        case 3:
            quizM3Index = 0; quizM3Acertos = 0; mostrarQuizM3Pergunta(); break;
        case 4:
            quizM4Index = 0; quizM4Acertos = 0; mostrarQuizM4Pergunta(); break;
        case 5:
            quizM5Index = 0; quizM5Acertos = 0; mostrarQuizM5Pergunta(); break;
        case 6:
            quizM6Index = 0; quizM6Acertos = 0; mostrarQuizM6Pergunta(); break;
        case 7:
            quizM7Index = 0; quizM7Acertos = 0; mostrarQuizM7Pergunta(); break;
        case 8:
            quizM8Index = 0; quizM8Acertos = 0; mostrarQuizM8Pergunta(); break;
        case 9:
            quizM9Index = 0; quizM9Acertos = 0; mostrarQuizM9Pergunta(); break;
        case 10:
            quizM10Index = 0; quizM10Acertos = 0; mostrarQuizM10Pergunta(); break;
        case 11:
            quizM11Index = 0; quizM11Acertos = 0; mostrarQuizM11Pergunta(); break;
        case 12:
            quizM12Index = 0; quizM12Acertos = 0; mostrarQuizM12Pergunta(); break;
    }
};

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

    const prevModuleBtn = document.getElementById('prev-module-btn');
    const nextModuleBtn = document.getElementById('next-module-btn');
    const moduleIndicator = document.getElementById('module-indicator');
    const floatingNav = document.querySelector('.floating-nav');

    function showModule(index) {
        if (index < 0 || index >= modules.length) {
            return;
        }
        currentModuleIndex = index;

        modules.forEach(m => {
            m.classList.remove('active');
        });

        modules[currentModuleIndex].classList.add('active');

        moduleIndicator.textContent = `${currentModuleIndex + 1} / ${modules.length}`;
        prevModuleBtn.disabled = (currentModuleIndex === 0);
        nextModuleBtn.disabled = (currentModuleIndex === modules.length - 1);
        
        if (currentModuleIndex === modules.length - 1) {
            floatingNav.classList.add('hidden');
        } else {
            floatingNav.classList.remove('hidden');
        }

        window.scrollTo(0, 0);
    }

    prevModuleBtn.addEventListener('click', () => showModule(currentModuleIndex - 1));
    nextModuleBtn.addEventListener('click', () => showModule(currentModuleIndex + 1));

    const perguntas = [
        {
            pergunta: "Para que serve a inspeção em ambientes industriais, mesmo quando os equipamentos aparentam estar funcionando normalmente?",
            opcoes: ["Para garantir que a máquina fique desligada por mais tempo.", "Para acelerar o processo de produção.", "Para aumentar o custo da manutenção corretiva.", "Para detectar sinais de falhas antes que causem paradas inesperadas."],
            resposta: "Para detectar sinais de falhas antes que causem paradas inesperadas."
        },
        {
            pergunta: "Qual o objetivo da inspeção preditiva?",
            opcoes: ["Realizar visitas aleatórias dos técnicos.", "Apenas observar se a máquina está fazendo barulho.", "Analisar dados reais, como vibração e temperatura, para prever falhas futuras.", "Agir somente quando a máquina já apresentou uma falha grave."],
            resposta: "Analisar dados reais, como vibração e temperatura, para prever falhas futuras."
        },
        {
            pergunta: "Qual ferramenta avançada é usada para detectar trincas internas e vazamentos que o ouvido humano não capta?",
            opcoes: ["Analisador de Vibração", "Termografia", "Análise de óleo", "Inspeção por Ultrassom"],
            resposta: "Inspeção por Ultrassom"
        },
        {
            pergunta: "Qual é a principal defesa contra o desgaste de componentes mecânicos?",
            opcoes: ["Aumento da velocidade de operação.", "Lubrificação correta.", "Uso de materiais mais leves.", "Diminuição da frequência de inspeção."],
            resposta: "Lubrificação correta."
        },
        {
            pergunta: "No estudo de caso sobre o motor com vibração anormal, qual é a ação recomendada?",
            opcoes: ["Ignorar, já que o motor está funcionando.", "Registrar como observação para as próximas inspeções.", "Acionar análise de vibração com equipamento portátil no mesmo dia.", "Aguardar até que a vibração seja perceptível ao tato."],
            resposta: "Acionar análise de vibração com equipamento portátil no mesmo dia."
        },
        {
            pergunta: "Qual ferramenta avançada permite visualizar o interior de máquinas e tubulações sem necessidade de desmontagem?",
            opcoes: ["Analisador de Vibração", "Ultrassom Industrial", "Medidor de Espessura Ultrassônico", "Boroscópio (Câmera de Inspeção)"],
            resposta: "Boroscópio (Câmera de Inspeção)"
        },
        {
            pergunta: "Em sistemas pneumáticos, qual é um dos principais impactos de vazamentos de ar comprimido?",
            opcoes: ["Aumento da força nas aplicações.", "Redução do consumo de energia.", "Aumento do consumo de energia elétrica pelo compressor.", "Melhora na eficiência do sistema."],
            resposta: "Aumento do consumo de energia elétrica pelo compressor."
        },
        {
            pergunta: "Qual é o principal objetivo de se criar um Plano de Inspeção?",
            opcoes: ["Organizar e padronizar as inspeções, garantindo que nenhuma etapa seja esquecida.", "Aumentar o tempo de parada não programada.", "Reduzir a frequência de calibração das ferramentas.", "Realizar inspeções apenas quando a máquina já falhou."],
            resposta: "Organizar e padronizar as inspeções, garantindo que nenhuma etapa seja esquecida."
        },
    ];

    let perguntaAtual = 0;
    let pontuacao = 0;
    
    const perguntaTituloEl = document.getElementById('pergunta-titulo');
    const opcoesQuizEl = document.getElementById('opcoes-quiz');
    const feedbackEl = document.getElementById('feedback');
    const quizContainerEl = document.getElementById('quiz-container');
    const certificadoFormEl = document.getElementById('certificado-form-container');
    const reprovadoEl = document.getElementById('reprovado-container');
    
    function iniciarQuiz() {
        perguntaAtual = 0;
        pontuacao = 0;
        feedbackEl.textContent = '';
        certificadoFormEl.style.display = 'none';
        reprovadoEl.style.display = 'none';
        quizContainerEl.style.display = 'block';
        mostrarPergunta();
    }

    function mostrarPergunta() {
        if (perguntaAtual === 0) {
            perguntas.sort(() => Math.random() - 0.5);
        }
        const p = perguntas[perguntaAtual];
        perguntaTituloEl.textContent = `Pergunta ${perguntaAtual + 1} de ${perguntas.length}: ${p.pergunta}`;
        opcoesQuizEl.innerHTML = '';
        p.opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.textContent = opcao;
            btn.onclick = () => verificarResposta(opcao, p.resposta);
            opcoesQuizEl.appendChild(btn);
        });
    }

    function verificarResposta(opcaoSelecionada, respostaCorreta) {
        const botoes = opcoesQuizEl.querySelectorAll('button');
        let acertou = (opcaoSelecionada === respostaCorreta);

        if (acertou) pontuacao++;
        feedbackEl.textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
        
        botoes.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === respostaCorreta) btn.classList.add('correta');
            else if (btn.textContent === opcaoSelecionada) btn.classList.add('incorreta');
        });
        
        setTimeout(() => {
            perguntaAtual++;
            if (perguntaAtual < perguntas.length) {
                feedbackEl.textContent = '';
                mostrarPergunta();
            } else {
                finalizarQuiz();
            }
        }, 1500);
    }

    function finalizarQuiz() {
        quizContainerEl.style.display = 'none';
        if (pontuacao === perguntas.length) {
            certificadoFormEl.style.display = 'block';
        } else {
            reprovadoEl.style.display = 'block';
        }
    }

    document.getElementById('tentar-novamente-btn').addEventListener('click', iniciarQuiz);
    document.getElementById('gerar-certificado-btn').addEventListener('click', gerarCertificadoPDF);

    // Função para formatar CPF (mantida apenas para CPF)
    function formatarCPF(cpf) {
        cpf = cpf.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (cpf.length !== 11) return cpf;
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function gerarCertificadoPDF() {
        const nome = document.getElementById('nome-aluno').value.trim();
        const documento = document.getElementById('documento-aluno').value.trim(); // Renomeado de 'cpf' para 'documento'
        const paisSelecionado = document.getElementById('pais-aluno').value;

        if (nome === "" || documento === "") {
            alert("Por favor, preencha seu nome completo e documento.");
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const LOGO_BASE64 = ''; // Cole sua logo Base64 aqui

        // Design do certificado
        doc.setFillColor(230, 240, 255);
        doc.rect(0, 0, 297, 210, 'F');
        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(2);
        doc.rect(5, 5, 287, 200);
        
        if (LOGO_BASE64) {
            const imgProps = doc.getImageProperties(LOGO_BASE64);
            const imgWidth = 50;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            doc.addImage(LOGO_BASE64, 'PNG', 20, 15, imgWidth, imgHeight);
        }

        // --- NOME DA ESCOLA ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 51, 102);
        doc.text("Manutenção Industrial ARQUIVOS", 148.5, 25, { align: "center" });

        // --- TÍTULO PRINCIPAL ---
        doc.setFontSize(30);
        doc.text("CERTIFICADO DE CONCLUSÃO", 148.5, 45, { align: "center" });

        // --- TEXTO DO CERTIFICADO ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor(50, 50, 50);
        doc.text(`Certificamos que`, 148.5, 65, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(0, 102, 204);
        doc.text(nome.toUpperCase(), 148.5, 77, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        
        let documentoTextoParaCertificado = '';
        if (paisSelecionado === 'angola') {
            documentoTextoParaCertificado = `portador(a) do BI nº ${documento},`; // Usa o documento como está (alfanumérico)
        } else {
            documentoTextoParaCertificado = `portador(a) do CPF nº ${formatarCPF(documento)},`; // Formata CPF
        }
        
        doc.text(`${documentoTextoParaCertificado} concluiu com aproveitamento o curso de`, 148.5, 87, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 51, 102);
        doc.text("INSPEÇÃO DE MÁQUINAS INDUSTRIAIS", 148.5, 99, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text("Carga Horária: 2 horas", 148.5, 109, { align: "center" });

        // --- CONTEÚDOS ESTUDADOS ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Conteúdos Estudados:", 20, 125);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9); 
        const conteudos = [
            "Introdução e Tipos de Inspeção (Preventiva, Preditiva)", "Inspeção Sensitiva e Instrumentada (Termografia, Vibração)",
            "Procedimentos Padrão e Checklists", "Registro e Análise de Dados de Inspeção",
            "Análise de Falhas Mecânicas (Rolamentos, Acoplamentos)", "Análise de Falhas Elétricas (Motores, Painéis)",
            "Ferramentas Avançadas (Ultrassom, Boroscópio)", "Desgaste, Lubrificação e Vida Útil de Componentes",
            "Inspeção de Sistemas Pneumáticos e Hidráulicos", "Inspeção Estrutural e de Segurança", "Criação de Planos de Inspeção e Melhoria Contínua"
        ];
        
        const col1 = conteudos.slice(0, 6);
        const col2 = conteudos.slice(6);
        let yPos = 132;
        col1.forEach(item => { doc.text(`• ${item}`, 20, yPos); yPos += 6; });
        yPos = 132;
        col2.forEach(item => { doc.text(`• ${item}`, 155, yPos); yPos += 6; });

        // --- DATA, HORA E ASSINATURA ---
        const agora = new Date();
        const dataHoraFormatada = agora.toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        doc.setFontSize(12);
        doc.line(90, 185, 205, 185); // Linha da assinatura
        doc.setFont("helvetica", "bold");
        doc.text("Jonathan da Silva Oliveira - Instrutor", 147.5, 190, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.text(`Emitido em: ${dataHoraFormatada}`, 147.5, 197, { align: "center" });
        
        doc.save(`Certificado - Inspeção Industrial - ${nome}.pdf`);
    }

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
                          
