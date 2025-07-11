document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEÇÃO DE ELEMENTOS DO DOM ---
    const directSearchInput = document.getElementById('bearing-spec');
    const directSearchBtn = document.getElementById('direct-search-btn');
    const boreSearchInput = document.getElementById('bore-diameter-search');
    const outerSearchInput = document.getElementById('outer-diameter-search');
    const widthSearchInput = document.getElementById('width-search');
    const advancedSearchBtn = document.getElementById('advanced-search-btn');
    const isoInput = document.getElementById('iso-spec-input');
    const isoCalculateBtn = document.getElementById('iso-calculate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resultDisplay = document.getElementById('result-display');
    const copyBtn = document.getElementById('copy-btn');
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    const historyList = document.getElementById('history-list');

    // --- 2. ESTADO DA APLICAÇÃO ---
    let rolamentosDB = [];
    let searchHistory = JSON.parse(localStorage.getItem('bearingSearchHistory')) || [];
    const API_BASE_URL = 'http://127.0.0.1:5000';

    // --- 3. INICIALIZAÇÃO ---
    async function init() {
        loadTheme();
        renderHistory();
        await loadData();
        setupEventListeners();
        showPlaceholder('Aguardando sua consulta...');
    }

    // --- 4. FUNÇÕES DE DADOS E API ---
    async function loadData() {
        showLoading('Carregando base de dados...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/rolamentos`);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            rolamentosDB = await response.json();
            showPlaceholder('Base de dados carregada. Pronto para consultar.');
        } catch (error) {
            console.error("Falha ao carregar dados da API:", error);
            showError('Erro crítico ao conectar com a API. Verifique se o servidor `app.py` está em execução e tente recarregar a página.');
        }
    }

    // --- 5. FUNÇÕES DE LÓGICA PRINCIPAL ---
    function handleDirectSearch() {
        const spec = directSearchInput.value.trim().toUpperCase();
        if (!spec) {
            showWarning('Por favor, digite uma especificação.');
            return;
        }
        showLoading(`Buscando por "${spec}"...`);
        const bearingData = rolamentosDB.find(b => b.designacao.toUpperCase() === spec);
        if (bearingData) {
            displayBearingDetails(bearingData);
            addToHistory(spec);
        } else {
            showWarning(`Rolamento '${spec}' não encontrado na base de dados.`, 'Tente a busca por medidas ou a calculadora de furo ISO.');
        }
    }
    
    function handleAdvancedSearch() {
        const d = parseFloat(boreSearchInput.value);
        const D = parseFloat(outerSearchInput.value);
        const B = parseFloat(widthSearchInput.value);

        if (isNaN(d) && isNaN(D) && isNaN(B)) {
            showWarning('Preencha ao menos um campo para a busca avançada.');
            return;
        }
        showLoading('Filtrando rolamentos...');
        
        const results = rolamentosDB.filter(b => {
            const match_d = isNaN(d) || b.d === d;
            const match_D = isNaN(D) || b.D === D;
            const match_B = isNaN(B) || (b.B || b.T) === B;
            return match_d && match_D && match_B;
        });

        if (results.length > 0) {
            displaySearchResults(results);
        } else {
            showWarning('Nenhum rolamento encontrado com os critérios informados.');
        }
    }

    function handleISOCalculation() {
        const especificacao = isoInput.value.trim();
        if (!especificacao || especificacao.length < 2) {
            showWarning("Digite uma especificação com pelo menos 2 caracteres.", "Calculadora ISO");
            return;
        }
        try {
            const codigo_furo_str = especificacao.slice(-2);
            const codigo_furo_int = parseInt(codigo_furo_str, 10);
            if (isNaN(codigo_furo_int)) {
                throw new Error("Os dois últimos caracteres não são numéricos.");
            }
            let resultado;
            if (codigo_furo_int === 0) resultado = "Furo de 10 mm (código 00)";
            else if (codigo_furo_int === 1) resultado = "Furo de 12 mm (código 01)";
            else if (codigo_furo_int === 2) resultado = "Furo de 15 mm (código 02)";
            else if (codigo_furo_int === 3) resultado = "Furo de 17 mm (código 03)";
            else if (4 <= codigo_furo_int && codigo_furo_int <= 96) {
                const diametro = codigo_furo_int * 5;
                resultado = `Furo de ${diametro} mm (código ${codigo_furo_str})`;
            } else {
                showWarning(`Código '${codigo_furo_str}' não segue a regra padrão.`, "Calculadora ISO");
                return;
            }
            showInfo(`Resultado para '${especificacao}'`, resultado);
        } catch (e) {
            showError(`Erro ao calcular: ${e.message}`, "Calculadora ISO");
        }
    }
    
    // --- 6. FUNÇÕES DE UI / EXIBIÇÃO ---
    function showPlaceholder(message) {
        resultDisplay.innerHTML = `<div class="result-placeholder"><i class="fa-solid fa-magnifying-glass"></i><p>${message}</p></div>`;
        copyBtn.style.display = 'none';
    }
    function showLoading(message) {
        resultDisplay.innerHTML = `<div class="result-placeholder"><i class="fa-solid fa-spinner fa-spin"></i><p>${message}</p></div>`;
        copyBtn.style.display = 'none';
    }
    function showWarning(message, subtext = 'Verifique os dados e tente novamente.') {
        resultDisplay.innerHTML = `<div class="result-item warning"><span class="label">${message}</span><span class="value" style="font-size: 1rem;">${subtext}</span></div>`;
        copyBtn.style.display = 'none';
    }
    function showError(message, subtext = 'Ocorreu um problema inesperado.') {
        resultDisplay.innerHTML = `<div class="result-item error"><span class="label">${message}</span><span class="value" style="font-size: 1rem;">${subtext}</span></div>`;
        copyBtn.style.display = 'none';
    }
    function showInfo(label, value) {
        resultDisplay.innerHTML = `<div class="result-item info"><span class="label">${label}</span><span class="value">${value}</span></div>`;
        copyBtn.style.display = 'none';
    }

    function displayBearingDetails(data) {
        const larguraLabel = data.T ? 'Largura Total (T)' : 'Largura (B)';
        const larguraValue = data.T || data.B;
        
        resultDisplay.innerHTML = `
            <div class="result-item success">
                <span class="label">Rolamento Encontrado:</span>
                <span class="value" id="result-value">${data.designacao}</span>
            </div>
            <div class="result-item"><span class="label">Tipo</span><span class="value" style="font-size: 1.2rem;">${data.tipo}</span></div>
            <div class="results-grid-main">
                <div class="result-item"><span class="label">Furo (d)</span><span class="value">${data.d} mm</span></div>
                <div class="result-item"><span class="label">Externo (D)</span><span class="value">${data.D} mm</span></div>
                <div class="result-item"><span class="label">${larguraLabel}</span><span class="value">${larguraValue} mm</span></div>
                <div class="result-item"><span class="label">Massa</span><span class="value">${data.massa || '-'} kg</span></div>
                <div class="result-item"><span class="label">Carga Din. (C)</span><span class="value">${data.C || '-'} N</span></div>
                <div class="result-item"><span class="label">Carga Est. (C0)</span><span class="value">${data.C0 || '-'} N</span></div>
                <div class="result-item"><span class="label">RPM (Graxa)</span><span class="value">${data.rpm_graxa || '-'}</span></div>
                <div class="result-item"><span class="label">RPM (Óleo)</span><span class="value">${data.rpm_oleo || '-'}</span></div>
            </div>
            ${data.notas ? `<div class="result-item warning"><span class="label">Observação</span><span class="value" style="font-size: 1rem;">${data.notas}</span></div>` : ''}
        `;
        copyBtn.style.display = 'block';
    }
    
    function displaySearchResults(results) {
        resultDisplay.innerHTML = `
            <div class="result-item success">
                <span class="label">${results.length} resultado(s) encontrado(s):</span>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Designação</th><th>Tipo</th><th>d</th><th>D</th><th>B/T</th></tr></thead>
                    <tbody>
                        ${results.map(b => `<tr>
                            <td><strong>${b.designacao}</strong></td>
                            <td>${b.tipo}</td>
                            <td>${b.d}</td>
                            <td>${b.D}</td>
                            <td>${b.T || b.B}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        copyBtn.style.display = 'none';
    }

    // --- 7. FUNÇÕES AUXILIARES ---
    function clearAll() {
        directSearchInput.value = '';
        boreSearchInput.value = '';
        outerSearchInput.value = '';
        widthSearchInput.value = '';
        isoInput.value = '';
        showPlaceholder('Aguardando sua consulta...');
        directSearchInput.focus();
    }
    
    function loadTheme() {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
        }
    }
    
    function addToHistory(spec) {
        // Remove a especificação se já existir para movê-la para o topo
        searchHistory = searchHistory.filter(item => item !== spec);
        // Adiciona no início do array
        searchHistory.unshift(spec);
        // Limita o histórico a 10 itens
        if (searchHistory.length > 10) {
            searchHistory.pop();
        }
        localStorage.setItem('bearingSearchHistory', JSON.stringify(searchHistory));
        renderHistory();
    }
    
    function renderHistory() {
        if (searchHistory.length === 0) {
            historyList.innerHTML = '<li class="history-placeholder">Nenhuma busca recente.</li>';
            return;
        }
        historyList.innerHTML = searchHistory.map(item => `<li data-spec="${item}">${item}</li>`).join('');
    }

    // --- 8. EVENT LISTENERS ---
    function setupEventListeners() {
        directSearchBtn.addEventListener('click', handleDirectSearch);
        advancedSearchBtn.addEventListener('click', handleAdvancedSearch);
        isoCalculateBtn.addEventListener('click', handleISOCalculation);
        clearBtn.addEventListener('click', clearAll);
        
        directSearchInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleDirectSearch());
        boreSearchInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleAdvancedSearch());
        outerSearchInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleAdvancedSearch());
        widthSearchInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleAdvancedSearch());
        isoInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleISOCalculation());
        
        copyBtn.addEventListener('click', () => {
            const resultValue = document.getElementById('result-value')?.innerText;
            if (resultValue) {
                navigator.clipboard.writeText(resultValue).then(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(() => { copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>'; }, 1500);
                });
            }
        });

        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });

        historyList.addEventListener('click', (e) => {
            if (e.target && e.target.matches('li[data-spec]')) {
                const spec = e.target.getAttribute('data-spec');
                directSearchInput.value = spec;
                handleDirectSearch();
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    init();
});
