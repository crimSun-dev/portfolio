/* crimSun — HUD + ATMOSPHERE
   ---------------------------------------------------------------------------
   1. The instrument rig around the enso (SVG): dashed orbits, degree ticks, a
      golden-section construction, a radar sweep.
   2. The field (canvas): a living solar-circuit under a command deck, in four
      layers back to front —
        A  circuit substrate .... etched PCB traces, pads and vias. Generated
                                  once per resize into an offscreen buffer, so
                                  it costs nothing per frame.
        B  lava buoyancy ........ 3–6 large soft solar blobs rising and
                                  overlapping, drawn as a cached sprite under
                                  'lighter' so they merge like a lava lamp.
        C  plasma filaments ..... slow curved energy threads.
        D  charge + embers ...... rare pulses running the traces (gold tip,
                                  crimson tail) and small rising motes.
      Then a QUIET ZONE is cut out of the centre column with destination-out,
      so density is always lowest where the content reads and highest in the
      empty margins.

   Budget: ~28fps ceiling, paused on document.hidden, static substrate only
   under prefers-reduced-motion and on small screens. Every layer is
   aria-hidden and pointer-events:none. Flame ramp only — no other hues. */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 900px)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function el(n, a) {
    var e = document.createElementNS(NS, n);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }

  /* ==================== 1. the instrument rig ==================== */

  var rig = document.querySelector('.rig');
  if (rig) {
    var S = 400, C = S / 2;
    var svg = el('svg', { viewBox: '0 0 ' + S + ' ' + S, 'aria-hidden': 'true', focusable: 'false' });

    var defs = el('defs');
    var grad = el('linearGradient', { id: 'radarFade', x1: '0', y1: '0', x2: '1', y2: '0' });
    grad.appendChild(el('stop', { offset: '0', 'stop-color': '#FF7A16', 'stop-opacity': '0' }));
    grad.appendChild(el('stop', { offset: '1', 'stop-color': '#FF7A16', 'stop-opacity': '.34' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    var gA = el('g', { 'class': 'spin-a' });
    gA.appendChild(el('circle', { cx: C, cy: C, r: 190, 'class': 'arc', 'stroke-dasharray': '54 12 6 12' }));
    [0, 90, 180, 270].forEach(function (d) {
      var a = d * Math.PI / 180, x = C + Math.cos(a) * 190, y = C + Math.sin(a) * 190;
      gA.appendChild(el('rect', {
        x: x - 3, y: y - 3, width: 6, height: 6, fill: '#FF2E1F', opacity: '.75',
        transform: 'rotate(45 ' + x + ' ' + y + ')'
      }));
    });
    svg.appendChild(gA);

    var gB = el('g', { 'class': 'spin-b' });
    gB.appendChild(el('circle', { cx: C, cy: C, r: 172, 'class': 'arc arc-2', 'stroke-dasharray': '2 7' }));
    for (var d = 0; d < 360; d += 15) {
      var a = d * Math.PI / 180, big = d % 45 === 0, r2 = 172 + (big ? 11 : 5);
      gB.appendChild(el('line', {
        x1: C + Math.cos(a) * 172, y1: C + Math.sin(a) * 172,
        x2: C + Math.cos(a) * r2, y2: C + Math.sin(a) * r2,
        'class': big ? 'tick-lg' : 'tick'
      }));
    }
    svg.appendChild(gB);

    var gC = el('g', { 'class': 'spin-c' }), R = 150;
    gC.appendChild(el('circle', { cx: C, cy: C, r: R, 'class': 'sigil' }));
    gC.appendChild(el('circle', { cx: C, cy: C, r: R * 0.618, 'class': 'sigil' }));
    var hex = [], tri = [];
    for (var i = 0; i < 6; i++) {
      var t = (i * 60 - 90) * Math.PI / 180;
      hex.push((C + Math.cos(t) * R).toFixed(1) + ',' + (C + Math.sin(t) * R).toFixed(1));
    }
    for (var j = 0; j < 3; j++) {
      var u = (j * 120 - 90) * Math.PI / 180;
      tri.push((C + Math.cos(u) * R).toFixed(1) + ',' + (C + Math.sin(u) * R).toFixed(1));
    }
    gC.appendChild(el('polygon', { points: hex.join(' '), 'class': 'sigil' }));
    gC.appendChild(el('polygon', { points: tri.join(' '), 'class': 'sigil' }));
    hex.forEach(function (p) {
      var xy = p.split(',');
      gC.appendChild(el('line', { x1: C, y1: C, x2: xy[0], y2: xy[1], 'class': 'sigil' }));
    });
    svg.appendChild(gC);

    var gR = el('g', { 'class': 'radar' });
    gR.appendChild(el('path', {
      d: 'M' + C + ',' + C + ' L' + (C + 186) + ',' + (C - 46) +
         ' A192,192 0 0,1 ' + (C + 186) + ',' + (C + 46) + ' Z',
      fill: 'url(#radarFade)'
    }));
    gR.appendChild(el('line', { x1: C, y1: C, x2: C + 192, y2: C, stroke: '#FFC21A', 'stroke-width': '1', opacity: '.5' }));
    svg.appendChild(gR);

    [['CRIMSUN.RIG', 26], ['φ 1.618', S - 18]].forEach(function (L) {
      var t = el('text', { x: C, y: L[1], 'class': 'lbl', 'text-anchor': 'middle' });
      t.textContent = L[0];
      svg.appendChild(t);
    });

    rig.appendChild(svg);
  }

  /* ==================== 2. the field ==================== */

  var cv = document.querySelector('.field');
  if (!cv) return;

  var ctx = cv.getContext('2d', { alpha: true });
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  /* ---- flame ramp, the only palette this layer may use ---- */
  var CRIM = [255, 46, 31], EMBER = [255, 122, 22], SOLAR = [255, 194, 26];
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  /* ---- opacity budget: the whole field sits under this ceiling ---- */
  var A_TRACE = 0.075, A_PAD = 0.13, A_BLOB = 0.052, A_FIL = 0.05, A_MOTE = 0.5;

  var substrate = document.createElement('canvas');
  var sctx = substrate.getContext('2d');
  var traces = [];

  /* ---- a soft solar sprite, drawn once and reused for every blob ---- */
  var blobSprite = (function () {
    var s = document.createElement('canvas'), n = 160;
    s.width = s.height = n;
    var c = s.getContext('2d');
    var g = c.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0, 'rgba(255,122,22,1)');
    g.addColorStop(0.42, 'rgba(255,60,24,.45)');
    g.addColorStop(1, 'rgba(255,46,31,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, n, n);
    return s;
  })();

  /* ---- A. circuit substrate: etched traces, pads, vias ---- */

  function buildSubstrate() {
    substrate.width = Math.floor(W * DPR);
    substrate.height = Math.floor(H * DPR);
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    sctx.clearRect(0, 0, W, H);
    traces = [];

    var GRID = 26;
    var runs = Math.round((W * H) / 34000);
    runs = Math.max(10, Math.min(runs, 46));

    sctx.lineCap = 'square';
    sctx.lineJoin = 'miter';

    for (var r = 0; r < runs; r++) {
      var x = Math.round(Math.random() * W / GRID) * GRID;
      var y = Math.round(Math.random() * H / GRID) * GRID;
      var pts = [[x, y]];
      var dir = Math.floor(Math.random() * 4);
      var segs = 3 + Math.floor(Math.random() * 5);

      for (var s = 0; s < segs; s++) {
        var len = GRID * (2 + Math.floor(Math.random() * 6));
        var diag = Math.random() < 0.26;           /* occasional 45 degree elbow */
        var dx = 0, dy = 0;
        if (diag) {
          var sx = (dir === 0 || dir === 3) ? 1 : -1;
          var sy = (dir === 0 || dir === 1) ? 1 : -1;
          var d = Math.min(len, GRID * 3);
          dx = sx * d; dy = sy * d;
        } else {
          if (dir === 0) dx = len; else if (dir === 1) dy = len;
          else if (dir === 2) dx = -len; else dy = -len;
        }
        x += dx; y += dy;
        pts.push([x, y]);
        if (Math.random() < 0.72) dir = (dir + (Math.random() < 0.5 ? 1 : 3)) % 4;
        if (x < -80 || x > W + 80 || y < -80 || y > H + 80) break;
      }

      if (pts.length < 2) continue;
      traces.push(pts);

      /* the trace */
      sctx.strokeStyle = rgba(EMBER, A_TRACE);
      sctx.lineWidth = Math.random() < 0.22 ? 1.6 : 1;
      sctx.beginPath();
      sctx.moveTo(pts[0][0], pts[0][1]);
      for (var p = 1; p < pts.length; p++) sctx.lineTo(pts[p][0], pts[p][1]);
      sctx.stroke();

      /* pads at each end */
      [pts[0], pts[pts.length - 1]].forEach(function (pt) {
        sctx.fillStyle = rgba(EMBER, A_PAD);
        sctx.beginPath();
        sctx.arc(pt[0], pt[1], 2.6, 0, 6.2832);
        sctx.fill();
      });

      /* the odd via: a ring rather than a pad */
      if (Math.random() < 0.4) {
        var mid = pts[Math.floor(pts.length / 2)];
        sctx.strokeStyle = rgba(SOLAR, A_PAD * 0.8);
        sctx.lineWidth = 1;
        sctx.beginPath();
        sctx.arc(mid[0], mid[1], 3.4, 0, 6.2832);
        sctx.stroke();
      }
    }
  }

  /* ---- B/C/D. the animated bodies ---- */

  var blobs = [], filaments = [], motes = [], pulses = [];

  function seed() {
    blobs = [];
    var nb = 3 + Math.floor(Math.random() * 3);
    for (var b = 0; b < nb; b++) {
      blobs.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 190 + Math.random() * 230,
        vy: -(0.055 + Math.random() * 0.075),
        ph: Math.random() * 6.28,
        sp: 0.00022 + Math.random() * 0.00035,
        amp: 24 + Math.random() * 46
      });
    }

    filaments = [];
    for (var f = 0; f < 5; f++) {
      filaments.push({
        x: Math.random() * W, y: Math.random() * H,
        len: 130 + Math.random() * 240,
        ang: Math.random() * 6.28,
        drift: (Math.random() - 0.5) * 0.0012,
        a: A_FIL * (0.55 + Math.random() * 0.7)
      });
    }

    motes = [];
    var nm = Math.min(52, Math.round(W * H / 30000));
    for (var m = 0; m < nm; m++) motes.push(mote(true));
  }

  function mote(anywhere) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 10,
      r: 0.5 + Math.random() * 1.5,
      vy: -(0.1 + Math.random() * 0.34),
      vx: (Math.random() - 0.5) * 0.14,
      life: 0, max: 320 + Math.random() * 500,
      c: Math.random() < 0.24 ? SOLAR : (Math.random() < 0.5 ? EMBER : CRIM)
    };
  }

  /* a charge runs a real trace, gold at the head, crimson behind */
  function fire() {
    if (!traces.length || pulses.length > 2) return;
    var pts = traces[Math.floor(Math.random() * traces.length)];
    var total = 0, segs = [];
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
      var L = Math.hypot(dx, dy);
      segs.push(L); total += L;
    }
    if (total < 60) return;
    pulses.push({ pts: pts, segs: segs, total: total, d: 0, sp: 0.9 + Math.random() * 1.5 });
  }

  function at(p, dist) {
    var acc = 0;
    for (var i = 0; i < p.segs.length; i++) {
      if (acc + p.segs[i] >= dist) {
        var t = (dist - acc) / p.segs[i];
        return [
          p.pts[i][0] + (p.pts[i + 1][0] - p.pts[i][0]) * t,
          p.pts[i][1] + (p.pts[i + 1][1] - p.pts[i][1]) * t
        ];
      }
      acc += p.segs[i];
    }
    return p.pts[p.pts.length - 1];
  }

  /* ---- the quiet zone: never compete with the reading column ----
     Deepest through the centre where body copy sits, but it never falls to
     zero: .cue, .foot and the un-stuck masthead all sit hard against the page
     edges, and at full field strength --ink-3 measured 3.76:1 there. A 28%
     floor at the margins puts it back over AA while keeping the density
     gradient that makes the effect read. */
  function quiet() {
    ctx.globalCompositeOperation = 'destination-out';
    var g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, 'rgba(0,0,0,.28)');
    g.addColorStop(0.20, 'rgba(0,0,0,.46)');
    g.addColorStop(0.50, 'rgba(0,0,0,.62)');
    g.addColorStop(0.80, 'rgba(0,0,0,.46)');
    g.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* the top strip carries the masthead before it sticks, and the bottom
       strip carries the footer — hold both quieter still */
    var vg = ctx.createLinearGradient(0, 0, 0, H);
    vg.addColorStop(0, 'rgba(0,0,0,.34)');
    vg.addColorStop(0.10, 'rgba(0,0,0,0)');
    vg.addColorStop(0.90, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.30)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'source-over';
  }

  function size() {
    W = cv.clientWidth; H = cv.clientHeight;
    if (!W || !H) return;
    cv.width = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildSubstrate();
  }

  /* ---- static path: reduced motion, or a phone ---- */

  if (reduce || small) {
    size();
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(substrate, 0, 0, W, H);
    quiet();
    var rts;
    window.addEventListener('resize', function () {
      clearTimeout(rts);
      rts = setTimeout(function () {
        size();
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(substrate, 0, 0, W, H);
        quiet();
      }, 220);
    }, { passive: true });
    return;
  }

  /* ---- live path ---- */

  size(); seed();

  var running = true, last = 0, nextFire = 1400;

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (now - last < 35) return;            /* ~28fps ceiling — this is ambience */
    var dt = Math.min(now - last, 90);
    last = now;

    ctx.clearRect(0, 0, W, H);

    /* B — lava buoyancy, merged additively */
    ctx.globalCompositeOperation = 'lighter';
    for (var b = 0; b < blobs.length; b++) {
      var o = blobs[b];
      o.ph += o.sp * dt;
      o.y += o.vy * (dt / 16.7);
      var x = o.x + Math.sin(o.ph) * o.amp;
      if (o.y + o.r < -40) { o.y = H + o.r; o.x = Math.random() * W; }
      ctx.globalAlpha = A_BLOB;
      ctx.drawImage(blobSprite, x - o.r, o.y - o.r, o.r * 2, o.r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    /* A — the etched substrate */
    ctx.drawImage(substrate, 0, 0, W, H);

    /* C — plasma filaments */
    ctx.lineWidth = 1;
    for (var f = 0; f < filaments.length; f++) {
      var v = filaments[f];
      v.ang += v.drift * (dt / 16.7);
      var x2 = v.x + Math.cos(v.ang) * v.len, y2 = v.y + Math.sin(v.ang) * v.len;
      var g = ctx.createLinearGradient(v.x, v.y, x2, y2);
      g.addColorStop(0, rgba(CRIM, 0));
      g.addColorStop(0.5, rgba(EMBER, v.a));
      g.addColorStop(1, rgba(SOLAR, 0));
      ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.lineTo(x2, y2); ctx.stroke();
    }

    /* D — charge along the traces */
    nextFire -= dt;
    if (nextFire <= 0) { fire(); nextFire = 2200 + Math.random() * 3600; }

    for (var p = pulses.length - 1; p >= 0; p--) {
      var pu = pulses[p];
      pu.d += pu.sp * (dt / 16.7);
      if (pu.d > pu.total + 70) { pulses.splice(p, 1); continue; }

      /* crimson tail */
      var tail = 58;
      ctx.lineWidth = 1.5;
      for (var s = 0; s < 6; s++) {
        var d0 = pu.d - (s / 6) * tail, d1 = pu.d - ((s + 1) / 6) * tail;
        if (d1 < 0) break;
        var a0 = at(pu, Math.min(d0, pu.total)), a1 = at(pu, Math.min(d1, pu.total));
        ctx.strokeStyle = rgba(CRIM, 0.32 * (1 - s / 6));
        ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke();
      }
      /* solar head */
      if (pu.d <= pu.total) {
        var hd = at(pu, pu.d);
        ctx.fillStyle = rgba(SOLAR, 0.5);
        ctx.beginPath(); ctx.arc(hd[0], hd[1], 1.9, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,214,.55)';
        ctx.beginPath(); ctx.arc(hd[0], hd[1], 0.9, 0, 6.2832); ctx.fill();
      }
    }

    /* D — embers */
    for (var m = 0; m < motes.length; m++) {
      var k = motes[m];
      k.x += k.vx * (dt / 16.7); k.y += k.vy * (dt / 16.7); k.life += dt / 16.7;
      k.vx += (Math.random() - 0.5) * 0.012;
      if (k.life > k.max || k.y < -12) { motes[m] = mote(false); continue; }
      var a = Math.sin(Math.min(k.life / k.max, 1) * Math.PI) * A_MOTE;
      ctx.fillStyle = rgba(k.c, a.toFixed(3));
      ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, 6.2832); ctx.fill();
    }

    quiet();
  }

  requestAnimationFrame(frame);

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { size(); seed(); }, 200);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = 0; requestAnimationFrame(frame); }
  });
})();
