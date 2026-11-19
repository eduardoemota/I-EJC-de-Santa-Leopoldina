/*
 * Ilustrações em SVG (sem imagens externas, carregam instantaneamente).
 *   ART.aparecida(prefixo)  -> Nossa Senhora Aparecida (azul, branco e dourado)
 *   ART.terco()             -> pequeno terço de contas vermelhas e cruz dourada
 */
(function (root) {
  'use strict';

  function f(n) { return Math.round(n * 100) / 100; }

  function aparecida(p) {
    p = p || 'a';
    var i, a, s = '<svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nossa Senhora Aparecida">';

    s += '<defs>' +
      '<linearGradient id="' + p + '-ouro" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#f3df9f"/><stop offset=".5" stop-color="#c9a24a"/><stop offset="1" stop-color="#a98230"/></linearGradient>' +
      '<linearGradient id="' + p + '-manto" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#3569bd"/><stop offset="1" stop-color="#12306b"/></linearGradient>' +
      '<radialGradient id="' + p + '-halo" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#fff3c9" stop-opacity=".95"/><stop offset="1" stop-color="#fff3c9" stop-opacity="0"/></radialGradient>' +
      '</defs>';

    var G = 'url(#' + p + '-ouro)';

    // Halo e raios de luz (lembrando Fátima)
    s += '<circle cx="100" cy="92" r="92" fill="url(#' + p + '-halo)"/>';
    s += '<g stroke="#c9a24a" stroke-width="1" stroke-linecap="round" opacity=".5">';
    for (i = 0; i < 32; i++) {
      a = i * Math.PI * 2 / 32;
      var r1 = 38, r2 = i % 2 ? 70 : 90;
      s += '<line x1="' + f(100 + Math.cos(a) * r1) + '" y1="' + f(92 + Math.sin(a) * r1) +
           '" x2="' + f(100 + Math.cos(a) * r2) + '" y2="' + f(92 + Math.sin(a) * r2) + '"/>';
    }
    s += '</g>';

    // Cruz
    s += '<rect x="98.2" y="3" width="3.6" height="19" rx="1" fill="' + G + '"/>';
    s += '<rect x="92.5" y="8.5" width="15" height="3.6" rx="1" fill="' + G + '"/>';

    // Coroa
    s += '<path d="M74 62 C69 49 70 38 76 32 C80 36 82 40 84 45 C86 35 92 27 100 25 C108 27 114 35 116 45 ' +
         'C118 40 120 36 124 32 C130 38 131 49 126 62 Z" fill="' + G + '" stroke="#a98230" stroke-width=".8"/>';
    s += '<path d="M100 27 L100 59 M89 56 C88 44 93 35 100 32 C107 35 112 44 111 56 M79 58 C77 50 78 43 80 39 M121 58 C123 50 122 43 120 39" ' +
         'fill="none" stroke="#fffdf3" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>';
    s += '<rect x="71" y="60" width="58" height="8" rx="2" fill="' + G + '" stroke="#a98230" stroke-width=".8"/>';

    // Manto
    s += '<path d="M86 70 L114 70 L178 250 L22 250 Z" fill="url(#' + p + '-manto)" stroke="' + G + '" stroke-width="2.4" stroke-linejoin="round"/>';

    // Ornamentos (lado esquerdo e espelhado)
    function leaf(x, y, rot, sc) {
      return '<path transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + sc + ')" ' +
             'd="M0 0 C3.4 -4 3.4 -9 0 -13 C-3.4 -9 -3.4 -4 0 0Z"/>';
    }
    function fan(x, y, rot, sc) {
      var g = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + sc + ')">';
      for (var k = -2; k <= 2; k++) g += '<ellipse cx="0" cy="-8" rx="2.1" ry="8.5" transform="rotate(' + (k * 21) + ')"/>';
      return g + '</g>';
    }
    function ornamentos() {
      var o = '<g fill="#ecd48f" stroke="none">';
      o += '<circle cx="77" cy="136" r="1.8"/><circle cx="73" cy="156" r="1.8"/><circle cx="60" cy="176" r="1.8"/>';
      o += leaf(74, 150, -25, .85) + leaf(66, 168, -40, .95) + leaf(78, 172, 18, .85);
      o += leaf(55, 196, -32, 1.05) + leaf(70, 202, 8, 1.05) + leaf(80, 190, 26, .9);
      o += fan(44, 246, -12, 1.15) + fan(62, 248, 0, 1.35) + fan(79, 246, 12, 1.1);
      o += '</g>';
      o += '<g fill="none" stroke="#ecd48f" stroke-width="1.7" stroke-linecap="round">';
      o += '<path d="M70 118 C63 116 62 108 68 107 C72 107 73 111 70 112"/>';
      o += '<path d="M50 214 C41 206 48 195 57 201 C63 206 58 214 52 211"/>';
      o += '<path d="M82 218 C75 210 66 217 71 223"/>';
      o += '</g>';
      return o;
    }
    s += '<g>' + ornamentos() + '</g>';
    s += '<g transform="translate(200 0) scale(-1 1)">' + ornamentos() + '</g>';

    // Faixa central
    s += '<rect x="86" y="70" width="28" height="180" fill="#fffdf3" stroke="' + G + '" stroke-width="2"/>';

    // Rosto (círculo) e mãos em oração
    s += '<circle cx="100" cy="90" r="12.5" fill="#12306b" stroke="' + G + '" stroke-width="1.6"/>';
    s += '<path d="M100 108 C96.5 113 94.5 119.500 94 128 L100 134 L106 128 C105.500 119.500 103.500 113 100 108 Z" fill="' + G + '"/>';
    s += '<path d="M100 111 L100 132" stroke="#fffdf3" stroke-width=".9" opacity=".8"/>';

    // Ondas (águas do rio Paraíba)
    s += '<g fill="none" stroke="' + G + '" stroke-width="2" stroke-linecap="round">' +
         '<path d="M92 172 q2.500 -3.500 5 0 t5 0 t5 0"/>' +
         '<path d="M92 204 q2.500 -3.500 5 0 t5 0 t5 0"/></g>';

    // Pontilhado da barra
    s += '<g fill="#c9a24a">';
    for (var x = 24; x <= 176; x += 7.6) {
      if (x > 84 && x < 116) continue;
      var y = 258 + 3.500 * (1 - Math.pow((x - 100) / 78, 2));
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="1.5"/>';
    }
    s += '</g></svg>';
    return s;
  }

  function terco() {
    var s = '<svg viewBox="0 0 220 84" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Terço">';
    var n = 19, i;
    // fio
    var d = '';
    for (i = 0; i <= 40; i++) {
      var t = i / 40, x = 10 + 200 * t, y = 8 + 28 * (1 - Math.pow(2 * t - 1, 2));
      d += (i ? 'L' : 'M') + f(x) + ' ' + f(y);
    }
    s += '<path d="' + d + '" fill="none" stroke="#c9a24a" stroke-width="1"/>';
    for (i = 0; i < n; i++) {
      var tt = i / (n - 1), px = 10 + 200 * tt, py = 8 + 28 * (1 - Math.pow(2 * tt - 1, 2));
      var grande = (i % 5 === 2 && i !== 9);
      if (i === 9) continue;
      s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + (grande ? 4.2 : 3.2) + '" fill="' + (grande ? '#c9a24a' : '#c8102e') + '"/>';
      s += '<circle cx="' + f(px - 1) + '" cy="' + f(py - 1) + '" r="1" fill="#fff" opacity=".55"/>';
    }
    // medalha central + pendente
    s += '<circle cx="110" cy="36" r="5.200" fill="#c9a24a"/><circle cx="110" cy="36" r="2.200" fill="#fffdf3"/>';
    for (i = 0; i < 3; i++) {
      s += '<circle cx="110" cy="' + (46 + i * 7) + '" r="2.800" fill="#c8102e"/>';
    }
    s += '<rect x="108.800" y="64" width="2.400" height="17" rx=".6" fill="#c9a24a"/>';
    s += '<rect x="104" y="68" width="12" height="2.400" rx=".6" fill="#c9a24a"/>';
    s += '</svg>';
    return s;
  }

  root.ART = { aparecida: aparecida, terco: terco };
})(window);
