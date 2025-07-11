document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rime-form');
    const resultDisplay = document.getElementById('result-display');
    const recommendationDisplay = document.getElementById('recommendation-display');
    const criticidadeSelect = document.getElementById('criticidade');
    const estrategiaSelect = document.getElementById('estrategia');
    const allCells = document.querySelectorAll('#rime-matrix td');

    // Função para limpar destaques e resultados
    const clearResults = () => {
        allCells.forEach(cell => cell.classList.remove('highlight'));
        resultDisplay.textContent = 'Aguardando cálculo...';
        resultDisplay.className = 'result-display';
        recommendationDisplay.innerHTML = '<p><strong>Ação Recomendada:</strong> Selecione os fatores e clique em "Calcular" para ver a estratégia sugerida.</p>';
    };

    // Evento de submissão do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        // Limpa o destaque anterior
        allCells.forEach(cell => cell.classList.remove('highlight'));

        // Obtém os valores dos selects
        const criticidadeValue = parseInt(criticidadeSelect.value);
        const estrategiaValue = parseInt(estrategiaSelect.value);

        // Obtém a letra da linha para identificar a célula
        const criticidadeRow = criticidadeSelect.options[criticidadeSelect.selectedIndex].dataset.row;

        // Calcula a pontuação
        const score = criticidadeValue * estrategiaValue;

        // Encontra e destaca a célula correspondente
        const targetCellId = `cell-${criticidadeRow}-${estrategiaValue}`;
        const targetCell = document.getElementById(targetCellId);
        if (targetCell) {
            targetCell.classList.add('highlight');
            targetCell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }

        // Exibe a pontuação e a recomendação
        resultDisplay.textContent = `Pontuação RIME: ${score}`;
        updateRecommendation(score);
    });

    // Evento de reset do formulário
    form.addEventListener('reset', () => {
        clearResults();
    });

    // Função para atualizar a recomendação e a cor do display de resultado
    const updateRecommendation = (score) => {
        let recommendationText = '';
        let resultClass = '';

        if (score >= 20) {
            resultClass = 'alta';
            recommendationText = '<strong>PRIORIDADE MÁXIMA:</strong> Ação imediata requerida. Risco intolerável para segurança, meio ambiente ou funcionalidade core. Implementar plano de contingência e análise de causa raiz (RCA/FMEA) urgente. Considere redesign ou substituição do ativo.';
        } else if (score >= 12) {
            resultClass = 'media';
            recommendationText = '<strong>PRIORIDADE ALTA:</strong> Falha com impacto significativo. Aumentar a frequência de inspeções e migrar para manutenção preditiva (análise de vibração, termografia, etc.). Planejar intervenção corretiva na próxima janela de oportunidade.';
        } else if (score >= 7) {
            resultClass = 'baixa';
            recommendationText = '<strong>PRIORIDADE MÉDIA:</strong> Impacto moderado. Manter plano de manutenção preventiva atual, mas revisar sua eficácia. Otimizar rotas de inspeção e garantir disponibilidade de peças de reposição.';
        } else {
            resultClass = 'baixa'; // Mantendo uma cor mais suave para prioridades baixas
            recommendationText = '<strong>PRIORIDADE BAIXA:</strong> Impacto mínimo. Manter rotinas básicas de manutenção e limpeza. Ação corretiva pode ser postergada sem grande prejuízo. Monitorar em intervalos longos.';
        }

        resultDisplay.className = `result-display ${resultClass}`;
        recommendationDisplay.innerHTML = `<p><strong>Ação Recomendada:</strong> ${recommendationText}</p>`;
    };
});
