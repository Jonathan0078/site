document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const dataInput = document.getElementById('data-input');
    const errorDiv = document.getElementById('error-message');
    const tableBody = document.getElementById('pareto-table-body');
    const chartCanvas = document.getElementById('pareto-chart');

    let paretoChartInstance = null;

    // Preenche com dados de exemplo para facilitar o primeiro uso
    dataInput.value = "Defeitos de pintura, 65\nArranhões na montagem, 22\nFalha no motor, 10\nProblema elétrico, 8\nPeça errada, 4";

    generateBtn.addEventListener('click', () => {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        try {
            const rawData = dataInput.value;
            const processedData = processParetoData(rawData); // Processa os dados localmente
            
            renderChart(processedData);
            renderTable(processedData);

        } catch (error) {
            errorDiv.textContent = `Erro: ${error.message}`;
            errorDiv.style.display = 'block';
        }
    });

    /**
     * Processa os dados brutos de texto e retorna um objeto com os dados para o gráfico e a tabela.
     * Esta função substitui o backend Java.
     * @param {string} rawData - O texto do textarea.
     * @returns {object} - Objeto com labels, values, e cumulativePercentages.
     */
    function processParetoData(rawData) {
        // 1. Parsear os dados
        const lines = rawData.trim().split('\n');
        const items = lines.map((line, index) => {
            if (line.trim() === '') return null; // Ignora linhas vazias

            const parts = line.split(',');
            if (parts.length < 2) {
                throw new Error(`Formato inválido na linha ${index + 1}. Use 'Causa, Valor'.`);
            }
            
            const cause = parts[0].trim();
            const value = parseFloat(parts.slice(1).join(',').trim()); // Permite vírgulas na causa

            if (isNaN(value)) {
                throw new Error(`Valor não numérico na linha ${index + 1}.`);
            }
             if (value < 0) {
                throw new Error(`Valor não pode ser negativo na linha ${index + 1}.`);
            }

            return { cause, value };
        }).filter(item => item !== null); // Remove linhas vazias

        if (items.length === 0) {
            throw new Error('Nenhum dado válido foi fornecido.');
        }

        // 2. Ordenar os itens em ordem decrescente de valor
        items.sort((a, b) => b.value - a.value);

        // 3. Calcular o total e as porcentagens
        const totalValue = items.reduce((sum, item) => sum + item.value, 0);
        let cumulativeSum = 0;
        
        const labels = [];
        const values = [];
        const cumulativePercentages = [];

        items.forEach(item => {
            cumulativeSum += item.value;
            labels.push(item.cause);
            values.push(item.value);
            const percentage = (totalValue === 0) ? 0 : (cumulativeSum / totalValue) * 100;
            cumulativePercentages.push(percentage);
        });

        return { labels, values, cumulativePercentages };
    }

    function renderChart(data) {
        if (paretoChartInstance) {
            paretoChartInstance.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        paretoChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Frequência / Custo',
                    data: data.values,
                    backgroundColor: 'rgba(0, 90, 156, 0.8)',
                    borderColor: 'rgba(0, 90, 156, 1)',
                    yAxisID: 'y-axis-values',
                }, {
                    type: 'line',
                    label: '% Acumulada',
                    data: data.cumulativePercentages,
                    borderColor: 'rgba(255, 199, 44, 1)',
                    backgroundColor: 'rgba(255, 199, 44, 0.2)',
                    borderWidth: 3,
                    tension: 0.1,
                    yAxisID: 'y-axis-percentage',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    'y-axis-values': {
                        beginAtZero: true,
                        position: 'left',
                        title: { display: true, text: 'Frequência / Custo' }
                    },
                    'y-axis-percentage': {
                        min: 0,
                        max: 100,
                        position: 'right',
                        title: { display: true, text: 'Percentual Acumulado (%)' },
                        ticks: { callback: value => value + '%' },
                        grid: { drawOnChartArea: false },
                    }
                },
                plugins: {
                    tooltip: { mode: 'index', intersect: false },
                    legend: { position: 'top' }
                }
            }
        });
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.labels.forEach((label, i) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${label}</td>
                <td>${data.values[i]}</td>
                <td>${data.cumulativePercentages[i].toFixed(2)}%</td>
            `;
        });
    }
});
