document.addEventListener('DOMContentLoaded', () => {
    // Permitir digitação manual em todos os inputs de number/text
    document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.removeAttribute('readonly');
            e.target.removeAttribute('disabled');
        });
        input.addEventListener('input', (e) => {
            e.target.removeAttribute('readonly');
            e.target.removeAttribute('disabled');
        });
    });

    const { jsPDF } = window.jspdf;

    // =================================================================================
    // NAVEGAÇÃO ENTRE MÓDULOS
    // =================================================================================
    const modules = document.querySelectorAll('.module');
    const prevBtn = document.getElementById('prev-module-btn');
    const nextBtn = document.getElementById('next-module-btn');
    const moduleIndicator = document.getElementById('module-indicator');
    const floatingNav = document.querySelector('.floating-nav');

    let currentModuleIndex = 0;
    const totalModules = modules.length;

    function showModule(index) {
        if (index < 0 || index >= totalModules) return;

        currentModuleIndex = index;
        modules.forEach(m => m.classList.remove('active'));
        if (modules[currentModuleIndex]) {
            modules[currentModuleIndex].classList.add('active');
        }

        updateNavigationUI();
        window.scrollTo(0, 0);
        checkAndInitQuiz(); // Verifica se é hora de iniciar o quiz
    }

    function updateNavigationUI() {
        if (moduleIndicator) {
            moduleIndicator.textContent = `${currentModuleIndex + 1} / ${totalModules}`;
        }
        if (prevBtn) {
            prevBtn.disabled = (currentModuleIndex === 0);
        }
        if (nextBtn) {
            nextBtn.disabled = (currentModuleIndex === totalModules - 1);
        }
        if (floatingNav) {
            floatingNav.style.display = (currentModuleIndex === totalModules - 1) ? 'none' : 'flex';
        }
    }
    
    if (prevBtn) prevBtn.addEventListener('click', () => showModule(currentModuleIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showModule(currentModuleIndex + 1));


    // =================================================================================
    // FUNÇÕES GLOBAIS (Expostas para o HTML)
    // =================================================================================

    // MÓDULO 1
    window.calcularEconomia = function() {
        const custoParada = parseFloat(document.getElementById('custo-parada').value) || 0;
        const paradasAno = parseFloat(document.getElementById('paradas-ano').value) || 0;
        const reducaoPercent = parseFloat(document.getElementById('reducao-percent').value) || 0;
        const valorReducaoEl = document.getElementById('valor-reducao');
        if(valorReducaoEl) valorReducaoEl.textContent = reducaoPercent + '%';

        const custoAtual = custoParada * paradasAno;
        const paradasReduzidas = paradasAno * (reducaoPercent / 100);
        const economiaAnual = paradasReduzidas * custoParada;

        const resultado = document.getElementById('resultado-economia');
        if(resultado) {
            resultado.style.display = 'block';
            resultado.classList.add('mostrar');
            resultado.innerHTML = `
                <h5>💰 Resultado da Análise</h5>
                <div class="resultado-item">Custo atual: R$ ${custoAtual.toLocaleString('pt-BR')}</div>
                <div class="resultado-item">Paradas evitadas: ${paradasReduzidas.toFixed(1)} por ano</div>
                <div class="resultado-item destaque">Economia anual: R$ ${economiaAnual.toLocaleString('pt-BR')}</div>
                <div class="resultado-item">ROI potencial: ${((economiaAnual / 50000) * 100).toFixed(0)}% (invest. R$ 50.000)</div>
            `;
        }
    };

    window.salvarReflexao = function(id) {
        const textarea = document.getElementById(id);
        if (!textarea) {
            alert('⚠️ Elemento não encontrado.');
            return;
        }
        const texto = textarea.value;
        if (texto.trim()) {
            alert('💾 Reflexão salva com sucesso!');
            localStorage.setItem(id, texto);
        } else {
            alert('⚠️ Por favor, escreva sua reflexão antes de salvar.');
        }
    };

    // MÓDULO 3
    window.verificarChecklist = function() {
        const checkboxes = document.querySelectorAll('.checklist-items input[type="checkbox"]');
        const marcados = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const percentage = total > 0 ? (marcados / total) * 100 : 0;
        const feedback = document.getElementById('feedback-checklist');

        if (!feedback) return;

        let message = '';
        if (percentage === 100) message = '🎯 Excelente! Preparação completa.';
        else if (percentage >= 80) message = '✅ Boa preparação! Verifique os itens restantes.';
        else if (percentage >= 60) message = '⚠️ Preparação incompleta. Revise os itens não marcados.';
        else message = '🚨 Preparação inadequada! Complete todos os itens.';
        
        feedback.style.display = 'block';
        feedback.innerHTML = `<div class="resultado-preparacao"><div>Preparação: ${percentage.toFixed(0)}% (${marcados}/${total})</div><div>${message}</div></div>`;
    };

    window.avaliarProcedimento = function() {
        const freqSelecionada = document.querySelector('.opcoes-freq .opcao-freq.selected');
        const checkboxes = document.querySelectorAll('.checklist-construtor input[type="checkbox"]:checked');
        const criticos = Array.from(checkboxes).filter(cb => cb.dataset.item === 'critico').length;
        const normais = Array.from(checkboxes).filter(cb => cb.dataset.item === 'normal').length;
        const resultado = document.getElementById('resultado-procedimento');
        if (!resultado) return;

        let score = 0;
        if (criticos >= 4) score += 60; else score += criticos * 15;
        if (normais >= 2) score += 20; else score += normais * 10;
        if (freqSelecionada) score += 20;

        let feedbackTxt = '';
        if (score >= 90) feedbackTxt = '🎯 Procedimento excelente!';
        else if (score >= 70) feedbackTxt = '✅ Bom procedimento!';
        else feedbackTxt = '⚠️ Procedimento incompleto. Inclua mais pontos críticos.';
        
        resultado.style.display = 'block';
        resultado.classList.add('mostrar');
        resultado.innerHTML = `<div>Score: ${score}/100 | Itens críticos: ${criticos} | Itens normais: ${normais}</div><div>${feedbackTxt}</div>`;
    };

    window.calcularROIFerramentas = function() {
        const investimento = parseFloat(document.getElementById('investimento-tools').value) || 0;
        const falhasEvitadas = parseFloat(document.getElementById('falhas-evitadas').value) || 0;
        const custoFalha = parseFloat(document.getElementById('custo-falha').value) || 0;
        const economiaAnual = falhasEvitadas * custoFalha;
        const roi = investimento > 0 ? ((economiaAnual - investimento) / investimento) * 100 : Infinity;
        const payback = economiaAnual > 0 ? investimento / economiaAnual : Infinity;
        const resultado = document.getElementById('resultado-roi-tools');

        if(resultado){
            resultado.style.display = 'block';
            resultado.classList.add('mostrar');
            resultado.innerHTML = `
                <h5>📊 Análise de ROI</h5>
                <div class="resultado-item">Investimento: R$ ${investimento.toLocaleString('pt-BR')}</div>
                <div class="resultado-item">Economia anual: R$ ${economiaAnual.toLocaleString('pt-BR')}</div>
                <div class="resultado-item destaque">ROI: ${isFinite(roi) ? roi.toFixed(1) + '%' : 'Infinito'}</div>
                <div class="resultado-item">Payback: ${isFinite(payback) ? payback.toFixed(1) + ' anos' : 'Imediato'}</div>
            `;
        }
    };

    window.gerarChecklist = function() {
        const tipo = document.getElementById('tipo-equipamento').value;
        const criticidade = document.getElementById('criticidade-eq').value;
        const ambiente = document.getElementById('ambiente-eq').value;
        const checklists = {
            motor: { basicos: ['Vibração geral', 'Temperatura mancais', 'Ruído anormal', 'Conexões elétricas'], criticos: ['Análise de vibração', 'Termografia'], ambienteAgressivo: ['Proteção IP', 'Corrosão'] },
            bomba: { basicos: ['Vazamentos', 'Vibração', 'Temperatura', 'Pressão'], criticos: ['Cavitação', 'Selo mecânico'], ambienteAgressivo: ['Corrosão', 'Erosão'] },
            redutor: { basicos: ['Nível de óleo', 'Vazamentos', 'Temperatura', 'Ruído'], criticos: ['Análise de óleo', 'Análise de vibração'], ambienteAgressivo: ['Vedações', 'Respiros'] },
            compressor: { basicos: ['Pressão', 'Temperatura', 'Vazamentos', 'Drenos'], criticos: ['Análise de vibração', 'Análise de óleo'], ambienteAgressivo: ['Filtros de ar'] }
        };
        const checklist = checklists[tipo] || checklists.motor;
        let itens = [...checklist.basicos];
        if (criticidade === 'critica' || criticidade === 'alta') itens.push(...(checklist.criticos || []));
        if (ambiente === 'agressivo') itens.push(...(checklist.ambienteAgressivo || []));

        const resultado = document.getElementById('checklist-gerado');
        if(resultado){
            resultado.style.display = 'block';
            resultado.classList.add('mostrar');
            resultado.innerHTML = `<h5>📋 Checklist para ${tipo.replace('-', ' ')}</h5><ul>${itens.map(item => `<li>✓ ${item}</li>`).join('')}</ul>`;
        }
    };
    
    // Demais funções globais para os outros módulos...
    // (O código completo já as possui, estou omitindo por brevidade nesta explicação)
    // Ex: window.calcularKPIs = function() { ... }; etc.


    // =================================================================================
    // LISTENER DE EVENTOS GERAL PARA BOTÕES E OPÇÕES
    // =================================================================================
    document.addEventListener('click', (e) => {
        // Módulo 1 - Exercício de manutenção
        if (e.target.classList.contains('opcao-exercicio')) {
            const tipo = e.target.dataset.tipo;
            const feedback = document.getElementById('feedback-exercicio-1');
            let message = '';
            if (tipo === 'preventiva') message = '✅ Correto! Manutenção preventiva baseada em tempo.';
            else if (tipo === 'preditiva') message = '✅ Correto! Manutenção preditiva baseada em condição.';
            else if (tipo === 'corretiva') message = '✅ Correto! Manutenção corretiva após a falha.';
            if (feedback) {
                feedback.innerHTML = `<div class="feedback-correto">${message}</div>`;
                feedback.style.display = 'block';
            }
        }

        // Módulo 2 - Explorar Sentidos
        if (e.target.classList.contains('sentido-btn')) {
            const sentido = e.target.dataset.sentido;
            const detalhes = document.getElementById('detalhes-sentido');
            const conteudo = {
                visao: '<h5>👀 Inspeção Visual</h5><ul><li>🔍 Vazamentos</li><li>🔩 Parafusos soltos</li><li>⚡ Cabos danificados</li></ul>',
                audicao: '<h5>👂 Inspeção Auditiva</h5><ul><li>🔊 Ruídos metálicos</li><li>💨 Vazamentos de ar</li><li>⚡ Arco elétrico</li></ul>',
                tato: '<h5>✋ Inspeção Tátil</h5><ul><li>🌡️ Temperatura anormal</li><li>📳 Vibração excessiva</li><li>⚠️ ATENÇÃO: Segurança!</li></ul>',
                olfato: '<h5>👃 Inspeção Olfativa</h5><ul><li>🔥 Cheiro de queimado</li><li>⚡ Ozônio (arco)</li><li>🛢️ Óleo deteriorado</li></ul>',
                intuicao: '<h5>❤️ Intuição</h5><ul><li>🧠 "Algo não está normal"</li><li>📊 Padrões de comportamento</li><li>🔍 Detalhes que "chamam atenção"</li></ul>'
            };
            if (detalhes) detalhes.innerHTML = conteudo[sentido] || '';
        }

        // Módulo 2 - Simulador de Escolha
        if (e.target.classList.contains('opcao-sim')) {
            const correto = e.target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-simulador');
            if (resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? '<div class="feedback-correto">✅ Escolha correta! Análise de vibração + termografia é a melhor abordagem.</div>' : '<div class="feedback-incorreto">❌ Essa abordagem pode não ser suficiente.</div>';
            }
        }
        
        // Módulo 3 - Seleção de Frequência
        if (e.target.classList.contains('opcao-freq')) {
            document.querySelectorAll('.opcoes-freq .opcao-freq').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
        }

        // Módulo 3 - Quiz de Segurança
        if (e.target.classList.contains('opcao-seg')) {
            const correto = e.target.dataset.correto === 'true';
            const feedback = document.getElementById('feedback-seguranca');
            if(feedback) {
                feedback.style.display = 'block';
                feedback.innerHTML = correto ? '<div class="feedback-correto">✅ Correto! Segurança sempre em primeiro lugar.</div>' : '<div class="feedback-incorreto">❌ Procedimento inadequado.</div>';
            }
        }
    });


    // =================================================================================
    // SISTEMA DE QUIZ E CERTIFICAÇÃO (SEU CÓDIGO INTEGRADO)
    // =================================================================================
    const perguntas = [
        { pergunta: "Para que serve a inspeção em ambientes industriais?", opcoes: ["Aumentar o custo da manutenção", "Detectar falhas antes que causem paradas", "Acelerar a produção", "Garantir que a máquina fique desligada"], resposta: "Detectar falhas antes que causem paradas" },
        { pergunta: "Qual o objetivo da inspeção preditiva?", opcoes: ["Agir somente quando a máquina falha", "Analisar dados para prever falhas futuras", "Realizar visitas aleatórias", "Observar barulhos"], resposta: "Analisar dados para prever falhas futuras" },
        { pergunta: "Qual ferramenta detecta sons que o ouvido humano não capta?", opcoes: ["Analisador de Vibração", "Termografia", "Inspeção por Ultrassom", "Análise de óleo"], resposta: "Inspeção por Ultrassom" },
        { pergunta: "Qual a principal defesa contra o desgaste mecânico?", opcoes: ["Aumentar a velocidade", "Lubrificação correta", "Uso de materiais leves", "Diminuir a inspeção"], resposta: "Lubrificação correta" },
        { pergunta: "No caso do motor com vibração, qual a ação recomendada?", opcoes: ["Ignorar o problema", "Acionar análise de vibração no mesmo dia", "Aguardar a próxima inspeção", "Esperar a vibração ser perceptível ao tato"], resposta: "Acionar análise de vibração no mesmo dia" },
        { pergunta: "Qual ferramenta visualiza o interior de máquinas sem desmontagem?", opcoes: ["Analisador de Vibração", "Boroscópio (Câmera de Inspeção)", "Ultrassom Industrial", "Medidor de Espessura"], resposta: "Boroscópio (Câmera de Inspeção)" },
        { pergunta: "Qual o impacto de vazamentos de ar comprimido?", opcoes: ["Redução do consumo de energia", "Aumento do consumo de energia pelo compressor", "Aumento da força", "Melhora na eficiência"], resposta: "Aumento do consumo de energia pelo compressor" },
        { pergunta: "Qual o objetivo de um Plano de Inspeção?", opcoes: ["Aumentar paradas não programadas", "Organizar e padronizar as inspeções", "Reduzir calibração de ferramentas", "Inspecionar apenas quando falhar"], resposta: "Organizar e padronizar as inspeções" }
    ];

    let perguntaAtual = 0;
    let pontuacao = 0;

    const quizContainerEl = document.getElementById('quiz-container');
    const perguntaTituloEl = document.getElementById('pergunta-titulo');
    const opcoesQuizEl = document.getElementById('opcoes-quiz');
    const feedbackEl = document.getElementById('feedback');
    const certificadoFormEl = document.getElementById('certificado-form-container');
    const reprovadoEl = document.getElementById('reprovado-container');

    function iniciarQuiz() {
        if (!quizContainerEl || !perguntaTituloEl || !opcoesQuizEl) return;
        perguntaAtual = 0;
        pontuacao = 0;
        if(feedbackEl) feedbackEl.textContent = '';
        if(certificadoFormEl) certificadoFormEl.style.display = 'none';
        if(reprovadoEl) reprovadoEl.style.display = 'none';
        quizContainerEl.style.display = 'block';
        mostrarPergunta();
    }

    function mostrarPergunta() {
        if (perguntaAtual === 0) perguntas.sort(() => Math.random() - 0.5);
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
        if(feedbackEl) feedbackEl.textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
        
        botoes.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === respostaCorreta) btn.classList.add('correta');
            else if (btn.textContent === opcaoSelecionada) btn.classList.add('incorreta');
        });
        
        setTimeout(() => {
            perguntaAtual++;
            if (perguntaAtual < perguntas.length) {
                if(feedbackEl) feedbackEl.textContent = '';
                mostrarPergunta();
            } else {
                finalizarQuiz();
            }
        }, 1500);
    }

    function finalizarQuiz() {
        if(quizContainerEl) quizContainerEl.style.display = 'none';
        if (pontuacao === perguntas.length) {
            if(certificadoFormEl) certificadoFormEl.style.display = 'block';
        } else {
            if(reprovadoEl) reprovadoEl.style.display = 'block';
        }
    }

    function formatarCPF(cpf) {
        cpf = cpf.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (cpf.length !== 11) return cpf;
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function gerarCertificadoPDF() {
        const nome = document.getElementById('nome-aluno').value.trim();
        const documento = document.getElementById('documento-aluno').value.trim();
        const paisSelecionado = document.getElementById('pais-aluno').value;

        if (nome === "" || documento === "") {
            alert("Por favor, preencha seu nome completo e documento.");
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        
        // Design do certificado
        doc.setFillColor(230, 240, 255);
        doc.rect(0, 0, 297, 210, 'F');
        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(2);
        doc.rect(5, 5, 287, 200);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 51, 102);
        doc.text("Manutenção Industrial ARQUIVOS", 148.5, 25, { align: "center" });
        
        doc.setFontSize(30);
        doc.text("CERTIFICADO DE CONCLUSÃO", 148.5, 45, { align: "center" });
        
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
        
        let documentoTextoParaCertificado = paisSelecionado === 'angola' 
            ? `portador(a) do BI nº ${documento},`
            : `portador(a) do CPF nº ${formatarCPF(documento)},`;
        
        doc.text(`${documentoTextoParaCertificado} concluiu com aproveitamento o curso de`, 148.5, 87, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 51, 102);
        doc.text("INSPEÇÃO DE MÁQUINAS INDUSTRIAIS", 148.5, 99, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text("Carga Horária: 40 horas", 148.5, 109, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Conteúdos Estudados:", 20, 125);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const conteudos = ["Introdução e Tipos de Inspeção", "Inspeção Sensitiva e Instrumentada", "Procedimentos Padrão e Checklists", "Registro e Análise de Dados", "Análise de Falhas Mecânicas", "Análise de Falhas Elétricas", "Ferramentas Avançadas", "Desgaste e Lubrificação", "Sistemas Pneumáticos e Hidráulicos", "Inspeção Estrutural", "Planos de Inspeção e Melhoria Contínua"];
        
        const col1 = conteudos.slice(0, 6);
        const col2 = conteudos.slice(6);
        let yPos = 132;
        col1.forEach(item => { doc.text(`• ${item}`, 20, yPos); yPos += 6; });
        yPos = 132;
        col2.forEach(item => { doc.text(`• ${item}`, 155, yPos); yPos += 6; });
        
        const agora = new Date();
        const dataHoraFormatada = agora.toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        doc.setFontSize(12);
        doc.line(90, 185, 205, 185);
        doc.setFont("helvetica", "bold");
        doc.text("Jonathan da Silva Oliveira - Instrutor", 147.5, 190, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.text(`Emitido em: ${dataHoraFormatada}`, 147.5, 197, { align: "center" });
        
        doc.save(`Certificado - Inspecao Industrial - ${nome}.pdf`);
    }

    function setupQuizListeners() {
        const tentarNovamenteBtn = document.getElementById('tentar-novamente-btn');
        const gerarCertificadoBtn = document.getElementById('gerar-certificado-btn');
        const paisSelect = document.getElementById('pais-aluno');
        const documentoLabel = document.getElementById('documento-label');
        const documentoInput = document.getElementById('documento-aluno');

        if (tentarNovamenteBtn) tentarNovamenteBtn.addEventListener('click', iniciarQuiz);
        if (gerarCertificadoBtn) gerarCertificadoBtn.addEventListener('click', gerarCertificadoPDF);

        if (paisSelect && documentoLabel && documentoInput) {
            paisSelect.addEventListener('change', function() {
                if (this.value === 'angola') {
                    documentoLabel.textContent = 'Seu BI:';
                    documentoInput.placeholder = 'Digite seu BI';
                    documentoInput.maxLength = 14;
                } else {
                    documentoLabel.textContent = 'Seu CPF:';
                    documentoInput.placeholder = 'Digite seu CPF (apenas números)';
                    documentoInput.maxLength = 14;
                }
                documentoInput.value = '';
            });

            documentoInput.addEventListener('input', function() {
                if (paisSelect.value === 'brasil') {
                    this.value = formatarCPF(this.value);
                }
            });
            paisSelect.dispatchEvent(new Event('change'));
        }
    }
    
    // Inicializar listeners do quiz
    setupQuizListeners();
    
    // Função para iniciar o quiz apenas quando o módulo 13 estiver ativo
    function checkAndInitQuiz() {
        if (currentModuleIndex === totalModules - 1) { // O último módulo é o quiz
            iniciarQuiz();
        }
    }
    
    // =================================================================================
    // INICIALIZAÇÃO
    // =================================================================================
    showModule(0);

});
