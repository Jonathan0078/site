document.getElementById('form-mancal').addEventListener('submit', function(e) {
  e.preventDefault();
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
  if (isNaN(carga) || isNaN(velocidade) || isNaN(tempOper) || isNaN(tempAmb)) {
    document.getElementById('resultado').innerHTML = '<span style="color:#dc3545">Preencha todos os campos corretamente.</span>';
    return;
  }
  if (tempOper <= tempAmb) {
    document.getElementById('resultado').innerHTML = '<span style="color:#dc3545">A temperatura de operação deve ser maior que a ambiente.</span>';
    return;
  }

  // Fórmula: Q = C × F × Carga × Velocidade × (Toper - Tamb)
  const dissipacao = C * F * carga * velocidade * (tempOper - tempAmb);

  let msg = `<strong>Dissipação térmica estimada:</strong> ${dissipacao.toFixed(2)} W`;
  if (dissipacao > 100) {
    msg += '<br><span style="color:#dc3545">Atenção: Dissipação elevada! Verifique lubrificação, refrigeração e condições de operação.</span>';
  } else if (dissipacao < 10) {
    msg += '<br><span style="color:#28a745">Dissipação baixa. Condições normais.</span>';
  } else {
    msg += '<br><span style="color:#ffc107">Dissipação moderada. Fique atento a variações.</span>';
  }
  msg += `<br><small>Consulte o manual do fabricante para limites específicos do seu mancal.</small>`;
  document.getElementById('resultado').innerHTML = msg;
});
