window.addEventListener('DOMContentLoaded', function() {
  // Atualização do gráfico em tempo real
  const campos = ['custo-parada','custo-pecas','custo-mao-obra','falhas-ano','intervalo-prev','custo-prev','inflacao'];
  campos.forEach(function(id) {
    document.getElementById(id).addEventListener('input', atualizarGraficoEmTempoReal);
  });

  function atualizarGraficoEmTempoReal() {
    const custoParada = parseFloat(document.getElementById('custo-parada').value);
    const custoPecas = parseFloat(document.getElementById('custo-pecas').value);
    const custoMaoObra = parseFloat(document.getElementById('custo-mao-obra').value);
    const falhasAno = parseFloat(document.getElementById('falhas-ano').value);
    const intervaloPrev = parseFloat(document.getElementById('intervalo-prev').value);
    const custoPrev = parseFloat(document.getElementById('custo-prev').value);
    const inflacao = parseFloat(document.getElementById('inflacao').value) || 0;
    if ([custoParada, custoPecas, custoMaoObra, falhasAno, custoPrev].some(isNaN) || intervaloPrev <= 0 || isNaN(intervaloPrev)) {
      if(window.graficoCustosInstance) window.graficoCustosInstance.destroy();
      document.getElementById('tabelaCustos').innerHTML = '';
      return;
    }
    const custoCorretiva = (custoParada + custoPecas + custoMaoObra) * falhasAno;
    const manutPrevAno = 12 / intervaloPrev;
    const custoPreventiva = manutPrevAno * custoPrev;
    let anos = [], corretivaArr = [], preventivaArr = [], economiaArr = [], cCor = custoCorretiva, cPrev = custoPreventiva;
    for(let i=1;i<=10;i++){
      anos.push(i);
      corretivaArr.push(Math.round(cCor));
      preventivaArr.push(Math.round(cPrev));
      economiaArr.push(Math.round(cCor - cPrev));
      cCor = aplicarInflacao(cCor, inflacao, 1);
      cPrev = aplicarInflacao(cPrev, inflacao, 1);
    }
    if(window.graficoCustosInstance) window.graficoCustosInstance.destroy();
    const ctx = document.getElementById('graficoCustos').getContext('2d');
    window.graficoCustosInstance = plotarGraficoEconomia(ctx, {anos, corretiva:corretivaArr, preventiva:preventivaArr, economia:economiaArr});
    // Atualiza tabela tipo planilha
    atualizarTabelaCustos(anos, corretivaArr, preventivaArr, economiaArr);
  }

  function atualizarTabelaCustos(anos, corretivaArr, preventivaArr, economiaArr) {
    let html = '<table style="width:100%;border-collapse:collapse;text-align:center;background:#fff;margin-top:16px;">';
    html += '<thead><tr style="background:#f0f6fc;"><th>Ano</th><th>Corretiva (R$)</th><th>Preventiva (R$)</th><th>Economia (R$)</th></tr></thead><tbody>';
    for(let i=0;i<anos.length;i++) {
      html += `<tr><td>${anos[i]}</td><td>${corretivaArr[i].toLocaleString('pt-BR')}</td><td>${preventivaArr[i].toLocaleString('pt-BR')}</td><td>${economiaArr[i].toLocaleString('pt-BR')}</td></tr>`;
    }
    html += '</tbody></table>';
    document.getElementById('tabelaCustos').innerHTML = html;
  }

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
    const inflacao = parseFloat(document.getElementById('inflacao').value) || 0;

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

    // Simulação de inflação e economia acumulada
    let anos = [];
    let corretivaArr = [];
    let preventivaArr = [];
    let economiaArr = [];
    let cCor = custoCorretiva;
    let cPrev = custoPreventiva;
    for(let i=1;i<=10;i++){
      anos.push(i);
      corretivaArr.push(Math.round(cCor));
      preventivaArr.push(Math.round(cPrev));
      economiaArr.push(Math.round(cCor - cPrev));
      cCor = aplicarInflacao(cCor, inflacao, 1);
      cPrev = aplicarInflacao(cPrev, inflacao, 1);
    }

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

    // Gráfico de comparação e tabela tipo planilha
    if(window.graficoCustosInstance) window.graficoCustosInstance.destroy();
    const ctx = document.getElementById('graficoCustos').getContext('2d');
    window.graficoCustosInstance = plotarGraficoEconomia(ctx, {anos, corretiva:corretivaArr, preventiva:preventivaArr, economia:economiaArr});
    atualizarTabelaCustos(anos, corretivaArr, preventivaArr, economiaArr);

    // Salva no histórico
    salvarComparacaoHistorico({
      data: new Date().toLocaleString('pt-BR'),
      corretiva: custoCorretiva,
      preventiva: custoPreventiva,
      inflacao,
      economia,
      entrada: {
        custoParada, custoPecas, custoMaoObra, falhasAno, intervaloPrev, custoPrev
      }
    });

    atualizarHistoricoComparador();
  });
});

// Atualiza histórico na tela
function atualizarHistoricoComparador() {
  const historico = obterHistoricoComparador();
  const ul = document.getElementById('historico-list');
  if (!ul) return;
  ul.innerHTML = '';
  historico.slice(-10).reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${item.data}</b>: Corretiva R$ ${item.corretiva.toLocaleString('pt-BR')}, Preventiva R$ ${item.preventiva.toLocaleString('pt-BR')}, Inflação ${item.inflacao}% <br>Economia: <b>R$ ${item.economia.toLocaleString('pt-BR')}</b>`;
    ul.appendChild(li);
  });
}

document.getElementById('limpar-historico-btn').onclick = function() {
  limparHistoricoComparador();
  atualizarHistoricoComparador();
};

// Exibe histórico ao abrir
document.getElementById('historico-container').style.display = 'block';
atualizarHistoricoComparador();

// Exportar resultado e gráfico para PDF e CSV

// Botão para exportar CSV
const btnExportarCSV = document.createElement('button');
btnExportarCSV.textContent = 'Exportar Resultado em CSV';
btnExportarCSV.id = 'exportar-csv';
btnExportarCSV.style.marginLeft = '10px';
document.getElementById('resultado-container').appendChild(btnExportarCSV);
btnExportarCSV.addEventListener('click', function() {
  const dados = [
    {
      tipo: 'Corretiva',
      custoTotal: (parseFloat(document.getElementById('custo-parada').value) + parseFloat(document.getElementById('custo-pecas').value) + parseFloat(document.getElementById('custo-mao-obra').value)) * parseFloat(document.getElementById('falhas-ano').value),
      detalhes: `Parada: R$${document.getElementById('custo-parada').value}, Peças: R$${document.getElementById('custo-pecas').value}, Mão de Obra: R$${document.getElementById('custo-mao-obra').value}, Falhas/Ano: ${document.getElementById('falhas-ano').value}`
    },
    {
      tipo: 'Preventiva',
      custoTotal: (12 / parseFloat(document.getElementById('intervalo-prev').value)) * parseFloat(document.getElementById('custo-prev').value),
      detalhes: `Intervalo: ${document.getElementById('intervalo-prev').value} meses, Custo Preventiva: R$${document.getElementById('custo-prev').value}`
    }
  ];
  exportarComparacaoCSV(dados);
});
