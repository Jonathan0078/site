/* Estilização geral e layout */
:root {
    --primary-color: #005f73;
    --secondary-color: #0a9396;
    --danger-color: #9b2226;
    --light-gray: #f8f9fa;
    --dark-gray: #6c757d;
    --border-color: #dee2e6;
    --card-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    background-color: var(--light-gray);
    color: #333;
}

header {
    background-color: var(--primary-color);
    color: white;
    padding: 20px 40px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

h1 {
    margin: 0;
}

.container {
    padding: 20px;
}

.card {
    background-color: white;
    padding: 25px;
    margin-bottom: 25px;
    border-radius: 8px;
    box-shadow: var(--card-shadow);
}

h2 {
    color: var(--primary-color);
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 10px;
    margin-top: 0;
}

/* Estilos do Formulário */
.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group.rating-group {
    max-width: 150px;
}

label {
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--dark-gray);
}

input[type="text"],
input[type="number"] {
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 95, 115, 0.2);
}

/* Estilos dos Botões */
button, .button-primary, .button-secondary, .button-danger, .action-button {
    padding: 10px 20px;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 10px;
}

button:hover, .button-primary:hover, .button-secondary:hover, .button-danger:hover, .action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.15);
}

.button-primary { background-color: var(--primary-color); }
.button-secondary { background-color: var(--secondary-color); }
.button-danger { background-color: var(--danger-color); }

form button[type="submit"] { margin-right: 10px; }

.output-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.button-group {
    display: flex;
    gap: 10px;
}

