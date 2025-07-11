document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERÊNCIAS AOS ELEMENTOS DO DOM ---
    const form = document.getElementById('form-mancal');
    const calcularBtn = document.getElementById('calcular-btn');
    const btnText = document.querySelector('#calcular-btn .btn-text');
    const btnSpinner = document.querySelector('#calcular-btn .spinner');

    // Contêineres de "Views"
    const views = {
        calculadora: document.getElementById('view-calculadora'),
        historico: document.getElementById('view-historico'),
        multiplos: document.getElementById('view-multiplos')
    };

    // Elementos da Calculadora Principal
    const resultadoContainer = document.getElementById('resultado-container');
    const resultadoDisplay = document.getElementById('resultado-display');
    const erroContainer = document.getElementById('erro-container');
    const graficoWhatIfContainer = document.getElementById('grafico-whatif-container');

    // Elementos do Menu e Navegação
    const abrirMenuBtn = document.getElementById('abrir-menu-btn');
    const menuPopup = document.getElementById('menu-popup');

    // Elementos do Histórico
    const historicoList = document.getElementById('historico-list');
    
    // Elementos de Múltiplos Mancais
    const adicionarMancalBtn = document.getElementById('adicionar-mancal-btn');
    const mancaisListContainer = document.getElementById('mancais-list');
    const resultadoMultiplosDisplay = document.getElementById('resultado-multiplos');

    // --- 2. VARIÁVEIS DE ESTADO E GRÁFICOS ---
    const HISTORICO_KEY = 'historico_dissipacao_v2';
    let whatIfChart = null;
    let multiplosChart = null;

    // --- 3. LÓGICA DE NAVEGAÇÃO E MENU ---
    const showView = (viewName) => {
        Object.values(views).forEach(view => view.classList.add('hidden'));
        if (views[viewName]) {
            views[viewName].classList.remove('hidden');
        }
        menuPopup.classList.remove('open');
    };

    const setupNavigation = () => {
        document.getElementById('nav-calculadora').addEventListener('click', () => showView('calculadora'));
        document.getElementById('nav-historico').addEventListener('click', () => showView('historico'));
        document.getElementById('nav-multiplos').addEventListener('click', () => showView('multiplos'));

        abrirMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuPopup.classList.toggle('open');
        });

        document.body.addEventListener('click', (e) => {
            if (!menuPopup.contains(e.target) && e.target !== abrirMenuBtn) {
                menuPopup.classList.remove('open');
            }
        });
    };

    // --- 4. FUNÇÕES AUXILIARES E DE UI ---
    const toggleLoading = (isLoading) => {
        if (isLoading) {
            calcularBtn.disabled = true;
            btnText.classList.add('hidden');
            btnSpinner.classList.remove('hidden');
            calcularBtn.classList.add('loading');
        } else {
            calcularBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
            calcularBtn.classList.remove('loading');
        }
    };

    const showError = (message) => {
        erroContainer.textContent = message;
        erroContainer.classList.remove('hidden');
        resultadoContainer.classList.add('hidden');
        graficoWhatIfContainer.classList.add('hidden');
    };

    const hideError = () => {
        erroContainer.classList.add('hidden');
    };

    // --- 5. LÓGICA PRINCIPAL DA CALCULADORA ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        toggleLoading(true);
        hideError();

        // Coleta de dados do formulário
        const inputs = {
            tipoMancal: document.getElementById('tipo-mancal').value,
            carga: parseFloat(document.getElementById('carga').value),
            velocidade: parseFloat(document.getElementById('velocidade').value),
            tempOper: parseFloat(document.getElementById('temp-oper').value),
            tempAmb: parseFloat(document.getElementById('temp-amb').value),
            tipoLub: document.getElementById('tipo-lubrificacao').value,
            diametroEixo: parseFloat(document.getElementById('diametro-eixo').value),
            tempoOperacao: parseFloat(document.getElementById('tempo-operacao').value)
        };

        // Validação
        const validationError = validateInputs(inputs);
        if (validationError) {
            showError(validationError);
            toggleLoading(false);
            return;
        }

        // Cálculo
        const resultData = calculateDissipation(inputs);
        
        // Exibição dos resultados e gráficos
        displayResults(resultData);
        generateWhatIfChart(inputs);
        saveToHistory(resultData);

        setTimeout(() => toggleLoading(false), 300); // Pequeno delay para feedback visual
    };

    const validateInputs = (inputs) => {
        for (const key in inputs) {
            if (typeof inputs[key] === 'number' && (isNaN(inputs[key]) || inputs[key] < 0)) {
                return `Por favor, preencha todos os campos com valores numéricos positivos. Campo inválido: ${key}.`;
            }
        }
        if (inputs.diametroEixo <= 0) return 'O diâmetro do eixo deve ser maior que zero.';
        if (inputs.tempoOperacao <= 0) return 'O tempo de operação deve ser maior que zero.';
        if (inputs.tempOper <= inputs.tempAmb) return 'A temperatura de operação deve ser maior que a temperatura ambiente.';
        return null;
    };

    const calculateDissipation = (inputs) => {
        const { tipoMancal, tipoLub, carga, diametroEixo, velocidade, tempOper, tempAmb, tempoOperacao } = inputs;
        
        // Estimativa de coeficiente de atrito
        let coefAtrito = 0.01; // Padrão
        if (tipoMancal === 'Bucha') coefAtrito = tipoLub === 'Óleo' ? 0.08 : 0.12;
        if (tipoMancal === 'Rolamento') coefAtrito = tipoLub === 'Óleo' ? 0.005 : 0.008;

        // Fórmula baseada na potência de atrito: P = Força de Atrito * Velocidade
        const forcaAtrito = carga * coefAtrito;
        const velocidadeLinear = (Math.PI * diametroEixo * velocidade) / (60 * 1000); // mm e rpm para m/s
        const dissipacao = forcaAtrito * velocidadeLinear; // Resultado em Watts (N*m/s)

        const energiaDissipada = (dissipacao * tempoOperacao) / 1000; // W*h para kWh
        const deltaT = tempOper - tempAmb;

        // Status
        let statusMsg, statusClass;
        if (dissipacao > 100) {
            statusMsg = 'Atenção: Dissipação elevada! Verifique lubrificação, refrigeração e condições de operação.';
            statusClass = 'elevada';
        } else if (dissipacao < 10) {
            statusMsg = 'Dissipação baixa. Condições normais.';
            statusClass = 'baixa';
        } else {
            statusMsg = 'Dissipação moderada. Fique atento a variações.';
            statusClass = 'moderada';
        }

        return { ...inputs, dissipacao, energiaDissipada, coefAtrito, velocidadeLinear, deltaT, statusMsg, statusClass, timestamp: new Date().toISOString() };
    };

    const displayResults = (data) => {
        resultadoContainer.classList.remove('dissipacao-elevada', 'dissipacao-moderada', 'dissipacao-baixa', 'hidden');
        resultadoContainer.classList.add(`dissipacao-${data.statusClass}`);

        resultadoDisplay.innerHTML = `
            <div class="dissipacao-valor">${data.dissipacao.toFixed(2)} W</div>
            <div><strong>Energia Dissipada:</strong> ${data.energiaDissipada.toFixed(3)} kWh (em ${data.tempoOperacao}h)</div>
            <div><strong>Coeficiente de Atrito Estimado:</strong> ${data.coefAtrito}</div>
            <div><strong>Velocidade Linear no Eixo:</strong> ${data.velocidadeLinear.toFixed(3)} m/s</div>
            <div><strong>ΔT (Operação - Ambiente):</strong> ${data.deltaT.toFixed(1)} °C</div>
            <div class="dissipacao-status ${data.statusClass}">${data.statusMsg}</div>
        `;
        resultadoContainer.classList.remove('hidden');
    };

    // --- 6. LÓGICA DO HISTÓRICO ---
    const getHistory = () => JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]');
    const saveToHistory = (item) => {
        let history = getHistory();
        history.unshift(item); // Adiciona no início
        if (history.length > 20) history.pop(); // Limita a 20 itens
        localStorage.setItem(HISTORICO_KEY, JSON.stringify(history));
        renderHistory();
    };

    const renderHistory = () => {
        historicoList.innerHTML = '';
        const history = getHistory();
        if (history.length === 0) {
            historicoList.innerHTML = '<li>Nenhum cálculo no histórico.</li>';
            return;
        }
        history.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'historico-list-item';
            li.innerHTML = `
                <strong>${new Date(item.timestamp).toLocaleString('pt-BR')}</strong><br>
                Dissipação: <strong>${item.dissipacao.toFixed(2)} W</strong> | Mancal: ${item.tipoMancal}
            `;
            li.addEventListener('click', () => loadFromHistory(item));
            historicoList.appendChild(li);
        });
    };

    const loadFromHistory = (itemData) => {
        Object.keys(itemData).forEach(key => {
            const el = document.getElementById(key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`));
            if (el) {
                el.value = itemData[key];
            }
        });
        showView('calculadora');
        // Rola até o formulário para melhor UX
        form.scrollIntoView({ behavior: 'smooth' });
        // Esconde o resultado anterior
        resultadoContainer.classList.add('hidden');
        graficoWhatIfContainer.classList.add('hidden');
    };

    const clearHistory = () => {
        localStorage.removeItem(HISTORICO_KEY);
        renderHistory();
    };

    // --- 7. LÓGICA DE MÚLTIPLOS MANCAIS ---
    const addMancalRow = () => {
        const index = mancaisListContainer.children.length;
        const div = document.createElement('div');
        div.className = 'mancal-item';
        div.innerHTML = `
            <span>#${index + 1}</span>
            <input type="number" placeholder="Carga (N)" class="m-carga" required>
            <input type="number" placeholder="Velocidade (rpm)" class="m-velocidade" required>
            <input type="number" placeholder="Diâmetro (mm)" class="m-diametro" required>
            <button type="button" class="remover-mancal">Remover</button>
        `;
        mancaisListContainer.appendChild(div);
        div.querySelector('.remover-mancal').addEventListener('click', () => {
            div.remove();
            calculateAndDisplayMultiplos();
        });
        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', calculateAndDisplayMultiplos);
        });
        calculateAndDisplayMultiplos();
    };

    const calculateAndDisplayMultiplos = () => {
        let totalDissipacao = 0;
        const labels = [];
        const data = [];

        mancaisListContainer.querySelectorAll('.mancal-item').forEach((item, index) => {
            const carga = parseFloat(item.querySelector('.m-carga').value);
            const velocidade = parseFloat(item.querySelector('.m-velocidade').value);
            const diametro = parseFloat(item.querySelector('.m-diametro').value);
            
            if (!isNaN(carga) && !isNaN(velocidade) && !isNaN(diametro) && carga > 0 && velocidade > 0 && diametro > 0) {
                // Usando uma estimativa simplificada para múltiplos (coef. atrito rolamento com graxa)
                const forcaAtrito = carga * 0.008;
                const velocidadeLinear = (Math.PI * diametro * velocidade) / (60 * 1000);
                const dissipacao = forcaAtrito * velocidadeLinear;
                totalDissipacao += dissipacao;
                labels.push(`Mancal #${index + 1}`);
                data.push(dissipacao);
            }
        });

        resultadoMultiplosDisplay.innerHTML = `<strong>Dissipação Total Estimada:</strong> ${totalDissipacao.toFixed(2)} W`;
        updateMultiplosChart(labels, data);
    };

    // --- 8. LÓGICA DOS GRÁFICOS (Chart.js) ---
    const generateWhatIfChart = (baseInputs) => {
        const labels = [];
        const data = [];
        const step = baseInputs.velocidade > 500 ? 250 : 50;
        
        for (let v = 0; v <= baseInputs.velocidade * 2; v += step) {
            if(v === 0 && baseInputs.velocidade > 0) continue;
            const tempInputs = { ...baseInputs, velocidade: v };
            const result = calculateDissipation(tempInputs);
            labels.push(`${v} rpm`);
            data.push(result.dissipacao.toFixed(2));
        }

        const ctx = document.getElementById('grafico-whatif').getContext('2d');
        if (whatIfChart) {
            whatIfChart.destroy();
        }
        whatIfChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Dissipação (W)',
                    data: data,
                    borderColor: 'rgba(0, 90, 156, 1)',
                    backgroundColor: 'rgba(0, 90, 156, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
        graficoWhatIfContainer.classList.remove('hidden');
    };


    const updateMultiplosChart = (labels, data) => {
        const ctx = document.getElementById('grafico-multiplos').getContext('2d');
        if (multiplosChart) {
            multiplosChart.destroy();
        }
        multiplosChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Dissipação Individual (W)',
                    data: data,
                    backgroundColor: 'rgba(255, 193, 7, 0.8)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
    };
    
    // --- 9. LÓGICA DE EXPORTAÇÃO ---
    const exportToCSV = () => {
        const data = getHistory()[0]; // Pega o último resultado
        if (!data) {
            alert('Calcule um resultado primeiro para exportar.');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Parâmetro,Valor,Unidade\r\n";
        Object.entries({
            'Tipo de Mancal': [data.tipoMancal, ''],
            'Carga': [data.carga, 'N'],
            'Velocidade': [data.velocidade, 'rpm'],
            'Temperatura de Operação': [data.tempOper, '°C'],
            'Temperatura Ambiente': [data.tempAmb, '°C'],
            'Diâmetro do Eixo': [data.diametroEixo, 'mm'],
            '---': ['---','---'],
            'Dissipação Térmica': [data.dissipacao.toFixed(2), 'W'],
            'Energia Dissipada': [data.energiaDissipada.toFixed(3), `kWh em ${data.tempoOperacao}h`],
        }).forEach(([key, value]) => {
            csvContent += `${key},${value[0]},${value[1]}\r\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `calculo_dissipacao_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (resultadoContainer.classList.contains('hidden')) {
             alert('Calcule um resultado primeiro para exportar.');
             return;
        }
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const elementToCapture = document.getElementById('resultado-container');
        
        pdf.text("Relatório de Dissipação Térmica", 105, 15, { align: 'center' });

        html2canvas(elementToCapture, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // A4 width with margin
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth, pdfHeight);
            
            // Adicionar o gráfico
             if (!graficoWhatIfContainer.classList.contains('hidden')) {
                 html2canvas(document.getElementById('grafico-whatif'), {scale: 2}).then(chartCanvas => {
                    pdf.addPage();
                    pdf.text("Análise de Sensibilidade (Dissipação vs. Velocidade)", 105, 15, { align: 'center' });
                    const chartImgData = chartCanvas.toDataURL('image/png');
                    pdf.addImage(chartImgData, 'PNG', 10, 25, pdfWidth, 100);
                    pdf.save(`relatorio_dissipacao_${new Date().toISOString().slice(0,10)}.pdf`);
                 });
             } else {
                 pdf.save(`relatorio_dissipacao_${new Date().toISOString().slice(0,10)}.pdf`);
             }
        });
    };

    // --- 10. INICIALIZAÇÃO E EVENT LISTENERS ---
    const init = () => {
        form.addEventListener('submit', handleFormSubmit);
        document.getElementById('limpar-historico-btn').addEventListener('click', clearHistory);
        adicionarMancalBtn.addEventListener('click', addMancalRow);
        document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
        document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);
        
        setupNavigation();
        renderHistory();
        showView('calculadora'); // Garante que a view inicial é a calculadora
        addMancalRow(); // Adiciona uma linha inicial para múltiplos mancais
    };

    init();
});
