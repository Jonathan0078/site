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
        if (floatingNav) {
            floatingNav.style.display = (currentModuleIndex === totalModules - 1) ? 'none' : 'flex';
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
            if (tipo === 'preventiva') message = '✅ Correto! Manutenção preventiva baseada em tempo.';
            else if (tipo === 'preditiva') message = '✅ Correto! Manutenção preditiva baseada em condição.';
            else if (tipo === 'corretiva') message = '✅ Correto! Manutenção corretiva após a falha.';
            if (feedback) {
                feedback.innerHTML = `<div class="feedback-correto">${message}</div>`;
                feedback.style.display = 'block';
            }
        }

        // Módulo 2: Inspeção Sensitiva
        if (target.classList.contains('sentido-btn')) {
            const sentido = target.dataset.sentido;
            const detalhes = document.getElementById('detalhes-sentido');
            const conteudo = {
                visao: `<h5>👀 Inspeção Visual</h5><ul><li>🔍 Vazamentos de óleo, graxa ou fluidos</li><li>🔩 Parafusos soltos ou faltando</li><li>⚡ Cabos elétricos danificados</li><li>🌡️ Sinais de aquecimento (descoloração)</li><li>💨 Acúmulo de sujeira ou corrosão</li></ul><div class="dica-pratica">💡 Dica: Use lanterna e espelho para áreas difíceis</div>`,
                audicao: `<h5>👂 Inspeção Auditiva</h5><ul><li>🔊 Ruídos metálicos (desgaste)</li><li>📳 Vibração anormal</li><li>💨 Vazamentos de ar (assovio)</li><li>⚡ Arco elétrico (crepitação)</li><li>🔧 Batidas ou impactos</li></ul><div class="dica-pratica">💡 Dica: Use estetoscópio mecânico para amplificar</div>`,
                tato: `<h5>✋ Inspeção Tátil</h5><ul><li>🌡️ Temperatura anormal (dorso da mão)</li><li>📳 Vibração excessiva</li><li>🔧 Folgas em conexões</li><li>💧 Umidade ou vazamentos</li><li>⚡ Aquecimento em cabos</li></ul><div class="alerta-seguranca">⚠️ ATENÇÃO: Nunca toque em partes energizadas!</div>`,
                olfato: `<h5>👃 Inspeção Olfativa</h5><ul><li>🔥 Cheiro de queimado (superaquecimento)</li><li>⚡ Ozônio (arco elétrico)</li><li>🛢️ Óleo deteriorado (acidez)</li><li>🧪 Produtos químicos (vazamentos)</li><li>🦨 Gases tóxicos</li></ul><div class="dica-pratica">💡 Dica: O nariz detecta problemas antes dos instrumentos</div>`,
                intuicao: `<h5>❤️ Intuição e Experiência</h5><ul><li>🧠 "Algo não está normal"</li><li>📊 Padrões de comportamento</li><li>🕐 Correlação temporal</li><li>🔍 Detalhes que "chamam atenção"</li><li>📈 Tendências observadas</li></ul><div class="dica-pratica">💡 Dica: Confie na experiência, mas sempre confirme com dados</div>`
            };
            if (detalhes) detalhes.innerHTML = conteudo[sentido] || '';
        }

        // Módulo 2: Simulador de Escolha
        if (target.classList.contains('opcao-sim')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-simulador');
            if (resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Escolha correta! Análise de vibração combinada com termografia é ideal para detectar a causa raiz.</div>` : `<div class="feedback-incorreto">❌ Essa abordagem pode não ser suficiente. Para um motor crítico, é necessária uma análise mais detalhada.</div>`;
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
                feedback.innerHTML = correto ? `<div class="feedback-correto">✅ Correto! Segurança em primeiro lugar sempre.</div>` : `<div class="feedback-incorreto">❌ Procedimento inadequado e perigoso.</div>`;
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
                feedback.innerHTML = correta ? `<div class="feedback-correto">✅ Decisão correta! Minimizando riscos e custos.</div>` : `<div class="feedback-incorreto">❌ Abordagem arriscada. Veja as consequências.</div>`;
            }
            if (consequencias) consequencias.style.display = 'block';
        }
        
        // Módulo 6: Simulador de Diagnóstico
        if (target.classList.contains('opcao-diag')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-diagnostico');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Diagnóstico correto! Vibração em 1x RPM com aquecimento é característico de desbalanceamento.</div>` : `<div class="feedback-incorreto">❌ Diagnóstico incorreto. Revise os sinais.</div>`;
            }
        }
        
        // Módulo 7: Simulador de Termografia
        if (target.classList.contains('opcao-termo')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-termografia');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Análise correta! Um delta de 50°C é crítico.</div>` : `<div class="feedback-incorreto">❌ Análise incorreta. Uma diferença tão grande de temperatura nunca é normal.</div>`;
            }
        }

        // Módulo 10: Detector de Vazamentos
        if (target.classList.contains('opcao-deteccao')) {
            const metodo = target.dataset.metodo;
            const eficacia = parseInt(target.dataset.eficacia, 10);
            const resultado = document.getElementById('resultado-deteccao');
            const metodos = {
                ultrassom: 'Ideal para localização exata em ambientes ruidosos.',
                espuma: 'Confirma o local exato do vazamento visualmente, mas é mais demorado.'
            };
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = `<div class="resultado-deteccao"><h5>🎯 Método: ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}</h5><div class="eficacia-metodo">Eficácia: ${eficacia}%</div><div class="explicacao-metodo">${metodos[metodo]}</div></div>`;
            }
        }
        
        // Módulo 11: Inspeção Estrutural
        if (target.classList.contains('opcao-estrutural')) {
            const correto = target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-estrutural');
            if(resultado) {
                resultado.style.display = 'block';
                resultado.innerHTML = correto ? `<div class="feedback-correto">✅ Decisão CORRETA! A segurança da vida humana é a prioridade máxima.</div>` : `<div class="feedback-incorreto">❌ Decisão PERIGOSA! Nunca se deve subestimar uma falha estrutural.</div>`;
            }
        }
    });

    // =================================================================================
    // FUNÇÕES GLOBAIS (ACESSÍVEIS VIA ONCLICK)
    // =================================================================================
    
    // Módulo 1: Calculadora de Economia
    window.calcularEconomia = function() {
        const custoParada = parseFloat(document.getElementById('custo-parada').value) || 0;
        const paradasAno = parseFloat(document.getElementById('paradas-ano').value) || 0;
        const reducaoPercent = parseFloat(document.getElementById('reducao-percent').value) || 0;
        const custoAtual = custoParada * paradasAno;
        const economiaAnual = custoAtual * (reducaoPercent / 100);
        const resultado = document.getElementById('resultado-economia');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💰 Resultado da Análise</h5><div class="resultado-item">Custo atual: R$ ${custoAtual.toLocaleString('pt-BR')}</div><div class="resultado-item destaque">Economia anual: R$ ${economiaAnual.toLocaleString('pt-BR')}</div>`;
    };

    // Módulo 3: Checklist de Preparação
    window.verificarChecklist = function() {
        const checkboxes = document.querySelectorAll('.checklist-items input[type="checkbox"]');
        const marcados = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const percentage = total > 0 ? (marcados / total) * 100 : 0;
        const feedback = document.getElementById('feedback-checklist');
        let message = '';
        if (percentage === 100) message = '🎯 Excelente! Preparação completa.';
        else if (percentage >= 80) message = '✅ Boa preparação! Verifique os itens restantes.';
        else message = '⚠️ Preparação incompleta. Revise os itens não marcados.';
        feedback.style.display = 'block';
        feedback.innerHTML = `<div class="resultado-preparacao"><div>Preparação: ${percentage.toFixed(0)}%</div><div>${message}</div></div>`;
    };
    
    // Módulo 3: Gerador de Checklist Personalizado
    window.gerarChecklist = function() {
        const tipo = document.getElementById('tipo-equipamento').value;
        const criticidade = document.getElementById('criticidade-eq').value;
        const ambiente = document.getElementById('ambiente-eq').value;
        const checklists = { motor: { basicos: ['Vibração geral', 'Temperatura mancais', 'Ruído anormal'], criticos: ['Análise de vibração', 'Termografia'], ambienteAgressivo: ['Corrosão', 'Vedações'] }, bomba: { basicos: ['Vazamentos', 'Vibração', 'Pressão'], criticos: ['Selo mecânico', 'Alinhamento'], ambienteAgressivo: ['Corrosão', 'Erosão'] }, redutor: { basicos: ['Nível de óleo', 'Vazamentos', 'Temperatura'], criticos: ['Análise de óleo', 'Análise de vibração'], ambienteAgressivo: ['Vedações', 'Respiros'] }, compressor: { basicos: ['Pressão', 'Temperatura', 'Vazamentos'], criticos: ['Análise de vibração', 'Válvulas'], ambienteAgressivo: ['Filtros de ar'] } };
        const checklist = checklists[tipo] || checklists.motor;
        const itens = [...checklist.basicos];
        if (criticidade === 'critica' || criticidade === 'alta') itens.push(...(checklist.criticos || []));
        if (ambiente === 'agressivo') itens.push(...(checklist.ambienteAgressivo || []));
        const resultado = document.getElementById('checklist-gerado');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>📋 Checklist para ${tipo.replace('-', ' ')}</h5><ul>${itens.map(item => `<li>✓ ${item}</li>`).join('')}</ul>`;
    };
    
    // Módulo 4: Análise de Tendências
    window.atualizarGrafico = function() {
        const parametro = document.getElementById('parametro-grafico').value;
        const periodo = document.getElementById('periodo-grafico').value;
        const resultadoEl = document.getElementById('interpretacao-grafico');
        const interpretacoes = { temperatura: 'Tendência crescente indica possível problema de lubrificação.', vibracao: 'Picos indicam desbalanceamento. Tendência crescente sugere desgaste.', corrente: 'Variações podem indicar problemas mecânicos ou elétricos.' };
        resultadoEl.style.display = 'block';
        resultadoEl.innerHTML = `<div class="interpretacao-grafico"><h6>📊 Análise de ${parametro} - ${periodo} dias</h6><p>${interpretacoes[parametro]}</p><div class="grafico-placeholder" style="background: #f8f9fa; padding: 2rem; border: 2px dashed #dee2e6; text-align: center; margin: 1rem 0;">📈 [Gráfico simulado de ${parametro}]</div></div>`;
    };
    
    // Módulo 7: Análise de Corrente (MCSA)
    window.calcularDesequilibrio = function() {
        const r = 28.5, s = 31.2, t = 29.8; // Valores fixos do exemplo
        const correntes = [r, s, t];
        const maxVal = Math.max(...correntes);
        const minVal = Math.min(...correntes);
        const media = (r + s + t) / 3;
        const desequilibrio = media > 0 ? ((maxVal - minVal) / media) * 100 : 0;
        let classificacao = '';
        if (desequilibrio <= 2) classificacao = '🟢 Normal';
        else if (desequilibrio <= 5) classificacao = '🟡 Atenção';
        else classificacao = '🔴 Crítico';
        const resultado = document.getElementById('classificacao-desequilibrio');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.innerHTML = `<div class="resultado-desequilibrio"><div>Desequilíbrio: ${desequilibrio.toFixed(1)}%</div><div>Classificação: ${classificacao}</div></div>`;
        }
    };
    
    // Módulo 8: Seleção da Ferramenta Ideal
    window.recomendarFerramenta = function() {
        const orcamento = document.getElementById('orcamento-sel').value;
        let recomendacao = '';
        if (orcamento === 'baixo') recomendacao = '📳 Medidor de vibração básico + Termômetro infravermelho';
        else if (orcamento === 'medio') recomendacao = '📸 Câmera termográfica + Detector ultrassônico';
        else recomendacao = '🚀 Suite completa: Analisador de vibração FFT + Termografia + Ultrassom';
        const resultado = document.getElementById('recomendacao-ferramenta');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.innerHTML = `<div class="recomendacao-personalizada"><h5>🎯 Recomendação</h5><div class="resultado-item destaque">${recomendacao}</div></div>`;
        }
    };

    // Módulo 9: Interpretador de Análise de Óleo
    window.interpretarAnalise = function() {
        const agua = parseFloat(document.getElementById('agua-atual').value) || 0;
        const ferro = parseFloat(document.getElementById('ferro-atual').value) || 0;
        let acoes = [];
        if (agua > 500) acoes.push('⚠️ Contaminação por água detectada. Verificar vedações.');
        if (ferro > 100) acoes.push('🚨 Desgaste acentuado de componentes ferrosos. Investigar causa.');
        const resultado = document.getElementById('interpretacao-analise');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.innerHTML = `<div class="interpretacao-completa"><h5>🔬 Interpretação</h5>${acoes.length > 0 ? `<ul>${acoes.map(a => `<li>${a}</li>`).join('')}</ul>` : '<p>✅ Níveis de contaminação dentro dos limites aceitáveis.</p>'}</div>`;
        }
    };
    
    // Módulo 10: Custo de Vazamentos
    window.calcularCustoVazamento = function() {
        const pressao = parseFloat(document.getElementById('pressao-sistema').value) || 7;
        const diametro = parseFloat(document.getElementById('diametro-furo').value) || 3;
        const custoAr = parseFloat(document.getElementById('custo-ar').value) || 0.12;
        // Fórmula simplificada para estimativa
        const perdaAnual = (diametro * diametro * pressao * 1000).toFixed(2);
        const resultado = document.getElementById('resultado-custo-vazamento');
        resultado.style.display = 'block';
        resultado.innerHTML = `<h5>💸 Análise de Perda</h5><div class="resultado-item destaque">Custo anual estimado: R$ ${perdaAnual.replace('.',',')}</div><div class="resultado-item">Reparar este vazamento pode gerar uma economia significativa.</div>`;
    };

    // Módulo 12: Calculadora de Criticidade ABC
    window.calcularCriticidade = function() {
        const impacto = parseFloat(document.getElementById('impacto-producao').value) || 0;
        const seguranca = parseFloat(document.getElementById('impacto-seguranca').value) || 0;
        const custo = parseFloat(document.getElementById('custo-manutencao').value) || 0;
        const criticidade = (impacto * 0.5) + (seguranca * 0.3) + (custo * 0.2);
        let classificacao = '';
        if (criticidade >= 8) classificacao = '🔴 A - CRÍTICO';
        else if (criticidade >= 5) classificacao = '🟠 B - IMPORTANTE';
        else classificacao = '🟢 C - NORMAL';
        const resultado = document.getElementById('resultado-criticidade');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.innerHTML = `<div class="banner-resultado"><h5>🎯 Classificação</h5><div><strong>Classificação:</strong> ${classificacao}</div></div>`;
        }
    };
    
    // Módulo 12: Gerador de Rotas
    window.gerarRota = function() {
        const area = document.getElementById('area-inspecao').value;
        const tempo = parseFloat(document.getElementById('tempo-disponivel').value) || 4;
        const numPontos = Math.floor(tempo / 0.25); // 15 min por ponto
        const resultado = document.getElementById('rota-gerada');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.innerHTML = `<div class="banner-resultado rota"><h5>🗺️ Rota de Inspeção</h5><div class="rota-info"><strong>Área:</strong> ${area}</div><div class="rota-info"><strong>Pontos a inspecionar:</strong> ~${numPontos}</div></div>`;
        }
    };
    
    // Módulo 12: Ciclo PDCA
    window.expandirFase = function(fase) {
        const ferramentas = {
            plan: { titulo: '📋 Ferramentas de Planejamento (PLAN)', itens: ['Diagrama de Pareto', 'Diagrama de Ishikawa', '5W2H'] },
            do: { titulo: '⚡ Ferramentas de Execução (DO)', itens: ['Procedimentos padrão', 'Treinamento prático', 'Dashboards'] },
            check: { titulo: '🔍 Ferramentas de Verificação (CHECK)', itens: ['Gráficos de controle', 'KPIs dashboard', 'Auditorias'] },
            act: { titulo: '🎯 Ferramentas de Ação (ACT)', itens: ['Lições aprendidas', 'Padronização de melhorias', 'Novos ciclos PDCA'] }
        };
        const ferramenta = ferramentas[fase];
        const container = document.getElementById('ferramentas-fase');
        container.style.display = 'block';
        container.innerHTML = `<div class="ferramentas-detalhes"><h4>${ferramenta.titulo}</h4><ul>${ferramenta.itens.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
    };


    // =================================================================================
    // SISTEMA DE QUIZ E CERTIFICAÇÃO (MÓDULO 13)
    // =================================================================================
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
                          
