
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
        modules[currentModuleIndex].classList.add('active');
        
        updateNavigationUI();
        window.scrollTo(0, 0);
    }

    function updateNavigationUI() {
        moduleIndicator.textContent = `${currentModuleIndex + 1} / ${totalModules}`;
        prevBtn.disabled = (currentModuleIndex === 0);
        nextBtn.disabled = (currentModuleIndex === totalModules - 1);
        
        if (currentModuleIndex === totalModules - 1) {
            floatingNav.style.display = 'none';
        } else {
            floatingNav.style.display = 'flex';
        }
    }

    prevBtn.addEventListener('click', () => showModule(currentModuleIndex - 1));
    nextBtn.addEventListener('click', () => showModule(currentModuleIndex + 1));

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 1
    // =================================================================================
    
    // Exercício de identificação de manutenção
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-exercicio')) {
            const tipo = e.target.dataset.tipo;
            const feedback = document.getElementById('feedback-exercicio-1');
            
            let message = '';
            if (tipo === 'preventiva') {
                message = '✅ Correto! Manutenção preventiva baseada em tempo.';
            } else if (tipo === 'preditiva') {
                message = '✅ Correto! Manutenção preditiva baseada em condição.';
            } else if (tipo === 'corretiva') {
                message = '✅ Correto! Manutenção corretiva após a falha.';
            }
            
            feedback.innerHTML = `<div class="feedback-correto">${message}</div>`;
        }
    });

    // Calculadora de economia
window.calcularEconomia = function() {
    const custoParada = parseFloat(document.getElementById('custo-parada').value) || 0;
    const paradasAno = parseFloat(document.getElementById('paradas-ano').value) || 0;
    const reducaoPercent = parseFloat(document.getElementById('reducao-percent').value) || 0;
    document.getElementById('valor-reducao').textContent = reducaoPercent + '%';
    const custoAtual = custoParada * paradasAno;
    const paradasReduzidas = paradasAno * (reducaoPercent / 100);
    const economiaAnual = paradasReduzidas * custoParada;
    const resultado = document.getElementById('resultado-economia');
    resultado.style.display = 'block';
    resultado.classList.add('mostrar');
    resultado.innerHTML = `
        <h5>💰 Resultado da Análise</h5>
        <div class="resultado-item">Custo atual: R$ ${custoAtual.toLocaleString('pt-BR')}</div>
        <div class="resultado-item">Paradas evitadas: ${paradasReduzidas.toFixed(1)} por ano</div>
        <div class="resultado-item destaque">Economia anual: R$ ${economiaAnual.toLocaleString('pt-BR')}</div>
        <div class="resultado-item">ROI potencial: ${((economiaAnual / 50000) * 100).toFixed(0)}% (invest. R$ 50.000)</div>
    `;
};

    // Oculta todos os banners de resultado ao carregar a página
    function ocultarResultados() {
        document.querySelectorAll('.resultado-calc, .resultado-gestao, .resultado-preparacao, .feedback-exercicio, .feedback-checklist, .feedback-correto, .feedback-incorreto, .resultado-item, .resultado-roi-detalhado, .resultado-prioridade, .resultado-desequilibrio, .interpretacao-grafico, .resultado-kpis, .resultado-problemas, .resultado-kpis-avancados, .rota-gerada, .resultado-criticidade').forEach(el => {
            if (el) {
                el.style.display = 'none';
                el.classList.remove('mostrar');
            }
        });
    }
    ocultarResultados();

    // Salvar reflexão
    window.salvarReflexao = function(id) {
        const texto = document.getElementById(id).value;
        if (texto.trim()) {
            alert('💾 Reflexão salva com sucesso!');
            localStorage.setItem(id, texto);
        } else {
            alert('⚠️ Por favor, escreva sua reflexão antes de salvar.');
        }
    };

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 2
    // =================================================================================
    
    // Explorar sentidos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('sentido-btn')) {
            const sentido = e.target.dataset.sentido;
            const detalhes = document.getElementById('detalhes-sentido');
            
            const conteudo = {
                visao: `
                    <h5>👀 Inspeção Visual</h5>
                    <ul>
                        <li>🔍 Vazamentos de óleo, graxa ou fluidos</li>
                        <li>🔩 Parafusos soltos ou faltando</li>
                        <li>⚡ Cabos elétricos danificados</li>
                        <li>🌡️ Sinais de aquecimento (descoloração)</li>
                        <li>💨 Acúmulo de sujeira ou corrosão</li>
                    </ul>
                    <div class="dica-pratica">💡 Dica: Use lanterna e espelho para áreas difíceis</div>
                `,
                audicao: `
                    <h5>👂 Inspeção Auditiva</h5>
                    <ul>
                        <li>🔊 Ruídos metálicos (desgaste)</li>
                        <li>📳 Vibração anormal</li>
                        <li>💨 Vazamentos de ar (assovio)</li>
                        <li>⚡ Arco elétrico (crepitação)</li>
                        <li>🔧 Batidas ou impactos</li>
                    </ul>
                    <div class="dica-pratica">💡 Dica: Use estetoscópio mecânico para amplificar</div>
                `,
                tato: `
                    <h5>✋ Inspeção Tátil</h5>
                    <ul>
                        <li>🌡️ Temperatura anormal (dorso da mão)</li>
                        <li>📳 Vibração excessiva</li>
                        <li>🔧 Folgas em conexões</li>
                        <li>💧 Umidade ou vazamentos</li>
                        <li>⚡ Aquecimento em cabos</li>
                    </ul>
                    <div class="alerta-seguranca">⚠️ ATENÇÃO: Nunca toque em partes energizadas!</div>
                `,
                olfato: `
                    <h5>👃 Inspeção Olfativa</h5>
                    <ul>
                        <li>🔥 Cheiro de queimado (superaquecimento)</li>
                        <li>⚡ Ozônio (arco elétrico)</li>
                        <li>🛢️ Óleo deteriorado (acidez)</li>
                        <li>🧪 Produtos químicos (vazamentos)</li>
                        <li>🦨 Gases tóxicos</li>
                    </ul>
                    <div class="dica-pratica">💡 Dica: O nariz detecta problemas antes dos instrumentos</div>
                `,
                intuicao: `
                    <h5>❤️ Intuição e Experiência</h5>
                    <ul>
                        <li>🧠 "Algo não está normal"</li>
                        <li>📊 Padrões de comportamento</li>
                        <li>🕐 Correlação temporal</li>
                        <li>🔍 Detalhes que "chamam atenção"</li>
                        <li>📈 Tendências observadas</li>
                    </ul>
                    <div class="dica-pratica">💡 Dica: Confie na experiência, mas sempre confirme com dados</div>
                `
            };
            
            detalhes.innerHTML = conteudo[sentido] || '';
        }
    });

    // Simulador de escolha
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-sim')) {
            const correto = e.target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-simulador');
            resultado.style.display = 'block';
            if (correto) {
                resultado.innerHTML = `
                    <div class="feedback-correto">
                        ✅ Escolha correta! Análise de vibração combinada com termografia é ideal para:
                        <ul>
                            <li>Detectar desbalanceamento (vibração 1x RPM)</li>
                            <li>Confirmar aquecimento nos mancais</li>
                            <li>Correlacionar dados mecânicos e térmicos</li>
                        </ul>
                    </div>
                `;
            } else {
                resultado.innerHTML = `
                    <div class="feedback-incorreto">
                        ❌ Essa abordagem pode não ser suficiente. Para um motor crítico com ruído crescente, é necessário análise mais detalhada para identificar a causa raiz.
                    </div>
                `;
            }
        }
    });

    // Simulador de gestão de prioridades (módulo 6)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-gestao')) {
            const custo = e.target.dataset.custo;
            const risco = e.target.dataset.risco;
            const resultado = document.getElementById('resultado-gestao');
            resultado.style.display = 'block';
            let feedback = '';
            if (risco === 'baixo') {
                feedback = `<div class='feedback-correto'>🛡️ Decisão segura! Todos os equipamentos serão analisados hoje. Risco de falha minimizado, maior custo imediato.</div>`;
            } else if (risco === 'medio') {
                feedback = `<div class='feedback-correto'>⚖️ Decisão equilibrada! A bomba crítica será priorizada, os demais serão inspecionados amanhã. Risco moderado, custo controlado.</div>`;
            } else {
                feedback = `<div class='feedback-incorreto'>💸 Decisão arriscada! Monitorar tudo pode gerar economia, mas aumenta o risco de falha grave e custos futuros.</div>`;
            }
            resultado.innerHTML = `
                <h5>Resultado da Decisão</h5>
                <div class="resultado-item">Custo imediato: R$ ${custo}</div>
                <div class="resultado-item">Risco: ${risco.toUpperCase()}</div>
                ${feedback}
            `;
        }
    });

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 3
    // =================================================================================
    
    // Verificar checklist
    // Função compatível com chamada inline (avaliarChecklist)
    window.avaliarChecklist = function() {
        const checkboxes = document.querySelectorAll('.checklist-items input[type="checkbox"]');
        const marcados = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const percentage = (marcados / total) * 100;
        const feedback = document.getElementById('feedback-checklist');
        let message = '';
        if (percentage === 100) {
            message = '🎯 Excelente! Preparação completa. Você está pronto para uma inspeção segura e eficaz.';
        } else if (percentage >= 80) {
            message = '✅ Boa preparação! Verifique os itens restantes antes de iniciar.';
        } else if (percentage >= 60) {
            message = '⚠️ Preparação incompleta. Revise os itens não marcados.';
        } else {
            message = '🚨 Preparação inadequada! Complete todos os itens antes de proceder.';
        }
        feedback.style.display = 'block';
        feedback.innerHTML = `
            <div class="resultado-preparacao">
                <div>Preparação: ${percentage.toFixed(0)}% (${marcados}/${total})</div>
                <div>${message}</div>
            </div>
        `;
    };

    // Avaliar procedimento
    window.avaliarProcedimento = function() {
        const freqSelecionada = document.querySelector('.opcao-freq.selected');
        const checkboxes = document.querySelectorAll('.checklist-construtor input[type="checkbox"]:checked');
        const criticos = Array.from(checkboxes).filter(cb => cb.dataset.item === 'critico').length;
        const normais = Array.from(checkboxes).filter(cb => cb.dataset.item === 'normal').length;
        
        const resultado = document.getElementById('resultado-procedimento');
        
        let score = 0;
        if (criticos >= 4) score += 60; // Itens críticos são mais importantes
        if (normais >= 2) score += 20;
        if (freqSelecionada) score += 20;
        
        let feedback = '';
        if (score >= 90) {
            feedback = '🎯 Procedimento excelente! Cobertura adequada dos pontos críticos.';
        } else if (score >= 70) {
            feedback = '✅ Bom procedimento! Adicione mais itens críticos se possível.';
        } else {
            feedback = '⚠️ Procedimento incompleto. Inclua mais pontos de inspeção críticos.';
        }
        
        resultado.innerHTML = `
            <div class="avaliacao-procedimento">
                <div>Score: ${score}/100</div>
                <div>Itens críticos: ${criticos}</div>
                <div>Itens normais: ${normais}</div>
                <div>${feedback}</div>
            </div>
        `;
    };

    // Seleção de frequência
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-freq')) {
            document.querySelectorAll('.opcao-freq').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });

    // ROI ferramentas
