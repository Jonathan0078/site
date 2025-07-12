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
        { pergunta: "Para que serve a inspeção em ambientes industriais?", opcoes: ["Para garantir que a máquina fique desligada.", "Para acelerar a produção.", "Para detectar sinais de falhas antes que causem paradas.", "Para aumentar o custo da manutenção."], resposta: "Para detectar sinais de falhas antes que causem paradas." },
        { pergunta: "Qual o objetivo da inspeção preditiva?", opcoes: ["Apenas observar se a máquina está fazendo barulho.", "Analisar dados reais para prever falhas futuras.", "Agir somente quando a máquina já quebrou.", "Realizar visitas aleatórias."], resposta: "Analisar dados reais para prever falhas futuras." },
        { pergunta: "Qual ferramenta detecta vazamentos que o ouvido humano não capta?", opcoes: ["Analisador de Vibração", "Termografia", "Inspeção por Ultrassom", "Análise de óleo"], resposta: "Inspeção por Ultrassom" },
        { pergunta: "Qual é a principal defesa contra o desgaste de componentes mecânicos?", opcoes: ["Aumento da velocidade.", "Lubrificação correta.", "Uso de materiais mais leves.", "Diminuir inspeções."], resposta: "Lubrificação correta." },
        { pergunta: "No caso do motor com vibração anormal, qual a ação correta?", opcoes: ["Ignorar o problema.", "Anotar para verificar na próxima semana.", "Acionar análise de vibração no mesmo dia.", "Esperar a vibração aumentar."], resposta: "Acionar análise de vibração no mesmo dia." },
        { pergunta: "Qual ferramenta permite ver dentro de máquinas sem desmontar?", opcoes: ["Analisador de Vibração", "Boroscópio (Câmera de Inspeção)", "Ultrassom Industrial", "Medidor de Espessura"], resposta: "Boroscópio (Câmera de Inspeção)" },
        { pergunta: "Qual o impacto de vazamentos de ar comprimido?", opcoes: ["Aumento da força.", "Redução do consumo de energia.", "Aumento do consumo de energia do compressor.", "Melhora na eficiência."], resposta: "Aumento do consumo de energia do compressor." },
        { pergunta: "Qual o objetivo de um Plano de Inspeção?", opcoes: ["Aumentar o tempo de parada.", "Organizar e padronizar as inspeções.", "Inspecionar apenas quando a máquina falha.", "Reduzir a calibração de ferramentas."], resposta: "Organizar e padronizar as inspeções." },
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
        p.opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.textContent = opcao;
            btn.onclick = () => verificarResposta(opcao, p.resposta);
            opcoesQuizEl.appendChild(btn);
        });
    }

    function verificarResposta(opcaoSelecionada, respostaCorreta) {
        const acertou = (opcaoSelecionada === respostaCorreta);
        if (acertou) pontuacao++;
        document.getElementById('feedback').textContent = acertou ? '✅ Correto!' : '❌ Incorreto.';
        document.querySelectorAll('#opcoes-quiz button').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === respostaCorreta) btn.classList.add('correta');
            else if (btn.textContent === opcaoSelecionada) btn.classList.add('incorreta');
        });
        setTimeout(() => {
            perguntaAtual++;
            if (perguntaAtual < perguntas.length) mostrarPergunta();
            else finalizarQuiz();
        }, 1500);
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
    if (document.getElementById('gerar-certificado-btn')) {
        document.getElementById('gerar-certificado-btn').addEventListener('click', () => {
            const nome = document.getElementById('nome-aluno').value.trim();
            const documento = document.getElementById('documento-aluno').value.trim();
            const pais = document.getElementById('pais-aluno').value;
            if (nome && documento) gerarCertificadoPDF(nome, documento, pais);
            else alert('Por favor, preencha todos os campos!');
        });
    }

    function gerarCertificadoPDF(nome, documento, pais) {
        if (!jsPDF) {
            alert("Erro: A biblioteca para gerar PDF não foi carregada. Verifique sua conexão com a internet.");
            return;
        }
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.text('Certificamos que', 148.5, 40, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(nome.toUpperCase(), 148.5, 55, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text(`concluiu com êxito o Curso de Inspeção de Máquinas Industriais.`, 148.5, 70, { align: 'center' });
        doc.text(`${pais === 'brasil' ? 'CPF' : 'BI'}: ${documento}`, 148.5, 80, { align: 'center' });
        doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 100, { align: 'center' });
        doc.save(`Certificado_${nome.replace(/\s+/g, '_')}.pdf`);
    }

    function checkAndInitQuiz() {
        if (currentModuleIndex === 12) { // Módulo 13 é o índice 12
            setTimeout(iniciarQuiz, 500);
        }
    }
    
    // Inicialização da página
    showModule(0);
});
