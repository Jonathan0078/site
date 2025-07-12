// Variável global para a instância do gráfico, permitindo que seja destruída e recriada.
let tendenciasChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Medida de segurança para garantir que as bibliotecas não travem o script
    const { jsPDF } = window.jspdf || {};

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
        modules[currentModuleIndex].classList.add('active');

        updateNavigationUI();
        window.scrollTo(0, 0);
        checkAndInitQuiz();
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
            floatingNav.style.display = (currentModuleIndex >= totalModules - 1) ? 'none' : 'flex';
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => showModule(currentModuleIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showModule(currentModuleIndex + 1));

    // =================================================================================
    // LISTENER DE EVENTOS DE CLIQUE CENTRALIZADO (EVENT DELEGATION)
    // =================================================================================
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button'); // Captura o botão mesmo que clique no ícone
        if (!target) return;

        // Módulo 1: Identificar Tipo de Manutenção
        if (target.classList.contains('opcao-exercicio')) {
            const tipo = target.dataset.tipo;
            const feedback = document.getElementById('feedback-exercicio-1');
            let message = '';
            if (tipo === 'preventiva') message = '✅ Correto! Manutenção preventiva é baseada em tempo ou uso, como trocar rolamentos a cada 30 dias.';
            else if (tipo === 'preditiva') message = '✅ Correto! Manutenção preditiva é baseada na condição real, como analisar uma vibração anômala.';
            else if (tipo === 'corretiva') message = '✅ Correto! Manutenção corretiva age após a quebra do equipamento.';
            if (feedback) {
                feedback.innerHTML = `<div class="feedback-correto">${message}</div>`;
                feedback.style.display = 'block';
            }
        }

        // Módulo 2: Inspeção Sensitiva
        if (target.classList.contains('sentido-btn')) {
            document.querySelectorAll('.sentido-btn').forEach(btn => btn.classList.remove('ativo'));
            target.classList.add('ativo');
            const sentido = target.dataset.sentido;
            const detalhes = document.getElementById('detalhes-sentido');
            const conteudo = {
                visao: `<h5>👀 Inspeção Visual</h5><ul><li>🔍 Vazamentos de óleo, graxa ou fluidos</li><li>🔩 Parafusos soltos ou faltando</li><li>⚡ Cabos elétricos danificados</li><li>🌡️ Sinais de aquecimento (descoloração)</li><li>💨 Acúmulo de sujeira ou corrosão</li></ul>`,
                audicao: `<h5>👂 Inspeção Auditiva</h5><ul><li>🔊 Ruídos metálicos (desgaste)</li><li>📳 Vibração anormal</li><li>💨 Vazamentos de ar (assovio)</li><li>⚡ Arco elétrico (crepitação)</li></ul>`,
                tato: `<h5>✋ Inspeção Tátil</h5><ul><li>🌡️ Temperatura anormal</li><li>📳 Vibração excessiva</li><li>🔧 Folgas em conexões</li></ul><div class="alerta-seguranca">⚠️ ATENÇÃO: Nunca toque em partes energizadas ou em movimento!</div>`,
                olfato: `<h5>👃 Inspeção Olfativa</h5><ul><li>🔥 Cheiro de queimado (superaquecimento)</li><li>⚡ Ozônio (arco elétrico)</li><li>🛢️ Óleo deteriorado (acidez)</li></ul>`,
                intuicao: `<h5>❤️ Intuição e Experiência</h5><ul><li>🧠 "Algo não está como antes"</li><li>📊 Comparação com o comportamento padrão</li><li>🔍 Identificação de mudanças sutis</li></ul>`
            };
            if (detalhes) detalhes.innerHTML = conteudo[sentido] || '';
        }

        // Módulo 2: Simulador de Escolha
        if (target.classList.contains('opcao-sim')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-simulador');
            if (resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Escolha correta! Análise de vibração + termografia é a abordagem mais completa para diagnosticar a causa raiz.</div>` : `<div class="feedback-incorreto">❌ Essa abordagem pode não ser suficiente ou adequada para a situação.</div>`;
            }
        }
        
        // Módulo 3: Construtor de Procedimento (Frequência)
        if (target.classList.contains('opcao-freq')) {
            document.querySelectorAll('.opcoes-freq .opcao-freq').forEach(btn => btn.classList.remove('selected'));
            target.classList.add('selected');
        }
        
        // Módulo 3: Quiz de Segurança
        if (target.classList.contains('opcao-seg')) {
            const correto = target.dataset.correto === 'true';
            const feedback = document.getElementById('feedback-seguranca');
            if(feedback) {
                feedback.style.display = 'block';
                feedback.innerHTML = correto ? `<div class="feedback-correto">✅ Correto! Segurança em primeiro lugar sempre. Comunicação, autorização e EPIs são inegociáveis.</div>` : `<div class="feedback-incorreto">❌ Procedimento inadequado e perigoso.</div>`;
            }
        }

        // Módulo 5: Estudos de Caso
        if (target.classList.contains('opcao-caso')) {
            const caso = target.dataset.caso;
            const correta = target.dataset.correta === 'true';
            const feedback = document.getElementById(`feedback-caso-${caso}`);
            const consequencias = document.getElementById(`consequencias-${caso}`);
            if (feedback) {
                feedback.style.display = 'block';
                feedback.innerHTML = correta ? `<div class="feedback-correto">✅ Decisão correta! Em equipamentos críticos, a ação imediata previne paradas catastróficas.</div>` : `<div class="feedback-incorreto">❌ Abordagem arriscada. Deixar para depois poderia resultar em uma falha grave.</div>`;
            }
            if (consequencias) consequencias.style.display = 'block';
        }
        
        // Módulo 5: Simulador de Gestão de Prioridades
        if (target.classList.contains('opcao-gestao')) {
            const custo = parseInt(target.dataset.custo, 10);
            const risco = target.dataset.risco;
            const resultado = document.getElementById('resultado-gestao');
            const analises = {
                alto: "<strong>ALTO RISCO:</strong> Economia hoje, mas grande chance de uma falha catastrófica na bomba crítica.",
                medio: "<strong>RISCO MÉDIO:</strong> Boa estratégia. Você mitiga o maior risco e planeja os outros. Decisão balanceada.",
                baixo: "<strong>BAIXO RISCO:</strong> A opção mais segura, mas com o maior custo imediato. Garante a confiabilidade."
            };
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = `<div class="resultado-item"><strong>Custo imediato:</strong> R$ ${custo.toLocaleString('pt-BR')}</div><div class="resultado-item"><strong>Análise de Risco:</strong> ${analises[risco]}</div>`;
            }
        }

        // Módulo 5: Desafio Final
        if (target.classList.contains('opcao-caso-final')) {
            const correto = target.dataset.correta === 'true';
            const feedbackMsg = target.dataset.feedback;
            const feedbackContainer = document.getElementById('feedback-caso-final');
            
            if (feedbackContainer) {
                feedbackContainer.style.display = 'block';
                if (correto) {
                    feedbackContainer.innerHTML = `<div class="feedback-correto">✅ ${feedbackMsg}</div>`;
                } else {
                    feedbackContainer.innerHTML = `<div class="feedback-incorreto">❌ ${feedbackMsg}</div>`;
                }
            }
        }

        // Módulo 6: Simulador de Diagnóstico
        if (target.classList.contains('opcao-diag')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-diagnostico');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Diagnóstico correto! Vibração forte em 1x RPM é o principal sintoma de desbalanceamento.</div>` : `<div class="feedback-incorreto">❌ Diagnóstico incorreto. Falhas de rolamento e desalinhamento têm outras assinaturas de vibração.</div>`;
            }
        }
        
        // Módulo 7: Simulador de Termografia
        if (target.classList.contains('opcao-termo')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-termografia');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Análise correta! Uma diferença de 50°C sobre o ambiente é um sinal crítico que exige ação imediata.</div>` : `<div class="feedback-incorreto">❌ Análise incorreta. Uma diferença tão grande de temperatura nunca é normal.</div>`;
            }
        }

        // Módulo 7: Simulador de Medição de Corrente (CORRIGIDO)
        if (target.classList.contains('opcao-corr')) {
            const correto = target.dataset.correto === 'true';
            const feedbackMsg = target.dataset.feedback;
            const resultado = document.getElementById('resultado-corrente');
            if(resultado) {
                resultado.style.display = 'block';
                 if (correto) {
                    resultado.innerHTML = `<div class="feedback-correto">✅ ${feedbackMsg}</div>`;
                } else {
                    resultado.innerHTML = `<div class="feedback-incorreto">❌ ${feedbackMsg}</div>`;
                }
            }
        }

        // Módulo 10: Detector de Vazamentos
        if (target.classList.contains('opcao-deteccao')) {
            const metodo = target.dataset.metodo;
            const eficacia = parseInt(target.dataset.eficacia, 10);
            const resultado = document.getElementById('resultado-deteccao');
            const metodos = {
                ultrassom: 'Ideal para localização exata em ambientes ruidosos. Rápido e eficiente.',
                espuma: 'Confirma o local exato visualmente, mas é mais demorado e difícil de aplicar em alguns locais.'
            };
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = `<h5>🎯 Método: ${target.textContent.trim()}</h5><div class="resultado-item">Eficácia: ${eficacia}%</div><div class="resultado-item">${metodos[metodo]}</div>`;
            }
        }
        
        // Módulo 11: Inspeção Estrutural
        if (target.classList.contains('opcao-estrutural')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-estrutural');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Decisão CORRETA! A segurança da vida humana é a prioridade máxima.</div>` : `<div class="feedback-incorreto">❌ Decisão PERIGOSA! Nunca subestime uma falha estrutural.</div>`;
            }
        }
    });

    // =================================================================================
    // FUNÇÕES GLOBAIS (ACESSÍVEIS VIA ONCLICK)
    // =================================================================================

    // Módulo 1
    window.calcularEconomia = function() {
        const custoParada = parseFloat(document.getElementById('custo-parada').value) || 0;
        const paradasAno = parseFloat(document.getElementById('paradas-ano').value) || 0;
        const reducaoPercent = parseFloat(document.getElementById('reducao-percent').value) || 0;
        const custoAtual = custoParada * paradasAno;
        const paradasEvitadas = paradasAno * (reducaoPercent / 100);
        const economiaAnual = custoParada * paradasEvitadas;
        const resultado = document.getElementById('resultado-economia');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💰 Resultado da Análise</h5>
            <div class="resultado-item">Custo Anual Atual: R$ ${custoAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <div class="resultado-item">Paradas Evitadas por Ano: ${paradasEvitadas.toFixed(1)}</div>
            <div class="resultado-item destaque">Economia Anual Estimada: R$ ${economiaAnual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>`;
    };

    window.salvarReflexao = function(id) {
        const textarea = document.getElementById(id);
        if (textarea && textarea.value.trim() !== "") {
            localStorage.setItem(id, textarea.value);
            alert('Reflexão salva com sucesso!');
        } else {
            alert('Por favor, escreva sua reflexão antes de salvar.');
        }
    };
    if (document.getElementById('reflexao-1')) {
        document.getElementById('reflexao-1').value = localStorage.getItem('reflexao-1') || '';
    }

    // Módulo 3
    window.verificarChecklist = function() {
        const checkboxes = document.querySelectorAll('.checklist-items input[type="checkbox"]');
        const marcados = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const percentage = total > 0 ? (marcados / total) * 100 : 0;
        const feedback = document.getElementById('feedback-checklist');
        let message = '';
        if (percentage === 100) message = '<div class="feedback-correto">🎯 Excelente! Preparação completa.</div>';
        else if (percentage >= 80) message = '<div class="feedback-correto" style="background-color: #fff3cd; color: #856404;">✅ Boa preparação! Verifique os itens restantes.</div>';
        else message = '<div class="feedback-incorreto">⚠️ Preparação incompleta. Segurança em primeiro lugar!</div>';
        feedback.style.display = 'block';
        feedback.innerHTML = `<div><strong>Progresso: ${percentage.toFixed(0)}%</strong></div>${message}`;
    };

    window.avaliarProcedimento = function() {
        const freqSelecionada = document.querySelector('.opcoes-freq .opcao-freq.selected');
        const itensCriticos = document.querySelectorAll('.checklist-construtor input[data-item="critico"]:checked').length;
        const resultado = document.getElementById('resultado-procedimento');
        resultado.style.display = 'block';

        if (!freqSelecionada) {
            resultado.innerHTML = `<div class="feedback-incorreto">❌ Selecione uma frequência.</div>`;
            return;
        }
        if (itensCriticos < 3) {
            resultado.innerHTML = `<div class="feedback-incorreto">❌ Procedimento fraco. Selecione pelo menos 3 itens críticos.</div>`;
            return;
        }
        resultado.innerHTML = `<div class="feedback-correto">✅ Ótimo procedimento! Frequência <strong>${freqSelecionada.textContent.trim()}</strong> com <strong>${itensCriticos}</strong> pontos críticos.</div>`;
    };

    window.calcularROIFerramentas = function() {
        const investimento = parseFloat(document.getElementById('investimento-tools').value) || 0;
        const falhasEvitadas = parseFloat(document.getElementById('falhas-evitadas').value) || 0;
        const custoFalha = parseFloat(document.getElementById('custo-falha').value) || 0;
        const resultado = document.getElementById('resultado-roi-tools');
        resultado.style.display = 'block';
        if (investimento === 0) {
            resultado.innerHTML = `<div class="feedback-incorreto">❌ Insira um valor de investimento.</div>`;
            return;
        }
        const ganho = falhasEvitadas * custoFalha;
        const roi = ((ganho - investimento) / investimento) * 100;
        const payback = ganho > 0 ? (investimento / (ganho / 12)) : Infinity;

        resultado.innerHTML = `<h5>📈 Análise de ROI</h5>
            <div class="resultado-item">Ganho Anual: R$ ${ganho.toLocaleString('pt-BR')}</div>
            <div class="resultado-item destaque">ROI: ${roi.toFixed(1)}%</div>
            ${payback !== Infinity ? `<div class="resultado-item">Payback: ${payback.toFixed(1)} meses</div>` : ''}`;
    };

    window.gerarChecklist = function() {
        const tipo = document.getElementById('tipo-equipamento').value;
        const criticidade = document.getElementById('criticidade-eq').value;
        const ambiente = document.getElementById('ambiente-eq').value;
        const checklists = {
            motor: { sensitiva: ['Ruído', 'Vibração', 'Temperatura', 'Fixação'], instrumentada: ['Vibração (FFT)', 'Termografia', 'Corrente (MCSA)'] },
            bomba: { sensitiva: ['Vazamentos', 'Pressão', 'Vibração', 'Ruído'], instrumentada: ['Alinhamento', 'Vibração (FFT)', 'Ultrassom'] },
            redutor: { sensitiva: ['Nível do óleo', 'Vazamentos', 'Temperatura', 'Respiro'], instrumentada: ['Análise de óleo', 'Vibração', 'Termografia'] },
            compressor: { sensitiva: ['Vazamentos', 'Temperatura', 'Pressão', 'Drenagem'], instrumentada: ['Vibração', 'Vazão', 'Termografia'] }
        };
        const base = checklists[tipo];
        let itens = `<h4>Sensitiva (${criticidade === 'baixa' ? 'Semanal' : 'Diária'})</h4><ul>` + base.sensitiva.map(item => `<li>${item}</li>`).join('') + '</ul>';
        if (criticidade === 'critica' || criticidade === 'alta') {
            itens += `<h4>Instrumentada (${criticidade === 'alta' ? 'Mensal' : 'Trimestral'})</h4><ul>` + base.instrumentada.map(item => `<li>${item}</li>`).join('') + '</ul>';
        }
        if (ambiente === 'agressivo') {
            itens += `<h4>Adicionais (Ambiente Agressivo)</h4><ul><li>Verificar corrosão</li><li>Inspecionar vedações</li></ul>`;
        }
        const resultado = document.getElementById('checklist-gerado');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>📋 Checklist para ${document.querySelector(`#tipo-equipamento option[value=${tipo}]`).textContent}</h5>${itens}`;
    };

    // Módulo 4
    window.verificarProblemas = function() {
        const problemas = document.querySelectorAll('.problemas-opcoes input:checked').length;
        const resultado = document.getElementById('resultado-problemas');
        resultado.style.display = 'block';
        if (problemas === 5) {
            resultado.innerHTML = `<div class="feedback-correto">✅ Excelente! Você identificou todos os 5 problemas.</div>`;
        } else {
            resultado.innerHTML = `<div class="feedback-incorreto">❌ Quase lá! Existem 5 problemas no total.</div>`;
        }
    };
    
    // Módulo 4: Lógica do Gráfico de Tendências
    function gerarDadosDeTendencia(dias, parametro) {
        const labels = [];
        const data = [];
        const hoje = new Date();
        let valorBase, variacao, tendencia;

        switch (parametro) {
            case 'vibracao': valorBase = 1.5; variacao = 0.5; tendencia = 0.008; break;
            case 'corrente': valorBase = 25; variacao = 1.5; tendencia = 0.005; break;
            default: valorBase = 55; variacao = 5; tendencia = 0.02; break;
        }

        for (let i = dias - 1; i >= 0; i--) {
            const dataPonto = new Date(hoje);
            dataPonto.setDate(hoje.getDate() - i);
            labels.push(dataPonto.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            let valor = valorBase + (Math.random() - 0.5) * variacao + (dias - i) * tendencia;
            if (Math.random() > 0.95) valor *= 1.3;
            data.push(valor.toFixed(2));
        }
        return { labels, data };
    }

    window.atualizarGrafico = function() {
        const parametroSelect = document.getElementById('parametro-grafico');
        const parametro = parametroSelect.value;
        const parametroTexto = parametroSelect.options[parametroSelect.selectedIndex].text;
        const periodoSelect = document.getElementById('periodo-grafico');
        const periodo = parseInt(periodoSelect.value, 10);
        const periodoTexto = periodoSelect.options[periodoSelect.selectedIndex].text;
        const resultadoEl = document.getElementById('interpretacao-grafico');
        const { labels, data } = gerarDadosDeTendencia(periodo, parametro);
        const interpretacoes = { 
            temperatura: 'Tendência crescente indica possível problema de lubrificação, sobrecarga ou refrigeração.', 
            vibracao: 'Picos súbitos indicam impactos ou falhas agudas. Tendência crescente sugere desgaste progressivo (rolamento, engrenagem).', 
            corrente: 'Variações anormais podem indicar problemas na carga, no motor ou na rede elétrica.' 
        };

        resultadoEl.innerHTML = `<h6>📊 Análise de ${parametroTexto} - ${periodoTexto}</h6>
            <p>${interpretacoes[parametro]}</p>
            <div class="chart-container" style="position: relative; height:300px; width:100%;">
                <canvas id="tendenciasChartCanvas"></canvas>
            </div>`;
        resultadoEl.style.display = 'block';

        const ctx = document.getElementById('tendenciasChartCanvas').getContext('2d');
        if (tendenciasChart) tendenciasChart.destroy();

        tendenciasChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: parametroTexto,
                    data: data,
                    borderColor: 'rgba(0, 90, 156, 1)',
                    backgroundColor: 'rgba(0, 90, 156, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: false, title: { display: true, text: parametroTexto } }, x: { title: { display: true, text: 'Data' } } },
                plugins: { legend: { position: 'top' }, title: { display: true, text: `Tendência de ${parametroTexto}` } }
            }
        });
    };

    window.calcularKPIs = function() {
        const planejadas = parseFloat(document.getElementById('inspecoes-planejadas').value) || 0;
        const realizadas = parseFloat(document.getElementById('inspecoes-realizadas').value) || 0;
        const detectadas = parseFloat(document.getElementById('falhas-detectadas').value) || 0;
        const parada = parseFloat(document.getElementById('falhas-parada').value) || 0;
        const resultado = document.getElementById('resultado-kpis');
        resultado.style.display = 'block';
        if(planejadas === 0) {
            resultado.innerHTML = `<div class="feedback-incorreto">Insira o n° de inspeções planejadas.</div>`;
            return;
        }
        const conformidade = (realizadas / planejadas) * 100;
        const assertividade = detectadas > 0 ? ((detectadas - parada) / detectadas) * 100 : 100;

        resultado.innerHTML = `<h5>📊 Indicadores de Performance (KPIs)</h5>
            <div class="resultado-item"><strong>Conformidade do Plano:</strong> ${conformidade.toFixed(1)}%</div>
            <div class="resultado-item"><strong>Assertividade da Inspeção:</strong> ${assertividade.toFixed(1)}%</div>
            <div class="resultado-item">${conformidade < 95 ? 'Atenção à baixa conformidade!' : 'Ótima conformidade!'}</div>
            <div class="resultado-item">${assertividade < 80 ? 'Muitas falhas não detectadas a tempo.' : 'Excelente assertividade!'}</div>`;
    };

    window.avaliarMelhoria = function() {
        const texto = document.getElementById('registro-melhorado').value.toLowerCase();
        const feedback = document.getElementById('feedback-melhoria');
        feedback.style.display = 'block';
        let score = 0;
        if (texto.match(/mtr-|motor\s*[\w-]+/)) score++;
        if (texto.match(/\d{1,2}\/\d{1,2}/)) score++;
        if (texto.match(/\d+(\.\d+)?\s*(mm\/s|°c|a|bar)/)) score++;
        if (texto.includes('programar') || texto.includes('ação:')) score++;
        
        if (score >= 3) {
            feedback.innerHTML = `<div class="feedback-correto">✅ Excelente! Seu registro agora é profissional.</div>`;
        } else {
            feedback.innerHTML = `<div class="feedback-incorreto">❌ Tente novamente. Um bom registro precisa de ID, data, valores e uma ação.</div>`;
        }
    };

    // Módulo 5
    window.calcularMatrizDecisao = function() {
        const criticidade = parseFloat(document.getElementById('criticidade').value);
        const severidade = parseFloat(document.getElementById('severidade').value);
        const urgencia = parseFloat(document.getElementById('urgencia').value);
        const pontuacao = (criticidade * 0.5) + (severidade * 0.3) + (urgencia * 0.2);
        const resultado = document.getElementById('resultado-matriz');
        resultado.style.display = 'block';
        let prioridade = '';
        if (pontuacao >= 7) prioridade = '🔴 ALTA - Ação Imediata';
        else if (pontuacao >= 4) prioridade = '🟡 MÉDIA - Programar Ação';
        else prioridade = '🟢 BAIXA - Monitorar';
        resultado.innerHTML = `<h5>🎯 Prioridade Calculada</h5>
            <div class="resultado-item">Pontuação de Risco: ${pontuacao.toFixed(1)}</div>
            <div class="resultado-item destaque">Nível de Prioridade: ${prioridade}</div>`;
    };
    
    // Módulo 6
    window.calcularCustoFalha = function() {
        const horasReparo = parseFloat(document.getElementById('horas-reparo').value) || 0;
        const custoParadaHora = parseFloat(document.getElementById('custo-parada-hora').value) || 0;
        const tipoFalha = document.getElementById('tipo-falha-calc').value;
        const custosPeca = { rolamento: 800, desbalanceamento: 200, desalinhamento: 300 };
        const custoMaoDeObra = horasReparo * 150;
        const custoParada = horasReparo * custoParadaHora;
        const custoTotal = (custosPeca[tipoFalha] || 0) + custoMaoDeObra + custoParada;
        
        const resultado = document.getElementById('resultado-custo-falha');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💸 Custo Total da Falha</h5>
            <div class="resultado-item">Custo da Parada: R$ ${custoParada.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Mão de Obra: R$ ${custoMaoDeObra.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Peças: R$ ${(custosPeca[tipoFalha] || 0).toLocaleString('pt-BR')}</div>
            <div class="resultado-item destaque">Custo Total: R$ ${custoTotal.toLocaleString('pt-BR')}</div>`;
    };
    
    window.avaliarChecklist = function() {
        const resultado = document.getElementById('resultado-checklist-mecanica');
        const checkboxes = document.querySelectorAll('.checklist-inspecao-mecanica input:checked');
        resultado.style.display = 'block';
        if (checkboxes.length > 0) {
            resultado.innerHTML = `<div class="feedback-correto">Checklist preenchido. A consistência é a chave!</div>`;
        } else {
            resultado.innerHTML = `<div class="feedback-incorreto">Marque os itens inspecionados.</div>`;
        }
    }

    // Módulo 7
    window.calcularDesequilibrio = function() {
        const r = 28.5, s = 31.2, t = 29.8;
        const media = (r + s + t) / 3;
        const maxDesvio = Math.max(Math.abs(r - media), Math.abs(s - media), Math.abs(t - media));
        const desequilibrio = media > 0 ? (maxDesvio / media) * 100 : 0;
        let classificacao = '';
        if (desequilibrio <= 2) classificacao = '🟢 Normal (<2%)';
        else if (desequilibrio <= 5) classificacao = '🟡 Atenção (2-5%)';
        else classificacao = '🔴 Crítico (>5%)';
        const resultado = document.getElementById('classificacao-desequilibrio');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.innerHTML = `<div class="resultado-item">Desequilíbrio: <strong>${desequilibrio.toFixed(2)}%</strong></div>
                <div class="resultado-item">Classificação: <strong>${classificacao}</strong></div>`;
        }
    };
    
    // Módulo 8
    window.recomendarFerramenta = function() {
        const orcamento = document.getElementById('orcamento-sel').value;
        const nivel = document.getElementById('nivel-equipe-sel').value;
        let recomendacao = '';
        if (orcamento === 'baixo') recomendacao = '📳 Medidor de vibração básico + Termômetro infravermelho.';
        else if (orcamento === 'medio') {
            if(nivel === 'basico') recomendacao = '📸 Câmera termográfica de entrada + Detector ultrassônico.';
            else recomendacao = '📳 Analisador de vibração de 1 canal + Software.';
        } else {
            recomendacao = '🚀 Suite completa: Analisador FFT, Câmera de alta resolução, Análise de óleo, Software CMMS.';
        }
        const resultado = document.getElementById('recomendacao-ferramenta');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.innerHTML = `<h5>🎯 Recomendação</h5><div class="resultado-item destaque">${recomendacao}</div>`;
        }
    };

    window.calcularROIAvancado = function() {
        const investimento = parseFloat(document.getElementById('investimento-ferramentas').value) || 0;
        const falhasAno = parseFloat(document.getElementById('falhas-ano-atual').value) || 0;
        const reducao = parseFloat(document.getElementById('reducao-falhas').value) / 100;
        const custoParadaMedia = parseFloat(document.getElementById('custo-parada-media').value) || 0;
        const horasParadaMedia = parseFloat(document.getElementById('horas-parada-media').value) || 0;
        
        if (investimento === 0) {
            document.getElementById('resultado-roi-avancado').innerHTML = `<div class="feedback-incorreto">Insira o valor do investimento.</div>`;
            document.getElementById('resultado-roi-avancado').style.display = 'block';
            return;
        }
        const falhasEvitadas = falhasAno * reducao;
        const ganhoAnual = falhasEvitadas * custoParadaMedia * horasParadaMedia;
        const roi = ((ganhoAnual - investimento) / investimento) * 100;
        const resultado = document.getElementById('resultado-roi-avancado');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💰 Análise de ROI Detalhada</h5>
            <div class="resultado-item">Falhas evitadas/ano: ${falhasEvitadas.toFixed(1)}</div>
            <div class="resultado-item">Economia anual: <strong>R$ ${ganhoAnual.toLocaleString('pt-BR')}</strong></div>
            <div class="resultado-item destaque">ROI (1º ano): ${roi.toFixed(1)}%</div>`;
    };
    
    // Módulo 9
    window.calcularViscosidadeIdeal = () => {
        document.getElementById('resultado-viscosidade').style.display = 'block';
        document.getElementById('resultado-viscosidade').innerHTML = `<h5>🧮 Viscosidade Ideal</h5><div class="resultado-item destaque">ISO VG 320</div><p>Para esta aplicação, um óleo ISO VG 320 é recomendado.</p>`;
    };
    
    window.interpretarAnalise = function() {
        const visc = parseFloat(document.getElementById('visc-atual').value) || 0;
        const agua = parseFloat(document.getElementById('agua-atual').value) || 0;
        const ferro = parseFloat(document.getElementById('ferro-atual').value) || 0;
        const tan = parseFloat(document.getElementById('tan-atual').value) || 0;
        let acoes = [];
        if (visc > 320 * 1.15) acoes.push('🔴 Viscosidade alta: Oxidação/Contaminação.');
        if (agua > 500) acoes.push('🔴 Água severa: Verificar vedações.');
        if (ferro > 100) acoes.push('🔴 Desgaste severo: Investigar causa.');
        if (tan > 1.5) acoes.push('🔴 Acidez alta: Óleo oxidado, risco de corrosão.');
        const resultado = document.getElementById('interpretacao-analise');
        resultado.style.display = 'block';
        if (acoes.length > 0) {
            resultado.innerHTML = `<h5>🔬 Diagnóstico e Ação</h5><ul>${acoes.map(a => `<li>${a}</li>`).join('')}</ul>`;
        } else {
            resultado.innerHTML = '<div class="feedback-correto">✅ Laudo OK. Níveis aceitáveis.</div>';
        }
    };
    
    window.calcularIntervaloLubrificacao = () => {
        const rpm = parseFloat(document.getElementById('rpm-rolamento').value) || 1;
        const diametro = parseFloat(document.getElementById('diametro-rolamento').value) || 1;
        const f_temp = parseFloat(document.getElementById('temperatura-trabalho').value);
        const f_cont = parseFloat(document.getElementById('ambiente-contaminacao').value);
        const f_umid = parseFloat(document.getElementById('umidade-ambiente').value);
        const f_orie = parseFloat(document.getElementById('orientacao-eixo').value);
        const K = 10000000;
        const intervalo = (K / (rpm * Math.sqrt(diametro)) - 4 * diametro) * f_temp * f_cont * f_umid * f_orie;
        const resultado = document.getElementById('resultado-intervalo');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>⏱️ Intervalo de Relubrificação</h5><div class="resultado-item destaque">Aprox. ${Math.round(intervalo)} horas.</div>`;
    };

    window.calcularVidaUtil = () => {
        const C = parseFloat(document.getElementById('carga-dinamica').value) || 1;
        const P = parseFloat(document.getElementById('carga-aplicada').value) || 1;
        const vel = parseFloat(document.getElementById('velocidade-vida').value) || 1;
        const horasDia = parseFloat(document.getElementById('horas-operacao-dia').value) || 1;
        if (P === 0) return;
        const p = 3;
        const L10_rev = Math.pow(C / P, p) * 1000000;
        const L10h = L10_rev / (vel * 60);
        const vida_anos = L10h / (horasDia * 365);
        const resultado = document.getElementById('resultado-vida-util');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>🧮 Vida Útil L₁₀</h5>
            <div class="resultado-item">Vida em horas: ${Math.round(L10h).toLocaleString('pt-BR')} h</div>
            <div class="resultado-item destaque">Vida em anos: ${vida_anos.toFixed(1)} anos</div>`;
    };

    // Módulo 10
    window.avaliarInspecaoPneumatica = () => {
        const resultado = document.getElementById('resultado-inspecao-pneumatica');
        const checkboxes = document.querySelectorAll('.checklist-pneumatico input:checked');
        resultado.style.display = 'block';
        if (checkboxes.length > 0) {
            resultado.innerHTML = `<div class="feedback-correto">Checklist avaliado. A qualidade do ar é crucial!</div>`;
        } else {
             resultado.innerHTML = `<div class="feedback-incorreto">Marque os itens inspecionados.</div>`;
        }
    };

    window.calcularCustoVazamento = function() {
        const pressao = parseFloat(document.getElementById('pressao-sistema').value) || 7;
        const diametro = parseFloat(document.getElementById('diametro-furo').value) || 3;
        const horas = (parseFloat(document.getElementById('horas-operacao').value) || 0) * 365;
        const custoM3 = parseFloat(document.getElementById('custo-ar').value) || 0.12;
        const vazao = 1.8 * Math.pow(diametro, 2) * (pressao + 1) / 100;
        const perdaAnualM3 = vazao * 60 * horas;
        const custoAnual = perdaAnualM3 * custoM3;
        const resultado = document.getElementById('resultado-custo-vazamento');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💸 Análise de Perda Anual</h5>
            <div class="resultado-item">Perda de ar: ${Math.round(perdaAnualM3).toLocaleString('pt-BR')} m³/ano</div>
            <div class="resultado-item destaque">Custo do Vazamento: R$ ${custoAnual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/ano</div>`;
    };
    
    // Módulo 10: Check-up do Fluido Hidráulico (CORRIGIDO)
    window.diagnosticarFluido = function() {
        const sintoma = document.getElementById('sintoma-fluido').value;
        const resultado = document.getElementById('diagnostico-fluido');
        const diagnosticos = {
            leitoso: '🚨 **Contaminação por Água!** Causa corrosão, reduz a lubrificação e a vida útil dos componentes. Verifique vedações e trocadores de calor.',
            espuma: '⚠️ **Contaminação por Ar ou Nível Baixo!** Causa cavitação na bomba e operação errática. Verifique o nível do óleo, vedações da sucção e o respiro.',
            escuro: '🔥 **Óleo Oxidado/Queimado!** Perdeu suas propriedades lubrificantes. Causa: alta temperatura. Verifique o sistema de refrigeração e troque o óleo.',
            particulas: '💥 **Desgaste Interno Severo!** As partículas são de componentes se desintegrando. Pare o equipamento, filtre/troque o óleo e investigue a causa raiz (bomba, motor, etc).'
        };
        if (sintoma !== 'selecione') {
            resultado.style.display = 'block';
            resultado.innerHTML = `<p>${diagnosticos[sintoma]}</p>`;
        } else {
            resultado.style.display = 'none';
        }
    };

    // Módulo 11
    window.calcularVidaFadiga = () => {
        const resultado = document.getElementById('resultado-vida-fadiga');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>⏱️ Análise de Fadiga (Simplificada)</h5><p>Recomenda-se inspeção por ultrassom ou líquido penetrante a cada 2 anos para detectar trincas incipientes.</p>`;
    };
    
    window.calcularRiscoEstrutural = () => {
        const idade = parseFloat(document.getElementById('idade-estrutura').value);
        const carga = parseFloat(document.getElementById('carga-operacional').value);
        const ambiente = parseFloat(document.getElementById('ambiente-agressividade').value);
        const manutencao = parseFloat(document.getElementById('manutencao-qualidade').value);
        const risco = (idade * 0.3) + ((carga / 10) * 0.3) + (ambiente * 0.2) + ((6 - manutencao) * 0.2);
        let classificacao = '';
        if (risco > 7) classificacao = '🔴 ALTO RISCO - Inspeção especializada imediata.';
        else if (risco > 4) classificacao = '🟡 RISCO MODERADO - Agendar inspeção detalhada.';
        else classificacao = '🟢 BAIXO RISCO - Manter plano padrão.';
        const resultado = document.getElementById('resultado-risco-estrutural');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>⚖️ Nível de Risco Estrutural</h5><div class="resultado-item destaque">${classificacao} (Score: ${risco.toFixed(1)})</div>`;
    };

    // Módulo 12
    window.calcularCriticidade = function() {
        const impacto = parseFloat(document.getElementById('impacto-producao').value);
        const seguranca = parseFloat(document.getElementById('impacto-seguranca').value);
        const custo = parseFloat(document.getElementById('custo-manutencao').value);
        const ambiental = parseFloat(document.getElementById('impacto-ambiental').value);
        const score = (impacto * 0.4) + (seguranca * 0.3) + (custo * 0.2) + (ambiental * 0.1);
        let classificacao = '';
        if (score >= 7) classificacao = '🔴 A - CRÍTICO';
        else if (score >= 4) classificacao = '🟠 B - IMPORTANTE';
        else classificacao = '🟢 C - NORMAL';
        const resultado = document.getElementById('resultado-criticidade');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>🎯 Classificação ABC</h5><div class="resultado-item"><strong>Score:</strong> ${score.toFixed(1)}</div><div class="resultado-item destaque"><strong>Classificação:</strong> ${classificacao}</div>`;
    };
    
    window.gerarRota = function() {
        const tempo = parseFloat(document.getElementById('tempo-disponivel').value) || 4;
        const numPontos = Math.floor((tempo * 60) / 15);
        const resultado = document.getElementById('rota-gerada');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>🗺️ Rota de Inspeção Sugerida</h5>
            <p>Com <strong>${tempo} horas</strong>, é possível inspecionar aprox. <strong>${numPontos} pontos</strong>.</p>
            <p><strong>Exemplo de Rota:</strong></p>
            <ol><li>Motores Críticos Linha 1</li><li>Bombas de Processo</li><li>Redutores Principais</li><li>Painéis de Alta Tensão</li></ol>`;
    };
    
    window.calcularKPIsAvancados = function() {
        const horasOp = parseFloat(document.getElementById('horas-operacao-mes').value) || 1;
        const tempoReparo = parseFloat(document.getElementById('tempo-reparo-total').value) || 0;
        const falhasMes = parseFloat(document.getElementById('falhas-mes').value) || 0;
        const resultado = document.getElementById('resultado-kpis-avancados');
        resultado.style.display = 'block';
        if (falhasMes === 0) {
             resultado.innerHTML = `<div class="feedback-correto">Sem falhas no período! MTBF e Disponibilidade excelentes.</div>`;
             return;
        }
        const mtbf = (horasOp - tempoReparo) / falhasMes;
        const mttr = tempoReparo / falhasMes;
        const disponibilidade = (mtbf / (mtbf + mttr)) * 100;
        resultado.innerHTML = `<h5>📊 KPIs de Confiabilidade</h5>
            <div class="resultado-item"><strong>MTBF:</strong> ${mtbf.toFixed(1)} h</div>
            <div class="resultado-item"><strong>MTTR:</strong> ${mttr.toFixed(1)} h</div>
            <div class="resultado-item destaque"><strong>Disponibilidade:</strong> ${disponibilidade.toFixed(2)}%</div>`;
    };
    
    window.calcularROIPrograma = function() {
        const custoFerramentas = parseFloat(document.getElementById('custo-ferramentas-prog').value) || 0;
        const custoTreinamento = parseFloat(document.getElementById('custo-treinamento-prog').value) || 0;
        const custoSoftware = parseFloat(document.getElementById('custo-software-prog').value) || 0;
        const custoOperacional = parseFloat(document.getElementById('custo-operacional-prog').value) || 0;
        const custoParadaAtual = parseFloat(document.getElementById('custo-parada-atual').value) || 0;
        const reducaoParadas = parseFloat(document.getElementById('reducao-paradas-prog').value) / 100;
        const estoqueAtual = parseFloat(document.getElementById('estoque-atual').value) || 0;
        const reducaoEstoque = parseFloat(document.getElementById('reducao-estoque').value) / 100;

        const investimentoTotal = custoFerramentas + custoTreinamento;
        const custoAnual = custoSoftware + custoOperacional;
        const ganhoParadas = custoParadaAtual * reducaoParadas;
        const ganhoEstoque = estoqueAtual * reducaoEstoque;
        const ganhoAnualTotal = ganhoParadas - custoAnual;
        
        if (investimentoTotal === 0) {
            document.getElementById('resultado-roi-programa').innerHTML = `<div class="feedback-incorreto">Insira o valor do investimento.</div>`;
            document.getElementById('resultado-roi-programa').style.display = 'block';
            return;
        }
        const roi = ((ganhoParadas + ganhoEstoque - investimentoTotal - custoAnual) / (investimentoTotal)) * 100;
        const resultado = document.getElementById('resultado-roi-programa');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💰 Análise de ROI do Programa</h5>
            <div class="resultado-item">Investimento Inicial: R$ ${investimentoTotal.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Custo Anual do Programa: R$ ${custoAnual.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Ganho Anual (Paradas): R$ ${ganhoParadas.toLocaleString('pt-BR')}</div>
            <div class="resultado-item destaque">ROI (1º Ano): ${roi.toFixed(1)}%</div>`;
    };

    // Módulo 12: Ciclo PDCA (CORRIGIDO)
    window.expandirFase = function(fase) {
        const ferramentas = {
            plan: { titulo: '📋 Ferramentas de Planejamento (PLAN)', itens: ['Análise de Criticidade (ABC)', 'Análise de Modos de Falha (FMEA)', 'Diagrama de Ishikawa', '5W2H'] },
            do: { titulo: '⚡ Ferramentas de Execução (DO)', itens: ['Procedimentos Padrão (POP)', 'Checklists', 'Ordens de Serviço (OS)', 'Treinamento'] },
            check: { titulo: '🔍 Ferramentas de Verificação (CHECK)', itens: ['Indicadores (KPIs)', 'Gráficos de Controle', 'Análise de Tendências', 'Auditorias'] },
            act: { titulo: '🎯 Ferramentas de Ação (ACT)', itens: ['Análise de Causa Raiz (RCA)', 'Lições Aprendidas', 'Padronização', 'Benchmarking'] }
        };
        const ferramenta = ferramentas[fase];
        const container = document.getElementById('ferramentas-fase');
        container.style.display = 'block';
        container.innerHTML = `<h4>${ferramenta.titulo}</h4><ul>${ferramenta.itens.map(item => `<li>${item}</li>`).join('')}</ul>`;
    };

    // =================================================================================
    // SISTEMA DE QUIZ E CERTIFICAÇÃO (MÓDULO 13)
    // =================================================================================
    
    const LOGO_BASE64 = null; // IMPORTANTE: Substitua null pela string base64 do seu logo

    function formatarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length === 11) return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        return cpf;
    }

    const perguntas = [
        { pergunta: "Qual tipo de manutenção age somente após a ocorrência da falha?", opcoes: ["Preditiva", "Preventiva", "Corretiva", "Detectiva"], resposta: "Corretiva" },
        { pergunta: "A inspeção que utiliza termografia e análise de vibração é classificada como:", opcoes: ["Sensitiva", "Corretiva", "Instrumentada", "Autônoma"], resposta: "Instrumentada" },
        { pergunta: "O principal objetivo de um checklist de inspeção é:", opcoes: ["Aumentar o tempo da inspeção", "Garantir a padronização e a qualidade", "Substituir um inspetor qualificado", "Gerar mais papelada"], resposta: "Garantir a padronização e a qualidade" },
        { pergunta: "Um registro com 'Vibração: 2.8 mm/s (+0.3 vs sem. ant)' é um exemplo de:", opcoes: ["Registro vago", "Registro quantitativo com tendência", "Registro complexo demais", "Registro de corretiva"], resposta: "Registro quantitativo com tendência" },
        { pergunta: "Vibração em 1x RPM é sintoma clássico de:", opcoes: ["Falha de rolamento", "Desgaste de engrenagem", "Desalinhamento", "Desbalanceamento"], resposta: "Desbalanceamento" },
        { pergunta: "Qual ferramenta detecta um ponto quente em um disjuntor?", opcoes: ["Analisador de vibração", "Estetoscópio", "Câmera termográfica", "Alicate amperímetro"], resposta: "Câmera termográfica" },
        { pergunta: "Água e ferro em uma amostra de óleo indicam:", opcoes: ["Operação normal", "Aumentar a velocidade", "Desgaste interno e falha de vedação", "Óleo de boa qualidade"], resposta: "Desgaste interno e falha de vedação" },
        { pergunta: "O ciclo PDCA é uma ferramenta para:", opcoes: ["Calcular o custo de falha", "Apenas planejar", "Promover a melhoria contínua", "Desmontar um equipamento"], resposta: "Promover a melhoria contínua" },
    ];
    let perguntaAtual = 0;
    let pontuacao = 0;
    const quizContainerEl = document.getElementById('quiz-container');

    function iniciarQuiz() {
        if (!quizContainerEl) return;
        perguntaAtual = 0;
        pontuacao = 0;
        document.getElementById('feedback').textContent = '';
        document.getElementById('certificado-form-container').style.display = 'none';
        document.getElementById('reprovado-container').style.display = 'none';
        quizContainerEl.style.display = 'block';
        mostrarPergunta();
    }

    function mostrarPergunta() {
        const p = perguntas[perguntaAtual];
        document.getElementById('pergunta-titulo').textContent = `Pergunta ${perguntaAtual + 1}/${perguntas.length}: ${p.pergunta}`;
        const opcoesQuizEl = document.getElementById('opcoes-quiz');
        opcoesQuizEl.innerHTML = '';
        p.opcoes.sort(() => Math.random() - 0.5).forEach(opcao => {
            const btn = document.createElement('button');
            btn.textContent = opcao;
            btn.onclick = () => verificarResposta(opcao, p.resposta);
            opcoesQuizEl.appendChild(btn);
        });
    }

    function verificarResposta(opcaoSelecionada, respostaCorreta) {
        const acertou = (opcaoSelecionada === respostaCorreta);
        if (acertou) {
            pontuacao++;
            document.getElementById('feedback').innerHTML = `<span style="color:var(--cor-sucesso)">✅ Correto!</span>`;
        } else {
            document.getElementById('feedback').innerHTML = `<span style="color:var(--cor-erro)">❌ Incorreto. A resposta certa é "${respostaCorreta}".</span>`;
        }
        document.querySelectorAll('#opcoes-quiz button').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === respostaCorreta) btn.classList.add('correta');
            else if (btn.textContent === opcaoSelecionada) btn.classList.add('incorreta');
        });
        setTimeout(() => {
            perguntaAtual++;
            if (perguntaAtual < perguntas.length) {
                document.getElementById('feedback').textContent = '';
                mostrarPergunta();
            } else {
                finalizarQuiz();
            }
        }, 2000);
    }

    function finalizarQuiz() {
        quizContainerEl.style.display = 'none';
        if (pontuacao === perguntas.length) {
            document.getElementById('certificado-form-container').style.display = 'block';
        } else {
            document.getElementById('reprovado-container').style.display = 'block';
        }
    }

    if (document.getElementById('tentar-novamente-btn')) {
        document.getElementById('tentar-novamente-btn').addEventListener('click', iniciarQuiz);
    }
    
    const paisSelect = document.getElementById('pais-aluno');
    if (paisSelect) {
        paisSelect.addEventListener('change', (e) => {
            const pais = e.target.value;
            const docLabel = document.getElementById('documento-label');
            const docInput = document.getElementById('documento-aluno');
            if (pais === 'brasil') {
                docLabel.textContent = 'Seu CPF:';
                docInput.placeholder = 'Digite seu CPF (apenas números)';
                docInput.maxLength = 14;
            } else if (pais === 'angola') {
                docLabel.textContent = 'Seu BI (Bilhete de Identidade):';
                docInput.placeholder = 'Digite seu número de BI';
                docInput.maxLength = 20;
            }
        });
    }

    if (document.getElementById('gerar-certificado-btn')) {
        document.getElementById('gerar-certificado-btn').addEventListener('click', () => {
            const nome = document.getElementById('nome-aluno').value.trim();
            const documento = document.getElementById('documento-aluno').value.trim();
            const pais = document.getElementById('pais-aluno').value;
            if (nome && documento) {
                gerarCertificadoPDF(nome, documento, pais);
            } else {
                alert('Por favor, preencha todos os campos!');
            }
        });
    }

    function gerarCertificadoPDF(nome, documento, pais) {
        if (!jsPDF) {
            alert("Erro: Biblioteca PDF não carregada. Verifique a internet.");
            return;
        }
        try {
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            doc.setFillColor(230, 240, 255);
            doc.rect(0, 0, 297, 210, 'F');
            doc.setDrawColor(0, 51, 102);
            doc.setLineWidth(2);
            doc.rect(5, 5, 287, 200);
            if (LOGO_BASE64) {
                const imgProps = doc.getImageProperties(LOGO_BASE64);
                doc.addImage(LOGO_BASE64, 'PNG', 20, 15, 50, (imgProps.height * 50) / imgProps.width);
            }
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
            let docTexto = pais === 'angola' ? `portador(a) do BI nº ${documento},` : `portador(a) do CPF nº ${formatarCPF(documento)},`;
            doc.text(`${docTexto} concluiu com aproveitamento o curso de`, 148.5, 87, { align: "center" });
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.setTextColor(0, 51, 102);
            doc.text("INSPEÇÃO DE MÁQUINAS INDUSTRIAIS", 148.5, 99, { align: "center" });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);
            doc.text("Carga Horária: 2 horas", 148.5, 109, { align: "center" });
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("Conteúdos Estudados:", 20, 125);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9); 
            const conteudos = [ "Introdução e Tipos de Inspeção", "Inspeção Sensitiva e Instrumentada", "Procedimentos Padrão e Checklists", "Registro e Análise de Dados", "Análise de Falhas Mecânicas", "Análise de Falhas Elétricas", "Ferramentas Avançadas", "Lubrificação e Vida Útil", "Sistemas Pneumáticos e Hidráulicos", "Inspeção Estrutural e de Segurança", "Planos de Inspeção e Melhoria Contínua" ];
            let yPos = 132;
            conteudos.slice(0, 6).forEach(item => { doc.text(`• ${item}`, 20, yPos); yPos += 6; });
            yPos = 132;
            conteudos.slice(6).forEach(item => { doc.text(`• ${item}`, 155, yPos); yPos += 6; });
            const agora = new Date();
            const dataHora = agora.toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            doc.setFontSize(12);
            doc.line(90, 185, 205, 185);
            doc.setFont("helvetica", "bold");
            doc.text("Jonathan da Silva Oliveira - Instrutor", 147.5, 190, { align: "center" });
            doc.setFont("helvetica", "normal");
            doc.text(`Emitido em: ${dataHora}`, 147.5, 197, { align: "center" });
            doc.save(`Certificado - ${nome}.pdf`);
        } catch(e) {
            console.error("Erro ao gerar PDF:", e);
            alert("Ocorreu um erro ao gerar o certificado.");
        }
    }

    function checkAndInitQuiz() {
        if (currentModuleIndex === totalModules - 1) {
            setTimeout(iniciarQuiz, 500);
        }
    }
    
    // Inicialização da página
    showModule(0);
});
