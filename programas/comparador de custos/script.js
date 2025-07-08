document.getElementById('form-custos').addEventListener('submit', function(e) {
  e.preventDefault();
  const custoParada = parseFloat(document.getElementById('custo-parada').value);
  const custoPecas = parseFloat(document.getElementById('custo-pecas').value);
  const custoMaoObra = parseFloat(document.getElementById('custo-mao-obra').value);
  const falhasAno = parseFloat(document.getElementById('falhas-ano').value);
  const intervaloPrev = parseFloat(document.getElementById('intervalo-prev').value);
  const custoPrev = parseFloat(document.getElementById('custo-prev').value);

  // Validação de dados
  if ([custoParada, custoPecas, custoMaoObra, falhasAno, intervaloPrev, custoPrev].some(isNaN) || intervaloPrev <= 0) {
    document.getElementById('resultado').innerHTML = '<span style="color:#dc3545">Preencha todos os campos corretamente (intervalo > 0).</span>';
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
    msg += `<span style="color:#28a745">A manutenção preventiva é mais econômica.<br>Economia anual estimada: <b>R$ ${economia.toLocaleString('pt-BR', {minimumFractionDigits:2})}</b></span>`;
  } else if (custoCorretiva < custoPreventiva) {
    msg += `<span style="color:#dc3545">A manutenção corretiva é mais econômica.<br>Economia anual estimada: <b>R$ ${Math.abs(economia).toLocaleString('pt-BR', {minimumFractionDigits:2})}</b></span>`;
  } else {
    msg += '<span style="color:#ffc107">Os custos são equivalentes.</span>';
  }
  msg += `<br><small>Considere também fatores indiretos como confiabilidade, segurança, impacto na produção e valor residual dos equipamentos.</small>`;
  document.getElementById('resultado').innerHTML = msg;

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
          backgroundColor: ['#dc3545', '#28a745']
        },
        {
          label: 'Falhas/ano',
          data: [falhasAno, manutPrevAno],
          backgroundColor: ['#ffc10755', '#005a9c55'],
          yAxisID: 'y1',
          type: 'line',
          borderColor: ['#ffc107', '#005a9c'],
          borderWidth: 2,
          fill: false,
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: true },
        title: { display: true, text: 'Comparação de Custos e Frequência de Manutenção' },
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
        y: { beginAtZero: true, title: { display: true, text: 'Custo (R$)' } },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Frequência (vezes/ano)' }
        }
      }
    }
  });
});

// Exportar resultado e gráfico para PDF
// Inclui data/hora e formatação aprimorada

document.getElementById('exportar-pdf').addEventListener('click', function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const data = new Date();
  doc.setFontSize(16);
  doc.text('Comparador de Custos: Corretiva vs. Preventiva', 10, 15);
  doc.setFontSize(10);
  doc.text('Data/Hora: ' + data.toLocaleString('pt-BR'), 10, 22);
  doc.setFontSize(12);
  const resultadoHtml = document.getElementById('resultado').innerHTML.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '');
  doc.text(resultadoHtml, 10, 35);
  // Gráfico
  const canvas = document.getElementById('graficoCustos');
  const imgData = canvas.toDataURL('image/png');
  doc.addImage(imgData, 'PNG', 10, 50, 180, 90);
  doc.setFontSize(9);
  doc.text('Gerado por: comparador_custos_manutencao', 10, 145);
  doc.save('comparacao_custos_manutencao.pdf');
});
