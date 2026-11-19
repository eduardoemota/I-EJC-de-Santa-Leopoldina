/*
 * Gerador de QR Code (modo byte, correção de erro M, versões 1–10).
 * Sem dependências. Gera QR Codes tradicionais, preto e branco.
 *
 *   QR.encode(texto) -> { size, modules }  (modules[y][x] === true => módulo escuro)
 *   QR.svg(texto, { border: 4 }) -> string SVG
 */
(function (root) {
  'use strict';

  // ---- Aritmética de Galois (GF 256) e Reed-Solomon ----
  var EXP = [], LOG = [];
  (function () {
    var x = 1, i;
    for (i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
    for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }

  function generator(deg) {
    var p = [1], i, j;
    for (i = 0; i < deg; i++) {
      var q = [];
      for (j = 0; j <= p.length; j++) q.push(0);
      for (j = 0; j < p.length; j++) { q[j] ^= p[j]; q[j + 1] ^= mul(p[j], EXP[i]); }
      p = q;
    }
    return p; // coeficiente líder primeiro
  }
  function remainder(data, deg) {
    var gen = generator(deg), res = [], i;
    for (i = 0; i < deg; i++) res.push(0);
    data.forEach(function (b) {
      var f = b ^ res.shift();
      res.push(0);
      for (i = 0; i < deg; i++) res[i] ^= mul(gen[i + 1], f);
    });
    return res;
  }

  // ---- Tabelas (nível M), índice = versão ----
  var ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  var NUM_BLOCKS    = [0,  1,  1,  1,  2,  2,  4,  4,  4,  5,  5];
  var MAX_VERSION = 10;

  function rawModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var n = Math.floor(ver / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (ver >= 7) r -= 36;
    }
    return r;
  }

  function encode(text) {
    // UTF-8 -> bytes
    var u = unescape(encodeURIComponent(String(text))), bytes = [], i, j;
    for (i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i));

    var ver, dataCap;
    for (ver = 1; ver <= MAX_VERSION; ver++) {
      dataCap = Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
      if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= dataCap * 8) break;
    }
    if (ver > MAX_VERSION) throw new Error('Endereço muito longo para o QR Code.');

    // ---- Fluxo de bits ----
    var bits = [];
    function put(v, n) { for (var k = n - 1; k >= 0; k--) bits.push((v >>> k) & 1); }
    put(4, 4);                                   // modo byte
    put(bytes.length, ver < 10 ? 8 : 16);        // contagem
    bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, dataCap * 8 - bits.length)); // terminador
    while (bits.length % 8) bits.push(0);
    var data = [];
    for (i = 0; i < bits.length; i += 8) {
      var v = 0;
      for (j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      data.push(v);
    }
    for (var pad = 0xEC; data.length < dataCap; pad ^= 0xEC ^ 0x11) data.push(pad);

    // ---- Blocos + Reed-Solomon + intercalação ----
    var nb = NUM_BLOCKS[ver], eccLen = ECC_PER_BLOCK[ver];
    var rawCw = Math.floor(rawModules(ver) / 8);
    var numShort = nb - (rawCw % nb), shortLen = Math.floor(rawCw / nb);
    var blocks = [], k = 0;
    for (i = 0; i < nb; i++) {
      var len = shortLen - eccLen + (i < numShort ? 0 : 1);
      var dat = data.slice(k, k + len); k += len;
      var ecc = remainder(dat, eccLen);
      if (i < numShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var all = [];
    for (i = 0; i < blocks[0].length; i++) {
      for (j = 0; j < blocks.length; j++) {
        if (i !== shortLen - eccLen || j >= numShort) all.push(blocks[j][i]);
      }
    }

    // ---- Matriz ----
    var size = ver * 4 + 17, m = [], fn = [], y, x;
    for (y = 0; y < size; y++) {
      m.push([]); fn.push([]);
      for (x = 0; x < size; x++) { m[y].push(false); fn[y].push(false); }
    }
    function setFn(px, py, dark) {
      if (px >= 0 && px < size && py >= 0 && py < size) { m[py][px] = !!dark; fn[py][px] = true; }
    }
    function bit(v, i) { return ((v >>> i) & 1) !== 0; }

    function drawFormat(mask) {
      var d = (0 << 3) | mask; // nível M = 00
      var rem = d, n;
      for (n = 0; n < 10; n++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var b = ((d << 10) | rem) ^ 0x5412;
      for (n = 0; n <= 5; n++) setFn(8, n, bit(b, n));
      setFn(8, 7, bit(b, 6)); setFn(8, 8, bit(b, 7)); setFn(7, 8, bit(b, 8));
      for (n = 9; n < 15; n++) setFn(14 - n, 8, bit(b, n));
      for (n = 0; n < 8; n++) setFn(size - 1 - n, 8, bit(b, n));
      for (n = 8; n < 15; n++) setFn(8, size - 15 + n, bit(b, n));
      setFn(8, size - 8, true);
    }
    function drawVersion() {
      if (ver < 7) return;
      var rem = ver, n;
      for (n = 0; n < 12; n++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var b = (ver << 12) | rem;
      for (n = 0; n < 18; n++) {
        var c = bit(b, n), a = size - 11 + (n % 3), bb = Math.floor(n / 3);
        setFn(a, bb, c); setFn(bb, a, c);
      }
    }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(cx + dx, cy + dy, d !== 2 && d !== 4);
      }
    }
    function align(cx, cy) {
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++)
        setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    function alignPos() {
      if (ver === 1) return [];
      var n = Math.floor(ver / 7) + 2;
      var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
      var res = [6];
      for (var pos = size - 7; res.length < n; pos -= step) res.splice(1, 0, pos);
      return res;
    }

    for (i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var ap = alignPos(), na = ap.length;
    for (i = 0; i < na; i++) for (j = 0; j < na; j++) {
      if (!((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0))) align(ap[i], ap[j]);
    }
    drawFormat(0); drawVersion();

    // Codewords em zigue-zague
    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (j = 0; j < 2; j++) {
          x = right - j;
          var up = ((right + 1) & 2) === 0;
          y = up ? size - 1 - vert : vert;
          if (!fn[y][x] && idx < all.length * 8) {
            m[y][x] = bit(all[idx >>> 3], 7 - (idx & 7));
            idx++;
          }
        }
      }
    }

    function applyMask(mask) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) {
        var inv;
        switch (mask) {
          case 0: inv = (xx + yy) % 2 === 0; break;
          case 1: inv = yy % 2 === 0; break;
          case 2: inv = xx % 3 === 0; break;
          case 3: inv = (xx + yy) % 3 === 0; break;
          case 4: inv = (Math.floor(xx / 3) + Math.floor(yy / 2)) % 2 === 0; break;
          case 5: inv = (xx * yy) % 2 + (xx * yy) % 3 === 0; break;
          case 6: inv = ((xx * yy) % 2 + (xx * yy) % 3) % 2 === 0; break;
          default: inv = ((xx + yy) % 2 + (xx * yy) % 3) % 2 === 0;
        }
        if (!fn[yy][xx] && inv) m[yy][xx] = !m[yy][xx];
      }
    }

    function penalty() {
      var res = 0, a, b, run, c;
      for (a = 0; a < size; a++) {
        run = 1;
        for (b = 1; b < size; b++) {
          if (m[a][b] === m[a][b - 1]) { run++; if (run === 5) res += 3; else if (run > 5) res++; } else run = 1;
        }
        run = 1;
        for (b = 1; b < size; b++) {
          if (m[b][a] === m[b - 1][a]) { run++; if (run === 5) res += 3; else if (run > 5) res++; } else run = 1;
        }
      }
      for (a = 0; a < size - 1; a++) for (b = 0; b < size - 1; b++) {
        c = m[a][b];
        if (c === m[a][b + 1] && c === m[a + 1][b] && c === m[a + 1][b + 1]) res += 3;
      }
      var P = [1,0,1,1,1,0,1,0,0,0,0], Q = [0,0,0,0,1,0,1,1,1,0,1];
      function match(get, pat) { for (var t = 0; t < 11; t++) if (get(t) !== !!pat[t]) return false; return true; }
      for (a = 0; a < size; a++) for (b = 0; b <= size - 11; b++) {
        if (match(function (t) { return m[a][b + t]; }, P) || match(function (t) { return m[a][b + t]; }, Q)) res += 40;
        if (match(function (t) { return m[b + t][a]; }, P) || match(function (t) { return m[b + t][a]; }, Q)) res += 40;
      }
      var dark = 0;
      for (a = 0; a < size; a++) for (b = 0; b < size; b++) if (m[a][b]) dark++;
      var total = size * size;
      res += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
      return res;
    }

    var best = 0, bestPen = Infinity, mk;
    for (mk = 0; mk < 8; mk++) {
      applyMask(mk); drawFormat(mk);
      var p = penalty();
      if (p < bestPen) { bestPen = p; best = mk; }
      applyMask(mk); // desfaz
    }
    applyMask(best); drawFormat(best);

    return { size: size, modules: m, version: ver, mask: best };
  }

  function svg(text, opts) {
    opts = opts || {};
    var b = opts.border === undefined ? 4 : opts.border;
    var q = encode(text), s = q.size, d = '';
    for (var y = 0; y < s; y++) {
      var x = 0;
      while (x < s) {
        if (q.modules[y][x]) {
          var st = x;
          while (x < s && q.modules[y][x]) x++;
          d += 'M' + (st + b) + ',' + (y + b) + 'h' + (x - st) + 'v1h-' + (x - st) + 'z';
        } else x++;
      }
    }
    var t = s + b * 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t +
      '" shape-rendering="crispEdges" role="img" aria-label="QR Code">' +
      '<rect width="' + t + '" height="' + t + '" fill="#fff"/>' +
      '<path d="' + d + '" fill="#000"/></svg>';
  }

  root.QR = { encode: encode, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.QR;
})(typeof window !== 'undefined' ? window : this);
