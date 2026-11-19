(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  var dados = window.MENSAGENS;

  // Pré-visualização a partir do editor (rascunho salvo no navegador)
  if (params.get('preview') === '1') {
    try {
      var rascunho = JSON.parse(localStorage.getItem('tercos:rascunho') || 'null');
      if (rascunho && rascunho.mensagens) dados = rascunho;
    } catch (e) { /* ignora */ }
  }

  var msg = null;
  if (dados && dados.mensagens && id !== null) {
    for (var i = 0; i < dados.mensagens.length; i++) {
      if (String(dados.mensagens[i].id) === String(id).trim()) { msg = dados.mensagens[i]; break; }
    }
  }

  var tela1 = document.getElementById('tela1');
  var tela2 = document.getElementById('tela2');
  var btnRevelar = document.getElementById('btnRevelar');

  function $(sel) { return document.getElementById(sel); }

  // Sem mensagem válida: avisa com delicadeza
  if (!msg) {
    btnRevelar.hidden = true;
    $('erro').hidden = false;
    return;
  }

  // ---- Preenche a carta (sempre com textContent: nada de HTML vindo das mensagens) ----
  $('saudacao').textContent = msg.saudacao || '';
  var texto = $('texto');
  String(msg.texto || '').replace(/\r/g, '').split(/\n\s*\n/).forEach(function (par) {
    par = par.trim();
    if (!par) return;
    var p = document.createElement('p');
    p.textContent = par;
    texto.appendChild(p);
  });
  $('versiculo').textContent = msg.versiculo || '';
  $('referencia').textContent = msg.referencia ? '— ' + msg.referencia : '';
  if (!msg.versiculo) document.querySelector('.versiculo').hidden = true;

  // ---- Ilustrações ----
  $('arte').innerHTML = ART.aparecida('arte');
  $('marca').innerHTML = ART.aparecida('marca');
  $('terco').innerHTML = ART.terco();

  // ---- Transições (fade) ----
  var rapido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var espera = rapido ? 200 : 900;

  function trocar(de, para) {
    de.classList.add('oculta');
    setTimeout(function () {
      de.hidden = true;
      para.hidden = false;
      window.scrollTo(0, 0);
      // força o navegador a registrar o estado inicial antes de animar
      void para.offsetWidth;
      para.classList.remove('oculta');
    }, espera);
  }

  btnRevelar.addEventListener('click', function () { trocar(tela1, tela2); });
  $('btnVoltar').addEventListener('click', function () { trocar(tela2, tela1); });
  $('btnImprimir').addEventListener('click', function () { window.print(); });
})();
