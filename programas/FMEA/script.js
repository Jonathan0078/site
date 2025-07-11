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
    let sortColumn = 'rpn'; // Ordena por RPN por padrão
    let sortDirection = 'desc'; // Ordem descendente por padrão

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
            const row = fmeaTableBody.insertRow();
            row.className = getRpnColorClass(item.rpn);

            row.innerHTML = `
                <td>${item.itemFuncao}</td>
                <td>${item.modoFalha}</td>
                <td>${item.efeitoFalha}</td>
                <td>${item.causaFalha}</td>
                <td>${item.controlesAtuais}</td>
                <td>${item.severidade}</td>
                <td>${item.ocorrencia}</td>
                <td>${item.deteccao}</td>
                <td><b>${item.rpn}</b></td>
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

        const severidade = parseInt(document.getElementById('severidade').value);
        const ocorrencia = parseInt(document.getElementById('ocorrencia').value);
        const deteccao = parseInt(document.getElementById('deteccao').value);

        const entry = {
            itemFuncao: document.getElementById('itemFuncao').value,
            modoFalha: document.getElementById('modoFalha').value,
            efeitoFalha: document.getElementById('efeitoFalha').value,
            causaFalha: document.getElementById('causaFalha').value,
            controlesAtuais: document.getElementById('controlesAtuais').value,
            severidade: severidade,
            ocorrencia: ocorrencia,
            deteccao: deteccao,
            acoesRecomendadas: document.getElementById('acoesRecomendadas').value,
            rpn: severidade * ocorrencia * deteccao
        };
        
        const editIndex = editIndexInput.value;

        if (editIndex !== "") {
            fmeaData[parseInt(editIndex)] = entry;
        } else {
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
        window.scrollTo(0, 0);
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

        const title = "Relatório FMEA - " + new Date().toLocaleDateString('pt-BR');
        doc.text(title, 40, 40);

        const tableHeaders = [...fmeaTableHead.querySelectorAll('th')]
            .map(th => th.textContent)
            .slice(0, -1);

        const tableBody = fmeaData.map(item => Object.values(item));

        doc.autoTable({
            head: [tableHeaders],
            body: tableBody,
            startY: 50,
            theme: 'striped',
            headStyles: { fillColor: [0, 95, 115] },
            styles: { fontSize: 8, cellPadding: 4, halign: 'center' },
            columnStyles: {
                0: { halign: 'left', cellWidth: 80 },
                1: { halign: 'left', cellWidth: 80 },
                2: { halign: 'left', cellWidth: 80 },
                3: { halign: 'left', cellWidth: 80 },
                9: { halign: 'left', cellWidth: 'auto' },
            },
        });

        doc.save('relatorio_fmea.pdf');
    }

    // FUNÇÕES AUXILIARES

    function getRpnColorClass(rpn) {
        if (rpn >= 200) return 'rpn-critical';
        if (rpn >= 120) return 'rpn-high';
        if (rpn >= 60) return 'rpn-medium';
        return 'rpn-low';
    }

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
    renderTable(); // Garante a ordenação inicial na primeira carga
});
