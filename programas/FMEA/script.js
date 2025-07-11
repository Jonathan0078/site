document.addEventListener('DOMContentLoaded', () => {
    const severidadeInput = document.getElementById('severidade');
    const ocorrenciaInput = document.getElementById('ocorrencia');
    const deteccaoInput = document.getElementById('deteccao');
    const calcularRpnBtn = document.getElementById('calcularRpn');
    const rpnResultadoSpan = document.getElementById('rpnResultado');
    const addLinhaBtn = document.getElementById('addLinha');
    const fmeaTableBody = document.querySelector('#fmeaTable tbody');
    const gerarPdfBtn = document.getElementById('gerarPdf');

    calcularRpnBtn.addEventListener('click', () => {
        const severidade = parseInt(severidadeInput.value);
        const ocorrencia = parseInt(ocorrenciaInput.value);
        const deteccao = parseInt(deteccaoInput.value);

        if (!isNaN(severidade) && !isNaN(ocorrencia) && !isNaN(deteccao)) {
            const rpn = severidade * ocorrencia * deteccao;
            rpnResultadoSpan.textContent = rpn;
        } else {
            rpnResultadoSpan.textContent = 'Erro: Insira valores válidos.';
        }
    });

    addLinhaBtn.addEventListener('click', () => {
        // Exemplo simplificado: você precisará pegar todos os valores do formulário
        const itemFuncao = "Exemplo Item"; // Pegar do input real
        const modoFalha = "Exemplo Falha"; // Pegar do input real
        const severidade = severidadeInput.value;
        const ocorrencia = ocorrenciaInput.value;
        const deteccao = deteccaoInput.value;
        const rpn = rpnResultadoSpan.textContent;

        const newRow = fmeaTableBody.insertRow();
        newRow.insertCell().textContent = itemFuncao;
        newRow.insertCell().textContent = modoFalha;
        newRow.insertCell().textContent = severidade;
        newRow.insertCell().textContent = ocorrencia;
        newRow.insertCell().textContent = deteccao;
        newRow.insertCell().textContent = rpn;
        // Adicionar outras células conforme seu FMEA
    });

    gerarPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Usando html2canvas para capturar a tabela e depois adicionar ao PDF
        html2canvas(document.getElementById('fmeaTable')).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 190; // Largura da imagem no PDF
            const pageHeight = doc.internal.pageSize.height;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 10; // Posição inicial no PDF

            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            doc.save('fmea_automatico.pdf');
        });
    });
});
