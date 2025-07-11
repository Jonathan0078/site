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

    // --- INICIALIZAÇÃO ---
    showModule(0);
    iniciarQuiz();

});
                          
