/* crimSun — COMMAND INTERFACE
   Brush marks are filled variable-width shapes revealed by a stroke sweeping
   along their own centreline inside a mask, so ink appears in the direction a
   brush travels. Everything else is instrument chrome layered on top.
   Content is visible by default; if GSAP or ink.js fail, this is a complete
   static document. */

(function () {
  'use strict';

  var INK = window.INK;
  var G = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var animate = !!G && !reduce;

  if (G && ST) G.registerPlugin(ST);

  var uid = 0, NS = 'http://www.w3.org/2000/svg', marks = [];

  /* ============================ brush marks ============================ */

  var VB = {
    enso:  [500, 500, 92, 'xMidYMid meet'],
    heavy: [600, 80, 64, 'none'],
    mid:   [600, 80, 64, 'none'],
    light: [600, 80, 64, 'none'],
    rule:  [600, 80, 64, 'none']
  };

  function el(n, a) {
    var e = document.createElementNS(NS, n);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }

  function buildMark(host, kind) {
    if (!INK || !INK[kind]) return null;
    var c = VB[kind] || VB.rule, id = 'inkm' + (++uid);
    var svg = el('svg', {
      'class': 'ink-svg', viewBox: '0 0 ' + c[0] + ' ' + c[1],
      preserveAspectRatio: c[3], focusable: 'false', 'aria-hidden': 'true'
    });
    var defs = el('defs'), mask = el('mask', { id: id, maskUnits: 'userSpaceOnUse' });
    var sweep = el('path', {
      d: INK[kind === 'enso' ? 'ensoLine' : kind + 'Line'],
      stroke: '#fff', 'stroke-width': c[2],
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      fill: 'none', pathLength: '1', 'stroke-dasharray': '1 1.02'
    });
    sweep.setAttribute('data-mask-stroke', '');
    sweep.style.strokeDashoffset = animate ? '1' : '0';
    mask.appendChild(sweep); defs.appendChild(mask); svg.appendChild(defs);
    var g = el('g', { mask: 'url(#' + id + ')' });
    g.appendChild(el('path', { d: INK[kind] }));
    if (kind === 'enso' && INK.ensoHairs) {
      INK.ensoHairs.forEach(function (h) { g.appendChild(el('path', { d: h, 'class': 'hair' })); });
    }
    svg.appendChild(g); host.appendChild(svg);
    marks.push({ host: host, sweep: sweep });
    return sweep;
  }

  document.querySelectorAll('[data-ink]').forEach(function (h) {
    buildMark(h, h.getAttribute('data-ink'));
  });

  function sweepIn(host) {
    for (var i = 0; i < marks.length; i++) if (marks[i].host === host) return marks[i].sweep;
    return null;
  }
  function sweepFor(sel) { var h = document.querySelector(sel); return h ? sweepIn(h) : null; }

  /* ============================ copy the address ============================
     Functional, not decorative — wired before any animation gate. */

  document.querySelectorAll('.copy').forEach(function (btn) {
    var label = btn.textContent.trim();
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy');
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        setTimeout(function () { btn.textContent = label; btn.classList.remove('is-done'); }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(done, function () { btn.textContent = val; });
      } else { btn.textContent = val; }
    });
  });

  /* ============================ portrait slideshow ============================ */

  (function slideshow() {
    var box = document.querySelector('.portrait');
    if (!box) return;
    var slides = [].slice.call(box.querySelectorAll('.slide'));
    if (slides.length < 2) return;

    var shutter = box.querySelector('.shutter');
    var idx = 0, paused = false, timer = null;

    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-on', i === idx); });
      if (shutter && !reduce) {
        shutter.classList.remove('is-firing');
        void shutter.offsetWidth;
        shutter.classList.add('is-firing');
      }
    }

    function tick() { if (!paused) show(idx + 1); }
    function start() { stop(); timer = setInterval(tick, 4600); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    box.addEventListener('mouseenter', function () { paused = true; });
    box.addEventListener('mouseleave', function () { paused = false; });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (!reduce) start();
    });

    if (!reduce) start();
  })();

  /* ============================ teaser tiles ============================
     Muted, loopless-until-seen. preload="none" until the tile is on screen,
     then play; pause the moment it leaves so three videos never decode at once. */

  (function teasers() {
    var vids = [].slice.call(document.querySelectorAll('.tile video'));
    if (!vids.length) return;

    vids.forEach(function (v) { v.muted = true; v.setAttribute('muted', ''); });

    if (!('IntersectionObserver' in window)) {
      vids.forEach(function (v) { v.setAttribute('preload', 'metadata'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.getAttribute('preload') === 'none') { v.setAttribute('preload', 'auto'); v.load(); }
          var p = v.play();
          if (p && p.catch) p.catch(function () { /* autoplay refused; poster stands in */ });
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.4 });

    vids.forEach(function (v) { io.observe(v); });

    /* a hover always wins over the observer */
    document.querySelectorAll('.tile a').forEach(function (a) {
      var v = a.querySelector('video');
      if (!v) return;
      a.addEventListener('mouseenter', function () {
        if (v.getAttribute('preload') === 'none') { v.setAttribute('preload', 'auto'); v.load(); }
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      });
    });
  })();

  /* ============================ ranked record gauge ============================
     The percentage is derived from the real match figures in the markup, not
     typed in twice: 3,097 wins / (3,097 + 217) = 93.5%. */

  document.querySelectorAll('[data-gauge]').forEach(function (fig) {
    var pct = parseFloat(fig.getAttribute('data-gauge')) || 0;
    var fill = fig.querySelector('.gauge-fill');
    var num = fig.querySelector('[data-gauge-num]');
    var C = 2 * Math.PI * 50;
    if (fill) fill.style.strokeDasharray = C;

    function run() {
      if (fill) fill.style.strokeDashoffset = C * (1 - pct / 100);
      if (!num) return;
      if (reduce || !window.gsap) { num.textContent = pct.toFixed(1); return; }
      var o = { n: 0 };
      window.gsap.to(o, {
        n: pct, duration: 1.5, ease: 'power2.out',
        onUpdate: function () { num.textContent = o.n.toFixed(1); }
      });
    }

    if (reduce || !('IntersectionObserver' in window)) { run(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.45 });
    io.observe(fig);
  });

  /* ============================ video reels ============================
     ADD MORE VIDEOS HERE. Paste a YouTube id (the part after v= or youtu.be/)
     and it appears on the page — no other change needed.
     Nothing loads from YouTube until the visitor clicks: each tile is a
     thumbnail facade, and only then does the nocookie player mount. */

  var REELS = {
    fuseon: [
      { id: 'oH3YOsGIun4', title: '100 Days Overthrowing a Government', note: 'DemocracyCraft' },
      { id: '0ZyBtxCI4Go', title: 'Pancasila', note: 'Educational build, not PvP' }
    ],
    fuson: []
  };

  var CHANNEL = {
    fuseon: 'https://www.youtube.com/@fuseon8463',
    fuson: 'https://www.youtube.com/@itsFuSon'
  };

  document.querySelectorAll('[data-reels]').forEach(function (ul) {
    var key = ul.getAttribute('data-reels');
    var list = REELS[key] || [];

    if (!list.length) {
      var li = document.createElement('li');
      li.className = 'reel reel--empty';
      li.innerHTML =
        '<a class="chan-go" href="' + CHANNEL[key] + '" target="_blank" rel="noopener">' +
        'Watch on YouTube<span class="sr"> (opens in a new tab)</span></a>';
      ul.appendChild(li);
      return;
    }

    list.forEach(function (v) {
      var li = document.createElement('li');
      li.className = 'reel';
      li.innerHTML =
        '<button class="reel-play" type="button" aria-label="Play ' + v.title + ' on YouTube">' +
          '<span class="reel-media">' +
            '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">' +
            '<span class="brackets" aria-hidden="true"></span>' +
            '<span class="reel-btn" aria-hidden="true"></span>' +
          '</span>' +
          '<span class="reel-meta"><b>' + v.title + '</b><i>' + v.note + '</i></span>' +
        '</button>';

      li.querySelector('.reel-play').addEventListener('click', function () {
        var media = li.querySelector('.reel-media');
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + v.id +
                '?autoplay=1&rel=0&modestbranding=1';
        f.title = v.title;
        f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
        f.allowFullscreen = true;
        f.setAttribute('loading', 'lazy');
        media.innerHTML = '';
        media.appendChild(f);
        li.classList.add('is-live');
      });

      ul.appendChild(li);
    });
  });

  /* ============================ focus selector ============================
     Re-ranks evidence for the room. "all" and "games" carry the same content,
     ordered differently; "engineering" additionally hides the studio marks,
     the Ravey gallery and the gameplay tiles (see style.css) so a software
     recruiter sees only technical evidence. Every destination link survives in
     every state. The choice persists in the URL, so a tailored link can be
     sent to a specific employer. */

  (function focusLens() {
    var track = document.querySelector('.focus-track');
    if (!track) return;
    var btns = [].slice.call(track.querySelectorAll('button'));
    var ind = track.querySelector('.focus-ind');
    var root = document.documentElement;

    var COPY = {
      all: {
        role: 'Software engineer <i>·</i> game systems programmer',
        fact: "I've shipped a Godot editor plugin as a paid asset and two WebGL games you can play in this tab, no install. Computer Science at SNHU, graduating mid-2027.",
        status: 'Open to software engineering &amp; game development roles · Bogor, Indonesia · remote-ready',
        lead: 1, primary: 0
      },
      engineering: {
        role: 'Software engineer <i>·</i> systems and tooling',
        fact: "Engine tooling, a TypeScript Model Context Protocol integration, and my own power and levelling system, plus a Godot editor plugin shipped as a paid asset. Computer Science at SNHU, graduating mid-2027.",
        status: 'Open to software engineering &amp; game development roles · Bogor, Indonesia · remote-ready',
        lead: 3, primary: 1
      },
      games: {
        role: 'Game systems programmer <i>·</i> software engineer',
        fact: "Four games built and shipped, two of them playable in this tab with no install, plus a Godot editor plugin sold as a paid asset. Unity, Godot, and my own power and levelling system underneath them.",
        status: 'Open to game development &amp; software engineering roles · Bogor, Indonesia · remote-ready',
        lead: 1, primary: 0
      },
      creator: {
        role: 'Creator <i>·</i> competitive player <i>·</i> engineer',
        fact: "Two YouTube channels, a decade of Minecraft, four perfect Dragon Ball games, and a video that doubled a server's population. I build the games too.",
        status: 'Open to creator partnerships &amp; game development roles · Bogor, Indonesia · remote-ready',
        lead: 1, primary: 0
      }
    };

    var role = document.querySelector('.hero .role');
    var fact = document.querySelector('.hero .fact');
    var status = document.querySelector('.hero .status');
    var acts = [].slice.call(document.querySelectorAll('.acts .act'));
    var rows = [].slice.call(document.querySelectorAll('.dests li'));

    function apply(key, remember) {
      var c = COPY[key] || COPY.all;
      root.setAttribute('data-focus', key);

      btns.forEach(function (b, i) {
        var on = b.getAttribute('data-focus') === key;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on && ind) {
          ind.style.setProperty('--fw', b.offsetWidth + 'px');
          ind.style.setProperty('--fx', b.offsetLeft + 'px');
        }
      });

      if (role) role.innerHTML = c.role;
      if (fact) fact.textContent = c.fact;
      if (status) {
        status.innerHTML = '<span class="wetdot" aria-hidden="true"></span>' + c.status;
      }
      acts.forEach(function (a, i) { a.classList.toggle('act-1', i === c.primary); });
      rows.forEach(function (li, i) { li.classList.toggle('is-lead', i === c.lead - 1); });

      if (remember) {
        try { localStorage.setItem('crimsun-focus', key); } catch (e) {}
        var u = new URL(window.location.href);
        if (key === 'all') u.searchParams.delete('focus');
        else u.searchParams.set('focus', key);
        history.replaceState(null, '', u);
      }
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-focus'), true); });
    });

    var param = new URLSearchParams(window.location.search).get('focus');
    var saved = null;
    try { saved = localStorage.getItem('crimsun-focus'); } catch (e) {}
    var start = (param && COPY[param]) ? param : (saved && COPY[saved] ? saved : 'all');
    apply(start, !!param);

    window.addEventListener('resize', function () {
      var on = track.querySelector('[aria-pressed="true"]');
      if (on && ind) {
        ind.style.setProperty('--fw', on.offsetWidth + 'px');
        ind.style.setProperty('--fx', on.offsetLeft + 'px');
      }
    }, { passive: true });
  })();

  /* ============================ gallery lightbox ============================
     Artwork deserves to be seen at size. Functional, so it is wired before any
     animation gate and works with GSAP absent or motion reduced. */

  (function lightbox() {
    var box = document.querySelector('.lightbox');
    if (!box) return;
    var body = box.querySelector('.lb-body');
    var cap = box.querySelector('.lb-cap');
    var shut = box.querySelector('.lb-close');
    var opener = null;

    /* built here, never shipped empty in the markup */
    var img = document.createElement('img');
    img.className = 'lb-img';
    body.insertBefore(img, cap);

    function open(btn) {
      opener = btn;
      img.src = btn.getAttribute('data-full');
      var inner = btn.querySelector('img');
      img.alt = inner ? inner.alt : '';
      cap.textContent = btn.getAttribute('data-cap') || '';
      box.hidden = false;
      requestAnimationFrame(function () { box.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      shut.focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(function () { box.hidden = true; img.removeAttribute('src'); }, 320);
      if (opener) opener.focus();
    }

    document.querySelectorAll('.frame-plate[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn); });
    });

    shut.addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { e.preventDefault(); shut.focus(); }
    });
  })();

  /* ============================ static path ============================ */

  if (!animate) {
    document.querySelectorAll('.portrait,.seal').forEach(function (e) { e.style.opacity = '1'; });
    return;
  }

  /* ============================ helpers ============================ */

  function draw(sweep, dur, delay) {
    return G.to(sweep, { strokeDashoffset: 0, duration: dur, delay: delay || 0, ease: 'power2.out' });
  }

  function splitWords(node) {
    var words = node.textContent.trim().split(/\s+/);
    node.textContent = '';
    var cells = [];
    words.forEach(function (w, i) {
      var cell = document.createElement('span'); cell.className = 'w';
      var inner = document.createElement('i'); inner.textContent = w;
      cell.appendChild(inner); node.appendChild(cell);
      if (i < words.length - 1) node.appendChild(document.createTextNode(' '));
      cells.push(inner);
    });
    return cells;
  }

  document.querySelectorAll('h1.display .ln').forEach(function (ln) {
    var i = document.createElement('i');
    i.textContent = ln.textContent;
    ln.textContent = ''; ln.appendChild(i);
    G.set(i, { yPercent: 112 });
  });

  /* ============================ boot sequence ============================
     Reveal order is a priority statement: the name, the shipped-work line, the
     CTAs and open-to-work are what a recruiter came for. The rig is the reward. */

  G.set('.hero .portrait, .seal', { opacity: 0 });
  G.set('.rig', { opacity: 0, scale: 1.14, rotate: -8 });

  var tl = G.timeline({ defaults: { ease: 'power3.out' } });
  var ensoSweep = sweepFor('.hero .enso');

  tl.to('.rig', { opacity: 1, scale: 1, rotate: 0, duration: 1.6, ease: 'power3.out' }, 0.05);
  if (ensoSweep) tl.add(draw(ensoSweep, 1.15), 0.1);

  tl.to('h1.display .ln>i', { yPercent: 0, duration: .8, stagger: .08 }, 0.12)
    .to('.hero .portrait', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.55);

  var heroRule = sweepFor('.hero .rule');
  if (heroRule) tl.add(draw(heroRule, 0.7), 0.62);

  /* .acts and .status are never hidden — live from the first frame */
  tl.fromTo('.hero .role, .hero .fact',
    { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, stagger: .09 }, 0.55);

  tl.fromTo('.seal-hero',
    { opacity: 0, scale: 1.5, rotate: -14 },
    { opacity: 1, scale: 1, rotate: 0, duration: .5, ease: 'power4.out' }, 1.1);

  tl.fromTo('.cue', { opacity: 0 }, { opacity: 1, duration: .7 }, 1.4);

  if (!ST) return;

  /* ============================ scroll choreography ============================ */

  G.to('.enso-stage', {
    yPercent: -13, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 }
  });
  G.to('.rig', {
    rotate: 24, scale: .92, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 }
  });
  G.to('.hero-text', {
    yPercent: 9, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 }
  });

  document.querySelectorAll('.band').forEach(function (band) {
    var sweeps = [];
    band.querySelectorAll('[data-ink]').forEach(function (h) {
      var s = sweepIn(h); if (s) sweeps.push(s);
    });
    ST.create({
      trigger: band, start: 'top 78%', once: true,
      onEnter: function () { sweeps.forEach(function (s, i) { draw(s, 1.05, i * .14); }); }
    });

    var heading = band.querySelector('h2.display');
    if (heading) {
      var cells = splitWords(heading);
      G.fromTo(cells, { yPercent: 108 }, {
        yPercent: 0, duration: 1.05, stagger: .085, ease: 'power3.out',
        scrollTrigger: { trigger: band, start: 'top 76%', once: true }
      });
    }

    var rise = band.querySelectorAll(
      '.head-note,.lede,.body,.links,.studio-marks figure,.plates .frame,' +
      '.tier h3,.tier ul,.tier-foot,.dests li,.teasers-head,.tile,.mail,.copy-note,.social'
    );
    if (rise.length) {
      G.fromTo(rise, { opacity: 0, y: 26 }, {
        opacity: 1, y: 0, duration: 1.05, stagger: .07, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: band, start: 'top 74%', once: true }
      });
    }
  });

  var endSeal = document.querySelector('.seal-end');
  if (endSeal) {
    ST.create({
      trigger: '.contact', start: 'top 66%', once: true,
      onEnter: function () {
        G.fromTo(endSeal,
          { opacity: 0, scale: 1.5, rotate: 12 },
          { opacity: 1, scale: 1, rotate: 0, duration: .5, ease: 'power4.out' });
      }
    });
  }

  /* ============================ masthead, progress, position ============================ */

  var mast = document.querySelector('.masthead');
  var prog = document.querySelector('.progress');
  var progFill = prog && prog.querySelector('span');
  var pct = document.querySelector('[data-readout="pct"]');
  var bar = document.querySelector('[data-readout="bar"]');
  var lock = document.querySelector('[data-readout="target"]');
  var navLinks = [].slice.call(document.querySelectorAll('.mast-nav a'));

  /* the scouter reads real state: scan is scroll, lock is the live section */
  ST.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var p = self.progress;
      if (mast) mast.classList.toggle('is-stuck', self.scroll() > 80);
      if (prog) prog.classList.toggle('is-live', self.scroll() > 240);
      if (progFill) G.set(progFill, { scaleY: p });
      if (pct) pct.textContent = Math.round(p * 100);
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
    }
  });

  document.querySelectorAll('section[id]').forEach(function (sec) {
    ST.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: function (self) {
        if (!self.isActive) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + sec.id;
          a.classList.toggle('is-here', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
        if (lock) lock.textContent = sec.id;
      }
    });
  });

  /* scouter power-on: the lens strikes, the counter spikes and settles to the
     real scroll value the way a scouter overshoots before it locks */
  if (pct) {
    var boot = { n: 0 };
    G.timeline({ delay: .45 })
      .to(boot, {
        n: 88, duration: .55, ease: 'power2.out',
        onUpdate: function () { pct.textContent = Math.round(boot.n); }
      })
      .to(boot, {
        n: 0, duration: .7, ease: 'power3.inOut',
        onUpdate: function () { pct.textContent = Math.round(boot.n); },
        onComplete: function () { ST.refresh(); }
      });
  }
  G.from('.scouter', { opacity: 0, x: 18, duration: .8, delay: .25, ease: 'power3.out' });
  G.from('.lens', {
    scaleX: 0, duration: .6, delay: .3, ease: 'power4.out', transformOrigin: 'left center'
  });

  /* ============================ the cursor ============================
     A brush tip that turns to its direction of travel, plus a reticle that
     closes on anything interactive. */

  if (fine) {
    var cur = document.querySelector('.hud-cursor');
    if (!cur) return;
    var tip = cur.querySelector('i'), ret = cur.querySelector('u');
    var tx = 0, ty = 0, px = 0, py = 0, rx = 0, ry = 0, qx = 0, qy = 0;
    var ang = 0, stretch = 1, live = false;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!live) { live = true; rx = px = qx = tx; ry = py = qy = ty; cur.classList.add('is-live'); }
    }, { passive: true });

    document.addEventListener('mouseleave', function () { cur.classList.remove('is-live'); });
    document.addEventListener('mouseenter', function () { if (live) cur.classList.add('is-live'); });

    (function loop() {
      requestAnimationFrame(loop);
      rx += (tx - rx) * 0.22; ry += (ty - ry) * 0.22;
      qx += (tx - qx) * 0.11; qy += (ty - qy) * 0.11;
      var dx = rx - px, dy = ry - py;
      var speed = Math.min(Math.sqrt(dx * dx + dy * dy), 46);
      if (speed > 0.7) ang = Math.atan2(dy, dx) * 180 / Math.PI;
      stretch += ((1 + speed / 15) - stretch) * 0.18;
      px = rx; py = ry;
      if (tip) {
        tip.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) rotate(' + ang + 'deg) ' +
          'scale(' + stretch.toFixed(3) + ',' + (1 / Math.sqrt(stretch)).toFixed(3) + ')';
      }
      if (ret) ret.style.translate = qx + 'px ' + qy + 'px';
    })();

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a,button,video')) cur.classList.add('is-target');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a,button,video')) cur.classList.remove('is-target');
    });
  }
})();
