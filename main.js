// ===== Mobile nav =====
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      burger.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
  }

  // ===== FAQ accordion =====
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.closest('.faq-list')?.querySelectorAll('.faq-item.open').forEach(el => { if (el !== item) el.classList.remove('open'); });
      item.classList.toggle('open', !wasOpen);
    });
  });

  // ===== Scroll reveal =====
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ===== Card glow tracking =====
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  // ===== Neural network canvas (ambient background field) =====
  const canvas = document.getElementById('neuralCanvas');
  if (canvas) initNeuralCanvas(canvas);

  // ===== Brain network canvas (hero signature graphic) =====
  const brain = document.getElementById('brainCanvas');
  if (brain) initBrainCanvas(brain);
});

function initNeuralCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, nodes, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(18, Math.min(46, Math.floor((w * h) / 26000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.6
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.3;
          ctx.strokeStyle = `rgba(124,77,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(244,242,251,0.5)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  step();
  window.addEventListener('resize', () => { resize(); if (reduceMotion) step(); });
}

/* Brain silhouette approximated as a union of overlapping ellipses:
   two cerebral hemispheres, a frontal lobe bump, and a small brainstem taper.
   Nodes are seeded only inside this union, then connected to nearby nodes —
   producing a recognizable "brain made of network points" without a fixed
   hand-drawn path, so it reflows cleanly at any canvas size. */
function initBrainCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, nodes, dpr, t = 0;

  function shapeAt(w, h) {
    const cx = w * 0.52, cy = h * 0.46;
    const rx = w * 0.36, ry = h * 0.34;
    return [
      { x: cx - rx * 0.42, y: cy - ry * 0.05, rx: rx * 0.62, ry: ry * 0.78 },
      { x: cx + rx * 0.42, y: cy - ry * 0.05, rx: rx * 0.62, ry: ry * 0.78 },
      { x: cx - rx * 0.05, y: cy - ry * 0.55, rx: rx * 0.55, ry: ry * 0.42 },
      { x: cx, y: cy + ry * 0.85, rx: rx * 0.22, ry: ry * 0.4 }
    ];
  }

  function inside(x, y, ellipses) {
    for (const e of ellipses) {
      const dx = (x - e.x) / e.rx, dy = (y - e.y) / e.ry;
      if (dx * dx + dy * dy <= 1) return true;
    }
    return false;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const ellipses = shapeAt(w, h);
    const target = Math.max(140, Math.min(320, Math.floor((w * h) / 1400)));
    nodes = [];
    let tries = 0;
    while (nodes.length < target && tries < target * 50) {
      tries++;
      const x = Math.random() * w, y = Math.random() * h;
      if (inside(x, y, ellipses)) {
        const yNorm = y / h;
        nodes.push({
          x, y, baseX: x, baseY: y,
          phase: Math.random() * Math.PI * 2,
          r: Math.random() * 1.5 + 0.7,
          glow: Math.random() < 0.1,
          colorMix: Math.min(1, Math.max(0, yNorm * 1.15))
        });
      }
    }
  }

  function mixColor(m) {
    // purple -> magenta -> red, top to bottom
    const c1 = [124, 77, 255], c2 = [228, 34, 48];
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * m);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * m);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * m);
    return `${r},${g},${b}`;
  }

  function step() {
    t += 0.008;
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x = n.baseX + Math.sin(t + n.phase) * 3;
      n.y = n.baseY + Math.cos(t + n.phase) * 3;
    }

    const maxDist = Math.max(34, Math.min(w, h) * 0.075);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.5;
          const col = mixColor((a.colorMix + b.colorMix) / 2);
          ctx.strokeStyle = `rgba(${col},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const col = mixColor(n.colorMix);
      if (n.glow) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${col},.9)`;
        ctx.shadowColor = `rgba(${col},1)`;
        ctx.shadowBlur = 10;
        ctx.arc(n.x, n.y, n.r + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${col},.85)`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  step();
  window.addEventListener('resize', () => { resize(); if (reduceMotion) step(); });
}
