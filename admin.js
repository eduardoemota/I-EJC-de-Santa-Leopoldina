(function () {
  'use strict';

  var KEY = 'tercos:rascunho';
  var KEY_BASE = 'tercos:base';
  var publicado = window.MENSAGENS;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function $(id) { return document.getElementById(id); }

  function lerRascunho() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (d && d.mensagens && d.mensagens.length) return d;
    } catch (e) { /* ignora */ }
    return clone(publicado);
  }
  var dados = lerRascunho();

  function salvar() {
    try { localStorage.setItem(KEY, JSON.stringify(dados)); } catch (e) { /* ignora */ }
    status();
  }
  function status() {
    var mudou = JSON.stringify(dados) !== JSON.stringify(publicado);
    var s = $('status');
    s.textContent = mudou ? '● Há alterações ainda não publicadas' : '✓ Igual ao que está publicado';
    s.style.color = mudou ? '#a46a00' : '#2e7d32';
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // ---------- Lista de mensagens ----------
  var CAMPOS = [
    { k: 'destinatario', rot: 'Identificação do destinatário', tipo: 'input',
      ajuda: 'Só para você se organizar. Aparece na etiqueta (ex.: “Maria”). Pode deixar em branco.' },
    { k: 'saudacao', rot: 'Saudação', tipo: 'input',
      ajuda: 'Ex.: “Querida Maria,” ou “Meu querido amigo,”' },
    { k: 'texto', rot: 'Mensagem', tipo: 'area',
      ajuda: 'Escreva à vontade, do tamanho que quiser. Deixe uma linha em branco para começar um novo parágrafo.' },
    { k: 'versiculo', rot: 'Versículo bíblico', tipo: 'area-curta',
      ajuda: 'Só o texto, sem aspas. Aparece em itálico no fim da mensagem.' },
    { k: 'referencia', rot: 'Referência bíblica', tipo: 'input', ajuda: 'Ex.: João 15,9' }
  ];

  function resumo(m) {
    return m.destinatario ? m.destinatario : '(sem identificação)';
  }

  function montarLista() {
    var lista = $('lista');
    lista.innerHTML = '';
    dados.mensagens.forEach(function (m) {
      var det = document.createElement('details');
      det.className = 'card';

      var sum = document.createElement('summary');
      var t = document.createElement('span');
      t.textContent = 'Terço ' + pad(m.id);
      var nome = document.createElement('span');
      nome.className = 'nome';
      nome.textContent = resumo(m);
      sum.appendChild(t); sum.appendChild(nome);
      det.appendChild(sum);

      var corpo = document.createElement('div');
      corpo.className = 'corpo';

      CAMPOS.forEach(function (c) {
        var lab = document.createElement('label');
        var uid = 'f-' + m.id + '-' + c.k;
        lab.setAttribute('for', uid);
        lab.textContent = c.rot;
        var ajuda = document.createElement('small');
        ajuda.className = 'ajuda';
        ajuda.textContent = c.ajuda;
        lab.appendChild(ajuda);

        var campo;
        if (c.tipo === 'input') { campo = document.createElement('input'); campo.type = 'text'; }
        else { campo = document.createElement('textarea'); if (c.tipo === 'area-curta') campo.className = 'curta'; }
        campo.id = uid;
        campo.value = m[c.k] || '';
        campo.addEventListener('input', function () {
          m[c.k] = campo.value;
          if (c.k === 'destinatario') nome.textContent = resumo(m);
          salvar();
        });
        corpo.appendChild(lab); corpo.appendChild(campo);
      });

      var linha = document.createElement('div');
      linha.className = 'linha';
      linha.style.marginTop = '14px';
      var ver = document.createElement('button');
      ver.type = 'button'; ver.className = 'btn claro';
      ver.textContent = 'Ver como fica';
      ver.addEventListener('click', function () {
        salvar();
        window.open('index.html?id=' + encodeURIComponent(m.id) + '&preview=1', '_blank');
      });
      linha.appendChild(ver);
      corpo.appendChild(linha);

      det.appendChild(corpo);
      lista.appendChild(det);
    });
  }

  // ---------- Download do messages.js ----------
  $('btnBaixar').addEventListener('click', function () {
    var conteudo =
      '/*\n * MENSAGENS DOS 15 TERÇOS\n * Gerado pela página admin.html. Para publicar: substitua este arquivo no GitHub.\n' +
      ' * Os QR Codes NÃO mudam quando as mensagens mudam.\n */\n' +
      'window.MENSAGENS = ' + JSON.stringify(dados, null, 2) + ';\n';
    var blob = new Blob([conteudo], { type: 'text/javascript;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'messages.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  $('btnDescartar').addEventListener('click', function () {
    if (!confirm('Descartar suas alterações e voltar ao que está publicado?')) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ }
    dados = clone(publicado);
    montarLista(); status();
  });

  // ---------- QR Codes e etiquetas ----------
  function baseInicial() {
    var s = null;
    try { s = localStorage.getItem(KEY_BASE); } catch (e) { /* ignora */ }
    if (s) return s;
    if (/^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname)) {
      return location.href.replace(/[?#].*$/, '').replace(/[^\/]*$/, '');
    }
    return '';
  }

  function normalizar(b) {
    b = (b || '').trim();
    if (!b) return '';
    b = b.replace(/[?#].*$/, '');
    if (!/\.html?$/i.test(b) && !/\/$/.test(b)) b += '/';
    return b;
  }

  function gerarEtiquetas() {
    var campo = $('base');
    var base = normalizar(campo.value);
    try { localStorage.setItem(KEY_BASE, campo.value.trim()); } catch (e) { /* ignora */ }

    var aviso = $('avisoBase');
    aviso.innerHTML = '';
    var box = $('etiquetas');
    box.innerHTML = '';

    function msg(txt, ok) {
      var d = document.createElement('div');
      d.className = 'caixa ' + (ok ? 'ok' : 'aviso');
      d.style.margin = '0';
      d.textContent = txt;
      aviso.appendChild(d);
    }

    if (!base) { msg('Digite o endereço do site publicado para gerar os QR Codes.'); return; }
    if (!/^https:\/\//i.test(base)) msg('Atenção: o endereço deve começar com https:// (o GitHub Pages já usa).');
    else if (/localhost|127\.0\.0\.1/.test(base)) msg('Esse endereço só funciona neste computador. Use o endereço do GitHub Pages.');

    dados.mensagens.forEach(function (m) {
      var url = base + '?id=' + encodeURIComponent(m.id);
      var svg = QR.svg(url, { border: 4 });

      var e = document.createElement('div');
      e.className = 'etq';

      var qr = document.createElement('div'); qr.className = 'qr'; qr.innerHTML = svg;
      var id = document.createElement('div'); id.className = 'id'; id.textContent = 'Terço ' + pad(m.id);
      e.appendChild(qr); e.appendChild(id);

      if (m.destinatario) {
        var n = document.createElement('div'); n.className = 'nome'; n.textContent = m.destinatario;
        e.appendChild(n);
      }
      var fr = document.createElement('div'); fr.className = 'frase';
      fr.textContent = 'Escaneie e receba uma mensagem especial!';
      e.appendChild(fr);

      var ex = document.createElement('div'); ex.className = 'extra no-print';
      ex.textContent = url;
      e.appendChild(ex);
      var dl = document.createElement('a'); dl.className = 'baixar no-print';
      dl.textContent = 'Baixar QR (SVG)';
      dl.download = 'qr-terco-' + pad(m.id) + '.svg';
      dl.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      e.appendChild(dl);

      box.appendChild(e);
    });
  }

  $('base').value = baseInicial();
  $('base').addEventListener('input', gerarEtiquetas);
  $('btnImprimirEtq').addEventListener('click', function () { gerarEtiquetas(); window.print(); });

  // ---------- Abas ----------
  function aba(qual) {
    var msgs = qual === 'msg';
    $('painelMensagens').classList.toggle('ativo', msgs);
    $('painelQR').classList.toggle('ativo', !msgs);
    $('abaMsg').setAttribute('aria-selected', msgs);
    $('abaQR').setAttribute('aria-selected', !msgs);
    if (!msgs) gerarEtiquetas();
  }
  $('abaMsg').addEventListener('click', function () { aba('msg'); });
  $('abaQR').addEventListener('click', function () { aba('qr'); });

  montarLista();
  status();
})();
