// Gráfico de economia acumulada (Chart.js)
function plotarGraficoEconomia(ctx, dados) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.anos,
      datasets: [
        {
          label: 'Corretiva',
          data: dados.corretiva,
          backgroundColor: 'rgba(229,57,53,0.7)',
          borderColor: '#e53935',
          borderWidth: 1
        },
        {
          label: 'Preventiva',
          data: dados.preventiva,
          backgroundColor: 'rgba(67,160,71,0.7)',
          borderColor: '#43a047',
          borderWidth: 1
        },
        {
          label: 'Economia',
          data: dados.economia,
          backgroundColor: 'rgba(21,101,192,0.5)',
          borderColor: '#1565c0',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Comparação de Custos ao Longo dos Anos' }
      },
      scales: {
        x: {
          stacked: false,
          title: { display: true, text: 'Ano' }
        },
        y: {
          stacked: false,
          title: { display: true, text: 'Valor (R$)' },
          beginAtZero: true
        }
      }
    }
  });
}
