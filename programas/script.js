// script.js
import { tabelaSimilaridade, matrizCompatibilidade } from './data/database.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Seleção de Elementos DOM ---
    const marcaSelect = document.getElementById('marca-select');
    const oleoSelect = document.getElementById('oleo-select');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');
    const calculatorSearchResultsContainer = document.getElementById('calculator-search-results-container');
    
    const tempOperacaoInput = document.getElementById('temp-operacao');
    const tipoEquipamentoSelect = document.getElementById('tipo-equipamento');
    const calculateButton = document.getElementById('calculate-button');
    const calculatorResultDiv = document.getElementById('calculator-result');
    const recommendedVgText = document.getElementById('recommended-vg-text');
    const justificationText = document.getElementById('calculator-justification');
    const findOilsButton = document.getElementById('find-oils-button');

    const modal = document.getElementById('compatibility-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalCloseButton = document.getElementById('modal-close-button');

    const equipmentForm = document.getElementById('equipment-form');
    const equipmentOilSelect = document.getElementById('equipment-oil');
    const planTableBody = document.querySelector('#plan-table tbody');

    // =======================================================
    //          SISTEMA DE NOTIFICAÇÃO (TOAST)
    // =======================================================
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }

    // =======================================================
    //          LÓGICA DA MODAL DE COMPATIBILIDADE
    // =======================================================
    function exibirModalCompatibilidade(info) {
        modalTitle.textContent = info.status.replace("_", " ");
        modalTitle.className = `status-${info.status.toLowerCase()}`;
        modalDescription.textContent = info.descricao;
        modal.classList.remove('hidden');
    }

    function fecharModal() {
        modal.classList.add('hidden');
    }

    // =======================================================
    //          LÓGICA DA CALCULADORA DE VISCOSIDADE
    // =======================================================
    function calcularViscosidade() {
        const temp = parseFloat(tempOperacaoInput.value);
        const tipo = tipoEquipamentoSelect.value;
        if (isNaN(temp) || !tipo) {
            showToast('Por favor, preencha todos os campos da calculadora.', 'error');
            return;
        }
        let vgRecomendado = 'N/A';
        let justification = '';

        if (tipo === 'redutor_paralelo') {
            if (temp < 40) vgRecomendado = '150'; else if (temp < 60) vgRecomendado = '220'; else if (temp < 80) vgRecomendado = '320'; else vgRecomendado = '460';
            justification = 'Redutores de eixos paralelos em temperaturas mais altas exigem maior viscosidade para garantir a película protetora nas engrenagens.';
        } else if (tipo === 'redutor_semfim') {
            if (temp < 40) vgRecomendado = '320'; else if (temp < 70) vgRecomendado = '460'; else vgRecomendado = '680';
            justification = 'O atrito de deslizamento em redutores coroa/sem-fim gera mais calor, necessitando de óleos mais viscosos para proteção contra o desgaste.';
        } else if (tipo === 'hidraulico_palhetas') {
            if (temp < 50) vgRecomendado = '32'; else if (temp < 70) vgRecomendado = '46'; else vgRecomendado = '68';
            justification = 'Bombas de palhetas são sensíveis à viscosidade. Um óleo muito espesso pode causar cavitação; um muito fino pode causar vazamentos internos e desgaste.';
        } else if (tipo === 'hidraulico_pistoes') {
            if (temp < 55) vgRecomendado = '46'; else if (temp < 75) vgRecomendado = '68'; else vgRecomendado = '100';
            justification = 'Bombas de pistões operam com altas pressões e se beneficiam de óleos um pouco mais viscosos para garantir a vedação e a lubrificação ideal.';
        } else if (tipo === 'mancal_deslizamento') {
             if (temp < 50) vgRecomendado = '68'; else if (temp < 70) vgRecomendado = '100'; else vgRecomendado = '150';
             justification = 'Para mancais de deslizamento, a viscosidade deve ser suficiente para manter um filme hidrodinâmico completo, que se torna mais difícil com o aumento da temperatura.';
        }
        
        recommendedVgText.textContent = `ISO VG ${vgRecomendado}`;
        justificationText.textContent = justification;
        findOilsButton.classList.remove('hidden');
        calculatorResultDiv.classList.remove('hidden');
        findOilsButton.onclick = () => buscarPorViscosidade(vgRecomendado, calculatorSearchResultsContainer);
    }

    function buscarPorViscosidade(viscosidade, container) {
        const gruposEncontrados = tabelaSimilaridade.filter(grupo => grupo.ISO_VG === viscosidade);
        container.innerHTML = '';
        if (gruposEncontrados.length === 0) {
            container.innerHTML = `<p class="error-message">Nenhum óleo com viscosidade ISO VG ${viscosidade} encontrado na base de dados.</p>`;
            return;
        }
        let htmlResultados = `<h3 class="results-header">Óleos Encontrados para ISO VG ${viscosidade}</h3>`;
        gruposEncontrados.forEach(grupo => {
            htmlResultados += `<div class="product-card"><h4>Aplicação: ${grupo.APLICACAO}</h4><ul class="results-list">`;
            for (const marca in grupo.PRODUTOS) {
                const produto = grupo.PRODUTOS[marca];
                htmlResultados += `
                    <li>
                        <div class="list-item-header">
                            <div class="product-details">
                                <span class="brand">${marca}:</span>
                                <span class="product">${produto.NOME}</span>
                            </div>
                        </div>
                        <div class="tech-data-grid">
                            <div class="tech-data-item"><span class="label">BASE</span><span class="value">${produto.BASE}</span></div>
                            <div class="tech-data-item"><span class="label">ÍNDICE VISC.</span><span class="value">${produto.IV}</span></div>
                            <div class="tech-data-item"><span class="label">P. FULGOR</span><span class="value">${produto.PONTO_FULGOR}°C</span></div>
                            <div class="tech-data-item"><span class="label">P. FLUIDEZ</span><span class="value">${produto.PONTO_FLUIDEZ}°C</span></div>
                        </div>
                    </li>`;
            }
            htmlResultados += `</ul></div>`;
        });
        container.innerHTML = htmlResultados;
        container.scrollIntoView({ behavior: 'smooth' });
    }

    // =======================================================
    //          LÓGICA DO BUSCADOR DE EQUIVALENTES
    // =======================================================
    function popularMarcas() {
        const marcas = new Set(tabelaSimilaridade.flatMap(grupo => Object.keys(grupo.PRODUTOS)));
        Array.from(marcas).sort().forEach(marca => {
            marcaSelect.add(new Option(marca, marca));
        });
    }

    function popularProdutosPorMarca(marcaSelecionada) {
        oleoSelect.innerHTML = '';
        oleoSelect.disabled = !marcaSelecionada;
        oleoSelect.add(new Option(marcaSelecionada ? "-- Selecione o Produto --" : "-- Primeiro selecione uma marca --", ""));

        if (!marcaSelecionada) return;

        const produtos = tabelaSimilaridade
            .map((grupo, index) => ({ grupo, index }))
            .filter(({ grupo }) => grupo.PRODUTOS[marcaSelecionada])
            .map(({ grupo, index }) => ({
                nome: grupo.PRODUTOS[marcaSelecionada].NOME,
                grupoIndex: index
            }))
            .sort((a, b) => a.nome.localeCompare(b.nome));

        produtos.forEach(produto => {
            oleoSelect.add(new Option(produto.nome, produto.grupoIndex));
        });
    }
    
    function encontrarSubstitutos() {
        resultsContainer.innerHTML = '';
        calculatorSearchResultsContainer.innerHTML = '';
        const marcaSelecionada = marcaSelect.value;
        const grupoIndex = oleoSelect.value;
        if (!marcaSelecionada || !grupoIndex) {
            showToast('Por favor, selecione uma marca e um produto.', 'error');
            return;
        }
        const grupoEncontrado = tabelaSimilaridade[parseInt(grupoIndex)];
        exibirResultados(grupoEncontrado, marcaSelecionada);
    }

    function exibirResultados(grupo, marcaOriginal) {
        // ... (o conteúdo desta função permanece o mesmo, pois já é bem estruturado)
        const produtoOriginal = grupo.PRODUTOS[marcaOriginal];
        const substitutos = { ...grupo.PRODUTOS };
        delete substitutos[marcaOriginal];

        let htmlResultados = `
            <h3 class="results-header">Análise de Equivalência</h3>
            <div class="product-card original">
                <h4>Seu Produto: ${produtoOriginal.NOME} (${marcaOriginal})</h4>
                <p><strong>Aplicação:</strong> ${grupo.APLICACAO}</p>
                <div class="tech-data-grid">
                    <div class="tech-data-item"><span class="label">ISO VG / NLGI</span><span class="value">${grupo.ISO_VG}</span></div>
                    <div class="tech-data-item"><span class="label">BASE</span><span class="value">${produtoOriginal.BASE}</span></div>
                    <div class="tech-data-item"><span class="label">ÍNDICE VISC.</span><span class="value">${produtoOriginal.IV}</span></div>
                    <div class="tech-data-item"><span class="label">P. FULGOR</span><span class="value">${produtoOriginal.PONTO_FULGOR}°C</span></div>
                    <div class="tech-data-item"><span class="label">P. FLUIDEZ</span><span class="value">${produtoOriginal.PONTO_FLUIDEZ}°C</span></div>
                </div>
            </div>
            <h4 class="equivalents-title">Produtos Equivalentes Recomendados:</h4>
            <ul class="results-list">`;
        
        if (Object.keys(substitutos).length === 0) {
             htmlResultados += `<p>Nenhum equivalente direto encontrado.</p>`;
        } else {
            for (const marcaSubstituto in substitutos) {
                const produtoSubstituto = substitutos[marcaSubstituto];
                const infoCompat = matrizCompatibilidade[produtoOriginal.BASE]?.[produtoSubstituto.BASE] || { status: "Desconhecido", descricao: "A compatibilidade entre estas bases não está registrada." };
                const statusClass = `compat-${infoCompat.status.toLowerCase()}`;
                const statusText = infoCompat.status.replace("_", " ");

                htmlResultados += `
                    <li>
                        <div class="list-item-header">
                            <div class="product-details">
                                <span class="brand">${marcaSubstituto}:</span>
                                <span class="product">${produtoSubstituto.NOME}</span>
                            </div>
                            <div class="compatibility-info ${statusClass}">
                                <span>${statusText}</span>
                                <i class="fas fa-info-circle info-icon" data-compat-info='${JSON.stringify(infoCompat)}'></i>
                            </div>
                        </div>
                        <div class="tech-data-grid">
                           <div class="tech-data-item"><span class="label">BASE</span><span class="value">${produtoSubstituto.BASE}</span></div>
                            <div class="tech-data-item"><span class="label">ÍNDICE VISC.</span><span class="value">${produtoSubstituto.IV}</span></div>
                            <div class="tech-data-item"><span class="label">P. FULGOR</span><span class="value">${produtoSubstituto.PONTO_FULGOR}°C</span></div>
                            <div class="tech-data-item"><span class="label">P. FLUIDEZ</span><span class="value">${produtoSubstituto.PONTO_FLUIDEZ}°C</span></div>
                        </div>
                    </li>`;
            }
        }
        
        htmlResultados += `</ul><div class="warning-message"><strong>ATENÇÃO:</strong> A compatibilidade de mistura é uma referência. Sempre confirme na ficha técnica (TDS).</div>`;
        resultsContainer.innerHTML = htmlResultados;
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        document.querySelectorAll('.info-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const info = JSON.parse(e.currentTarget.getAttribute('data-compat-info'));
                exibirModalCompatibilidade(info);
            });
        });
    }

    // =======================================================
    //          LÓGICA DO PLANO DE LUBRIFICAÇÃO
    // =======================================================
    let planItems = JSON.parse(localStorage.getItem('lubPlanItems')) || [];

    function popularOleosDoPlano() {
        const todosOsOleos = new Set();
        tabelaSimilaridade.forEach(grupo => {
            for (const marca in grupo.PRODUTOS) {
                todosOsOleos.add(`${grupo.PRODUTOS[marca].NOME} (${marca})`);
            }
        });
        Array.from(todosOsOleos).sort().forEach(oleo => {
            equipmentOilSelect.add(new Option(oleo, oleo));
        });
    }

    function salvarPlano() {
        localStorage.setItem('lubPlanItems', JSON.stringify(planItems));
    }

    function adicionarItemAoPlano(event) {
        event.preventDefault();
        const equipmentName = document.getElementById('equipment-name').value;
        const equipmentOil = document.getElementById('equipment-oil').value;
        const changeInterval = parseInt(document.getElementById('change-interval').value);
        const startDateString = document.getElementById('start-date').value;
        
        if (!equipmentName || !equipmentOil || isNaN(changeInterval) || !startDateString) {
            showToast('Por favor, preencha todos os campos do plano.', 'error');
            return;
        }
        
        const startDate = new Date(startDateString + 'T00:00:00');
        const hoursPerDay = 8;
        const daysToNextChange = changeInterval / hoursPerDay;
        const nextChangeDate = new Date(startDate);
        nextChangeDate.setDate(startDate.getDate() + Math.round(daysToNextChange));
        
        const newItem = {
            id: Date.now(),
            name: equipmentName,
            oil: equipmentOil,
            nextChange: nextChangeDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        };
        planItems.push(newItem);
        salvarPlano();
        renderizarTabelaPlano();
        equipmentForm.reset();
        showToast('Equipamento adicionado ao plano!', 'success');
    }

    function removerItemDoPlano(itemId) {
        planItems = planItems.filter(item => item.id !== itemId);
        salvarPlano();
        renderizarTabelaPlano();
        showToast('Item removido do plano.', 'info');
    }

    function renderizarTabelaPlano() {
        planTableBody.innerHTML = ''; // Limpa a tabela
        if (planItems.length === 0) {
            const row = planTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'Nenhum equipamento no plano ainda.';
            cell.style.textAlign = 'center';
            return;
        }

        // REATORADO: Usa document.createElement para mais segurança e performance
        planItems
          .sort((a, b) => new Date(a.nextChange.split('/').reverse().join('-')) - new Date(b.nextChange.split('/').reverse().join('-')))
          .forEach(item => {
            const row = planTableBody.insertRow();
            row.insertCell().textContent = item.name;
            row.insertCell().textContent = item.oil;
            row.insertCell().textContent = item.nextChange;
            
            const actionCell = row.insertCell();
            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-btn';
            deleteButton.dataset.id = item.id;
            // ACESSIBILIDADE: Adiciona um rótulo claro para leitores de tela
            deleteButton.setAttribute('aria-label', `Remover ${item.name}`);
            deleteButton.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';
            deleteButton.addEventListener('click', () => removerItemDoPlano(item.id));
            
            actionCell.appendChild(deleteButton);
        });
    }

    // =======================================================
    //          EVENT LISTENERS GERAIS
    // =======================================================
    equipmentForm.addEventListener('submit', adicionarItemAoPlano);
    calculateButton.addEventListener('click', calcularViscosidade);
    marcaSelect.addEventListener('change', () => { popularProdutosPorMarca(marcaSelect.value); resultsContainer.innerHTML = ''; });
    searchButton.addEventListener('click', encontrarSubstitutos);
    modalCloseButton.addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });

    // =======================================================
    //          INICIALIZAÇÃO DA APLICAÇÃO
    // =======================================================
    popularMarcas();
    popularProdutosPorMarca('');
    popularOleosDoPlano();
    renderizarTabelaPlano();
});