window.calcularROIFerramentas = function() {
    const investimento = parseFloat(document.getElementById('investimento-tools').value) || 0;
    const falhasEvitadas = parseFloat(document.getElementById('falhas-evitadas').value) || 0;
    const custoFalha = parseFloat(document.getElementById('custo-falha').value) || 0;
    const economiaAnual = falhasEvitadas * custoFalha;
    const roi = investimento > 0 ? ((economiaAnual - investimento) / investimento) * 100 : 0;
    const payback = economiaAnual > 0 ? investimento / economiaAnual : 0;
    const resultado = document.getElementById('resultado-roi-tools');
    resultado.style.display = 'block';
    resultado.classList.add('mostrar');
    resultado.innerHTML = `
        <h5>📊 Análise de ROI</h5>
        <div class="resultado-item">Investimento: R$ ${investimento.toLocaleString('pt-BR')}</div>
        <div class="resultado-item">Economia anual: R$ ${economiaAnual.toLocaleString('pt-BR')}</div>
        <div class="resultado-item destaque">ROI: ${roi.toFixed(1)}%</div>
        <div class="resultado-item">Payback: ${payback.toFixed(1)} anos</div>
    `;
};

    // Quiz de segurança
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-seg')) {
            const correto = e.target.dataset.correto === 'true';
            const feedback = document.getElementById('feedback-seguranca');
            
            if (correto) {
                feedback.innerHTML = `
                    <div class="feedback-correto">
                        ✅ Correto! Sempre comunique a operação, use EPIs adequados e certifique-se de ter autorização antes de trabalhar com equipamentos energizados.
                    </div>
                `;
            } else {
                feedback.innerHTML = `
                    <div class="feedback-incorreto">
                        ❌ Procedimento inadequado. A segurança deve sempre vir primeiro!
                    </div>
                `;
            }
        }
    });

    // Gerador de checklist