/* Estilos da Tabela */
.table-wrapper {
    overflow-x: auto; /* Garante que a tabela seja responsiva em telas pequenas */
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th, td {
    border: 1px solid var(--border-color);
    padding: 12px;
    text-align: left;
    vertical-align: middle;
}

th {
    background-color: #e9ecef;
    color: #495057;
    cursor: pointer;
    position: relative;
}

th:hover {
    background-color: #ced4da;
}

th::after {
    content: '';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
}

th.sort-asc::after { border-bottom-color: var(--primary-color); }
th.sort-desc::after { border-top-color: var(--primary-color); }

tr:nth-child(even) {
    background-color: #f8f9fa;
}

tr:hover {
    background-color: #e2e6ea;
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.action-button {
    padding: 5px 10px;
    font-size: 0.8rem;
}

/* Codificação de Cores do RPN */
.rpn-low { background-color: rgba(40, 167, 69, 0.2); }
.rpn-medium { background-color: rgba(255, 193, 7, 0.2); }
.rpn-high { background-color: rgba(220, 53, 69, 0.2); }
.rpn-critical { background-color: rgba(155, 34, 38, 0.3); }```

#### **`script.js` (Atualizado)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const fmeaForm = document.getElementById('fmeaForm');
    const fmeaTableBody = document.querySelector('#fmeaTable tbody');
    const fmeaTableHead = document.querySelector('#fmeaTable thead');
    const gerarPdfBtn = document.getElementById('gerarPdf');
    const limparDadosBtn = document.getElementById('limparDados');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const editIndexInput = document.getElementById('editIndex');

    let fmeaData = [];
    let sortColumn = null;
    let sortDirection = 'asc';

    // FUNÇÕES PRINCIPAIS

    /**
     * Carrega os dados do localStorage e renderiza a tabela.
     */
    function loadFromLocalStorage() {
        const data = localStorage.getItem('fmeaData');
        if (data) {
            fmeaData = JSON.parse(data);
            renderTable();
        }
    }

    /**
     * Salva os dados atuais no localStorage.
     */
    function saveToLocalStorage() {
        localStorage.setItem('fmeaData', JSON.stringify(fmeaData));
    }

    /**
     * Renderiza a tabela FMEA com os dados atuais.
     */
    function renderTable() {
        fmeaTableBody.innerHTML = ''; // Limpa a tabela antes de renderizar

        // Ordena os dados se uma coluna de ordenação for definida
        if (sortColumn) {
            fmeaData.sort((a, b) => {
                const valA = a[sortColumn];
                const valB = b[sortColumn];
                
                let comparison = 0;
                if (valA > valB) {
                    comparison = 1;
                } else if (valA < valB) {
                    comparison = -1;
                }
                return sortDirection === 'desc' ? comparison * -1 : comparison;
            });
        }

        fmeaData.forEach((item, index) => {
            const rpn = item.severidade * item.ocorrencia * item.deteccao;
            const row = fmeaTableBody.insertRow();
            row.className = getRpnColorClass(rpn);

            row.innerHTML = `
                <td>${item.itemFuncao}</td>
                <td>${item.modoFalha}</td>
                <td>${item.efeitoFalha}</td>
                <td>${item.causaFalha}</td>
                <td>${item.controlesAtuais}</td>
                <td>${item.severidade}</td>
                <td>${item.ocorrencia}</td>
                <td>${item.deteccao}</td>
                <td><b>${rpn}</b></td>
                <td>${item.acoesRecomendadas}</td>
                <td class="action-buttons">
                    <button class="action-button button-secondary" onclick="editRow(${index})">Editar</button>
                    <button class="action-button button-danger" onclick="deleteRow(${index})">Excluir</button>
                </td>
            `;
        });

        updateSortIndicators();
    }

    /**
     * Adiciona ou atualiza uma linha na tabela FMEA.
     * @param {Event} e O evento do formulário.
     */
    function handleFormSubmit(e) {
        e.preventDefault();

        const entry = {
            itemFuncao: document.getElementById('itemFuncao').value,
            modoFalha: document.getElementById('modoFalha').value,
            efeitoFalha: document.getElementById('efeitoFalha').value,
            causaFalha: document.getElementById('causaFalha').value,
            controlesAtuais: document.getElementById('controlesAtuais').value,
            severidade: parseInt(document.getElementById('severidade').value),
            ocorrencia: parseInt(document.getElementById('ocorrencia').value),
            deteccao: parseInt(document.getElementById('deteccao').value),
            acoesRecomendadas: document.getElementById('acoesRecomendadas').value,
        };
        
        entry.rpn = entry.severidade * entry.ocorrencia * entry.deteccao;

        const editIndex = editIndexInput.value;

        if (editIndex !== "") {
            // Atualiza a linha existente
            fmeaData[parseInt(editIndex)] = entry;
        } else {
            // Adiciona uma nova linha
            fmeaData.push(entry);
        }

        saveToLocalStorage();
        renderTable();
        resetForm();
    }

    /**
     * Prepara o formulário para editar uma linha existente.
     * @param {number} index O índice da linha a ser editada.
     */
    window.editRow = function(index) {
        const item = fmeaData[index];
        document.getElementById('itemFuncao').value = item.itemFuncao;
        document.getElementById('modoFalha').value = item.modoFalha;
        document.getElementById('efeitoFalha').value = item.efeitoFalha;
        document.getElementById('causaFalha').value = item.causaFalha;
        document.getElementById('controlesAtuais').value = item.controlesAtuais;
        document.getElementById('severidade').value = item.severidade;
        document.getElementById('ocorrencia').value = item.ocorrencia;
        document.getElementById('deteccao').value = item.deteccao;
        document.getElementById('acoesRecomendadas').value = item.acoesRecomendadas;
        
        editIndexInput.value = index;
        document.querySelector('button[type="submit"]').textContent = 'Atualizar Linha';
        cancelEditBtn.style.display = 'inline-block';
        window.scrollTo(0, 0); // Rola a página para o topo para mostrar o formulário
    };

    /**
     * Exclui uma linha da tabela.
     * @param {number} index O índice da linha a ser excluída.
     */
    window.deleteRow = function(index) {
        if (confirm('Tem certeza que deseja excluir esta linha?')) {
            fmeaData.splice(index, 1);
            saveToLocalStorage();
            renderTable();
        }
    };

    /**
     * Reseta o formulário para o estado inicial.
     */
    function resetForm() {
        fmeaForm.reset();
        editIndexInput.value = '';
        document.querySelector('button[type="submit"]').textContent = 'Salvar Linha';
        cancelEditBtn.style.display = 'none';
    }

    /**
     * Gera um PDF da tabela FMEA.
     */
    function generatePdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
        });

        const title = "Relatório FMEA - " + new Date().toLocaleDateString();
        doc.text(title, 40, 40);

        const tableHeaders = [...fmeaTableHead.querySelectorAll('th')]
            .map(th => th.textContent)
            .slice(0, -1); // Remove a coluna "Ações"

        const tableBody = fmeaData.map(item => [
            item.itemFuncao,
            item.modoFalha,
            item.efeitoFalha,
            item.causaFalha,
            item.controlesAtuais,
            item.severidade,
            item.ocorrencia,
            item.deteccao,
            item.rpn,
            item.acoesRecomendadas
        ]);

        doc.autoTable({
            head: [tableHeaders],
            body: tableBody,
            startY: 50,
            theme: 'striped',
            headStyles: { fillColor: [0, 95, 115] },
            styles: { fontSize: 8, cellPadding: 4 },
            didDrawCell: (data) => {
                // Colore as células da tabela com base no RPN
                 if (data.column.dataKey === 8) { // Coluna RPN
                    const rpn = data.cell.raw;
                    const color = getRpnJsPdfColor(rpn);
                    if (color) {
                       doc.setFillColor(color[0], color[1], color[2]);
                    }
                }
            }
        });

        doc.save('fmea_report.pdf');
    }

    // FUNÇÕES AUXILIARES

    /**
     * Retorna a classe CSS com base no valor do RPN.
     * @param {number} rpn O valor do RPN.
     * @returns {string} A classe CSS.
     */
    function getRpnColorClass(rpn) {
        if (rpn >= 200) return 'rpn-critical';
        if (rpn >= 120) return 'rpn-high';
        if (rpn >= 60) return 'rpn-medium';
        return 'rpn-low';
    }
    
    /**
     * Retorna a cor para o jsPDF com base no valor do RPN.
     * @param {number} rpn O valor do RPN.
     * @returns {Array|null} A cor em formato RGB ou null.
     */
    function getRpnJsPdfColor(rpn){
        if (rpn >= 200) return [220, 53, 69]; // Critical (vermelho escuro)
        if (rpn >= 120) return [255, 193, 7]; // High (amarelo)
        if (rpn >= 60) return [40, 167, 69]; // Medium (verde)
        return null; // Low (sem cor)
    }

    /**
     * Atualiza os indicadores visuais de ordenação nos cabeçalhos da tabela.
     */
    function updateSortIndicators() {
        fmeaTableHead.querySelectorAll('th').forEach(th => {
            if (th.dataset.sort === sortColumn) {
                th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
                th.classList.remove(sortDirection === 'asc' ? 'sort-desc' : 'sort-asc');
            } else {
                th.classList.remove('sort-asc', 'sort-desc');
            }
        });
    }

    // EVENT LISTENERS

    fmeaForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);
    gerarPdfBtn.addEventListener('click', generatePdf);

    limparDadosBtn.addEventListener('click', () => {
        if (confirm('Atenção! Isso apagará todos os dados da tabela. Deseja continuar?')) {
            fmeaData = [];
            saveToLocalStorage();
            renderTable();
            resetForm();
        }
    });

    fmeaTableHead.addEventListener('click', (e) => {
        const th = e.target.closest('th');
        if (!th || !th.dataset.sort) return;

        const newSortColumn = th.dataset.sort;
        if (sortColumn === newSortColumn) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = newSortColumn;
            sortDirection = 'asc';
        }
        renderTable();
    });

    // Inicialização
    loadFromLocalStorage();
});
