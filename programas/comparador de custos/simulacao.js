// Simulação de cenários e inflação
function simularCenarios(base, variacoes) {
  return variacoes.map(v => ({
    ...base,
    ...v,
    resultado: calcularCustos({...base, ...v})
  }));
}

function aplicarInflacao(valor, taxa, anos) {
  let v = valor;
  for (let i = 0; i < anos; i++) {
    v *= (1 + taxa/100);
  }
  return v;
}