window.gerarChecklist = function() {
    const tipo = document.getElementById('tipo-equipamento').value;
    const criticidade = document.getElementById('criticidade-eq').value;
    const ambiente = document.getElementById('ambiente-eq').value;
    const checklists = {
        motor: {
            basicos: ['Vibração geral', 'Temperatura mancais', 'Ruído anormal', 'Conexões elétricas'],
            criticos: ['Análise de vibração', 'Termografia', 'Corrente elétrica', 'Análise de óleo'],
            ambienteAgressivo: ['Proteção IP', 'Corrosão', 'Vedações']
        },
        bomba: {
            basicos: ['Vazamentos', 'Vibração', 'Temperatura', 'Pressão'],
            criticos: ['Cavitação', 'Selo mecânico', 'Alinhamento', 'Análise de vibração'],
            ambienteAgressivo: ['Corrosão', 'Erosão', 'Compatibilidade química']
        }
    };
    const checklist = checklists[tipo] || checklists.motor;
    const itens = [...checklist.basicos];
    if (criticidade === 'critica' || criticidade === 'alta') {
        itens.push(...checklist.criticos);
    }
    if (ambiente === 'agressivo') {
        itens.push(...checklist.ambienteAgressivo);
    }
    const resultado = document.getElementById('checklist-gerado');
    resultado.style.display = 'block';
    resultado.classList.add('mostrar');
    resultado.innerHTML = `
        <h5>📋 Checklist Personalizado</h5>
        <ul>
            ${itens.map(item => `<li>✓ ${item}</li>`).join('')}
        </ul>
        <div class="frequencia-sugerida">
            Frequência sugerida: ${criticidade === 'critica' ? 'Semanal' : criticidade === 'alta' ? 'Quinzenal' : 'Mensal'}
        </div>
    `;
};

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 4
    // =================================================================================
    
    // Verificar problemas no registro
