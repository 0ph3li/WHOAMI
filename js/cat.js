/* ═══════════════════════════════════════════════════════════════
   WHOAMI — cat.js
   concept, design & code by ghostly.grl ♥

   the cat. a black muzzle made of characters, drawn fresh every
   frame from a handful of shapes (head, ears, eyes, slit pupils,
   nose, mouth, whiskers). nothing is a picture: it's all text,
   so it can glitch, blink, laugh, sulk and stare.

   new WH.Cat(<pre>, { w, h, mood, zoom, oy, still })
   cat.mood('idle' | 'sleep' | 'smug' | 'laugh' | 'angry' | 'wide' |
            'dead' | 'stare' | 'sad', ms?)  → ms = go back to idle after
   cat.talk(ms)   mouth flaps
   cat.glitch(ms) rows slip
   cat.lookAt(x, y) / cat.follow = true (default: follows the pointer)
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const WH = (window.WH = window.WH || {});
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ASP = 0.6;                    /* mono char width / line height */
  const FUR = '#%@&$8B#%@W';
  const EDGE = ':;*+=~-';
  const all = [];
  let px = innerWidth / 2, py = innerHeight / 2, moved = 0;
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; moved = performance.now(); }, { passive: true });

  const hash = (a, b, c = 0) => {
    let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const ell = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
  const side = (ax, ay, bx, by, x, y) => (bx - ax) * (y - ay) - (by - ay) * (x - ax);
  const tri = (x, y, a, b, c) => {
    const d1 = side(a[0], a[1], b[0], b[1], x, y), d2 = side(b[0], b[1], c[0], c[1], x, y), d3 = side(c[0], c[1], a[0], a[1], x, y);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const shrink = (t, k) => {
    const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3 + 0.06;
    return t.map((p) => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k]);
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  /* each mood = targets the state eases towards */
  const MOODS = {
    idle:  { open: 1, dil: 1, ear: 0, lid: 0, mouth: 0, smile: 0 },
    stare: { open: 1.12, dil: 0.55, ear: 0, lid: 0, mouth: 0, smile: 0, fix: 1 },
    sleep: { open: 0, dil: 1, ear: 0.2, lid: 0, mouth: 0, smile: 0.3 },
    smug:  { open: 0.42, dil: 0.9, ear: 0, lid: 0, mouth: 0, smile: 1 },
    laugh: { open: 0, dil: 1, ear: -0.1, lid: 0, mouth: 0.9, smile: 1, arch: 1, bob: 1 },
    angry: { open: 0.8, dil: 0.35, ear: 1, lid: 1, mouth: 0.55, smile: 0, fang: 1 },
    wide:  { open: 1.25, dil: 2.6, ear: -0.25, lid: 0, mouth: 0.25, smile: 0 },
    sad:   { open: 0.75, dil: 2.1, ear: 0.7, lid: -1, mouth: 0, smile: 0 },
    dead:  { open: 1, dil: 1, ear: 0.6, lid: 0, mouth: 0, smile: 0, x: 1 }
  };

  class Cat {
    constructor(el, o = {}) {
      this.el = el;
      const d = el.dataset.cat ? JSON.parse(el.dataset.cat) : {};
      o = Object.assign({ w: 64, h: 32, mood: 'idle', zoom: 1, oy: 0, ox: 0, still: false }, d, o);
      this.o = o;
      this.W = o.w; this.H = o.h;
      this.s = Object.assign({ lx: 0, ly: 0, talk: 0, gl: 0, bob: 0, arch: 0, fang: 0, x: 0, fix: 0 }, MOODS.idle);
      this.t = Object.assign({}, MOODS[o.mood] || MOODS.idle);
      this.name = o.mood;
      this.follow = true;
      this.blink = 0; this.nextBlink = performance.now() + 1500 + Math.random() * 3000;
      this.twitch = 0;
      this.talkUntil = 0; this.glUntil = 0; this.back = 0;
      this.vis = true; this.last = 0; this.f = 0;
      el.classList.add('cat');
      el.setAttribute('aria-hidden', 'true');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((es) => es.forEach((e) => (this.vis = e.isIntersecting)), { rootMargin: '120px' }).observe(el);
      }
      all.push(this);
      this.draw(performance.now());
    }
    mood(m, ms) {
      if (!MOODS[m]) return this;
      this.name = m;
      this.t = Object.assign({}, MOODS[m]);
      clearTimeout(this.back);
      if (ms) this.back = setTimeout(() => this.mood(this.o.rest || 'idle'), ms);
      if (m === 'angry' || m === 'wide') this.glitch(260);
      return this;
    }
    talk(ms = 1200) { this.talkUntil = performance.now() + ms; return this; }
    glitch(ms = 400) { this.glUntil = performance.now() + ms; return this; }
    lookAt(x, y) { this.follow = false; this.s.tx = x; this.s.ty = y; return this; }

    step(now) {
      const s = this.s, t = this.t, k = 0.16;
      for (const key of ['open', 'dil', 'ear', 'lid', 'mouth', 'smile']) s[key] = lerp(s[key], t[key] || 0, k);
      s.arch = lerp(s.arch, t.arch || 0, 0.3);
      s.bob = lerp(s.bob, t.bob || 0, 0.2);
      s.fang = lerp(s.fang, t.fang || 0, 0.25);
      s.x = t.x || 0;
      s.fix = t.fix || 0;
      /* where to look */
      let tx = 0, ty = 0;
      if (this.follow && !s.fix) {
        const r = this.el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
        tx = Math.max(-1, Math.min(1, (px - cx) / (innerWidth * 0.45)));
        ty = Math.max(-1, Math.min(1, (py - cy) / (innerHeight * 0.45)));
        if (now - moved > 2600) { tx = Math.sin(now / 1900) * 0.35; ty = Math.cos(now / 2600) * 0.2; }
      } else if (!this.follow) { tx = s.tx || 0; ty = s.ty || 0; }
      s.lx = lerp(s.lx, tx, 0.12); s.ly = lerp(s.ly, ty, 0.12);
      /* blink */
      if (now > this.nextBlink && !RM) {
        this.blink = 1;
        this.nextBlink = now + 1800 + Math.random() * 4200;
        if (Math.random() < 0.18) this.nextBlink = now + 260; /* double blink */
      }
      this.blink = Math.max(0, this.blink - 0.16);
      if (Math.random() < 0.004 && !RM) this.twitch = 1;
      this.twitch = Math.max(0, this.twitch - 0.08);
      s.talk = now < this.talkUntil ? Math.abs(Math.sin(now / 70)) * 0.8 : lerp(s.talk, 0, 0.3);
      s.gl = now < this.glUntil ? 1 : 0;
    }

    draw(now) {
      const { W, H, o } = this, s = this.s;
      const S = H / 2, cx = (W * ASP) / 2, cy = H / 2;
      const bl = this.blink > 0 ? Math.sin(this.blink * Math.PI) : 0;
      const open = Math.max(0, s.open * (1 - bl));
      const bob = s.bob ? Math.sin(now / 90) * 0.03 * s.bob : 0;
      const slow = (now / 220) | 0;
      /* ears */
      const eo = s.ear, tw = this.twitch;
      const earL = [[-0.8, -0.1], [-0.6 - eo * 0.32 - tw * 0.05, -1.02 + eo * 0.42 + tw * 0.08], [-0.16 - eo * 0.04, -0.44 + eo * 0.08]];
      const earR = earL.map((p) => [-p[0], p[1]]);
      const inL = shrink(earL, 0.42), inR = shrink(earR, 0.42);
      const rows = [];
      for (let j = 0; j < H; j++) {
        let line = '', cur = '', buf = '';
        const shift = s.gl && hash(j, slow) < 0.35 ? ((hash(j, slow, 7) * 10) | 0) - 5 : 0;
        for (let i0 = 0; i0 < W; i0++) {
          const i = i0 + shift;
          const x = (((i + 0.5) * ASP - cx) / S) / o.zoom + o.ox;
          const y = (((j + 0.5) - cy) / S) / o.zoom + o.oy - bob;
          let ch = ' ', cl = '';
          const head = Math.min(ell(x, y, 0, 0.16, 0.8, 0.68), ell(x, y, 0, 0.4, 0.92, 0.42));
          const inEar = tri(x, y, earL[0], earL[1], earL[2]) || tri(x, y, earR[0], earR[1], earR[2]);
          const fur = head < 1 || inEar;
          if (fur) {
            const r = hash(i, j, (slow / 3) | 0);
            ch = head > 0.9 && !inEar ? EDGE[(r * EDGE.length) | 0] : FUR[(r * FUR.length) | 0];
            cl = 'f';
            if (tri(x, y, inL[0], inL[1], inL[2]) || tri(x, y, inR[0], inR[1], inR[2])) { ch = hash(i, j) < 0.5 ? '/' : ':'; cl = 'e'; }
            /* eyes */
            for (const sd of [-1, 1]) {
              const ex = sd * 0.36, ey = 0.1, dx = x - ex, dy = y - ey;
              if (s.x) {
                if (Math.abs(dx) < 0.16 && Math.abs(dy) < 0.15 && (Math.abs(dx - dy) < 0.05 || Math.abs(dx + dy) < 0.05)) { ch = 'X'; cl = 'i'; }
                continue;
              }
              if (s.arch > 0.5) {
                const yc = ey + 0.02 - 0.11 * (1 - (dx / 0.2) ** 2);
                if (Math.abs(dx) < 0.2 && Math.abs(y - yc) < 0.045) { ch = Math.abs(dx) < 0.05 ? '^' : dx < 0 ? '/' : '\\'; cl = 'i'; }
                continue;
              }
              const ry = 0.17 * open;
              if (ry < 0.03) {
                /* closed: a lid line, curved down when asleep */
                const yc = ey + 0.03 * (1 - (dx / 0.2) ** 2) * (s.smile > 0.2 ? 1 : 0);
                if (Math.abs(dx) < 0.2 && Math.abs(y - yc) < 0.035) { ch = '-'; cl = 'i'; }
                continue;
              }
              if (ell(x, y, ex, ey, 0.21, ry) < 1) {
                /* lids: angry slants down to the nose, sad slants up, smug is flat */
                const lidY = ey - ry + (s.smile > 0.5 ? ry * 0.6 : 0) + (s.lid > 0 ? (0.08 - dx * sd * 0.5) * s.lid : 0) + (s.lid < 0 ? (0.04 + dx * sd * 0.4) * -s.lid : 0);
                if (y < lidY) continue;
                ch = hash(i, j) < 0.5 ? 'o' : 'O'; cl = 'i';
                const lx = ex + s.lx * 0.075, ly = ey + s.ly * 0.05;
                const pr = Math.min(0.14, 0.04 * s.dil);
                if (ell(x, y, lx, ly, pr, Math.max(0.04, ry * 0.9)) < 1) { ch = '@'; cl = 'p'; }
                if (ell(x, y, lx + 0.05, ly - 0.05, 0.035, 0.04) < 1 && ry > 0.08) { ch = '*'; cl = 'h'; }
              }
            }
            /* nose */
            if (tri(x, y, [-0.07, 0.33], [0.07, 0.33], [0, 0.4])) { ch = 'v'; cl = 'n'; }
            /* mouth */
            const m = Math.max(s.mouth, s.talk);
            if (m > 0.08) {
              const rx = 0.07 + 0.07 * s.smile, ry = 0.02 + 0.1 * m;
              if (ell(x, y, 0, 0.47 + ry * 0.6, rx, ry) < 1) { ch = '#'; cl = 'm'; }
              if (s.fang > 0.3 && (tri(x, y, [-0.07, 0.46], [-0.03, 0.46], [-0.05, 0.56]) || tri(x, y, [0.03, 0.46], [0.07, 0.46], [0.05, 0.56]))) { ch = 'V'; cl = 'h'; }
            } else {
              const dx = Math.abs(x);
              if (dx < 0.15) {
                const yc = 0.43 + 0.045 * Math.sin((dx / 0.15) * Math.PI) - s.smile * 0.03 * (dx / 0.15) ** 2;
                if (Math.abs(y - yc) < 0.03) { ch = dx < 0.02 ? '|' : 'w'; cl = 'n'; }
              }
            }
          } else {
            /* whiskers: three on each side, drawn on the background */
            const ax = Math.abs(x);
            if (ax > 0.62 && ax < 1.4) {
              for (let k = 0; k < 3; k++) {
                const t = (ax - 0.62) / 0.78;
                const yc = 0.36 + k * 0.08 + (k - 1) * 0.16 * t + s.talk * 0.03 * Math.sin(now / 80 + k);
                if (Math.abs(y - yc) < 0.028) {
                  const up = k === 0, down = k === 2;
                  ch = t < 0.25 || (!up && !down) ? '-' : (up === x > 0) ? '/' : '\\';
                  cl = 'k';
                }
              }
            }
          }
          if (cl !== cur) {
            if (buf) line += cur ? `<b class="c${cur}">${buf}</b>` : buf;
            buf = ''; cur = cl;
          }
          buf += ch;
        }
        if (buf) line += cur ? `<b class="c${cur}">${buf}</b>` : buf;
        rows.push(line);
      }
      this.el.innerHTML = rows.join('\n');
    }
  }

  const loop = (now) => {
    for (const c of all) {
      if (!c.vis || !c.el.isConnected) continue;
      if (now - c.last < 40) continue;   /* ~25fps is plenty for a cat */
      c.last = now;
      c.step(now);
      c.draw(now);
    }
    if (!RM) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  WH.Cat = Cat;
  WH.cats = all;
})();
