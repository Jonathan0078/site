document.addEventListener('DOMContentLoaded', () => {
    // Medida de segurança para garantir que a biblioteca de PDF não trave o script
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
        // Oculta a navegação no último módulo (Quiz)
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
        const target = e.target;

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
                visao: `<h5>👀 Inspeção Visual</h5><ul><li>🔍 Vazamentos de óleo, graxa ou fluidos</li><li>🔩 Parafusos soltos ou faltando</li><li>⚡ Cabos elétricos danificados</li><li>🌡️ Sinais de aquecimento (descoloração)</li><li>💨 Acúmulo de sujeira ou corrosão</li></ul><div class="dica-pratica">💡 Dica: Use lanterna e espelho para áreas difíceis</div>`,
                audicao: `<h5>👂 Inspeção Auditiva</h5><ul><li>🔊 Ruídos metálicos (desgaste)</li><li>📳 Vibração anormal</li><li>💨 Vazamentos de ar (assovio)</li><li>⚡ Arco elétrico (crepitação)</li><li>🔧 Batidas ou impactos</li></ul><div class="dica-pratica">💡 Dica: Use estetoscópio mecânico para amplificar</div>`,
                tato: `<h5>✋ Inspeção Tátil</h5><ul><li>🌡️ Temperatura anormal (dorso da mão)</li><li>📳 Vibração excessiva</li><li>🔧 Folgas em conexões</li><li>💧 Umidade ou vazamentos</li><li>⚡ Aquecimento em cabos</li></ul><div class="alerta-seguranca">⚠️ ATENÇÃO: Nunca toque em partes energizadas ou em movimento!</div>`,
                olfato: `<h5>👃 Inspeção Olfativa</h5><ul><li>🔥 Cheiro de queimado (superaquecimento)</li><li>⚡ Ozônio (arco elétrico)</li><li>🛢️ Óleo deteriorado (acidez)</li><li>🧪 Produtos químicos (vazamentos)</li><li>🦨 Gases tóxicos</li></ul><div class="dica-pratica">💡 Dica: O nariz detecta problemas antes de muitos instrumentos</div>`,
                intuicao: `<h5>❤️ Intuição e Experiência</h5><ul><li>🧠 "Algo não está como antes"</li><li>📊 Comparação com o comportamento padrão</li><li>🕐 Identificação de mudanças sutis ao longo do tempo</li><li>🔍 Detalhes que "chamam a atenção"</li></ul><div class="dica-pratica">💡 Dica: Confie na experiência, mas sempre confirme com dados</div>`
            };
            if (detalhes) detalhes.innerHTML = conteudo[sentido] || '';
        }

        // Módulo 2: Simulador de Escolha
        if (target.classList.contains('opcao-sim')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-simulador');
            if (resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Escolha correta! Análise de vibração combinada com termografia é ideal para detectar a causa raiz (desbalanceamento, desalinhamento, falha de rolamento) e problemas elétricos associados.</div>` : `<div class="feedback-incorreto">❌ Essa abordagem pode não ser suficiente. Apenas sensitiva é pouco para um diagnóstico preciso em um equipamento de 50 HP, e análise de óleo não detectaria a origem do ruído mecânico.</div>`;
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
                feedback.innerHTML = correto ? `<div class="feedback-correto">✅ Correto! Segurança em primeiro lugar sempre. A comunicação, autorização e o uso de EPIs corretos são inegociáveis.</div>` : `<div class="feedback-incorreto">❌ Procedimento inadequado e perigoso. Esperar parar nem sempre é uma opção (o motor precisa estar em carga), e medir sem preparo é um risco enorme.</div>`;
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
                feedback.innerHTML = correta ? `<div class="feedback-correto">✅ Decisão correta! Em equipamentos críticos, a ação imediata previne paradas catastróficas.</div>` : `<div class="feedback-incorreto">❌ Abordagem arriscada. Deixar para depois poderia resultar em uma falha grave e parada de produção.</div>`;
            }
            if (consequencias) consequencias.style.display = 'block';
        }
        
        // Módulo 5: Simulador de Gestão de Prioridades
        if (target.classList.contains('opcao-gestao')) {
            const custo = parseInt(target.dataset.custo, 10);
            const risco = target.dataset.risco;
            const resultado = document.getElementById('resultado-gestao');
            const analises = {
                alto: "<strong>ALTO RISCO:</strong> Economia hoje, mas grande chance de uma falha catastrófica na bomba crítica, custando muito mais.",
                medio: "<strong>RISCO MÉDIO:</strong> Boa estratégia. Você mitiga o maior risco (bomba) e planeja os outros. É uma decisão balanceada.",
                baixo: "<strong>BAIXO RISCO:</strong> A opção mais segura, mas com o maior custo imediato. Garante a confiabilidade de todos os ativos."
            };
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = `<div class="resultado-item"><strong>Custo imediato:</strong> R$ ${custo.toLocaleString('pt-BR')}</div><div class="resultado-item"><strong>Análise de Risco:</strong> ${analises[risco]}</div>`;
            }
        }

        // Módulo 6: Simulador de Diagnóstico
        if (target.classList.contains('opcao-diag')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-diagnostico');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Diagnóstico correto! Vibração forte em 1x a rotação (1x RPM) é o principal sintoma de desbalanceamento.</div>` : `<div class="feedback-incorreto">❌ Diagnóstico incorreto. Falhas de rolamento e desalinhamento têm assinaturas de vibração diferentes (frequências mais altas e harmônicos).</div>`;
            }
        }
        
        // Módulo 7: Simulador de Termografia
        if (target.classList.contains('opcao-termo')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-termografia');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Análise correta! Uma diferença de temperatura (Delta T) de 50°C (78°C - 28°C) sobre a temperatura ambiente é um sinal crítico de mau contato ou sobrecarga, exigindo ação imediata.</div>` : `<div class="feedback-incorreto">❌ Análise incorreta. Uma diferença tão grande de temperatura nunca é normal e indica uma falha iminente ou um risco de incêndio.</div>`;
            }
        }

        // Módulo 10: Detector de Vazamentos
        if (target.classList.contains('opcao-deteccao')) {
            const metodo = target.dataset.metodo;
            const eficacia = parseInt(target.dataset.eficacia, 10);
            const resultado = document.getElementById('resultado-deteccao');
            const metodos = {
                ultrassom: 'Ideal para localização exata em ambientes ruidosos. Rápido e eficiente para varrer grandes áreas.',
                espuma: 'Confirma o local exato do vazamento visualmente, mas é mais demorado e difícil de aplicar em locais de difícil acesso.'
            };
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = `<h5>🎯 Método: ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}</h5><div class="resultado-item">Eficácia: ${eficacia}%</div><div class="resultado-item">${metodos[metodo]}</div>`;
            }
        }
        
        // Módulo 11: Inspeção Estrutural
        if (target.classList.contains('opcao-estrutural')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-estrutural');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Decisão CORRETA! A segurança da vida humana é a prioridade máxima. Qualquer suspeita de falha estrutural exige interdição imediata e avaliação por um especialista.</div>` : `<div class="feedback-incorreto">❌ Decisão PERIGOSA! Nunca se deve subestimar uma falha estrutural. Monitorar uma trinca conhecida em um componente crítico é inaceitável.</div>`;
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
    // Carregar reflexão salva ao iniciar
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
        if (percentage === 100) message = '<div class="feedback-correto">🎯 Excelente! Preparação completa. Você está pronto e seguro para a inspeção.</div>';
        else if (percentage >= 80) message = '<div class="feedback-correto" style="background-color: #fff3cd; color: #856404;">✅ Boa preparação! Verifique os itens restantes para garantir 100% de segurança.</div>';
        else message = '<div class="feedback-incorreto">⚠️ Preparação incompleta. Revise os itens não marcados. Segurança em primeiro lugar!</div>';
        feedback.style.display = 'block';
        feedback.innerHTML = `<div><strong>Progresso da Preparação: ${percentage.toFixed(0)}%</strong></div>${message}`;
    };

    window.avaliarProcedimento = function() {
        const freqSelecionada = document.querySelector('.opcoes-freq .opcao-freq.selected');
        const itensCriticos = document.querySelectorAll('.checklist-construtor input[data-item="critico"]:checked').length;
        const resultado = document.getElementById('resultado-procedimento');
        resultado.style.display = 'block';

        if (!freqSelecionada) {
            resultado.innerHTML = `<div class="feedback-incorreto">❌ Por favor, selecione uma frequência para o procedimento.</div>`;
            return;
        }
        if (itensCriticos < 3) {
            resultado.innerHTML = `<div class="feedback-incorreto">❌ Procedimento fraco. Selecione pelo menos 3 itens críticos (com 🌡️, 📳, 🔊, ⚡, 🛢️) para uma inspeção preditiva eficaz.</div>`;
            return;
        }
        resultado.innerHTML = `<div class="feedback-correto">✅ Ótimo procedimento! Frequência <strong>${freqSelecionada.textContent.trim()}</strong> com <strong>${itensCriticos}</strong> pontos críticos monitorados. Isso garante uma boa cobertura do equipamento.</div>`;
    };

    window.calcularROIFerramentas = function() {
        const investimento = parseFloat(document.getElementById('investimento-tools').value) || 0;
        const falhasEvitadas = parseFloat(document.getElementById('falhas-evitadas').value) || 0;
        const custoFalha = parseFloat(document.getElementById('custo-falha').value) || 0;
        const resultado = document.getElementById('resultado-roi-tools');
        resultado.style.display = 'block';
        if (investimento === 0) {
            resultado.innerHTML = `<div class="feedback-incorreto">❌ Insira um valor de investimento válido.</div>`;
            return;
        }
        const ganho = falhasEvitadas * custoFalha;
        const roi = ((ganho - investimento) / investimento) * 100;
        const payback = ganho > 0 ? (investimento / (ganho / 12)) : Infinity;

        resultado.innerHTML = `<h5>📈 Análise de ROI</h5>
            <div class="resultado-item">Ganho Anual (falhas evitadas): R$ ${ganho.toLocaleString('pt-BR')}</div>
            <div class="resultado-item destaque">Retorno Sobre Investimento (ROI): ${roi.toFixed(1)}%</div>
            ${payback !== Infinity ? `<div class="resultado-item">Tempo de Payback: ${payback.toFixed(1)} meses</div>` : '<div class="resultado-item">O ganho não cobre o investimento no primeiro ano.</div>'}`;
    };

    window.gerarChecklist = function() {
        const tipo = document.getElementById('tipo-equipamento').value;
        const criticidade = document.getElementById('criticidade-eq').value;
        const ambiente = document.getElementById('ambiente-eq').value;
        const checklists = {
            motor: { sensitiva: ['Ruído', 'Vibração (tátil)', 'Temperatura (tátil)', 'Fixação', 'Limpeza'], instrumentada: ['Vibração (FFT)', 'Termografia (conexões)', 'Corrente (MCSA)'] },
            bomba: { sensitiva: ['Vazamentos (selo)', 'Pressão (manômetro)', 'Vibração', 'Ruído'], instrumentada: ['Alinhamento a laser', 'Vibração (FFT)', 'Ultrassom (cavitação)'] },
            redutor: { sensitiva: ['Nível do óleo', 'Vazamentos', 'Temperatura', 'Respiro'], instrumentada: ['Análise de óleo', 'Análise de vibração', 'Termografia'] },
            compressor: { sensitiva: ['Vazamentos de ar', 'Temperatura de descarga', 'Pressão', 'Drenagem de condensado'], instrumentada: ['Análise de vibração', 'Medição de vazão', 'Termografia'] }
        };
        const base = checklists[tipo];
        let itens = `<h4>Inspeção Sensitiva (${criticidade === 'baixa' || criticidade === 'media' ? 'Semanal' : 'Diária'})</h4><ul>` + base.sensitiva.map(item => `<li>${item}</li>`).join('') + '</ul>';
        if (criticidade === 'critica' || criticidade === 'alta') {
            itens += `<h4>Inspeção Instrumentada (${criticidade === 'alta' ? 'Mensal' : 'Trimestral'})</h4><ul>` + base.instrumentada.map(item => `<li>${item}</li>`).join('') + '</ul>';
        }
        if (ambiente === 'agressivo') {
            itens += `<h4>Itens Adicionais (Ambiente Agressivo)</h4><ul><li>Verificar corrosão</li><li>Inspecionar vedações e proteções</li></ul>`;
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
            resultado.innerHTML = `<div class="feedback-correto">✅ Excelente! Você identificou todos os 5 problemas neste registro. Um registro de qualidade precisa ser específico, quantitativo e acionável.</div>`;
        } else {
            resultado.innerHTML = `<div class="feedback-incorreto">❌ Quase lá! Existem 5 problemas no total. Um bom registro precisa de: ID do equipamento, data/hora, medição com valores, nome completo do responsável e uma ação clara.</div>`;
        }
    };

    window.calcularKPIs = function() {
        const planejadas = parseFloat(document.getElementById('inspecoes-planejadas').value) || 0;
        const realizadas = parseFloat(document.getElementById('inspecoes-realizadas').value) || 0;
        const detectadas = parseFloat(document.getElementById('falhas-detectadas').value) || 0;
        const parada = parseFloat(document.getElementById('falhas-parada').value) || 0;
        const resultado = document.getElementById('resultado-kpis');
        resultado.style.display = 'block';
        if(planejadas === 0) {
            resultado.innerHTML = `<div class="feedback-incorreto">Insira o número de inspeções planejadas.</div>`;
            return;
        }
        const conformidade = (realizadas / planejadas) * 100;
        const assertividade = detectadas > 0 ? ((detectadas - parada) / detectadas) * 100 : 100;

        resultado.innerHTML = `<h5>📊 Indicadores de Performance (KPIs)</h5>
            <div class="resultado-item"><strong>Conformidade do Plano:</strong> ${conformidade.toFixed(1)}%</div>
            <div class="resultado-item"><strong>Assertividade da Inspeção:</strong> ${assertividade.toFixed(1)}%</div>
            <div class="resultado-item">${conformidade < 95 ? 'Atenção à baixa conformidade!' : 'Ótima conformidade!'}</div>
            <div class="resultado-item">${assertividade < 80 ? 'Muitas falhas não detectadas a tempo. Melhorar técnicas.' : 'Excelente assertividade!'}</div>`;
    };

    window.avaliarMelhoria = function() {
        const texto = document.getElementById('registro-melhorado').value.toLowerCase();
        const feedback = document.getElementById('feedback-melhoria');
        feedback.style.display = 'block';
        let score = 0;
        let checklist = {
            id: false,
            data: false,
            medicao: false,
            acao: false
        };

        if (texto.includes('mtr-') || texto.match(/motor\s*[\w-]+/)) { score++; checklist.id = true; }
        if (texto.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) || texto.match(/\d{1,2}:\d{2}/)) { score++; checklist.data = true; }
        if (texto.match(/\d+(\.\d+)?\s*(mm\/s|°c|a|bar|psi)/)) { score++; checklist.medicao = true; }
        if (texto.includes('programar') || texto.includes('verificar') || texto.includes('ação:') || texto.includes('recomendo')) { score++; checklist.acao = true; }
        
        if (score >= 3) {
            feedback.innerHTML = `<div class="feedback-correto">✅ Excelente! Seu registro agora é profissional, contendo os elementos essenciais.</div>`;
        } else {
            let dica = "❌ Tente novamente. Um bom registro precisa de:<ul>";
            if (!checklist.id) dica += "<li>ID do equipamento (Ex: MTR-001)</li>";
            if (!checklist.data) dica += "<li>Data e hora</li>";
            if (!checklist.medicao) dica += "<li>Valores medidos com unidades (Ex: Vib: 2.5mm/s, Temp: 60°C)</li>";
            if (!checklist.acao) dica += "<li>Ação recomendada (Ex: Programar análise FFT)</li>";
            dica += "</ul>";
            feedback.innerHTML = `<div class="feedback-incorreto">${dica}</div>`;
        }
    };
    
    window.atualizarGrafico = function() {
        const parametro = document.getElementById('parametro-grafico').value;
        const periodo = document.getElementById('periodo-grafico').value;
        const resultadoEl = document.getElementById('interpretacao-grafico');
        const interpretacoes = { temperatura: 'Tendência crescente indica possível problema de lubrificação, sobrecarga ou refrigeração.', vibracao: 'Picos súbitos indicam impactos ou falhas agudas. Tendência crescente sugere desgaste progressivo (rolamento, engrenagem).', corrente: 'Variações anormais podem indicar problemas na carga, no motor ou na rede elétrica. Aumentos graduais podem sinalizar maior atrito mecânico.' };
        resultadoEl.style.display = 'block';
        resultadoEl.innerHTML = `<h6>📊 Análise de ${parametro.charAt(0).toUpperCase() + parametro.slice(1)} - ${periodo} dias</h6><p>${interpretacoes[parametro]}</p><div style="background: #f8f9fa; padding: 2rem; border: 2px dashed #dee2e6; text-align: center; margin-top: 1rem;">📈 [Gráfico simulado de ${parametro} mostrando tendência]</div>`;
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
        const custoMaoDeObra = horasReparo * 150; // R$150/h
        const custoParada = horasReparo * custoParadaHora;
        const custoTotal = (custosPeca[tipoFalha] || 0) + custoMaoDeObra + custoParada;
        
        const resultado = document.getElementById('resultado-custo-falha');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💸 Custo Total da Falha</h5>
            <div class="resultado-item">Custo da Parada: R$ ${custoParada.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Custo de Mão de Obra: R$ ${custoMaoDeObra.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Custo de Peças: R$ ${(custosPeca[tipoFalha] || 0).toLocaleString('pt-BR')}</div>
            <div class="resultado-item destaque">Custo Total: R$ ${custoTotal.toLocaleString('pt-BR')}</div>`;
    };
    
    window.avaliarChecklist = function() {
        const resultado = document.getElementById('resultado-checklist-mecanica');
        const checkboxes = document.querySelectorAll('.checklist-inspecao-mecanica input:checked');
        resultado.style.display = 'block';
        if (checkboxes.length > 0) {
            resultado.innerHTML = `<div class="feedback-correto">Checklist preenchido. Lembre-se: a consistência na execução do checklist é a chave para a detecção precoce de falhas.</div>`;
        } else {
            resultado.innerHTML = `<div class="feedback-incorreto">Marque os itens inspecionados para avaliar sua inspeção.</div>`;
        }
    }

    // Módulo 7
    window.calcularDesequilibrio = function() {
        const r = 28.5, s = 31.2, t = 29.8; // Valores fixos do exemplo
        const media = (r + s + t) / 3;
        const desvios = [Math.abs(r - media), Math.abs(s - media), Math.abs(t - media)];
        const maxDesvio = Math.max(...desvios);
        const desequilibrio = media > 0 ? (maxDesvio / media) * 100 : 0;
        let classificacao = '';
        let acao = '';
        if (desequilibrio <= 2) {
             classificacao = '🟢 Normal (<2%)';
             acao = 'Operação segura. Monitorar.'
        } else if (desequilibrio <= 5) {
            classificacao = '🟡 Atenção (2-5%)';
            acao = 'Investigar causa. Pode ser problema na rede ou no motor.'
        } else {
            classificacao = '🔴 Crítico (>5%)';
            acao = 'Risco de superaquecimento e falha. Ação corretiva urgente.'
        }
        const resultado = document.getElementById('classificacao-desequilibrio');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.innerHTML = `
                <div class="resultado-item">Desequilíbrio de Corrente: <strong>${desequilibrio.toFixed(2)}%</strong></div>
                <div class="resultado-item">Classificação: <strong>${classificacao}</strong></div>
                <div class="resultado-item">Ação Recomendada: ${acao}</div>
            `;
        }
    };
    
    // Módulo 8
    window.recomendarFerramenta = function() {
        const orcamento = document.getElementById('orcamento-sel').value;
        const nivel = document.getElementById('nivel-equipe-sel').value;
        let recomendacao = '';

        if (orcamento === 'baixo') {
            recomendacao = '📳 Medidor de vibração básico (caneta) + Termômetro infravermelho + Estetoscópio. Ideal para iniciar na preditiva com inspeção sensitiva melhorada.';
        } else if (orcamento === 'medio') {
            if(nivel === 'basico') {
                 recomendacao = '📸 Câmera termográfica de entrada + Detector ultrassônico. Ferramentas com curva de aprendizado rápida e alto impacto em detecção de falhas elétricas e vazamentos.';
            } else {
                 recomendacao = '📳 Analisador de vibração de 1 canal + Software de tendência. Permite iniciar uma análise de falhas mais profunda.';
            }
        } else { // alto
            recomendacao = '🚀 Suite completa: Analisador de vibração FFT multicanal, Câmera termográfica de alta resolução, Sistema de análise de óleo e Software de gestão preditiva (CMMS). Para um programa de classe mundial.';
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
            document.getElementById('resultado-roi-avancado').style.display = 'block';
            document.getElementById('resultado-roi-avancado').innerHTML = `<div class="feedback-incorreto">Insira o valor do investimento.</div>`;
            return;
        }

        const falhasEvitadas = falhasAno * reducao;
        const ganhoAnual = falhasEvitadas * custoParadaMedia * horasParadaMedia;
        const roi = ((ganhoAnual - investimento) / investimento) * 100;

        const resultado = document.getElementById('resultado-roi-avancado');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💰 Análise de ROI Detalhada</h5>
            <div class="resultado-item">Falhas evitadas por ano: ${falhasEvitadas.toFixed(1)}</div>
            <div class="resultado-item">Economia anual com paradas: <strong>R$ ${ganhoAnual.toLocaleString('pt-BR')}</strong></div>
            <div class="resultado-item">Investimento: R$ ${investimento.toLocaleString('pt-BR')}</div>
            <div class="resultado-item destaque">ROI no primeiro ano: ${roi.toFixed(1)}%</div>
        `;
    };
    
    // Módulo 9
    window.calcularViscosidadeIdeal = () => {
        const resultado = document.getElementById('resultado-viscosidade');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>🧮 Viscosidade Ideal</h5><div class="resultado-item destaque">ISO VG 320</div><p>Para esta aplicação (velocidade moderada, carga e temperatura elevadas), um óleo com viscosidade ISO VG 320 é recomendado para garantir um filme lubrificante adequado.</p>`;
    };
    
    window.interpretarAnalise = function() {
        const visc = parseFloat(document.getElementById('visc-atual').value) || 0;
        const agua = parseFloat(document.getElementById('agua-atual').value) || 0;
        const ferro = parseFloat(document.getElementById('ferro-atual').value) || 0;
        const tan = parseFloat(document.getElementById('tan-atual').value) || 0;
        let acoes = [];
        
        if (visc > 320 * 1.15) acoes.push('🔴 Viscosidade alta (>15%): pode indicar oxidação ou contaminação. Trocar óleo.');
        if (agua > 500) acoes.push('🔴 Contaminação por água severa (>500ppm): Verificar vedações e fonte de umidade. Trocar óleo.');
        if (ferro > 100) acoes.push('🔴 Desgaste severo (Ferro >100ppm): Investigar desalinhamento, desbalanceamento ou sobrecarga. Pode ser necessário reparo.');
        if (tan > 1.5) acoes.push('🔴 Acidez alta (TAN > 1.5): Óleo oxidado, risco de corrosão. Trocar óleo imediatamente.');

        const resultado = document.getElementById('interpretacao-analise');
        resultado.style.display = 'block';
        if (acoes.length > 0) {
            resultado.innerHTML = `<h5>🔬 Diagnóstico e Ação</h5><ul>${acoes.map(a => `<li>${a}</li>`).join('')}</ul>`;
        } else {
            resultado.innerHTML = '<div class="feedback-correto">✅ Laudo OK. Níveis dentro dos limites aceitáveis. Continuar monitorando.</div>';
        }
    };
    
    window.calcularIntervaloLubrificacao = () => {
        const rpm = parseFloat(document.getElementById('rpm-rolamento').value) || 1;
        const diametro = parseFloat(document.getElementById('diametro-rolamento').value) || 1;
        const f_temp = parseFloat(document.getElementById('temperatura-trabalho').value);
        const f_cont = parseFloat(document.getElementById('ambiente-contaminacao').value);
        const f_umid = parseFloat(document.getElementById('umidade-ambiente').value);
        const f_orie = parseFloat(document.getElementById('orientacao-eixo').value);
        
        // Fórmula simplificada de referência (FAG/SKF)
        const K = 10000000; // Constante empírica
        const intervalo = (K / (rpm * Math.sqrt(diametro)) - 4 * diametro) * f_temp * f_cont * f_umid * f_orie;

        const resultado = document.getElementById('resultado-intervalo');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>⏱️ Intervalo de Relubrificação</h5><div class="resultado-item destaque">Aproximadamente ${Math.round(intervalo)} horas de operação.</div>`;
    };

    window.calcularVidaUtil = () => {
        const C = parseFloat(document.getElementById('carga-dinamica').value) || 1;
        const P = parseFloat(document.getElementById('carga-aplicada').value) || 1;
        const vel = parseFloat(document.getElementById('velocidade-vida').value) || 1;
        const horasDia = parseFloat(document.getElementById('horas-operacao-dia').value) || 1;
        
        if (P === 0) return;
        
        // p=3 para rolamentos de esferas (comum em motores)
        const p = 3;
        const L10_milhoes_rev = Math.pow(C / P, p);
        const L10h = (L10_milhoes_rev * 1000000) / (vel * 60);
        const vida_anos = L10h / (horasDia * 365);

        const resultado = document.getElementById('resultado-vida-util');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>🧮 Vida Útil L₁₀</h5>
            <div class="resultado-item">Vida em horas (L₁₀h): ${Math.round(L10h).toLocaleString('pt-BR')} horas</div>
            <div class="resultado-item destaque">Vida em anos: ${vida_anos.toFixed(1)} anos</div>`;
    };

    // Módulo 10
    window.avaliarInspecaoPneumatica = () => {
        const resultado = document.getElementById('resultado-inspecao-pneumatica');
        const checkboxes = document.querySelectorAll('.checklist-pneumatico input:checked');
        resultado.style.display = 'block';
        if (checkboxes.length > 0) {
            resultado.innerHTML = `<div class="feedback-correto">Checklist avaliado. Lembre-se: a qualidade do ar comprimido (seco e limpo) é tão importante quanto a condição mecânica do compressor.</div>`;
        } else {
             resultado.innerHTML = `<div class="feedback-incorreto">Marque os itens inspecionados para avaliar.</div>`;
        }
    };

    window.calcularCustoVazamento = function() {
        const pressao = parseFloat(document.getElementById('pressao-sistema').value) || 7;
        const diametro = parseFloat(document.getElementById('diametro-furo').value) || 3;
        const horas = (parseFloat(document.getElementById('horas-operacao').value) || 0) * 365; // Anual
        const custoM3 = parseFloat(document.getElementById('custo-ar').value) || 0.12;

        // Fórmula de engenharia aproximada para vazão (m³/min)
        const vazao = 1.8 * Math.pow(diametro, 2) * (pressao + 1) / 100; // Ajustada
        const perdaAnualM3 = vazao * 60 * horas;
        const custoAnual = perdaAnualM3 * custoM3;

        const resultado = document.getElementById('resultado-custo-vazamento');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💸 Análise de Perda Anual</h5>
            <div class="resultado-item">Perda de ar: ${Math.round(perdaAnualM3).toLocaleString('pt-BR')} m³/ano</div>
            <div class="resultado-item destaque">Custo do Vazamento: R$ ${custoAnual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/ano</div>`;
    };

    // Módulo 11
    window.calcularVidaFadiga = () => {
        const resultado = document.getElementById('resultado-vida-fadiga');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>⏱️ Análise de Fadiga (Simplificada)</h5><p>Com base nos dados, a vida útil estimada está dentro do esperado para o projeto. Recomenda-se inspeção por ultrassom ou líquido penetrante a cada 2 anos para detectar trincas incipientes, especialmente por se tratar de Aço Carbono.</p>`;
    };
    
    window.calcularRiscoEstrutural = () => {
        const idade = parseFloat(document.getElementById('idade-estrutura').value);
        const carga = parseFloat(document.getElementById('carga-operacional').value);
        const ambiente = parseFloat(document.getElementById('ambiente-agressividade').value);
        const manutencao = parseFloat(document.getElementById('manutencao-qualidade').value);
        
        // Uma má manutenção (nota baixa) aumenta o risco
        const risco = (idade * 0.3) + ((carga / 10) * 0.3) + (ambiente * 0.2) + ((6 - manutencao) * 0.2);
        
        let classificacao = '';
        if (risco > 7) classificacao = '🔴 ALTO RISCO - Requer inspeção especializada imediata.';
        else if (risco > 4) classificacao = '🟡 RISCO MODERADO - Agendar inspeção detalhada.';
        else classificacao = '🟢 BAIXO RISCO - Manter plano de inspeção padrão.';

        const resultado = document.getElementById('resultado-risco-estrutural');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>⚖️ Nível de Risco Estrutural</h5><div class="resultado-item destaque">${classificacao} (Pontuação: ${risco.toFixed(1)})</div>`;
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
        const numPontos = Math.floor((tempo * 60) / 15); // 15 min por ponto de inspeção
        const resultado = document.getElementById('rota-gerada');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>🗺️ Rota de Inspeção Sugerida</h5>
            <p>Com <strong>${tempo} horas</strong>, é possível inspecionar aproximadamente <strong>${numPontos} pontos</strong> críticos.</p>
            <p><strong>Exemplo de Rota Priorizada por Criticidade:</strong></p>
            <ol><li>Motores Críticos da Linha 1 (Vibração/Temp)</li><li>Bombas de Água de Processo (Vazamento/Pressão)</li><li>Redutores Principais (Nível de óleo/Temp)</li><li>Painéis Elétricos de Alta Tensão (Termografia)</li></ol>
        `;
    };
    
    window.calcularKPIsAvancados = function() {
        const horasOp = parseFloat(document.getElementById('horas-operacao-mes').value) || 1;
        const tempoReparo = parseFloat(document.getElementById('tempo-reparo-total').value) || 0;
        const falhasMes = parseFloat(document.getElementById('falhas-mes').value) || 1;
        
        if (falhasMes === 0) {
             document.getElementById('resultado-kpis-avancados').innerHTML = `<div class="feedback-correto">Sem falhas no período! MTBF e Disponibilidade tendem a infinito (excelente).</div>`;
             document.getElementById('resultado-kpis-avancados').style.display = 'block';
             return;
        }

        const mtbf = (horasOp - tempoReparo) / falhasMes;
        const mttr = tempoReparo / falhasMes;
        const disponibilidade = (mtbf / (mtbf + mttr)) * 100;
        
        const resultado = document.getElementById('resultado-kpis-avancados');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>📊 KPIs de Confiabilidade</h5>
            <div class="resultado-item"><strong>MTBF (Tempo Médio Entre Falhas):</strong> ${mtbf.toFixed(1)} horas</div>
            <div class="resultado-item"><strong>MTTR (Tempo Médio Para Reparo):</strong> ${mttr.toFixed(1)} horas</div>
            <div class="resultado-item destaque"><strong>Disponibilidade Inerente:</strong> ${disponibilidade.toFixed(2)}%</div>`;
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
        const ganhoEstoque = estoqueAtual * reducaoEstoque; // Ganho único no 1º ano
        const ganhoAnualTotal = ganhoParadas - custoAnual;
        
        if (investimentoTotal === 0) {
            document.getElementById('resultado-roi-programa').innerHTML = `<div class="feedback-incorreto">Insira o valor do investimento para calcular o ROI.</div>`;
            document.getElementById('resultado-roi-programa').style.display = 'block';
            return;
        }

        const roi = ((ganhoParadas + ganhoEstoque - investimentoTotal - custoAnual) / (investimentoTotal)) * 100;

        const resultado = document.getElementById('resultado-roi-programa');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💰 Análise de ROI do Programa</h5>
            <div class="resultado-item">Investimento Inicial: R$ ${investimentoTotal.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Custo Anual do Programa: R$ ${custoAnual.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Ganho Anual (Redução de Paradas): R$ ${ganhoParadas.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Ganho Único (Redução de Estoque): R$ ${ganhoEstoque.toLocaleString('pt-BR')}</div>
            <div class="resultado-item destaque">ROI (Primeiro Ano): ${roi.toFixed(1)}%</div>
            <div class="resultado-item">Ganho Líquido Anual (Após 1º ano): R$ ${ganhoAnualTotal.toLocaleString('pt-BR')}</div>
            `;
    };

    window.expandirFase = function(fase) {
        const ferramentas = {
            plan: { titulo: '📋 Ferramentas de Planejamento (PLAN)', itens: ['Análise de Criticidade (ABC)', 'Análise de Modos de Falha (FMEA)', 'Diagrama de Ishikawa (Causa e Efeito)', '5W2H (Plano de Ação)'] },
            do: { titulo: '⚡ Ferramentas de Execução (DO)', itens: ['Procedimentos Operacionais Padrão (POP)', 'Checklists de Inspeção', 'Ordens de Serviço (OS)', 'Treinamento Prático'] },
            check: { titulo: '🔍 Ferramentas de Verificação (CHECK)', itens: ['Indicadores de Performance (KPIs)', 'Gráficos de Controle', 'Análise de Tendências', 'Auditorias de Processo'] },
            act: { titulo: '🎯 Ferramentas de Ação (ACT)', itens: ['Análise de Causa Raiz (RCA)', 'Lições Aprendidas', 'Padronização de Melhorias', 'Benchmarking'] }
        };
        const ferramenta = ferramentas[fase];
        const container = document.getElementById('ferramentas-fase');
        container.style.display = 'block';
        container.innerHTML = `<h4>${ferramenta.titulo}</h4><ul>${ferramenta.itens.map(item => `<li>${item}</li>`).join('')}</ul>`;
    };

    // =================================================================================
    // SISTEMA DE QUIZ E CERTIFICAÇÃO (MÓDULO 13) - JÁ ESTAVA FUNCIONAL
    // =================================================================================
    
    // --- Variáveis e Funções para o Certificado ---
    const LOGO_BASE64 = null; // IMPORTANTE: Substitua null pela string base64 do seu logo

    function formatarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length === 11) {
            return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cpf;
    }

    const perguntas = [
        { pergunta: "Qual tipo de manutenção age somente após a ocorrência da falha?", opcoes: ["Preditiva", "Preventiva", "Corretiva", "Detectiva"], resposta: "Corretiva" },
        { pergunta: "A inspeção que utiliza termografia e análise de vibração é classificada como:", opcoes: ["Sensitiva", "Corretiva", "Instrumentada", "Autônoma"], resposta: "Instrumentada" },
        { pergunta: "Qual o principal objetivo de um checklist de inspeção bem estruturado?", opcoes: ["Aumentar o tempo da inspeção", "Garantir a padronização e a qualidade da inspeção", "Substituir a necessidade de um inspetor qualificado", "Gerar mais papelada para a manutenção"], resposta: "Garantir a padronização e a qualidade da inspeção" },
        { pergunta: "Um registro de inspeção com a anotação 'Vibração: 2.8 mm/s (+0.3 vs sem. ant)' é um exemplo de:", opcoes: ["Registro ruim e vago", "Registro quantitativo e com análise de tendência", "Registro desnecessariamente complexo", "Registro de manutenção corretiva"], resposta: "Registro quantitativo e com análise de tendência" },
        { pergunta: "Vibração excessiva em 1x a frequência de rotação (1x RPM) é um sintoma clássico de qual falha?", opcoes: ["Falha de rolamento", "Desgaste de engrenagem", "Desalinhamento", "Desbalanceamento"], resposta: "Desbalanceamento" },
        { pergunta: "Qual ferramenta é mais eficaz para detectar um ponto quente em um disjuntor de um painel elétrico?", opcoes: ["Analisador de vibração", "Estetoscópio mecânico", "Câmera termográfica", "Alicate amperímetro"], resposta: "Câmera termográfica" },
        { pergunta: "A contaminação por água e partículas de ferro em uma amostra de óleo de um redutor indica:", opcoes: ["Operação normal do equipamento", "Necessidade de aumentar a velocidade", "Desgaste interno e provável falha de vedação", "Que o óleo é de boa qualidade"], resposta: "Desgaste interno e provável falha de vedação" },
        { pergunta: "O ciclo PDCA (Plan-Do-Check-Act) é uma ferramenta para:", opcoes: ["Calcular o custo de uma falha", "Apenas planejar a manutenção", "Promover a melhoria contínua dos processos", "Desmontar um equipamento"], resposta: "Promover a melhoria contínua dos processos" },
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
                docInput.maxLength = 20; // Ajuste conforme necessário
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
            alert("Erro: A biblioteca para gerar PDF não foi carregada. Verifique sua conexão com a internet.");
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
                const imgWidth = 50;
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                doc.addImage(LOGO_BASE64, 'PNG', 20, 15, imgWidth, imgHeight);
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
            
            let documentoTextoParaCertificado = '';
            if (pais === 'angola') {
                documentoTextoParaCertificado = `portador(a) do BI nº ${documento},`;
            } else {
                documentoTextoParaCertificado = `portador(a) do CPF nº ${formatarCPF(documento)},`;
            }
            
            doc.text(`${documentoTextoParaCertificado} concluiu com aproveitamento o curso de`, 148.5, 87, { align: "center" });
            
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
            const conteudos = [
                "Introdução e Tipos de Inspeção (Preventiva, Preditiva)", "Inspeção Sensitiva e Instrumentada (Termografia, Vibração)",
                "Procedimentos Padrão e Checklists", "Registro e Análise de Dados de Inspeção",
                "Análise de Falhas Mecânicas (Rolamentos, Acoplamentos)", "Análise de Falhas Elétricas (Motores, Painéis)",
                "Ferramentas Avançadas (Ultrassom, Análise de Óleo)", "Desgaste, Lubrificação e Vida Útil de Componentes",
                "Inspeção de Sistemas Pneumáticos e Hidráulicos", "Inspeção Estrutural e de Segurança", "Criação de Planos de Inspeção e Melhoria Contínua"
            ];
            
            const col1 = conteudos.slice(0, 6);
            const col2 = conteudos.slice(6);
            let yPos = 132;
            col1.forEach(item => { doc.text(`• ${item}`, 20, yPos); yPos += 6; });
            yPos = 132;
            col2.forEach(item => { doc.text(`• ${item}`, 155, yPos); yPos += 6; });
    
            const agora = new Date();
            const dataHoraFormatada = agora.toLocaleString('pt-BR', { 
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
    
            doc.setFontSize(12);
            doc.line(90, 185, 205, 185);
            doc.setFont("helvetica", "bold");
            doc.text("Jonathan da Silva Oliveira - Instrutor", 147.5, 190, { align: "center" });
            
            doc.setFont("helvetica", "normal");
            doc.text(`Emitido em: ${dataHoraFormatada}`, 147.5, 197, { align: "center" });
            
            doc.save(`Certificado - Inspeção Industrial - ${nome}.pdf`);
        } catch(e) {
            console.error("Erro ao gerar PDF:", e);
            alert("Ocorreu um erro ao gerar o certificado. Verifique o console para mais detalhes.");
        }
    }

    function checkAndInitQuiz() {
        if (currentModuleIndex === totalModules - 1) { // Último módulo
            setTimeout(iniciarQuiz, 500);
        }
    }
    
    // Inicialização da página
    showModule(0);
});