window.verificarProblemas = function() {
    const checkboxes = document.querySelectorAll('[data-problema]:checked');
    const problemas = Array.from(checkboxes).map(cb => cb.dataset.problema);
    const todosProblemas = ['data', 'identificacao', 'medicoes', 'acao', 'responsavel'];
    const acertos = problemas.filter(p => todosProblemas.includes(p)).length;
    const percentual = (acertos / todosProblemas.length) * 100;
    const resultado = document.getElementById('resultado-problemas');
    resultado.style.display = 'block';
    resultado.classList.add('mostrar');
    resultado.innerHTML = `
        <div class="analise-problemas">
            <div>Problemas identificados: ${acertos}/${todosProblemas.length}</div>
            <div>Precisão: ${percentual.toFixed(0)}%</div>
            <div>${percentual === 100 ? '🎯 Excelente análise!' : '📚 Continue estudando os padrões de qualidade'}</div>
        </div>
    `;
};

    // Atualizar gráfico de tendências
    window.atualizarGrafico = function() {
        const parametro = document.getElementById('parametro-grafico').value;
        const periodo = document.getElementById('periodo-grafico').value;
        
        const interpretacoes = {
            temperatura: 'Tendência crescente indica possível problema de lubrificação ou desalinhamento.',
            vibracao: 'Picos indicam desbalanceamento. Tendência crescente sugere desgaste progressivo.',
            corrente: 'Variações podem indicar problemas mecânicos ou elétricos.'
        };
        
        const resultado = document.getElementById('interpretacao-grafico');
        resultado.innerHTML = `
            <div class="interpretacao-grafico">
                <h6>📊 Análise de ${parametro} - ${periodo} dias</h6>
                <p>${interpretacoes[parametro]}</p>
                <div class="grafico-placeholder">[Gráfico simulado de ${parametro} ao longo de ${periodo} dias]</div>
            </div>
        `;
    };

    // Calcular KPIs
    window.calcularKPIs = function() {
        const planejadas = parseFloat(document.getElementById('inspecoes-planejadas').value) || 0;
        const realizadas = parseFloat(document.getElementById('inspecoes-realizadas').value) || 0;
        const detectadas = parseFloat(document.getElementById('falhas-detectadas').value) || 0;
        const paradas = parseFloat(document.getElementById('falhas-parada').value) || 0;
        
        const aderencia = (realizadas / planejadas) * 100;
        const eficacia = ((detectadas - paradas) / detectadas) * 100;
        const taxaDeteccao = (detectadas / realizadas) * 100;
        
        const resultado = document.getElementById('resultado-kpis');
        resultado.innerHTML = `
            <h5>📈 KPIs de Inspeção</h5>
            <div class="kpi-item">Aderência ao Plano: ${aderencia.toFixed(1)}%</div>
            <div class="kpi-item">Eficácia Preditiva: ${eficacia.toFixed(1)}%</div>
            <div class="kpi-item">Taxa de Detecção: ${taxaDeteccao.toFixed(1)}%</div>
            <div class="kpi-meta">Meta: >95% aderência, >80% eficácia</div>
        `;
    };

    // Avaliar melhoria de registro
    window.avaliarMelhoria = function() {
        const texto = document.getElementById('registro-melhorado').value;
        const feedback = document.getElementById('feedback-melhoria');
        
        let score = 0;
        const criterios = [
            { palavra: 'data', peso: 20, nome: 'Data/hora' },
            { palavra: 'motor', peso: 15, nome: 'Identificação' },
            { palavra: 'vibra', peso: 15, nome: 'Medições' },
            { palavra: 'temperatura', peso: 15, nome: 'Parâmetros' },
            { palavra: 'ação', peso: 15, nome: 'Ações' },
            { palavra: 'técnico', peso: 10, nome: 'Responsável' },
            { palavra: 'próxim', peso: 10, nome: 'Próximos passos' }
        ];
        
        let itensPresentes = [];
        criterios.forEach(criterio => {
            if (texto.toLowerCase().includes(criterio.palavra)) {
                score += criterio.peso;
                itensPresentes.push(criterio.nome);
            }
        });
        
        let classificacao = '';
        if (score >= 90) classificacao = '🏆 Excelente';
        else if (score >= 70) classificacao = '✅ Bom';
        else if (score >= 50) classificacao = '⚠️ Regular';
        else classificacao = '❌ Precisa melhorar';
        
        feedback.innerHTML = `
            <div class="avaliacao-melhoria">
                <div>Score: ${score}/100 - ${classificacao}</div>
                <div>Critérios atendidos: ${itensPresentes.join(', ')}</div>
                <div>Dica: ${score < 70 ? 'Inclua mais detalhes técnicos e ações específicas' : 'Ótimo trabalho!'}</div>
            </div>
        `;
    };

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 5
    // =================================================================================
    
    // Casos interativos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-caso')) {
            const caso = e.target.dataset.caso;
            const opcao = e.target.dataset.opcao;
            const correta = e.target.dataset.correta === 'true';
            
            const feedback = document.getElementById(`feedback-caso-${caso}`);
            const consequencias = document.getElementById(`consequencias-${caso}`);
            
            if (correta) {
                feedback.innerHTML = `
                    <div class="feedback-correto">
                        ✅ Decisão correta! Essa é a melhor abordagem para minimizar riscos e custos.
                    </div>
                `;
            } else {
                feedback.innerHTML = `
                    <div class="feedback-incorreto">
                        ❌ Essa abordagem apresenta riscos. Veja as consequências abaixo.
                    </div>
                `;
            }
            
            if (consequencias) {
                consequencias.style.display = 'block';
            }
        }
    });

    // Matriz de decisão
    window.calcularMatrizDecisao = function() {
        const criticidade = parseFloat(document.getElementById('criticidade').value);
        const severidade = parseFloat(document.getElementById('severidade').value);
        const urgencia = parseFloat(document.getElementById('urgencia').value);
        
        document.getElementById('valor-criticidade').textContent = criticidade;
        document.getElementById('valor-severidade').textContent = severidade;
        document.getElementById('valor-urgencia').textContent = urgencia;
        
        const prioridade = (criticidade * 0.4) + (severidade * 0.3) + (urgencia * 0.3);
        
        let classificacao = '';
        let acao = '';
        
        if (prioridade >= 8) {
            classificacao = '🔴 CRÍTICA';
            acao = 'Ação imediata (0-24h)';
        } else if (prioridade >= 6) {
            classificacao = '🟠 ALTA';
            acao = 'Ação em 1-3 dias';
        } else if (prioridade >= 4) {
            classificacao = '🟡 MÉDIA';
            acao = 'Ação em 1 semana';
        } else {
            classificacao = '🟢 BAIXA';
            acao = 'Incluir no próximo ciclo';
        }
        
        const resultado = document.getElementById('resultado-matriz');
        resultado.innerHTML = `
            <div class="resultado-prioridade">
                <div class="prioridade-score">Score: ${prioridade.toFixed(1)}/10</div>
                <div class="prioridade-class">${classificacao}</div>
                <div class="prioridade-acao">${acao}</div>
            </div>
        `;
    };

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULOS 6-9
    // =================================================================================
    
    // Simulador de diagnóstico mecânico
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-diag')) {
            const correto = e.target.dataset.correto === 'true';
            const diagnostico = e.target.dataset.diagnostico;
            const resultado = document.getElementById('resultado-diagnostico');
            
            if (correto) {
                resultado.innerHTML = `
                    <div class="feedback-correto">
                        ✅ Diagnóstico correto! Vibração em 1x RPM com aquecimento é característico de desbalanceamento.
                        <div class="explicacao">
                            <strong>Por quê?</strong>
                            <ul>
                                <li>Vibração em 1x RPM indica desbalanceamento</li>
                                <li>Aquecimento é consequência do esforço adicional</li>
                                <li>Corrente normal descarta problemas elétricos</li>
                            </ul>
                        </div>
                    </div>
                `;
            } else {
                resultado.innerHTML = `
                    <div class="feedback-incorreto">
                        ❌ Diagnóstico incorreto. Revise os sinais: vibração 1x RPM é típica de desbalanceamento.
                    </div>
                `;
            }
        }
    });

    // Calculadora de custo de falhas
    window.calcularCustoFalha = function() {
        const tipoFalha = document.getElementById('tipo-falha-calc').value;
        const potencia = parseFloat(document.getElementById('potencia-motor').value) || 0;
        const custoHora = parseFloat(document.getElementById('custo-parada-hora').value) || 0;
        const horasReparo = parseFloat(document.getElementById('horas-reparo').value) || 0;
        
        const custos = {
            rolamento: { material: potencia * 50, maoObra: horasReparo * 200 },
            desbalanceamento: { material: potencia * 20, maoObra: horasReparo * 150 },
            desalinhamento: { material: potencia * 30, maoObra: horasReparo * 180 },
            folgas: { material: potencia * 25, maoObra: horasReparo * 160 }
        };
        
        const custo = custos[tipoFalha] || custos.rolamento;
        const custoParada = custoHora * horasReparo;
        const custoTotal = custo.material + custo.maoObra + custoParada;
        
        const resultado = document.getElementById('resultado-custo-falha');
        resultado.innerHTML = `
            <h5>💰 Análise de Custo</h5>
            <div class="custo-item">Material: R$ ${custo.material.toLocaleString('pt-BR')}</div>
            <div class="custo-item">Mão de obra: R$ ${custo.maoObra.toLocaleString('pt-BR')}</div>
            <div class="custo-item">Parada produção: R$ ${custoParada.toLocaleString('pt-BR')}</div>
            <div class="custo-total">TOTAL: R$ ${custoTotal.toLocaleString('pt-BR')}</div>
        `;
    };

    // Análise termográfica
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-termo')) {
            const correto = e.target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-termografia');
            
            if (correto) {
                resultado.innerHTML = `
                    <div class="feedback-correto">
                        ✅ Análise correta! Contator C2 a 78°C (50°C acima do ambiente) indica conexão crítica.
                        <div class="explicacao">
                            <strong>Critério:</strong> Diferença >40°C = Emergência
                            <strong>Ação:</strong> Programar manutenção em 24-48h
                        </div>
                    </div>
                `;
            } else {
                resultado.innerHTML = `
                    <div class="feedback-incorreto">
                        ❌ Análise incorreta. Verifique os critérios de termografia na tabela.
                    </div>
                `;
            }
        }
    });

    // Calculadora de desequilíbrio
    // Corrigido: Calculadora de Desequilíbrio (valores manuais)
    window.calcularDesequilibrio = function() {
        const max = parseFloat(document.getElementById('valor-maximo').value) || 0;
        const min = parseFloat(document.getElementById('valor-minimo').value) || 0;
        const valor3 = parseFloat(document.getElementById('valor-terceiro').value) || 0;
        const diferenca = max - min;
        const media = (max + min + valor3) / 3;
        const desequilibrio = media > 0 ? (diferenca / media) * 100 : 0;
        document.getElementById('diferenca').value = diferenca.toFixed(1);
        document.getElementById('desequilibrio-percent').value = desequilibrio.toFixed(1);
        let classificacao = '';
        if (desequilibrio <= 2) classificacao = '🟢 Normal';
        else if (desequilibrio <= 5) classificacao = '🟡 Atenção';
        else classificacao = '🔴 Crítico';
        const resultado = document.getElementById('classificacao-desequilibrio');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.classList.add('mostrar');
            resultado.innerHTML = `
                <div class="resultado-desequilibrio">
                    <div>Desequilíbrio: ${desequilibrio.toFixed(1)}%</div>
                    <div>Classificação: ${classificacao}</div>
                    <div>Ação: ${desequilibrio > 5 ? 'Investigar causas' : 'Monitorar'}</div>
                </div>
            `;
        }
    };

    // =================================================================================
    // SISTEMA DE QUIZ E CERTIFICAÇÃO
    // =================================================================================
    
    // NOVO QUIZ DO MÓDULO 13
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

    // Event listeners para o quiz
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-quiz')) {
            const index = parseInt(e.target.dataset.index);
            const pergunta = perguntas[perguntaAtual];
            const feedback = document.getElementById('feedback');
            
            if (index === pergunta.correta) {
                acertos++;
                feedback.innerHTML = '<div class="feedback-correto">✅ Correto!</div>';
            } else {
                feedback.innerHTML = '<div class="feedback-incorreto">❌ Incorreto!</div>';
            }
            
            setTimeout(() => {
                perguntaAtual++;
                mostrarPergunta();
            }, 1500);
        }
    });

    // Alterar campos baseado no país
    document.getElementById('pais-aluno').addEventListener('change', (e) => {
        const pais = e.target.value;
        const label = document.getElementById('documento-label');
        const input = document.getElementById('documento-aluno');
        
        if (pais === 'brasil') {
            label.textContent = 'Seu CPF:';
            input.placeholder = 'Digite seu CPF (apenas números)';
            input.maxLength = 14;
        } else {
            label.textContent = 'Seu BI:';
            input.placeholder = 'Digite seu BI';
            input.maxLength = 20;
        }
    });

    // Gerar certificado
    document.getElementById('gerar-certificado-btn').addEventListener('click', () => {
        const nome = document.getElementById('nome-aluno').value.trim();
        const documento = document.getElementById('documento-aluno').value.trim();
        const pais = document.getElementById('pais-aluno').value;
        
        if (!nome || !documento) {
            alert('Por favor, preencha todos os campos!');
            return;
        }
        
        gerarCertificadoPDF(nome, documento, pais);
    });

    function gerarCertificadoPDF(nome, documento, pais) {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Configuração baseada no país
        const config = pais === 'brasil' ? {
            titulo: 'CERTIFICADO DE CONCLUSÃO',
            subtitulo: 'CURSO DE INSPEÇÃO DE MÁQUINAS INDUSTRIAIS',
            texto1: 'Certificamos que',
            texto2: 'concluiu com êxito o',
            texto3: 'Curso de Inspeção de Máquinas Industriais',
            texto4: 'com carga horária de 40 horas, demonstrando conhecimento em:',
            rodape: 'Brasil',
            docLabel: 'CPF'
        } : {
            titulo: 'CERTIFICADO DE CONCLUSÃO',
            subtitulo: 'CURSO DE INSPEÇÃO DE MÁQUINAS INDUSTRIAIS', 
            texto1: 'Certificamos que',
            texto2: 'concluiu com êxito o',
            texto3: 'Curso de Inspeção de Máquinas Industriais',
            texto4: 'com carga horária de 40 horas, demonstrando conhecimento em:',
            rodape: 'Angola',
            docLabel: 'BI'
        };

        // Design do certificado
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 297, 210, 'F');
        
        doc.setFillColor(255, 255, 255);
        doc.rect(10, 10, 277, 190, 'F');
        
        doc.setFillColor(41, 128, 185);
        doc.rect(15, 15, 267, 20, 'F');
        
        // Título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text(config.titulo, 148.5, 28, { align: 'center' });
        
        // Subtítulo
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text(config.subtitulo, 148.5, 50, { align: 'center' });
        
        // Texto principal
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(config.texto1, 148.5, 75, { align: 'center' });
        
        // Nome do aluno
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(41, 128, 185);
        doc.text(nome.toUpperCase(), 148.5, 90, { align: 'center' });
        
        // Documento
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`${config.docLabel}: ${documento}`, 148.5, 100, { align: 'center' });
        
        // Continuação do texto
        doc.setFontSize(14);
        doc.text(config.texto2, 148.5, 115, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.text(config.texto3, 148.5, 125, { align: 'center' });
        
        // Competências
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(config.texto4, 148.5, 140, { align: 'center' });
        
        const competencias = [
            '• Técnicas de inspeção sensitiva e instrumentada',
            '• Análise de vibração, termografia e ultrassom',
            '• Procedimentos de segurança e qualidade',
            '• Registro e análise de dados preditivos'
        ];
        
        competencias.forEach((comp, index) => {
            doc.text(comp, 50, 155 + (index * 8));
        });
        
        // Data e assinatura
        const data = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(10);
        doc.text(`Emitido em: ${data}`, 25, 185);
        doc.text(config.rodape, 25, 195);
        
        doc.text('Assinatura Digital Válida', 200, 185);
        doc.text('Canal Manutenção Industrial', 200, 195);
        
        // Download
        doc.save(`Certificado_Inspecao_Maquinas_${nome.replace(/\s+/g, '_')}.pdf`);
        
        alert('🎓 Certificado gerado com sucesso! O download foi iniciado.');
    }

    // Tentar novamente
    document.getElementById('tentar-novamente-btn').addEventListener('click', () => {
        document.getElementById('reprovado-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        iniciarQuiz();
    });

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 10 (PNEUMÁTICA E HIDRÁULICA)
    // =================================================================================
    
    // Avaliar inspeção pneumática
    window.avaliarInspecaoPneumatica = function() {
        const checkboxes = document.querySelectorAll('.checklist-pneumatico input[type="checkbox"]:checked');
        const total = document.querySelectorAll('.checklist-pneumatico input[type="checkbox"]').length;
        const marcados = checkboxes.length;
        
        let pontuacao = 0;
        checkboxes.forEach(cb => {
            if (cb.dataset.criticidade === 'alta') pontuacao += 3;
            else if (cb.dataset.criticidade === 'media') pontuacao += 2;
            else pontuacao += 1;
        });
        
        const maxPontuacao = document.querySelectorAll('.checklist-pneumatico input[data-criticidade="alta"]').length * 3 +
                            document.querySelectorAll('.checklist-pneumatico input[data-criticidade="media"]').length * 2 +
                            document.querySelectorAll('.checklist-pneumatico input[data-criticidade="baixa"]').length * 1;
        
        const percentual = (pontuacao / maxPontuacao) * 100;
        
        const resultado = document.getElementById('resultado-inspecao-pneumatica');
        let classificacao = '';
        if (percentual >= 90) classificacao = '🏆 Excelente';
        else if (percentual >= 75) classificacao = '✅ Bom';
        else if (percentual >= 60) classificacao = '⚠️ Regular';
        else classificacao = '❌ Insuficiente';
        
        resultado.innerHTML = `
            <h5>${classificacao}</h5>
            <div class="resultado-item">Pontuação: ${pontuacao}/${maxPontuacao} (${percentual.toFixed(0)}%)</div>
            <div class="resultado-item">Itens verificados: ${marcados}/${total}</div>
            <div class="recomendacao">${percentual >= 75 ? 'Sistema em condições adequadas' : 'Revisar itens não verificados'}</div>
        `;
    };

    // Detector de vazamentos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-deteccao')) {
            const metodo = e.target.dataset.metodo;
            const eficacia = parseInt(e.target.dataset.eficacia);
            const resultado = document.getElementById('resultado-deteccao');
            
            const metodos = {
                ultrassom: 'Ultrassônico detecta vazamentos com precisão de ±5cm. Ideal para localização exata.',
                auditivo: 'Método básico, localiza área geral. Requer confirmação com outro método.',
                espuma: 'Confirma vazamento visualmente. Útil para verificação final.',
                manometro: 'Detecta perda geral de pressão. Não localiza vazamento específico.'
            };
            
            resultado.innerHTML = `
                <div class="resultado-deteccao">
                    <h5>🎯 Método: ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}</h5>
                    <div class="eficacia-metodo">Eficácia: ${eficacia}%</div>
                    <div class="explicacao-metodo">${metodos[metodo]}</div>
                    <div class="custo-metodo">
                        ${eficacia >= 90 ? '💰 Alto custo, alta precisão' : 
                          eficacia >= 70 ? '💰 Custo médio, boa precisão' : 
                          '💰 Baixo custo, precisão limitada'}
                    </div>
                </div>
            `;
        }
    });

    // Calcular custo de vazamento
    window.calcularCustoVazamento = function() {
        const pressao = parseFloat(document.getElementById('pressao-sistema').value);
        const diametro = parseFloat(document.getElementById('diametro-furo').value);
        const horas = parseFloat(document.getElementById('horas-operacao').value);
        const custo = parseFloat(document.getElementById('custo-ar').value);
        
        // Fórmula aproximada para vazamento de ar comprimido
        const area = Math.PI * Math.pow(diametro/2000, 2); // área em m²
        const vazao = 0.6 * area * Math.sqrt(pressao * 100000 * 1.2); // m³/s
        const vazaoDiaria = vazao * 3600 * horas; // m³/dia
        const vazaoAnual = vazaoDiaria * 365; // m³/ano
        const custoAnual = vazaoAnual * custo;
        
        const resultado = document.getElementById('resultado-custo-vazamento');
        resultado.innerHTML = `
            <h5>💸 Análise de Perda por Vazamento</h5>
            <div class="resultado-item">Vazão: ${vazao.toFixed(4)} m³/s</div>
            <div class="resultado-item">Perda diária: ${vazaoDiaria.toFixed(1)} m³</div>
            <div class="resultado-item">Perda anual: ${vazaoAnual.toFixed(0)} m³</div>
            <div class="resultado-item destaque">Custo anual: R$ ${custoAnual.toLocaleString('pt-BR')}</div>
            <div class="economia-reparo">
                Reparo: R$ 50 | ROI: ${(custoAnual/50).toFixed(0)}x | Payback: ${(50*365/custoAnual).toFixed(0)} dias
            </div>
        `;
    };

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 11 (ESTRUTURAL E SEGURANÇA)
    // =================================================================================
    
    // Simulador estrutural
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('opcao-estrutural')) {
            const risco = e.target.dataset.risco;
            const correto = e.target.dataset.correto === 'true';
            const resultado = document.getElementById('resultado-estrutural');
            
            if (correto) {
                resultado.innerHTML = `
                    <div class="feedback-correto">
                        ✅ Decisão CORRETA! Trinca de 15cm próxima à solda em viga crítica exige interdição imediata.
                        <div class="justificativa">
                            <strong>Por quê?</strong>
                            <ul>
                                <li>Trinca >10cm é crítica em estruturas</li>
                                <li>Proximidade de solda concentra tensões</li>
                                <li>Ponte rolante = risco de vida</li>
                                <li>Crescimento da trinca é exponencial</li>
                            </ul>
                        </div>
                    </div>
                `;
            } else {
                const riscos = {
                    alto: 'ALTO RISCO! Trinca pode crescer rapidamente, levando ao colapso.',
                    medio: 'RISCO ELEVADO! Redução de carga não elimina o risco de propagação da trinca.'
                };
                resultado.innerHTML = `
                    <div class="feedback-incorreto">
                        ❌ Decisão PERIGOSA! ${riscos[risco]}
                        <div class="consequencias-risco">
                            <strong>Possíveis consequências:</strong>
                            <ul>
                                <li>Colapso estrutural</li>
                                <li>Risco de vida para operadores</li>
                                <li>Perdas materiais superiores a R$ 500.000</li>
                                <li>Responsabilização criminal</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
        }
    });

    // Calcular vida à fadiga
    window.calcularVidaFadiga = function() {
        const tensaoMax = parseFloat(document.getElementById('tensao-maxima').value);
        const tensaoMin = parseFloat(document.getElementById('tensao-minima').value);
        const ciclos = parseFloat(document.getElementById('ciclos-dia').value);
        const material = document.getElementById('material-tipo').value;
        
        const tensaoAmplitude = (tensaoMax - tensaoMin) / 2;
        const tensaoMedia = (tensaoMax + tensaoMin) / 2;
        
        // Coeficientes aproximados para diferentes materiais
        const coeficientes = {
            'aco-carbono': { A: 1000, m: 3.5 },
            'aco-baixa-liga': { A: 1500, m: 3.2 },
            'aco-inox': { A: 2000, m: 3.0 },
            'aluminio': { A: 800, m: 4.0 }
        };
        
        const coef = coeficientes[material];
        const vidaCiclos = Math.pow(coef.A / tensaoAmplitude, coef.m);
        const vidaDias = vidaCiclos / ciclos;
        const vidaAnos = vidaDias / 365;
        
        const resultado = document.getElementById('resultado-vida-fadiga');
        resultado.innerHTML = `
            <h5>⏱️ Análise de Vida à Fadiga</h5>
            <div class="resultado-item">Tensão amplitude: ${tensaoAmplitude.toFixed(1)} MPa</div>
            <div class="resultado-item">Tensão média: ${tensaoMedia.toFixed(1)} MPa</div>
            <div class="resultado-item">Vida em ciclos: ${vidaCiclos.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</div>
            <div class="resultado-item">Vida em dias: ${vidaDias.toFixed(0)} dias</div>
            <div class="resultado-item destaque">Vida útil: ${vidaAnos.toFixed(1)} anos</div>
            <div class="recomendacao">
                ${vidaAnos > 20 ? '✅ Vida útil adequada' : vidaAnos > 10 ? '⚠️ Monitorar regularmente' : '🚨 Vida útil crítica - ação necessária'}
            </div>
        `;
    };

    // Calcular risco estrutural
    window.calcularRiscoEstrutural = function() {
        const idade = parseFloat(document.getElementById('idade-estrutura').value);
        const carga = parseFloat(document.getElementById('carga-operacional').value);
        const ambiente = parseFloat(document.getElementById('ambiente-agressividade').value);
        const manutencao = parseFloat(document.getElementById('manutencao-qualidade').value);
        
        // Atualizar valores exibidos
        document.getElementById('valor-idade').textContent = idade;
        document.getElementById('valor-carga').textContent = carga + '%';
        document.getElementById('valor-ambiente').textContent = ambiente;
        document.getElementById('valor-manutencao').textContent = manutencao;
        
        // Cálculo de risco ponderado
        let pontuacao = 0;
        pontuacao += idade > 25 ? 30 : idade > 15 ? 20 : idade > 10 ? 10 : 5;
        pontuacao += carga > 100 ? 25 : carga > 90 ? 15 : carga > 80 ? 10 : 5;
        pontuacao += ambiente * 8;
        pontuacao -= manutencao * 5;
        
        let classificacao = '';
        let acao = '';
        if (pontuacao >= 70) {
            classificacao = '🔴 RISCO ALTO';
            acao = 'Inspeção estrutural imediata por engenheiro especializado';
        } else if (pontuacao >= 45) {
            classificacao = '🟠 RISCO MÉDIO';
            acao = 'Inspeção estrutural em 30 dias';
        } else if (pontuacao >= 25) {
            classificacao = '🟡 RISCO BAIXO';
            acao = 'Inspeção estrutural anual';
        } else {
            classificacao = '🟢 RISCO MÍNIMO';
            acao = 'Manter programa de inspeção atual';
        }
        
        const resultado = document.getElementById('resultado-risco-estrutural');
        resultado.innerHTML = `
            <h5>⚖️ Avaliação de Risco Estrutural</h5>
            <div class="resultado-item">Pontuação: ${pontuacao}/100</div>
            <div class="resultado-item">Classificação: ${classificacao}</div>
            <div class="resultado-item">Ação recomendada: ${acao}</div>
            <div class="fatores-principais">
                <strong>Fatores críticos:</strong>
                ${idade > 20 ? '⚠️ Estrutura antiga ' : ''}
                ${carga > 90 ? '⚠️ Sobrecarga ' : ''}
                ${ambiente > 3 ? '⚠️ Ambiente agressivo ' : ''}
                ${manutencao < 3 ? '⚠️ Manutenção deficiente' : ''}
            </div>
        `;
    };

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 12 (PLANO E MELHORIA CONTÍNUA)
    // =================================================================================
    
    // Calcular criticidade
    window.calcularCriticidade = function() {
        const impacto = parseFloat(document.getElementById('impacto-producao').value) || 0;
        const seguranca = parseFloat(document.getElementById('impacto-seguranca').value) || 0;
        const custo = parseFloat(document.getElementById('custo-manutencao').value) || 0;
        const ambiental = parseFloat(document.getElementById('impacto-ambiental').value) || 0;

        // Atualizar valores exibidos
        document.getElementById('valor-impacto').textContent = impacto;
        document.getElementById('valor-seguranca').textContent = seguranca;
        document.getElementById('valor-custo').textContent = custo;
        document.getElementById('valor-ambiental').textContent = ambiental;

        // Cálculo ponderado
        const criticidade = (impacto * 0.4) + (seguranca * 0.3) + (custo * 0.2) + (ambiental * 0.1);

        let classificacao = '';
        let acao = '';
        let cor = '';
        if (criticidade >= 8) {
            classificacao = '🔴 CRÍTICA';
            acao = 'Ação imediata (0-24h)';
            cor = 'critico';
        } else if (criticidade >= 6) {
            classificacao = '🟠 ALTA';
            acao = 'Ação em 1-3 dias';
            cor = 'importante';
        } else if (criticidade >= 4) {
            classificacao = '🟡 MÉDIA';
            acao = 'Ação em 1 semana';
            cor = 'normal';
        } else {
            classificacao = '🟢 BAIXA';
            acao = 'Incluir no próximo ciclo';
            cor = 'baixo';
        }

        const resultado = document.getElementById('resultado-criticidade');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.classList.add('mostrar');
            resultado.innerHTML = `
                <div class="banner-resultado ${cor}">
                    <h5>🎯 Classificação de Criticidade</h5>
                    <div><strong>Pontuação:</strong> ${criticidade.toFixed(1)}/10</div>
                    <div><strong>Classificação:</strong> ${classificacao}</div>
                    <div><strong>Ação recomendada:</strong> ${acao}</div>
                    <div class="detalhamento">
                        <strong>Detalhamento:</strong><br>
                        Produção (40%): ${(impacto * 0.4).toFixed(1)} |
                        Segurança (30%): ${(seguranca * 0.3).toFixed(1)} |
                        Custo (20%): ${(custo * 0.2).toFixed(1)} |
                        Ambiental (10%): ${(ambiental * 0.1).toFixed(1)}
                    </div>
                </div>
            `;
        }
    };

    // Gerar rota de inspeção
    window.gerarRota = function() {
        const area = document.getElementById('area-inspecao').value;
        const pontos = document.getElementById('pontos-inspecao') ? document.getElementById('pontos-inspecao').value : '';
        const frequencia = document.getElementById('frequencia-inspecao') ? document.getElementById('frequencia-inspecao').value : '';
        const responsavel = document.getElementById('responsavel-inspecao') ? document.getElementById('responsavel-inspecao').value : '';

        let listaPontos = pontos ? pontos.split(',').map(p => p.trim()).filter(p => p) : [];
        if (listaPontos.length === 0) listaPontos = ['Ponto 1', 'Ponto 2', 'Ponto 3'];

        const resultado = document.getElementById('rota-gerada');
        if (resultado) {
            resultado.style.display = 'block';
            resultado.classList.add('mostrar');
            resultado.innerHTML = `
                <div class="banner-resultado rota">
                    <h5>🚶‍♂️ Rota de Inspeção Gerada</h5>
                    <div class="rota-info"><strong>Área:</strong> ${area}</div>
                    <div class="rota-info"><strong>Responsável:</strong> ${responsavel}</div>
                    <div class="rota-info"><strong>Frequência:</strong> ${frequencia}</div>
                    <ul class="rota-lista">
                        ${listaPontos.map((p, i) => `<li>${i + 1}. ${p}</li>`).join('')}
                    </ul>
                    <div class="dica-rota">💡 Dica: Siga a ordem para otimizar o tempo e evitar esquecimentos.</div>
                </div>
            `;
        }
    };

    // Calcular KPIs avançados
    window.calcularKPIsAvancados = function() {
        const horasOp = parseFloat(document.getElementById('horas-operacao-mes').value);
        const falhas = parseFloat(document.getElementById('falhas-mes').value);
        const tempoReparo = parseFloat(document.getElementById('tempo-reparo-total').value);
        const inspecoesPlan = parseFloat(document.getElementById('inspecoes-planejadas-mes').value);
        const inspecoesReal = parseFloat(document.getElementById('inspecoes-realizadas-mes').value);
        const falhasPrev = parseFloat(document.getElementById('falhas-previstas').value);
        const falhasSubitas = parseFloat(document.getElementById('falhas-subitas').value);
        
        // Cálculos dos KPIs
        const mtbf = falhas > 0 ? horasOp / falhas : horasOp;
        const mttr = falhas > 0 ? tempoReparo / falhas : 0;
        const disponibilidade = (mtbf / (mtbf + mttr)) * 100;
        const aderencia = (inspecoesReal / inspecoesPlan) * 100;
        const eficacia = falhasPrev > 0 ? ((falhasPrev - falhasSubitas) / falhasPrev) * 100 : 0;
        const custoInspecao = 150; // Custo médio estimado por inspeção
        const custoTotal = inspecoesReal * custoInspecao;
        
        const resultado = document.getElementById('resultado-kpis-avancados');
        resultado.innerHTML = `
            <h5>📊 Dashboard de KPIs</h5>
            <div class="kpis-grid">
                <div class="kpi-card">
                    <h6>⏱️ MTBF</h6>
                    <div class="kpi-valor">${mtbf.toFixed(0)}h</div>
                    <div class="kpi-status">${mtbf > 200 ? '✅ Excelente' : mtbf > 100 ? '✅ Bom' : '⚠️ Melhorar'}</div>
                </div>
                <div class="kpi-card">
                    <h6>🔧 MTTR</h6>
                    <div class="kpi-valor">${mttr.toFixed(1)}h</div>
                    <div class="kpi-status">${mttr < 4 ? '✅ Excelente' : mttr < 8 ? '✅ Bom' : '⚠️ Melhorar'}</div>
                </div>
                <div class="kpi-card">
                    <h6>📈 Disponibilidade</h6>
                    <div class="kpi-valor">${disponibilidade.toFixed(1)}%</div>
                    <div class="kpi-status">${disponibilidade > 95 ? '✅ Excelente' : disponibilidade > 90 ? '✅ Bom' : '⚠️ Melhorar'}</div>
                </div>
                <div class="kpi-card">
                    <h6>🎯 Aderência</h6>
                    <div class="kpi-valor">${aderencia.toFixed(1)}%</div>
                    <div class="kpi-status">${aderencia > 95 ? '✅ Excelente' : aderencia > 85 ? '✅ Bom' : '⚠️ Melhorar'}</div>
                </div>
                <div class="kpi-card">
                    <h6>🔮 Eficácia Preditiva</h6>
                    <div class="kpi-valor">${eficacia.toFixed(1)}%</div>
                    <div class="kpi-status">${eficacia > 80 ? '✅ Excelente' : eficacia > 60 ? '✅ Bom' : '⚠️ Melhorar'}</div>
                </div>
                <div class="kpi-card">
                    <h6>💰 Custo/Inspeção</h6>
                    <div class="kpi-valor">R$ ${custoInspecao}</div>
                    <div class="kpi-total">Total mês: R$ ${custoTotal.toLocaleString('pt-BR')}</div>
                </div>
            </div>
        `;
    };

    // Expandir fase PDCA
    window.expandirFase = function(fase) {
        const ferramentas = {
            plan: {
                titulo: '📋 Ferramentas de Planejamento',
                itens: [
                    '📊 Diagrama de Pareto - Priorizar problemas',
                    '🐟 Diagrama de Ishikawa - Identificar causas',
                    '📈 Análise de tendências - Identificar padrões',
                    '🎯 5W2H - Estruturar plano de ação'
                ]
            },
            do: {
                titulo: '⚡ Ferramentas de Execução',
                itens: [
                    '📚 Procedimentos padrão - Padronizar execução',
                    '🎓 Treinamento prático - Capacitar equipe',
                    '📱 Apps de coleta - Facilitar registro',
                    '📊 Dashboards - Monitorar progresso'
                ]
            },
            check: {
                titulo: '🔍 Ferramentas de Verificação',
                itens: [
                    '📊 Gráficos de controle - Monitorar variação',
                    '📈 KPIs dashboard - Acompanhar indicadores',
                    '🎯 Análise de gaps - Comparar com metas',
                    '📋 Auditorias - Verificar conformidade'
                ]
            },
            act: {
                titulo: '🎯 Ferramentas de Ação',
                itens: [
                    '📚 Lições aprendidas - Capturar conhecimento',
                    '📋 Procedimentos atualizados - Padronizar melhorias',
                    '🎓 Treinamento em cascata - Disseminar conhecimento',
                    '🔄 Novos ciclos PDCA - Melhoria contínua'
                ]
            }
        };
        
        const ferramenta = ferramentas[fase];
        const container = document.getElementById('ferramentas-fase');
        container.innerHTML = `
            <div class="ferramentas-detalhes">
                <h4>${ferramenta.titulo}</h4>
                <ul>
                    ${ferramenta.itens.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    };

    // Calcular ROI do programa
    window.calcularROIPrograma = function() {
        const custoFerramentas = parseFloat(document.getElementById('custo-ferramentas-prog').value);
        const custoTreinamento = parseFloat(document.getElementById('custo-treinamento-prog').value);
        const custoSoftware = parseFloat(document.getElementById('custo-software-prog').value);
        const custoOperacional = parseFloat(document.getElementById('custo-operacional-prog').value);
        const reducaoParadas = parseFloat(document.getElementById('reducao-paradas-prog').value);
        const custoParadasAtual = parseFloat(document.getElementById('custo-parada-atual').value);
        const reducaoEstoque = parseFloat(document.getElementById('reducao-estoque').value);
        const estoqueAtual = parseFloat(document.getElementById('estoque-atual').value);
        
        // Atualizar valores exibidos
        document.getElementById('valor-reducao-paradas').textContent = reducaoParadas + '%';
        document.getElementById('valor-reducao-estoque').textContent = reducaoEstoque + '%';
        
        // Cálculos de investimento e benefícios
        const investimentoInicial = custoFerramentas + custoTreinamento;
        const custoAnual = custoSoftware + custoOperacional;
        
        const economiaParadas = (custoParadasAtual * reducaoParadas) / 100;
        const economiaEstoque = (estoqueAtual * reducaoEstoque) / 100 * 0.2; // 20% a.a. custo do capital
        const beneficioAnual = economiaParadas + economiaEstoque;
        
        const roiAno1 = ((beneficioAnual - custoAnual - investimentoInicial) / investimentoInicial) * 100;
        const roiAno2 = ((beneficioAnual - custoAnual) / investimentoInicial) * 100;
        const payback = investimentoInicial / (beneficioAnual - custoAnual);
        const vpl3anos = (beneficioAnual - custoAnual) * 3 - investimentoInicial;
        
        const resultado = document.getElementById('resultado-roi-programa');
        resultado.innerHTML = `
            <h5>💰 Análise Financeira do Programa</h5>
            <div class="analise-investimento">
                <div class="investimento-secao">
                    <h6>💸 Investimentos</h6>
                    <div class="resultado-item">Inicial: R$ ${investimentoInicial.toLocaleString('pt-BR')}</div>
                    <div class="resultado-item">Anual: R$ ${custoAnual.toLocaleString('pt-BR')}</div>
                </div>
                <div class="beneficios-secao">
                    <h6>💰 Benefícios Anuais</h6>
                    <div class="resultado-item">Economia paradas: R$ ${economiaParadas.toLocaleString('pt-BR')}</div>
                    <div class="resultado-item">Economia estoque: R$ ${economiaEstoque.toLocaleString('pt-BR')}</div>
                    <div class="resultado-item destaque">Total anual: R$ ${beneficioAnual.toLocaleString('pt-BR')}</div>
                </div>
                <div class="indicadores-secao">
                    <h6>📊 Indicadores</h6>
                    <div class="resultado-item">ROI Ano 1: ${roiAno1.toFixed(0)}%</div>
                    <div class="resultado-item">ROI Ano 2+: ${roiAno2.toFixed(0)}%</div>
                    <div class="resultado-item">Payback: ${payback.toFixed(1)} anos</div>
                    <div class="resultado-item destaque">VPL 3 anos: R$ ${vpl3anos.toLocaleString('pt-BR')}</div>
                </div>
            </div>
            <div class="recomendacao-investimento">
                ${roiAno1 > 50 ? '🚀 INVESTIMENTO ALTAMENTE RECOMENDADO' : 
                  roiAno1 > 20 ? '✅ INVESTIMENTO VIÁVEL' : 
                  roiAno1 > 0 ? '⚠️ INVESTIMENTO MARGINAL' : 
                  '❌ INVESTIMENTO NÃO RECOMENDADO'}
            </div>
        `;
    };

    // Inicializar
    showModule(0);
    if (currentModuleIndex === totalModules - 1) {
        iniciarQuiz();
    }
});
