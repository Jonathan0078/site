// Gráfico de economia acumulada (Chart.js)
function plotarGraficoEconomia(ctx, dados) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dados.anos,
      datasets: [
        {
          label: 'Corretiva',
          data: dados.corretiva,
          borderColor: '#e53935',
          fill: false
        },
        {
          label: 'Preventiva',
          data: dados.preventiva,
          borderColor: '#43a047',
          fill: false
        },
        {
          label: 'Economia Acumulada',
          data: dados.economia,
          borderColor: '#1565c0',
          fill: false,
          borderDash: [5,5]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Economia Acumulada ao Longo dos Anos' }
      }
    }
  });
}
