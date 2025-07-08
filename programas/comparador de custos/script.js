document.getElementById('form-custos').addEventListener('submit', function(e) {
  e.preventDefault();

  // Oculta o container de resultado antes de exibir um novo resultado
  document.getElementById('resultado-container').classList.add('hidden');

  const custoParada = parseFloat(document.getElementById('custo-parada').value);
  const custoPecas = parseFloat(document.getElementById('custo-pecas').value);
  const custoMaoObra = parseFloat(document.getElementById('custo-mao-obra').value);
  const falhasAno = parseFloat(document.getElementById('falhas-ano').value);
  const intervaloPrev = parseFloat(document.getElementById('intervalo-prev').value);
  const custoPrev = parseFloat(document.getElementById('custo-prev').value);

  // Validação de dados
  if ([custoParada, custoPecas, custoMaoObra, falhasAno, custoPrev].some(isNaN) || intervaloPrev <= 0 || isNaN(intervaloPrev)) {
    document.getElementById('resultado').innerHTML = '<span class="error-message">Por favor, preencha todos os campos com números válidos e certifique-se de que o Intervalo de Manutenção Preventiva seja maior que zero.</span>';
    document.getElementById('resultado-container').classList.remove('hidden'); // Exibe a mensagem de erro
    if(window.graficoCustosInstance) window.graficoCustosInstance.destroy();
    return;
  }

  // Custo anual corretiva
  const custoCorretiva = (custoParada + custoPecas + custoMaoObra) * falhasAno;
  // Custo anual preventiva
  const manutPrevAno = 12 / intervaloPrev;
  const custoPreventiva = manutPrevAno * custoPrev;

  let economia = custoCorretiva - custoPreventiva;
  let msg = `<strong>Custo anual manutenção corretiva:</strong> R$ ${custoCorretiva.toLocaleString('pt-BR', {minimumFractionDigits:2})}<br>`;
  msg += `<strong>Custo anual manutenção preventiva:</strong> R$ ${custoPreventiva.toLocaleString('pt-BR', {minimumFractionDigits:2})}<br>`;

  if (custoCorretiva > custoPreventiva) {
    msg += `<span class="success-message">A manutenção preventiva é mais econômica.<br>Economia anual estimada: <b>R$ ${economia.toLocaleString('pt-BR', {minimumFractionDigits:2})}</b></span>`;
  } else if (custoCorretiva < custoPreventiva) {
    msg += `<span class="error-message">A manutenção corretiva é mais econômica.<br>Desvantagem anual estimada: <b>R$ ${Math.abs(economia).toLocaleString('pt-BR', {minimumFractionDigits:2})}</b></span>`;
  } else {
    msg += '<span style="color:var(--cor-destaque)">Os custos são equivalentes.</span>';
  }
  msg += `<br><small>Considere também fatores indiretos como confiabilidade, segurança, impacto na produção e valor residual dos equipamentos.</small>`;
  document.getElementById('resultado').innerHTML = msg;

  // Exibe o container de resultado
  document.getElementById('resultado-container').classList.remove('hidden');

  // Gráfico de comparação
  if(window.graficoCustosInstance) window.graficoCustosInstance.destroy();
  const ctx = document.getElementById('graficoCustos').getContext('2d');
  window.graficoCustosInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Corretiva', 'Preventiva'],
      datasets: [
        {
          label: 'Custo Anual (R$)',
          data: [custoCorretiva, custoPreventiva],
          backgroundColor: [
            'var(--cor-erro)', // Corretiva
            'var(--cor-sucesso)' // Preventiva
          ]
        },
        {
          label: 'Frequência (vezes/ano)', // Rótulo ajustado
          data: [falhasAno, manutPrevAno],
          backgroundColor: [
            'var(--cor-destaque)', // Falhas/ano
            'var(--cor-secundaria)' // Manutenções Preventivas/ano
          ],
          yAxisID: 'y1',
          type: 'line',
          borderColor: [
            'var(--cor-destaque)',
            'var(--cor-secundaria)'
          ],
          borderWidth: 2,
          fill: false,
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: false, // Mantido como false para controle manual
      plugins: {
        legend: { display: true, position: 'bottom' },
        title: {
          display: true,
          text: 'Comparação de Custos e Frequência de Manutenção',
          font: { size: 16, family: 'Oswald, sans-serif', weight: 'bold' },
          color: 'var(--cor-primaria)'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if(context.dataset.label === 'Custo Anual (R$)') {
                return context.dataset.label + ': R$ ' + context.parsed.y.toLocaleString('pt-BR', {minimumFractionDigits:2});
              } else {
                return context.dataset.label + ': ' + context.parsed.y.toLocaleString('pt-BR', {maximumFractionDigits:2});
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Custo (R$)',
            font: { size: 12, family: 'Roboto, sans-serif' },
            color: 'var(--cor-texto)'
          },
          ticks: {
            callback: function(value) {
              return 'R$ ' + value.toLocaleString('pt-BR', {minimumFractionDigits:0});
            }
          }
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: {
            display: true,
            text: 'Frequência (vezes/ano)',
            font: { size: 12, family: 'Roboto, sans-serif' },
            color: 'var(--cor-texto)'
          },
          ticks: {
            callback: function(value) {
              return value.toLocaleString('pt-BR', {maximumFractionDigits:1});
            }
          }
        }
      }
    }
  });
});

