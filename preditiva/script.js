
document.addEventListener('DOMContentLoaded', () => {
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
        resultado.innerHTML = `
            <h5>💰 Resultado da Análise</h5>
            <div class="resultado-item">Custo atual: R$ ${custoAtual.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">Paradas evitadas: ${paradasReduzidas.toFixed(1)} por ano</div>
            <div class="resultado-item destaque">Economia anual: R$ ${economiaAnual.toLocaleString('pt-BR')}</div>
            <div class="resultado-item">ROI potencial: ${((economiaAnual / 50000) * 100).toFixed(0)}% (invest. R$ 50.000)</div>
        `;
    };

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

    // =================================================================================
    // FUNÇÕES INTERATIVAS - MÓDULO 3
    // =================================================================================
    
    // Verificar checklist
    window.verificarChecklist = function() {
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
        const roi = ((economiaAnual - investimento) / investimento) * 100;
        const payback = investimento / economiaAnual;
        
        const resultado = document.getElementById('resultado-roi-tools');
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
    window.calcularDesequilibrio = function() {
        const max = 31.2;
        const min = 28.5;
        const diferenca = max - min;
        const media = (max + min + 29.8) / 3;
        const desequilibrio = (diferenca / media) * 100;
        
        document.getElementById('diferenca').value = diferenca.toFixed(1);
        document.getElementById('desequilibrio-percent').value = desequilibrio.toFixed(1);
        
        let classificacao = '';
        if (desequilibrio <= 2) classificacao = '🟢 Normal';
        else if (desequilibrio <= 5) classificacao = '🟡 Atenção';
        else classificacao = '🔴 Crítico';
        
        const resultado = document.getElementById('classificacao-desequilibrio');
        resultado.innerHTML = `
            <div class="resultado-desequilibrio">
                <div>Desequilíbrio: ${desequilibrio.toFixed(1)}%</div>
                <div>Classificação: ${classificacao}</div>
                <div>Ação: ${desequilibrio > 5 ? 'Investigar causas' : 'Monitorar'}</div>
            </div>
        `;
    };

    // =================================================================================
    // SISTEMA DE QUIZ E CERTIFICAÇÃO
    // =================================================================================
    
    const perguntas = [
        {
            pergunta: "Qual a principal vantagem da manutenção preditiva?",
            opcoes: [
                "Menor custo inicial",
                "Detecção precoce de falhas baseada em condição real",
                "Menor necessidade de treinamento",
                "Uso apenas de ferramentas básicas"
            ],
            correta: 1
        },
        {
            pergunta: "Qual sentido humano detecta vazamentos de gases mais facilmente?",
            opcoes: [
                "Visão",
                "Audição",
                "Olfato",
                "Tato"
            ],
            correta: 1
        },
        {
            pergunta: "A vibração em 1x RPM geralmente indica:",
            opcoes: [
                "Desalinhamento",
                "Desbalanceamento",
                "Folgas mecânicas",
                "Problemas elétricos"
            ],
            correta: 1
        },
        {
            pergunta: "Em termografia elétrica, uma diferença de temperatura >40°C indica:",
            opcoes: [
                "Situação normal",
                "Atenção necessária",
                "Situação crítica",
                "Emergência"
            ],
            correta: 3
        },
        {
            pergunta: "A análise de óleo detecta principalmente:",
            opcoes: [
                "Problemas elétricos",
                "Desgaste interno e contaminação",
                "Desalinhamento",
                "Problemas de refrigeração"
            ],
            correta: 1
        },
        {
            pergunta: "O ultrassom é mais eficaz para detectar:",
            opcoes: [
                "Temperatura elevada",
                "Vazamentos e lubrificação inadequada",
                "Problemas de tensão",
                "Desbalanceamento"
            ],
            correta: 1
        },
        {
            pergunta: "Um bom registro de inspeção deve conter:",
            opcoes: [
                "Apenas a conclusão final",
                "Data, identificação, medições, observações e ações",
                "Somente valores numéricos",
                "Apenas problemas encontrados"
            ],
            correta: 1
        },
        {
            pergunta: "A vida útil L₁₀ de um rolamento significa:",
            opcoes: [
                "10% dos rolamentos falham antes desse tempo",
                "Vida útil mínima garantida",
                "Tempo máximo de operação",
                "Período de garantia do fabricante"
            ],
            correta: 0
        }
    ];

    let perguntaAtual = 0;
    let acertos = 0;

    function iniciarQuiz() {
        perguntaAtual = 0;
        acertos = 0;
        mostrarPergunta();
    }

    function mostrarPergunta() {
        if (perguntaAtual >= perguntas.length) {
            finalizarQuiz();
            return;
        }

        const pergunta = perguntas[perguntaAtual];
        const titulo = document.getElementById('pergunta-titulo');
        const opcoes = document.getElementById('opcoes-quiz');
        const feedback = document.getElementById('feedback');

        titulo.innerHTML = `<h4>Pergunta ${perguntaAtual + 1}/8</h4><p>${pergunta.pergunta}</p>`;
        
        opcoes.innerHTML = pergunta.opcoes.map((opcao, index) => 
            `<button class="opcao-quiz" data-index="${index}">${opcao}</button>`
        ).join('');

        feedback.innerHTML = '';
    }

    function finalizarQuiz() {
        const quizContainer = document.getElementById('quiz-container');
        const certificadoContainer = document.getElementById('certificado-form-container');
        const reprovadoContainer = document.getElementById('reprovado-container');

        quizContainer.style.display = 'none';

        if (acertos === perguntas.length) {
            certificadoContainer.style.display = 'block';
            reprovadoContainer.style.display = 'none';
        } else {
            certificadoContainer.style.display = 'none';
            reprovadoContainer.style.display = 'block';
        }
    }

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
        const impacto = parseFloat(document.getElementById('impacto-producao').value);
        const seguranca = parseFloat(document.getElementById('impacto-seguranca').value);
        const custo = parseFloat(document.getElementById('custo-manutencao').value);
        const ambiental = parseFloat(document.getElementById('impacto-ambiental').value);
        
        // Atualizar valores exibidos
        document.getElementById('valor-impacto').textContent = impacto;
        document.getElementById('valor-seguranca').textContent = seguranca;
        document.getElementById('valor-custo').textContent = custo;
        document.getElementById('valor-ambiental').textContent = ambiental;
        
        // Cálculo ponderado
        const criticidade = (impacto * 0.4) + (seguranca * 0.3) + (custo * 0.2) + (ambiental * 0.1);
        
        let classe = '';
        let frequencia = '';
        let cor = '';
        if (criticidade >= 8) {
            classe = 'A - CRÍTICO';
            frequencia = 'Inspeção diária, instrumentada semanal';
            cor = 'critico';
        } else if (criticidade >= 5) {
            classe = 'B - IMPORTANTE';
            frequencia = 'Inspeção semanal, instrumentada quinzenal';
            cor = 'importante';
        } else {
            classe = 'C - NORMAL';
            frequencia = 'Inspeção quinzenal, instrumentada mensal';
            cor = 'normal';
        }
        
        const resultado = document.getElementById('resultado-criticidade');
        resultado.innerHTML = `
            <h5>🎯 Classificação de Criticidade</h5>
            <div class="resultado-item">Pontuação: ${criticidade.toFixed(1)}/10</div>
            <div class="resultado-item ${cor}">Classe: ${classe}</div>
            <div class="resultado-item">Frequência sugerida: ${frequencia}</div>
            <div class="detalhamento">
                <strong>Detalhamento:</strong>
                Produção (40%): ${(impacto * 0.4).toFixed(1)} |
                Segurança (30%): ${(seguranca * 0.3).toFixed(1)} |
                Custo (20%): ${(custo * 0.2).toFixed(1)} |
                Ambiental (10%): ${(ambiental * 0.1).toFixed(1)}
            </div>
        `;
    };

    // Gerar rota de inspeção
    window.gerarRota = function() {
        const area = document.getElementById('area-inspecao').value;
        const tempo = parseFloat(document.getElementById('tempo-disponivel').value);
        const equipe = parseFloat(document.getElementById('equipe-size').value);
        const prioridade = document.getElementById('prioridade-rota').value;
        
        // Simulação de equipamentos por área
        const equipamentos = {
            producao: ['MTR-001 (Crítico)', 'BBA-002 (Importante)', 'RED-003 (Normal)', 'MTR-004 (Crítico)', 'CMP-005 (Importante)'],
            utilidades: ['BBA-101 (Crítico)', 'TRF-102 (Normal)', 'MTR-103 (Importante)', 'VNT-104 (Normal)'],
            manutencao: ['ESM-201 (Normal)', 'SOL-202 (Importante)', 'CMP-203 (Crítico)'],
            laboratorio: ['AGT-301 (Normal)', 'BBA-302 (Importante)', 'ESQ-303 (Normal)']
        };
        
        const lista = equipamentos[area] || [];
        const tempoEquipamento = 30; // minutos por equipamento
        const maxEquipamentos = Math.floor((tempo * 60) / tempoEquipamento);
        const equipamentosSelecionados = lista.slice(0, Math.min(maxEquipamentos, lista.length));
        
        const resultado = document.getElementById('rota-gerada');
        resultado.innerHTML = `
            <h5>🗺️ Rota Otimizada - ${area.charAt(0).toUpperCase() + area.slice(1)}</h5>
            <div class="resultado-item">Equipamentos na rota: ${equipamentosSelecionados.length}</div>
            <div class="resultado-item">Tempo estimado: ${(equipamentosSelecionados.length * tempoEquipamento)} minutos</div>
            <div class="resultado-item">Equipe: ${equipe} pessoas</div>
            <div class="lista-equipamentos">
                <strong>Sequência otimizada:</strong>
                <ol>
                    ${equipamentosSelecionados.map(eq => `<li>${eq}</li>`).join('')}
                </ol>
            </div>
            <div class="observacoes">
                <strong>Observações:</strong>
                Priorização por ${prioridade}. ${equipamentosSelecionados.length < lista.length ? `${lista.length - equipamentosSelecionados.length} equipamentos ficaram para próxima rota.` : 'Todos os equipamentos incluídos.'}
            </div>
        `;
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
