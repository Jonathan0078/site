// Histórico de comparações salvo no localStorage
// Salva um novo cálculo no histórico
function salvarComparacaoHistorico(dados) {
  let historico = JSON.parse(localStorage.getItem('historicoComparador') || '[]');
  historico.push(dados);
  localStorage.setItem('historicoComparador', JSON.stringify(historico));
}

// Retorna o histórico completo
function obterHistoricoComparador() {
  return JSON.parse(localStorage.getItem('historicoComparador') || '[]');
}

// Limpa todo o histórico
function limparHistoricoComparador() {
  localStorage.removeItem('historicoComparador');
}

// Explicações dos campos para ajuda interativa
const explicacoesCampos = {
  'custo-parada': 'Custo total de produção parada por falha, incluindo perdas de produção, atrasos e outros impactos financeiros.',
  'custo-pecas': 'Custo médio das peças trocadas a cada falha, considerando componentes principais e acessórios.',
  'custo-mao-obra': 'Custo médio de mão de obra por intervenção, incluindo horas extras, deslocamento e equipe.',
  'falhas-ano': 'Quantas vezes, em média, ocorre falha por ano neste equipamento ou linha.',
  'intervalo-prev': 'A cada quantos meses é feita a manutenção preventiva planejada.',
  'custo-prev': 'Custo médio de cada manutenção preventiva, incluindo peças, mão de obra e insumos.',
  'inflacao': 'Percentual médio de inflação anual para simular o aumento dos custos ao longo do tempo.'
};

// Exibe explicação em popup próximo ao campo (mouse e toque)
function mostrarAjuda(id, texto, evento) {
  let ajuda = document.getElementById('ajuda-' + id);
  if (!ajuda) {
    ajuda = document.createElement('div');
    ajuda.id = 'ajuda-' + id;
    ajuda.className = 'ajuda-popup';
    ajuda.innerText = texto || explicacoesCampos[id] || '';
    document.body.appendChild(ajuda);
  } else {
    ajuda.innerText = texto || explicacoesCampos[id] || '';
  }
  // Detecta evento de toque ou mouse
  let x = 0, y = 0;
  if (evento && evento.touches && evento.touches.length) {
    x = evento.touches[0].pageX;
    y = evento.touches[0].pageY;
  } else if (evento && (evento.pageX || evento.pageY)) {
    x = evento.pageX;
    y = evento.pageY;
  } else {
    x = window.innerWidth/2;
    y = window.innerHeight/2;
  }
  ajuda.style.left = (x + 16) + 'px';
  ajuda.style.top = (y - 8) + 'px';
  ajuda.style.position = 'absolute';
  ajuda.style.zIndex = 9999;
  ajuda.style.background = '#fff';
  ajuda.style.border = '1px solid #ccc';
  ajuda.style.borderRadius = '8px';
  ajuda.style.padding = '10px 16px';
  ajuda.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
  ajuda.style.maxWidth = '320px';
  ajuda.style.fontSize = '1em';
  ajuda.style.color = '#222';
  ajuda.style.display = 'block';

  // Mouse move para desktop
  if (!('ontouchstart' in window)) {
    document.onmousemove = function(e) {
      ajuda.style.left = (e.pageX + 16) + 'px';
      ajuda.style.top = (e.pageY - 8) + 'px';
    };
  }
}

// Esconde popup de explicação
function esconderAjuda(id) {
  const ajuda = document.getElementById('ajuda-' + id);
  if (ajuda) ajuda.style.display = 'none';
  document.onmousemove = null;
}

// Adiciona listeners para toque em dispositivos móveis
window.addEventListener('DOMContentLoaded', function() {
  const campos = Object.keys(explicacoesCampos);
  campos.forEach(function(id) {
    // Busca o span.ajuda-icone dentro do label do campo
    const label = document.querySelector('label[for="'+id+'"]');
    if (label) {
      const span = label.querySelector('span.ajuda-icone');
      if (span) {
        // Mouse
        span.onmouseover = function(e) { mostrarAjuda(id, null, e); };
        span.onmouseout = function() { esconderAjuda(id); };
        // Toque/celular
        span.ontouchstart = function(e) { mostrarAjuda(id, null, e); };
        span.ontouchend = function() { esconderAjuda(id); };
        span.onclick = function(e) { mostrarAjuda(id, null, e); setTimeout(()=>esconderAjuda(id), 2500); };
      }
    }
  });
});
