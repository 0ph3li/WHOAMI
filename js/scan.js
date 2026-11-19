/* ═══════════════════════════════════════════════════════════════
   WHOAMI — scan.js · the full scan
   concept, design & code by ghostly.grl ♥

   01 full    the quick scan found you. this one finds the rest
   02 layers  five layers deep (pinned): surface, habits, body,
              mood, core. live numbers. at the core: the cat
   03 quarantine  drag what's infected into the box. the cat
              won't go in. when it's full, everything comes out
   04 threat  your threat level is how much you move. stay still
   05 report  a receipt prints itself. you can really print it
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, D, FINE } = WH;
  const G = !!window.gsap && !RM;
  const wait = WH.wait;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cats = {};
  $$('main [data-cat]').forEach((el) => (cats[el.className.split('__')[0]] = new WH.Cat(el)));
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mmss = (s) => WH.pad(Math.floor(s / 60)) + ':' + WH.pad(s % 60);

  /* how much of the time your cursor sits on the right half of the screen */
  let rightT = 0, allT = 0;
  addEventListener('pointermove', (e) => { allT++; if (e.clientX > innerWidth / 2) rightT++; }, { passive: true });
  const hand = () => (allT < 40 ? null : Math.round((rightT / allT) * 100));

  /* ═══════════════ how much of you has been read ═══════════════ */
  let done = false;
  const readAll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = clamp(scrollY / Math.max(1, max)) * 100;
    if (p >= 99.9 && !done && WH.isReady) { done = true; WH.buddy.say('100%. you’re fully read now, {first}. like a cheap book.', 'smug', 2800); }
  };
  addEventListener('scroll', readAll, { passive: true });
  readAll();

  /* ═══════════════ 01 · full scan ═══════════════ */
  addEventListener('wh:ready', () => {
    if (G) {
      gsap.from('.sh__l > span', { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.12 });
      gsap.from('.sh__bar > span', { opacity: 0, y: -8, duration: 0.5, stagger: 0.06, delay: 0.2 });
      gsap.from('.sh__low > *', { opacity: 0, y: 30, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.4 });
      gsap.to('.sh__down', { y: 6, repeat: -1, yoyo: true, duration: 0.6, ease: 'sine.inOut', delay: 1.4 });
    }
    WH.tear(300);
    setTimeout(() => WH.buddy.say(D.known ? 'full scan, {first}. scrolling means yes. i don’t make the rules. i do, actually.' : 'full scan. scrolling means yes. i don’t make the rules. i do, actually.', 'smug', 3400), 1200);
    later();
  });

  function later() {
    if (!window.ScrollTrigger) return;
    layers();
    quarantine();
    threat();
    report();
    ScrollTrigger.refresh();
  }

  /* ═══════════════ 02 · layers ═══════════════ */
  function layers() {
    const cat = cats.ly, read = $('.ly__read'), boxes = $$('.ly__box');
    const names = ['surface', 'habits', 'body', 'mood', 'core'];
    const insets = [0, 0.1, 0.2, 0.3, 0.39];
    const live = {};
    const L = [
      () => `<b>surface.</b> ${esc(D.device)}, ${esc(D.os)}, ${esc(D.browser)}, ${D.w}×${D.h} at ${D.dpr}x, ${esc(D.gpuLine)}. <em>nothing personal. yet.</em>`,
      () => `<b>habits.</b> on this site you moved your mouse <span class="is-live" data-k="px"></span>, clicked <span class="is-live" data-k="clicks"></span>, scrolled <span class="is-live" data-k="scroll"></span> and left me <span class="is-live" data-k="tabs"></span>.`,
      () => `<b>body.</b> it’s ${D.time()}${D.hour() < 5 ? ', your eyes are tired' : ''}. your cursor sits on the right half <span class="is-live" data-k="hand"></span> of the time.${D.battery != null ? ` battery ${D.battery}%, ${D.charging ? 'plugged in, like you.' : 'draining, like you.'}` : ''}`,
      () => `<b>mood.</b> your hand moves at <span class="is-live" data-k="speed"></span>. that’s <em class="is-live" data-k="mood"></em>.`,
      () => `<b>core.</b> at the very bottom of ${esc(D.known ? D.first : 'you')} there is… <em>a cat.</em>`
    ];
    read.innerHTML = L.map((f, i) => `<li data-l="0${i + 1}">${f()}</li>`).join('');
    const lis = $$('li', read);
    $$('.is-live', read).forEach((s) => (live[s.dataset.k] = s));
    let avg = 0;
    const tick = () => {
      avg += (WH.speed - avg) * 0.05;
      if (live.px) live.px.textContent = WH.meters(WH.s.px) + ' m';
      if (live.clicks) live.clicks.textContent = WH.s.clicks + (WH.s.clicks === 1 ? ' time' : ' times');
      if (live.scroll) live.scroll.textContent = WH.meters(WH.s.scroll) + ' m';
      if (live.tabs) live.tabs.textContent = WH.s.tabs === 0 ? 'zero times (good)' : WH.s.tabs + (WH.s.tabs === 1 ? ' time' : ' times');
      if (live.hand) { const h = hand(); live.hand.textContent = h == null ? '…' : h + '%'; }
      if (live.speed) live.speed.textContent = '~' + Math.max(0, Math.round(avg)) + ' px/s';
      if (live.mood) live.mood.textContent = !FINE ? 'unknown. your thumb hides it.' : avg < 40 ? 'suspiciously calm' : avg < 300 ? 'nervous' : avg < 900 ? 'in a hurry' : 'guilty';
    };
    let on = false;
    const loop = () => { if (on) { tick(); setTimeout(loop, 250); } };
    const said = [];
    const SAY = [
      'surface first. you have nice pixels.',
      'you click a lot for someone who says they just browse.',
      () => (hand() != null ? (hand() > 50 ? 'right-handed. or the nervous kind.' : 'left-handed? interesting. noted.') : 'i can feel your hands from here.'),
      'don’t worry. nervous is my favourite flavour.',
      null
    ];
    let cur = -1;
    ScrollTrigger.create({
      trigger: '.ly', start: 'top top', end: '+=420%', pin: '.ly__pin', scrub: true,
      onToggle: (s) => { on = s.isActive; on && loop(); WH.buddy.hide(s.isActive); },
      onUpdate(self) {
        const n = self.progress * 5.6;
        const k = Math.min(4, Math.floor(n));
        /* zoom: the current layer fills the stage */
        const a = insets[k], b = insets[Math.min(4, k + 1)], f = clamp(n - k);
        const ins = a + (b - a) * (k < 4 ? f : 0);
        if (G) gsap.set('.ly__zoom', { scale: 1 / (1 - 2 * ins) });
        boxes.forEach((bx, i) => { bx.classList.toggle('is-on', i === k); bx.classList.toggle('is-in', i < k); });
        lis.forEach((li, i) => li.classList.toggle('is-on', i <= k && n > 0.08));
        $('.ly__d').textContent = n < 0.08 ? 0 : k + 1;
        $('.ly__name').textContent = names[k];
        if (k !== cur) {
          cur = k;
          tick();
          if (k === 4) {
            cat.mood('wide').glitch(500);
            $('.ly__cat').classList.add('is-found');
            if (!said[4]) { said[4] = 1; WH.note('core'); WH.flash(); WH.type($('.ly__say'), 'hi.', { cat }); setTimeout(() => cat.mood('smug'), 900); WH.pop(D.known ? 'found the core, {first}. it’s me. i moved in.' : 'found the core. it’s me. i moved in.', { mood: 'smug', ms: 1800, flash: false }); }
          } else {
            $('.ly__cat').classList.remove('is-found');
            cat.mood('sleep');
          }
        }
        if (n > 0.08 && !said[k] && k < 4) { said[k] = 1; const s = SAY[k]; s && WH.type($('.ly__say'), WH.t(typeof s === 'function' ? s() : s), { cat, speed: 26 }); }
      }
    });
  }

  /* ═══════════════ 03 · quarantine ═══════════════ */
  function quarantine() {
    const list = $('.qt__items'), vault = $('.qt__vault'), box = $('.qt__in'), count = $('.qt__count');
    const late = D.hour() < 5 || D.hour() >= 23;
    const ITEMS = [
      { t: D.known ? D.full : 'your name', s: 'identity', l: 'quarantining your own name. very healthy.' },
      { t: '“' + D.computer + '”', s: 'device', l: '“{computer}” is in quarantine. you’re still using it though.' },
      { t: D.browser, s: 'browser · tabs: too many', l: '{browser} quarantined. you’re reading this on it.' },
      { t: D.city, s: 'location', l: '{city} is quarantined. please don’t leave the house.' },
      { t: late ? 'being awake at ' + D.time() : 'checking your phone at ' + D.time(), s: 'habit', l: 'habit quarantined. see you same time tomorrow.' },
      D.battery != null ? { t: D.battery + '% battery', s: 'power', l: 'battery quarantined. it will die alone.' } : { t: D.w + '×' + D.h + ' screen', s: 'display', l: 'screen quarantined. you can still see me. weird.' },
      { t: 'your search history', s: 'history · 4,812 entries', l: 'your history is safe with me. in here. with me.' },
      { t: 'the cat', s: 'pid 9 · do not', cat: 1 }
    ];
    list.innerHTML = ITEMS.map((it, i) => `<li class="qi${it.cat ? ' is-cat' : ''}" data-i="${i}" data-cursor="${it.cat ? 'try it' : 'drag me'}"><span>${esc(it.t)}<small>${esc(it.s)}</small></span></li>`).join('');
    const els = $$('.qi', list);
    const need = ITEMS.filter((i) => !i.cat).length;
    let inside = 0, catTries = 0, busy = false;
    const setCount = () => { count.textContent = inside + (inside === 1 ? ' item' : ' items'); vault.classList.toggle('has-some', inside > 0); };
    const over = (x, y) => { const r = vault.getBoundingClientRect(); return x > r.left && x < r.right && y > r.top && y < r.bottom; };
    const home = (el) => G ? gsap.to(el, { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'elastic.out(1, .5)' }) : (el.style.transform = '');

    const drop = async (el) => {
      const it = ITEMS[+el.dataset.i];
      vault.classList.remove('is-over');
      if (it.cat) {
        catTries++;
        WH.note('cat-try');
        if (G) gsap.fromTo(vault, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, .3)' });
        WH.flash();
        home(el);
        if (catTries === 3) WH.pop('keep trying, {first}. i love this game.', { mood: 'laugh', ms: 1500 });
        else WH.buddy.say(catTries === 1 ? 'you can’t quarantine the quarantine, {first}.' : 'no.', 'angry', 2000);
        return;
      }
      el.classList.add('is-gone');
      const p = document.createElement('p');
      p.textContent = it.t;
      box.appendChild(p);
      G && gsap.from(p, { y: -30, opacity: 0, duration: 0.5, ease: 'back.out(2)' });
      inside++;
      setCount();
      WH.buddy.say(it.l, 'smug', 2200);
      if (inside === need) {
        busy = true;
        vault.classList.add('is-full');
        count.textContent = 'full';
        WH.note('quarantine');
        await wait(1400);
        WH.tear(600);
        $$('p', box).forEach((q) => q.classList.add('is-out'));
        box.innerHTML = '';
        inside = 0;
        setCount();
        vault.classList.remove('is-full');
        els.forEach((e) => {
          if (e.classList.contains('is-gone')) {
            e.classList.remove('is-gone');
            G && gsap.fromTo(e, { x: () => (Math.random() - 0.5) * 600, y: () => -200 - Math.random() * 300, rotation: () => (Math.random() - 0.5) * 60 }, { x: 0, y: 0, rotation: 0, duration: 1.1, ease: 'expo.out' });
          }
        });
        await WH.pop('quarantine full. releasing everything. everything is infected, {first}. that’s just what being a person is.', { mood: 'laugh', ms: 2200 });
        busy = false;
      }
    };

    els.forEach((el) => {
      let sx = 0, sy = 0, moved = false, id = null;
      el.addEventListener('pointerdown', (e) => {
        if (busy) return;
        id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
        el.setPointerCapture(id);
        el.classList.add('is-drag');
        G && gsap.killTweensOf(el);
      });
      el.addEventListener('pointermove', (e) => {
        if (e.pointerId !== id) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.hypot(dx, dy) > 6) moved = true;
        if (G) gsap.set(el, { x: dx, y: dy, rotation: clamp(dx / 30, -8, 8) });
        else el.style.transform = `translate(${dx}px, ${dy}px)`;
        vault.classList.toggle('is-over', over(e.clientX, e.clientY));
      });
      const up = async (e) => {
        if (e.pointerId !== id) return;
        id = null;
        el.classList.remove('is-drag');
        if (!moved) {
          /* a tap: it flies in by itself */
          const a = el.getBoundingClientRect(), b = vault.getBoundingClientRect();
          if (G) await gsap.to(el, { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), rotation: 8, duration: 0.45, ease: 'power3.in' });
          return drop(el);
        }
        if (over(e.clientX, e.clientY)) drop(el); else { vault.classList.remove('is-over'); home(el); }
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
    ScrollTrigger.create({ trigger: '.qt', start: 'top 55%', once: true, onEnter: () => WH.buddy.say('everything on the left is infected. including the thing on the end. don’t touch the thing on the end.', 'stare', 3000) });
    if (G) gsap.from(els, { y: 30, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.qt__grid', start: 'top 80%' } });
  }

  /* ═══════════════ 04 · threat level ═══════════════ */
  function threat() {
    const sec = $('.tl'), num = $('.tl__n'), say = $('.tl__say'), cat = cats.tl;
    const cv = $('.tl__graph'), x = cv.getContext('2d');
    const hist = new Array(160).fill(0);
    let on = false, lvl = 0, still = 0, band = -1, lastShake = 0;
    const size = () => { cv.width = cv.clientWidth * Math.min(2, devicePixelRatio); cv.height = cv.clientHeight * Math.min(2, devicePixelRatio); };
    size();
    addEventListener('resize', size);
    const BANDS = [
      { m: 'sleep', s: () => 'good. now you’re furniture.' },
      { m: 'idle', s: () => 'normal. for a human.' },
      { m: 'stare', s: () => 'nervous, {first}?' },
      { m: 'smug', s: () => 'that’s a guilty hand.' },
      { m: 'angry', s: () => 'calm down, {first}. i can hear you breathing.' }
    ];
    const loop = () => {
      if (!on) return;
      const lv = WH.lenis ? Math.abs(WH.lenis.velocity || 0) * 30 : 0;
      const target = clamp((WH.speed + lv) / 16, 0, 99);
      lvl += (target - lvl) * 0.08;
      const v = Math.round(lvl);
      num.textContent = WH.pad(v);
      still = v < 2 ? still + 1 : 0;
      const b = still > 150 ? 0 : v < 25 ? 1 : v < 50 ? 2 : v < 75 ? 3 : 4;
      if (b !== band) {
        band = b;
        cat.mood(BANDS[b].m);
        WH.type(say, WH.t(BANDS[b].s()), { cat, speed: 22 });
        sec.classList.toggle('is-zero', b === 0);
        if (b === 0) WH.note('still');
        sec.classList.toggle('is-high', b === 4);
      }
      if (b === 4 && performance.now() - lastShake > 3500) { lastShake = performance.now(); WH.shake(8, 0.25); }
      /* the seismograph */
      hist.push(lvl); hist.shift();
      const w = cv.width, h = cv.height;
      x.clearRect(0, 0, w, h);
      const col = getComputedStyle(sec).color;
      x.strokeStyle = col; x.lineWidth = Math.max(1.5, w / 600);
      x.beginPath();
      hist.forEach((q, i) => {
        const px = (i / (hist.length - 1)) * w;
        const py = h - 6 - (q / 99) * (h - 12) + (Math.random() - 0.5) * (2 + q / 12);
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      });
      x.stroke();
      x.fillStyle = col;
      for (let i = 0; i < w; i += w / 40) x.fillRect(i, h - 1, 1, -4);
      requestAnimationFrame(loop);
    };
    ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => { on = s.isActive; if (on) requestAnimationFrame(loop); } });
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', once: true, onEnter: () => WH.buddy.say(FINE ? 'stop moving your mouse. go on. try.' : 'stop scrolling. go on. try.', 'stare', 2600) });
  }

  /* ═══════════════ 05 · the report ═══════════════ */
  function report() {
    const pre = $('.rp__receipt');
    let printed = false, printing = false;
    const W = 32;
    const row = (a, b) => a + ' '.repeat(Math.max(1, W - a.length - String(b).length)) + b;
    const line = '-'.repeat(W);
    const center = (s) => ' '.repeat(Math.max(0, Math.floor((W - s.length) / 2))) + s;
    const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
    const barcode = (s) => {
      let h = 9;
      for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const stops = [];
      let p = 0;
      for (let i = 0; p < 100; i++) {
        const w = 0.6 + ((h >> (i % 28)) & 3) * 0.7;
        stops.push(`${i % 2 ? 'transparent' : '#0d0d0d'} ${p.toFixed(1)}% ${(p + w).toFixed(1)}%`);
        p += w;
      }
      return `<span class="bc" style="background:linear-gradient(90deg,${stops.join(',')})"></span>`;
    };
    const build = () => {
      const d = new Date();
      const q = $$('.qt__in p').length;
      return [
        center('WHOAMI® DEEP SCAN'),
        center('personal threat detection'),
        line,
        row('report no.', '0309-' + WH.pad(D.visits, 3) + '-' + WH.pad(D.secs() % 1000, 3)),
        row('date', d.toLocaleDateString('en-GB')),
        row('time', D.time() + ' · ' + cut(D.city, 14)),
        line,
        row('TARGET', cut(D.known ? D.full : 'unknown', 22)),
        row('device', cut(D.computer, 24)),
        row('system', cut(D.os + ' · ' + D.browser, 24)),
        row('chip', cut(D.gpu || '?', 24)),
        line,
        'on this page you',
        row(' moved the mouse', WH.meters(WH.s.px) + ' m'),
        row(' clicked', WH.s.clicks + ' ×'),
        row(' scrolled', WH.meters(WH.s.scroll) + ' m'),
        row(' left the tab', WH.s.tabs + ' ×'),
        row(' stayed', mmss(WH.s.secs)),
        line,
        row('items in quarantine', q + '/7'),
        row('items escaped', '1 (cat)'),
        line,
        row('THREATS FOUND', '1'),
        '§HOT§',
        row('recommended action', 'none.'),
        row('', 'it’s too late.'),
        line,
        '§BC§',
        center('thank you for being scanned.'),
        center('no refunds. no exit.'),
        '',
        '      /\\_/\\',
        '     ( o.o )   ← scanned by',
        '      > ^ <      cat.exe'
      ];
    };
    const print = async () => {
      if (printing) return;
      printing = true;
      const L = build();
      pre.innerHTML = '';
      for (const l of L) {
        if (l === '§BC§') pre.innerHTML += barcode((D.full || '') + D.computer);
        else if (l === '§HOT§') pre.innerHTML += ' └ <span class="hot">' + esc(cut(D.known ? D.full : 'you', 26)) + '</span>\n';
        else pre.innerHTML += (l.startsWith('THREATS') ? '<b>' + esc(l) + '</b>' : esc(l)) + '\n';
        if (!RM) await wait(l === line ? 40 : 70);
      }
      printing = false;
      printed = true;
    };
    ScrollTrigger.create({ trigger: '.rp', start: 'top 65%', onEnter: () => { if (!printed) { print(); WH.buddy.say('printing your results. on real paper. well. fake real paper.', 'smug', 2600); } } });
    if (G) gsap.from('.rp__t span', { yPercent: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.rp', start: 'top 70%' } });

    $('.rp__print').addEventListener('click', async () => {
      WH.note('print');
      if (!printed) await print();
      WH.buddy.say('framing it? i’m flattered.', 'laugh', 2000);
      setTimeout(() => window.print(), 500);
    });
    $('.rp__again').addEventListener('click', async () => {
      WH.tear(600);
      printed = false;
      done = false;
      WH.to(0, { duration: 2.2 });
      await wait(2300);
      WH.pop(D.known ? 'again? you like being looked at, {first}.' : 'again? you like being looked at.', { mood: 'laugh', ms: 1800 });
    });
  }
})();
