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

  // Fórmula: Q = C × F × Carga × Velocidade × (Toper - Tamb)
  const dissipacao = C * F * carga * velocidade * (tempOper - tempAmb);

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

  resultadoDisplay.innerHTML = `
    <div class="dissipacao-valor">${dissipacao.toFixed(2)} W</div>
    <div class="dissipacao-status ${statusClass}">${statusMsg}</div>
  `;
  resultadoContainer.classList.remove('hidden'); // Mostrar o contêiner de resultado
});
