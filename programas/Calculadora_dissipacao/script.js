document.getElementById('form-mancal').addEventListener('submit', function(e) {
  e.preventDefault();

  const resultadoContainer = document.getElementById('resultado-container');
  const erroContainer = document.getElementById('erro-container');
  const resultadoDisplay = document.getElementById('resultado-display');

  // Esconder resultados e erros anteriores ao iniciar um novo cálculo
  resultadoContainer.classList.add('hidden');
  erroContainer.classList.add('hidden');
  // Remover quaisquer classes de estilo de borda anteriores
  resultadoContainer.classList.remove('dissipacao-elevada', 'dissipacao-moderada', 'dissipacao-baixa');

  const tipoMancal = document.getElementById('tipo-mancal').value;
  const carga = parseFloat(document.getElementById('carga').value);
  const velocidade = parseFloat(document.getElementById('velocidade').value);
  const tempOper = parseFloat(document.getElementById('temp-oper').value);
  const tempAmb = parseFloat(document.getElementById('temp-amb').value);
  const tipoLub = document.getElementById('tipo-lubrificacao').value;
  const diametroEixo = parseFloat(document.getElementById('diametro-eixo').value);
  const tempoOperacao = parseFloat(document.getElementById('tempo-operacao').value);

  // Fatores técnicos (exemplo, podem ser ajustados)
  let C = tipoMancal === 'Rolamento' ? 0.00045 : 0.0009;
  let F = tipoLub === 'Óleo' ? 1.0 : 1.15;

  // Validação de dados
  if (isNaN(carga) || isNaN(velocidade) || isNaN(tempOper) || isNaN(tempAmb) || carga < 0 || velocidade < 0) {
    erroContainer.innerHTML = 'Preencha todos os campos corretamente com valores numéricos positivos.';
    erroContainer.classList.remove('hidden'); // Mostrar o contêiner de erro
    return;
  }
  if (tempOper <= tempAmb) {
    erroContainer.innerHTML = 'A temperatura de operação deve ser maior que a temperatura ambiente.';
    erroContainer.classList.remove('hidden'); // Mostrar o contêiner de erro
    return;
  }
  // Validação extra
  if (isNaN(diametroEixo) || diametroEixo <= 0) {
    erroContainer.innerHTML = 'Informe o diâmetro do eixo corretamente.';
    erroContainer.classList.remove('hidden');
    return;
  }
  if (isNaN(tempoOperacao) || tempoOperacao <= 0) {
    erroContainer.innerHTML = 'Informe o tempo de operação corretamente.';
    erroContainer.classList.remove('hidden');
    return;
  }

  // Cálculo da velocidade linear (m/s)
  const velocidadeLinear = (Math.PI * diametroEixo * velocidade) / (60 * 1000); // mm para m

  // Estimativa de coeficiente de atrito (simples)
  let coefAtrito = 0.01;
  if (tipoMancal === 'Bucha') coefAtrito = tipoLub === 'Óleo' ? 0.08 : 0.12;
  if (tipoMancal === 'Rolamento') coefAtrito = tipoLub === 'Óleo' ? 0.01 : 0.015;

  // Fórmula: Q = C × F × Carga × Velocidade × (Toper - Tamb)
  const dissipacao = C * F * carga * velocidade * (tempOper - tempAmb);

  // Energia dissipada (kWh)
  const energiaDissipada = (dissipacao * tempoOperacao) / 1000; // W*h para kWh

  // Diferença de temperatura
  const deltaT = tempOper - tempAmb;

  let statusMsg = '';
  let statusClass = '';

  if (dissipacao > 100) {
    statusMsg = 'Atenção: Dissipação elevada! Verifique lubrificação, refrigeração e condições de operação.';
    statusClass = 'elevada';
    resultadoContainer.classList.add('dissipacao-elevada');
  } else if (dissipacao < 10) {
    statusMsg = 'Dissipação baixa. Condições normais.';
    statusClass = 'baixa';
    resultadoContainer.classList.add('dissipacao-baixa');
  } else {
    statusMsg = 'Dissipação moderada. Fique atento a variações.';
    statusClass = 'moderada';
    resultadoContainer.classList.add('dissipacao-moderada');
  }

  // Resultados detalhados
  resultadoDisplay.innerHTML = `
    <div class="dissipacao-valor"><strong>Dissipação:</strong> ${dissipacao.toFixed(2)} W</div>
    <div><strong>Energia Dissipada:</strong> ${energiaDissipada.toFixed(3)} kWh (${tempoOperacao} h)</div>
    <div><strong>Coeficiente de Atrito Estimado:</strong> ${coefAtrito}</div>
    <div><strong>Velocidade Linear:</strong> ${velocidadeLinear.toFixed(3)} m/s</div>
    <div><strong>ΔT (Operação - Ambiente):</strong> ${deltaT} °C</div>
    <div class="dissipacao-status ${statusClass}">${statusMsg}</div>
  `;
  resultadoContainer.classList.remove('hidden'); // Mostrar o contêiner de resultado

  // ================= HISTÓRICO DE CÁLCULOS =================
  const historicoKey = 'historico_dissipacao';
  const historicoList = document.getElementById('historico-list');
  const limparHistoricoBtn = document.getElementById('limpar-historico-btn');

  function salvarHistorico(item) {
    let hist = JSON.parse(localStorage.getItem(historicoKey) || '[]');
    hist.push(item);
    localStorage.setItem(historicoKey, JSON.stringify(hist));
    renderizarHistorico();
  }
  function renderizarHistorico() {
    let hist = JSON.parse(localStorage.getItem(historicoKey) || '[]');
    historicoList.innerHTML = '';
    hist.slice(-20).reverse().forEach((item, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.data}</strong>: ${item.resumo}`;
      historicoList.appendChild(li);
    });
  }
  if (limparHistoricoBtn) {
    limparHistoricoBtn.onclick = () => {
      localStorage.removeItem(historicoKey);
      renderizarHistorico();
    };
  }
  renderizarHistorico();

  // ================= MÚLTIPLOS MANCAIS =================
  const adicionarMancalBtn = document.getElementById('adicionar-mancal-btn');
  const mancaisList = document.getElementById('mancais-list');
  const resultadoMultiplos = document.getElementById('resultado-multiplos');
  let mancais = [];
  function criarLinhaMancal() {
    const idx = mancais.length + 1;
    const div = document.createElement('div');
    div.className = 'mancal-item';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <input type="number" placeholder="Carga (N)" class="m-carga" style="width:90px;" required>
      <input type="number" placeholder="Velocidade (rpm)" class="m-velocidade" style="width:90px;" required>
      <input type="number" placeholder="ΔT (°C)" class="m-dt" style="width:80px;" required>
      <button type="button" class="remover-mancal" style="background:#eee;color:#222;border:none;border-radius:8px;padding:4px 10px;font-weight:600;cursor:pointer;">Remover</button>
    `;
    mancaisList.appendChild(div);
    div.querySelector('.remover-mancal').onclick = () => {
      mancaisList.removeChild(div);
      calcularMultiplos();
    };
    ['m-carga','m-velocidade','m-dt'].forEach(cls => {
      div.querySelector('.'+cls).oninput = calcularMultiplos;
    });
  }
  if (adicionarMancalBtn) adicionarMancalBtn.onclick = criarLinhaMancal;
  function calcularMultiplos() {
    let total = 0;
    let labels = [];
    let dados = [];
    mancaisList.querySelectorAll('.mancal-item').forEach((div, i) => {
      const carga = parseFloat(div.querySelector('.m-carga').value);
      const vel = parseFloat(div.querySelector('.m-velocidade').value);
      const dt = parseFloat(div.querySelector('.m-dt').value);
      if (!isNaN(carga) && !isNaN(vel) && !isNaN(dt)) {
        const diss = 0.00045 * carga * vel * dt;
        total += diss;
        labels.push('Mancal '+(i+1));
        dados.push(diss);
      }
    });
    resultadoMultiplos.innerHTML = `<strong>Dissipação Total:</strong> ${total.toFixed(2)} W`;
  }

  // ================= EXPORTAÇÃO =================
  function exportToCSV() {
    const resultado = document.getElementById('resultado-display').innerText;
    const blob = new Blob([resultado.replace(/\n/g, '\r\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultado_dissipacao.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportToPDF() {
    const resultado = document.getElementById('resultado-display').innerHTML;
    const win = window.open('', '', 'width=800,height=600');
    win.document.write('<html><head><title>Resultado Dissipação</title></head><body>');
    win.document.write('<h2>Resultado da Calculadora de Dissipação</h2>');
    win.document.write(resultado);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  }

  document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
  document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);

  // ========== MENU FLUTUANTE: SOBREPOR CONTEÚDO AO INVÉS DE NOVA ABA ==========
  const abrirMenuBtn = document.getElementById('abrir-menu-btn');
  const menuPopup = document.getElementById('menu-popup');
  const abrirHistoricoBtn = document.getElementById('abrir-historico-btn');
  const abrirMultiplosBtn = document.getElementById('abrir-multiplos-btn');
  const limparHistoricoBtnMenu = document.getElementById('limpar-historico-btn-menu');
  const historicoContainer = document.getElementById('historico-container');
  const multiplosMancaisContainer = document.getElementById('multiplos-mancais-container');

  function fecharMenu() { menuPopup.classList.remove('open'); }

  abrirMenuBtn.onclick = function() {
    menuPopup.classList.toggle('open');
  };
  document.body.addEventListener('click', function(e) {
    if (!menuPopup.contains(e.target) && e.target !== abrirMenuBtn) fecharMenu();
  });

  abrirHistoricoBtn.onclick = function() {
    historicoContainer.style.display = 'block';
    multiplosMancaisContainer.style.display = 'none';
    document.querySelector('.calculator-container').style.display = 'none';
    document.getElementById('resultado-container').style.display = 'none';
    document.getElementById('grafico-container').style.display = 'none';
    fecharMenu();
  };
  abrirMultiplosBtn.onclick = function() {
    multiplosMancaisContainer.style.display = 'block';
    historicoContainer.style.display = 'none';
    document.querySelector('.calculator-container').style.display = 'none';
    document.getElementById('resultado-container').style.display = 'none';
    document.getElementById('grafico-container').style.display = 'none';
    fecharMenu();
  };
  // Botão para voltar ao modo principal
  function mostrarPrincipal() {
    historicoContainer.style.display = 'none';
    multiplosMancaisContainer.style.display = 'none';
    document.querySelector('.calculator-container').style.display = 'block';
    document.getElementById('resultado-container').style.display = 'block';
    document.getElementById('grafico-container').style.display = 'block';
  }
  // Adiciona botão de voltar no histórico e múltiplos mancais
  if (!document.getElementById('voltar-principal-hist')) {
    const btn = document.createElement('button');
    btn.id = 'voltar-principal-hist';
    btn.textContent = 'Voltar';
    btn.style = 'margin:12px 0 0 0;background:var(--cor-destaque);color:var(--cor-primaria);border:none;border-radius:8px;padding:8px 16px;font-weight:600;cursor:pointer;';
    btn.onclick = mostrarPrincipal;
    historicoContainer.appendChild(btn);
  }
  if (!document.getElementById('voltar-principal-mult')) {
    const btn2 = document.createElement('button');
    btn2.id = 'voltar-principal-mult';
    btn2.textContent = 'Voltar';
    btn2.style = 'margin:12px 0 0 0;background:var(--cor-destaque);color:var(--cor-primaria);border:none;border-radius:8px;padding:8px 16px;font-weight:600;cursor:pointer;';
    btn2.onclick = mostrarPrincipal;
    multiplosMancaisContainer.appendChild(btn2);
  }
  // Esconde containers ao carregar
  mostrarPrincipal();

  // Corrige inicialização do menu flutuante
  window.addEventListener('DOMContentLoaded', function() {
    const abrirMenuBtn = document.getElementById('abrir-menu-btn');
    const menuPopup = document.getElementById('menu-popup');
    if (!abrirMenuBtn || !menuPopup) return;
    abrirMenuBtn.onclick = function(e) {
      e.stopPropagation();
      menuPopup.classList.toggle('open');
    };
    document.body.addEventListener('click', function(e) {
      if (!menuPopup.contains(e.target) && e.target !== abrirMenuBtn) menuPopup.classList.remove('open');
    });
  });
});