// Exportar resultado e gráfico para PDF
document.getElementById('exportar-pdf').addEventListener('click', function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const data = new Date();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102); // cor-primaria
  doc.text('Relatório de Comparação de Custos de Manutenção', 10, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41); // cor-texto
  doc.text('Gerado em: ' + data.toLocaleString('pt-BR'), 10, 28);
  doc.line(10, 32, 200, 32); // Linha separadora

  doc.setFontSize(12);
  let yOffset = 40;

  // Adiciona os dados de entrada
  doc.setFont('helvetica', 'bold');
  doc.text('Dados de Entrada:', 10, yOffset);
  yOffset += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(`Custo de Parada: R$ ${parseFloat(document.getElementById('custo-parada').value).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, 10, yOffset); yOffset += 6;
  doc.text(`Custo de Peças: R$ ${parseFloat(document.getElementById('custo-pecas').value).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, 10, yOffset); yOffset += 6;
  doc.text(`Custo de Mão de Obra: R$ ${parseFloat(document.getElementById('custo-mao-obra').value).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, 10, yOffset); yOffset += 6;
  doc.text(`Frequência de Falhas por Ano: ${parseFloat(document.getElementById('falhas-ano').value).toLocaleString('pt-BR')}`, 10, yOffset); yOffset += 6;
  doc.text(`Intervalo Preventiva (meses): ${parseFloat(document.getElementById('intervalo-prev').value).toLocaleString('pt-BR')}`, 10, yOffset); yOffset += 6;
  doc.text(`Custo da Preventiva: R$ ${parseFloat(document.getElementById('custo-prev').value).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, 10, yOffset); yOffset += 10;

  // Adiciona o resultado da comparação
  doc.setFont('helvetica', 'bold');
  doc.text('Resultado da Análise:', 10, yOffset);
  yOffset += 7;
  doc.setFont('helvetica', 'normal');
  const resultadoHtml = document.getElementById('resultado').innerHTML;
  // Extrai e formata o texto do resultado, ignorando estilos e tags
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = resultadoHtml;
  const textoResultado = tempDiv.textContent || tempDiv.innerText;

  const linhasResultado = doc.splitTextToSize(textoResultado, 180); // Ajusta para a largura da página
  doc.text(linhasResultado, 10, yOffset);
  yOffset += (linhasResultado.length * 6) + 10; // Espaçamento dinâmico

  // Adiciona o Gráfico
  const canvas = document.getElementById('graficoCustos');
  if (canvas) {
    const imgData = canvas.toDataURL('image/png');
    if (imgData) {
      doc.setFont('helvetica', 'bold');
      doc.text('Gráfico Comparativo:', 10, yOffset);
      yOffset += 5;
      // Adiciona a imagem, ajustando para caber na página
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 10;
    }
  }

  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125); // cor para observações
  doc.text('Observação: Os custos são estimativas. Fatores indiretos podem influenciar a decisão.', 10, yOffset);

  doc.save('relatorio_comparacao_custos_manutencao.pdf');
});
