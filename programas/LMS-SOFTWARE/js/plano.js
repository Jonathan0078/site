// js/plano.js

// O caminho agora sobe um nível (../) para encontrar a pasta 'data'
// import { tabelaSimilaridade } from '../data/database.js'; // A importação não é usada, pode ser removida se não for expandida

// Usamos o objeto global jsPDF que foi carregado pelos scripts no HTML
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
    // [FIX] - Seletores corrigidos para corresponder ao HTML de plano.html
    const planForm = document.getElementById('plan-form');
    const equipamentoInput = document.getElementById('equipamento');
    const oleoAplicadoInput = document.getElementById('oleo-aplicado');
    const vidaUtilInput = document.getElementById('vida-util');
    const dataUltimaTrocaInput = document.getElementById('data-ultima-troca');
    const planTableBody = document.getElementById('plan-table-body');
    const generateReportBtn = document.getElementById('generate-report-btn');
    
    // Carrega os itens do plano do localStorage ou inicializa um array vazio
    let planItems = JSON.parse(localStorage.getItem('planItemsSGL')) || [];

    // --- LÓGICA DO PLANNER ---
    function persistItems() {
        localStorage.setItem('planItemsSGL', JSON.stringify(planItems));
    }

    function adicionarItemAoPlano(event) {
        event.preventDefault();
        
        const equipmentName = equipamentoInput.value.trim();
        const oilApplied = oleoAplicadoInput.value.trim();
        const oilLifetime = parseInt(vidaUtilInput.value);
        const lastChangeDateStr = dataUltimaTrocaInput.value;
        
        if (!equipmentName || !oilApplied || isNaN(oilLifetime) || !lastChangeDateStr) {
            alert('Por favor, preencha todos os campos do formulário.');
            return;
        }

        const lastChangeDate = new Date(lastChangeDateStr + 'T00:00:00'); // Garante que a data é lida corretamente
        const hoursPerDay = 8; // Assumimos um turno de 8 horas por dia
        const daysToNextChange = Math.round(oilLifetime / hoursPerDay);
        
        const nextChangeDate = new Date(lastChangeDate);
        nextChangeDate.setDate(lastChangeDate.getDate() + daysToNextChange);
        
        const newItem = {
            id: Date.now(),
            equipamento: equipmentName,
            oleo: oilApplied,
            ultimaTroca: lastChangeDate.toLocaleDateString('pt-BR'),
            proximaTroca: nextChangeDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        };
        planItems.push(newItem);
        persistItems();
        renderizarTabelaPlano();
        planForm.reset();
    }

    function removerItemDoPlano(itemId) {
        if (confirm('Tem a certeza que deseja remover este item do plano?')) {
            planItems = planItems.filter(item => item.id !== itemId);
            persistItems();
            renderizarTabelaPlano();
        }
    }

    function renderizarTabelaPlano() {
        planTableBody.innerHTML = '';
        if (planItems.length === 0) {
            planTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum item no plano ainda. Adicione um acima.</td></tr>`;
            return;
        }
        // Ordena por data da próxima troca
        planItems.sort((a, b) => new Date(a.proximaTroca.split('/').reverse().join('-')) - new Date(b.proximaTroca.split('/').reverse().join('-')));
        
        planItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.equipamento}</td>
                <td>${item.oleo}</td>
                <td>${item.ultimaTroca}</td>
                <td>${item.proximaTroca}</td>
                <td>
                    <button class="action-btn" data-id="${item.id}" title="Remover Item">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            row.querySelector('.action-btn').addEventListener('click', () => removerItemDoPlano(item.id));
            planTableBody.appendChild(row);
        });
    }

    // --- LÓGICA DE GERAÇÃO DE PDF ---
    function generatePDF() {
        if (planItems.length === 0) {
            alert("Não há dados na tabela para gerar um relatório.");
            return;
        }

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Relatório do Plano de Lubrificação Preditivo", 14, 22);
        doc.setFontSize(11);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
        
        const tableColumn = ["Equipamento", "Óleo", "Última Troca", "Próxima Troca"];
        const tableRows = planItems.map(item => [item.equipamento, item.oleo, item.ultimaTroca, item.proximaTroca]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [0, 51, 102] } 
        });

        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.text('Sistema de Gestão de Lubrificação (SGL)', 14, doc.internal.pageSize.height - 10);
            doc.text('Página ' + String(i) + ' de ' + String(pageCount), doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
        }

        doc.save(`Plano_Lubrificacao_${new Date().toISOString().slice(0,10)}.pdf`);
    }

    // --- EVENT LISTENERS ---
    if (planForm) planForm.addEventListener('submit', adicionarItemAoPlano);
    if (generateReportBtn) generateReportBtn.addEventListener('click', generatePDF);

    // --- INICIALIZAÇÃO ---
    renderizarTabelaPlano();
});
