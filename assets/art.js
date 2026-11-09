/* Generative art and scroll-driven drawing for the portfolio.
 *
 * Everything here is progressive enhancement: the page is complete without
 * it. Motion is skipped (a still frame is drawn instead) when the visitor
 * asks for reduced motion, and the animated field pauses whenever it is
 * off screen or the tab is hidden.
 */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pad = (n) => String(n).padStart(2, '0');
  const f = (n) => +n.toFixed(1);

  // Small seeded generator, so every plate draws the same each visit.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 2D gradient noise for the flow field.
  const noise2 = (() => {
    const rand = mulberry32(7);
    const order = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = order[i & 255];

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (hash, x, y) => {
      switch (hash & 3) {
        case 0: return x + y;
        case 1: return -x + y;
        case 2: return x - y;
        default: return -x - y;
      }
    };

    return (x, y) => {
      const xi = Math.floor(x) & 255;
      const yi = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = fade(xf);
      const v = fade(yf);
      const a = perm[xi] + yi;
      const b = perm[xi + 1] + yi;
      return lerp(
        lerp(grad(perm[a], xf, yf), grad(perm[b], xf - 1, yf), u),
        lerp(grad(perm[a + 1], xf, yf - 1), grad(perm[b + 1], xf - 1, yf - 1), u),
        v
      );
    };
  })();

  /* Hero: a pen-plotter flow field ------------------------------------------
     Hundreds of fine pens follow a slowly drifting noise field and leave
     trails that fade out. The pointer bends the field around it. */
  function initField(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const INK = 'rgba(220, 226, 240, 0.34)';
    const BLUE = 'rgba(63, 140, 255, 0.95)';
    const pointer = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let t = 0;
    let particles = [];
    let raf = 0;
    let onScreen = true;

    function respawn(p) {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.age = 0;
      p.life = 90 + Math.random() * 220;
      p.speed = 0.5 + Math.random() * 0.9;
      p.blue = Math.random() < 0.26;
      return p;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const count = clamp(Math.round((w * h) / 1500), 320, 1100);
      particles = Array.from({ length: count }, () => respawn({}));
    }

    function step() {
      // Erase a little each frame so old strokes dissolve into the page.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      const inkPath = new Path2D();
      const bluePath = new Path2D();
      const reach = 280;
      const reach2 = reach * reach;

      for (const p of particles) {
        let angle = noise2(p.x * 0.0017, p.y * 0.0017 + t) * Math.PI * 2.4;
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);

        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < reach2) {
          const d = Math.sqrt(d2) || 1;
          const pull = (1 - d2 / reach2) * 2.6;
          vx += (-dy / d) * pull;
          vy += (dx / d) * pull;
          angle = Math.atan2(vy, vx);
        }

        const nx = p.x + Math.cos(angle) * p.speed;
        const ny = p.y + Math.sin(angle) * p.speed;
        const path = p.blue ? bluePath : inkPath;
        path.moveTo(p.x, p.y);
        path.lineTo(nx, ny);
        p.x = nx;
        p.y = ny;
        p.age += 1;

        if (p.age > p.life || nx < -10 || ny < -10 || nx > w + 10 || ny > h + 10) respawn(p);
      }

      ctx.lineWidth = 1.15;
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK;
      ctx.stroke(inkPath);
      ctx.strokeStyle = BLUE;
      ctx.stroke(bluePath);
      t += 0.0006;
    }

    function frame() {
      step();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf || !onScreen || document.hidden || reduceMotion.matches) return;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function paint() {
      stop();
      resize();
      // Warm up so the artwork is already present on first paint.
      const warm = reduceMotion.matches ? 260 : 70;
      for (let i = 0; i < warm; i++) step();
      start();
    }

    paint();

    let lastWidth = canvas.getBoundingClientRect().width;
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const width = canvas.getBoundingClientRect().width;
        // Ignore height-only changes (mobile browser bars) to avoid a redraw.
        if (Math.abs(width - lastWidth) < 2) return;
        lastWidth = width;
        paint();
      }, 180);
    });

    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    }).observe(canvas);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    reduceMotion.addEventListener('change', paint);

    const host = canvas.parentElement;
    host.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    }, { passive: true });
    host.addEventListener('pointerleave', () => {
      pointer.x = -9999;
      pointer.y = -9999;
    });
  }

  /* Plates: one small drawing per case study ------------------------------
     Each plate is a diagram of what the project does, not decoration:
     three stages of checking, tangled code made plain, many tickers read at
     once, a rough brief resolved into a grid, five trade corridors meeting
     one decision. */
  const PLATE_W = 300;
  const PLATE_H = 380;

  function makeEmitter() {
    let i = 0;
    return (tag, attrs, accent) =>
      `<${tag} ${attrs} pathLength="1" style="--i:${i++}"${accent ? ' class="plate-accent"' : ''}/>`;
  }

  function arcPath(cx, cy, r, a0, a1) {
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${f(x0)} ${f(y0)}A${r} ${r} 0 ${large} 1 ${f(x1)} ${f(y1)}`;
  }

  const frame = (e) => e('rect', 'x="12" y="12" width="276" height="356" rx="2"');

  const PLATES = {
    // Notion MCP: expand, search, then a final adversarial check.
    arcs(rand) {
      const e = makeEmitter();
      const cx = 150;
      const cy = 190;
      let out = frame(e);
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const r2 = 54 + rand() * 12;
        out += e('line', `x1="${f(cx + Math.cos(a) * 34)}" y1="${f(cy + Math.sin(a) * 34)}" x2="${f(cx + Math.cos(a) * r2)}" y2="${f(cy + Math.sin(a) * r2)}"`);
      }
      [80, 96, 112].forEach((r) => {
        const start = rand() * Math.PI * 2;
        out += e('path', `d="${arcPath(cx, cy, r, start, start + 1.8 + rand() * 3)}" stroke-width="1.6"`);
      });
      out += e('circle', `cx="${cx}" cy="${cy}" r="138"`);
      const a = -0.9;
      out += e('line', `x1="${cx}" y1="${cy}" x2="${f(cx + Math.cos(a) * 138)}" y2="${f(cy + Math.sin(a) * 138)}"`, true);
      out += e('circle', `cx="${f(cx + Math.cos(a) * 138)}" cy="${f(cy + Math.sin(a) * 138)}" r="6"`, true);
      return out;
    },

    // Code Explainer: tangled code resolved into a few plain lines.
    lines(rand) {
      const e = makeEmitter();
      let out = frame(e);
      let y = 38;
      for (let i = 0; i < 15; i++) {
        const indent = Math.floor(rand() * 4) * 16;
        const len = 28 + rand() * (172 - indent);
        out += e('line', `x1="${36 + indent}" y1="${y}" x2="${f(36 + indent + len)}" y2="${y}" stroke-width="2.4"`);
        y += 11;
      }
      out += e('line', 'x1="36" y1="226" x2="264" y2="226"');
      out += e('path', 'd="M252 219l12 7-12 7"');
      [214, 188, 126].forEach((len, i) => {
        out += e('line', `x1="36" y1="${262 + i * 26}" x2="${36 + len}" y2="${262 + i * 26}" stroke-width="2.4"`, true);
      });
      return out;
    },

    // TickerNG: a whole exchange read at once.
    bars(rand) {
      const e = makeEmitter();
      let out = frame(e);
      const n = 40;
      const series = [];
      let price = 200;
      for (let i = 0; i < n; i++) {
        const open = price;
        const close = price + (rand() - 0.46) * 24;
        series.push({ open, close, hi: Math.max(open, close) + rand() * 9, lo: Math.min(open, close) - rand() * 9 });
        price = close;
      }
      const lo = Math.min(...series.map((s) => s.lo));
      const hi = Math.max(...series.map((s) => s.hi));
      const y = (v) => f(330 - ((v - lo) / (hi - lo)) * 270);
      series.forEach((s, i) => {
        const x = f(30 + i * (240 / (n - 1)));
        const accent = i === n - 1;
        out += e('line', `x1="${x}" y1="${y(s.hi)}" x2="${x}" y2="${y(s.lo)}"`, accent);
        const top = Math.min(+y(s.open), +y(s.close));
        out += e('rect', `x="${f(x - 2.2)}" y="${top}" width="4.4" height="${f(Math.abs(y(s.open) - y(s.close)) + 1)}"`, accent);
      });
      return out;
    },

    // SpecOS: a rough idea resolved into an exact grid.
    grid(rand) {
      const e = makeEmitter();
      let out = frame(e);
      const cols = 6;
      const rows = 8;
      const size = 28;
      const gap = 10;
      const x0 = (PLATE_W - (cols * size + (cols - 1) * gap)) / 2;
      const y0 = 44;
      for (let r = 0; r < rows; r++) {
        const jitter = (1 - r / (rows - 1)) * 12;
        for (let c = 0; c < cols; c++) {
          const x = x0 + c * (size + gap) + (rand() - 0.5) * 2 * jitter;
          const y = y0 + r * (size + gap) + (rand() - 0.5) * 2 * jitter;
          const rot = (rand() - 0.5) * 2 * jitter * 1.4;
          out += e('rect', `x="${f(x)}" y="${f(y)}" width="${size}" height="${size}" transform="rotate(${f(rot)} ${f(x + size / 2)} ${f(y + size / 2)})"`, r === rows - 1);
        }
      }
      return out;
    },

    // Afrigate: five trade corridors converging on one compliant decision.
    fan(rand) {
      const e = makeEmitter();
      let out = frame(e);
      const tx = 258;
      const ty = 190;
      for (let i = 0; i < 5; i++) {
        const y0 = 70 + i * 60;
        out += e('rect', `x="26" y="${y0 - 8}" width="12" height="16" rx="1"`);
        out += e('path', `d="M40 ${y0}C140 ${y0} 170 ${ty} ${tx} ${ty}"`);
        for (let k = 1; k <= 3; k++) {
          const px = 40 + k * 42 + rand() * 6;
          out += e('line', `x1="${f(px)}" y1="${y0 - 4 + (ty - y0) * (k / 7)}" x2="${f(px)}" y2="${y0 + 4 + (ty - y0) * (k / 7)}"`);
        }
      }
      out += e('circle', `cx="${tx}" cy="${ty}" r="6"`, true);
      out += e('circle', `cx="${tx}" cy="${ty}" r="16"`, true);
      return out;
    }
  };

  window.plateSVG = function plateSVG(kind, index) {
    const draw = PLATES[kind] || PLATES.arcs;
    const rand = mulberry32((Number(index) || 0) * 97 + 13);
    return `<svg class="plate" viewBox="0 0 ${PLATE_W} ${PLATE_H}" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${draw(rand)}</svg>`;
  };

  // On pointer devices a paper print follows the cursor across the list.
  function initPlatePreview() {
    const list = document.querySelector('.case-studies');
    if (!list) return;

    const card = document.createElement('div');
    card.className = 'plate-preview';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = '<div class="plate-card"></div><p class="plate-caption"></p>';
    document.body.appendChild(card);
    const holder = card.querySelector('.plate-card');
    const caption = card.querySelector('.plate-caption');

    let active = null;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let rotation = 0;
    let raf = 0;

    function tick() {
      x = lerp(x, targetX, 0.16);
      y = lerp(y, targetY, 0.16);
      rotation = lerp(rotation, clamp((targetX - x) * 0.06, -7, 7), 0.2);
      const top = clamp(y - card.offsetHeight / 2, 12, window.innerHeight - card.offsetHeight - 12);
      // Sit on whichever side of the cursor has more room, so it covers as
      // little of the row being read as possible.
      const flip = x > window.innerWidth * 0.55;
      const left = flip ? x - card.offsetWidth - 36 : x + 36;
      card.style.transform = `translate3d(${f(left)}px, ${f(top)}px, 0) rotate(${f(rotation)}deg)`;
      raf = requestAnimationFrame(tick);
    }

    function show(row) {
      const index = Number(row.dataset.index) || 0;
      holder.innerHTML = window.plateSVG(row.dataset.plate, index);
      caption.textContent = `Plate ${pad(index + 1)}`;
      card.classList.add('is-on');
      requestAnimationFrame(() => holder.firstElementChild && holder.firstElementChild.classList.add('is-drawn'));
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function hide() {
      active = null;
      card.classList.remove('is-on');
      cancelAnimationFrame(raf);
      raf = 0;
    }

    list.addEventListener('pointermove', (event) => {
      if (!fineHover.matches || event.pointerType === 'touch') return;
      targetX = event.clientX;
      targetY = event.clientY;
      const row = event.target.closest('.case-study');
      if (!row || !row.dataset.plate) return hide();
      if (row !== active) {
        if (!active) {
          x = targetX;
          y = targetY;
        }
        active = row;
        show(row);
      }
    });
    list.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', () => { if (active) hide(); }, { passive: true });
  }

  /* Audit: the five pillars drawn as a drafting diagram ------------------- */
  function initAuditFigure() {
    const host = document.getElementById('auditFigure');
    if (!host) return;

    const cx = 210;
    const cy = 220;
    const radius = 142;
    const readings = [0.58, 0.9, 0.42, 0.72, 0.64];
    const point = (i, k) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return [cx + Math.cos(a) * radius * k, cy + Math.sin(a) * radius * k];
    };
    const ring = (k) => [0, 1, 2, 3, 4].map((i) => point(i, k).map(f).join(',')).join(' ');
    const reading = readings.map((value, i) => point(i, value).map(f).join(',')).join(' ');

    let svg = '<svg viewBox="0 0 420 420" role="img" aria-label="Diagram: the five audit pillars arranged as a pentagon, with a reading plotted against each">';

    [[18, 18], [402, 18], [18, 402], [402, 402]].forEach(([x, y]) => {
      svg += `<path class="fig-mark" d="M${x - 7} ${y}h14M${x} ${y - 7}v14"/>`;
    });

    [0.25, 0.5, 0.75].forEach((k) => { svg += `<polygon class="fig-ring" points="${ring(k)}"/>`; });
    svg += `<polygon class="fig-ring fig-ring-outer" points="${ring(1)}"/>`;

    for (let i = 0; i < 5; i++) {
      const [x, y] = point(i, 1);
      svg += `<line class="fig-spoke" x1="${cx}" y1="${cy}" x2="${f(x)}" y2="${f(y)}"/>`;
    }

    svg += `<polygon class="fig-reading" points="${reading}" pathLength="1"/>`;
    svg += `<circle class="fig-centre" cx="${cx}" cy="${cy}" r="2.5"/>`;

    for (let i = 0; i < 5; i++) {
      const [vx, vy] = point(i, 1);
      const [dx, dy] = point(i, readings[i]);
      const [lx, ly] = point(i, 1.2);
      svg += `<g class="fig-v" data-i="${i}">`
        + `<circle class="fig-vertex" cx="${f(vx)}" cy="${f(vy)}" r="4.5"/>`
        + `<circle class="fig-dot" cx="${f(dx)}" cy="${f(dy)}" r="3.5"/>`
        + `<text class="fig-label" x="${f(lx)}" y="${f(ly)}" text-anchor="middle" dominant-baseline="central">${pad(i + 1)}</text>`
        + '</g>';
    }

    svg += `<text class="fig-caption" x="210" y="404" text-anchor="middle">Fig. 04 — Five pillars, one reading</text></svg>`;
    host.innerHTML = svg;

    const nodes = [...host.querySelectorAll('.fig-v')];
    const setActive = (index) => nodes.forEach((n, i) => n.classList.toggle('is-active', i === index));

    document.querySelectorAll('.audit-pillar').forEach((li, i) => {
      li.addEventListener('pointerenter', () => setActive(i));
      li.addEventListener('pointerleave', () => setActive(-1));
    });
  }

  /* Scroll: drawn lines and portrait drift ------------------------------- */
  function initScroll() {
    const draws = [...document.querySelectorAll('[data-draw]')];
    const drift = document.querySelector('[data-parallax]');
    if (!draws.length && !drift) return;

    let ticking = false;

    function update() {
      const vh = window.innerHeight;
      draws.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const p = clamp((vh * 0.85 - rect.top) / (rect.height + vh * 0.25), 0, 1);
        el.style.setProperty('--p', p.toFixed(3));
      });
      if (drift && !reduceMotion.matches) {
        const y = Math.min(window.scrollY, 900);
        drift.style.setProperty('--py', `${f(y * 0.035)}px`);
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* Rail: which numbered section is on screen --------------------------- */
  function initRail() {
    const rail = document.getElementById('rail');
    if (!rail || !('IntersectionObserver' in window)) return;

    const num = rail.querySelector('[data-rail-num]');
    const label = rail.querySelector('[data-rail-label]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        num.textContent = entry.target.dataset.section;
        label.textContent = entry.target.dataset.label;
        // The difference blend vanishes on the blue sheet, so go solid ink there.
        rail.classList.toggle('on-blue', entry.target.classList.contains('section-blue'));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('[data-section]').forEach((section) => observer.observe(section));
  }

  /* Cursor: a ring that trails the pointer and swells over anything clickable */
  function initCursor() {
    if (!fineHover.matches || reduceMotion.matches) return;

    const ring = document.createElement('div');
    ring.className = 'cursor';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let raf = 0;

    const loop = () => {
      x = lerp(x, tx, 0.2);
      y = lerp(y, ty, 0.2);
      ring.style.transform = `translate3d(${f(x)}px, ${f(y)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      tx = event.clientX;
      ty = event.clientY;
      if (!raf) {
        x = tx;
        y = ty;
        ring.classList.add('is-on');
        raf = requestAnimationFrame(loop);
      }
      const hot = event.target.closest && event.target.closest('a, button, input, textarea, .case-study, .service-list li, .audit-pillar');
      ring.classList.toggle('is-hot', Boolean(hot));
    }, { passive: true });

    document.addEventListener('pointerleave', () => ring.classList.remove('is-on'));
    document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    document.addEventListener('pointerup', () => ring.classList.remove('is-down'));
  }

  /* Primary buttons lean toward the pointer */
  function initMagnets() {
    if (!fineHover.matches || reduceMotion.matches) return;
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach((btn) => {
      btn.addEventListener('pointermove', (event) => {
        const rect = btn.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        btn.style.translate = `${f(dx * 14)}px ${f(dy * 10)}px`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });
  }

  /* Ribbon: drifts on its own and surges and leans with scroll speed */
  function initMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track || reduceMotion.matches) return;

    track.style.animation = 'none';
    let pos = 0;
    let lastY = window.scrollY;
    let velocity = 0;
    let skew = 0;
    let raf = 0;
    let onScreen = true;
    let half = track.scrollWidth / 2;

    const loop = () => {
      const y = window.scrollY;
      velocity = lerp(velocity, y - lastY, 0.12);
      lastY = y;
      skew = lerp(skew, clamp(velocity * -0.35, -14, 14), 0.15);
      pos -= 0.7 + Math.abs(velocity) * 0.9;
      if (-pos >= half) pos += half;
      track.style.transform = `translate3d(${f(pos)}px, 0, 0) skewX(${f(skew)}deg)`;
      raf = requestAnimationFrame(loop);
    };

    const start = () => { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    }).observe(track.parentElement);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    window.addEventListener('resize', () => { half = track.scrollWidth / 2; });
    start();
  }

  /* Giant outlined numerals behind each numbered heading */
  function initNumerals() {
    document.querySelectorAll('.sec-head').forEach((head) => {
      const b = head.querySelector('.sec-num b');
      if (b && /^\d+$/.test(b.textContent.trim())) head.dataset.n = b.textContent.trim();
    });
  }

  const field = document.getElementById('heroArt');
  if (field) initField(field);
  initPlatePreview();
  initAuditFigure();
  initScroll();
  initRail();
  initNumerals();
  initMarquee();
  initMagnets();
  initCursor();
})();
