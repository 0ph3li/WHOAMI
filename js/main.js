/* ═══════════════════════════════════════════════════════════════
   WHOAMI — main.js (shared)
   concept, design & code by ghostly.grl ♥

   window.WH  ·  localStorage prefix "wh-"
   - WH.D        everything the site could read about you
   - WH.who      promise → WH.D, once the slow bits are in
   - WH.buddy    the little cat.exe in the corner
   - WH.pop()    the big cat jumps in, says something, leaves
   - WH.dialog() a system box that isn't really the system
   - WH.panic()  your computer "crashes" (it doesn't)
   - WH.rot() / WH.heal()  text that goes bad and comes back
   - WH.lock() / WH.unlock()  you lose the scroll for a while
   - boot loader ($ whoami), crosshair cursor + ghost cursor,
     magnetic, scramble, nav doors, tab title, konami (sudo)
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const WH = (window.WH = window.WH || {});
  const RM = (WH.RM = matchMedia('(prefers-reduced-motion: reduce)').matches);
  const FINE = (WH.FINE = matchMedia('(hover: hover) and (pointer: fine)').matches);
  const $ = (WH.$ = (s, r = document) => r.querySelector(s));
  const $$ = (WH.$$ = (s, r = document) => [...r.querySelectorAll(s)]);
  const hasG = () => !!window.gsap;
  const wait = (WH.wait = (ms) => new Promise((r) => setTimeout(r, ms)));
  const root = document.documentElement;

  WH.get = (k, d) => { try { const v = localStorage.getItem('wh-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  WH.set = (k, v) => { if (WH.forgot) return; try { localStorage.setItem('wh-' + k, JSON.stringify(v)); } catch (e) {} };
  WH.pad = (n, l = 2) => String(n).padStart(l, '0');
  WH.pick = (a) => a[(Math.random() * a.length) | 0];

  /* ═══════════════ what the site can read ═══════════════ */
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? 'ios' : /iPad/.test(ua) ? 'ipados' : /Android/.test(ua) ? 'android' : /Mac/.test(ua) ? 'macos' : /Win/.test(ua) ? 'windows' : /Linux/.test(ua) ? 'linux' : 'something';
  const device = { ios: 'an iphone', ipados: 'an ipad', android: 'an android phone', macos: 'a mac', windows: 'a windows pc', linux: 'a linux box', something: 'a machine' }[os];
  const browser = /Edg\//.test(ua) ? 'edge' : /OPR\//.test(ua) ? 'opera' : /Firefox\//.test(ua) ? 'firefox' : /Chrome\//.test(ua) ? 'chrome' : /Safari\//.test(ua) ? 'safari' : 'a browser';
  const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();
  const gpu = (() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return '';
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      const m = String(r).match(/(Apple M\d[\w ]*|Apple GPU|NVIDIA [\w ]+|GeForce [\w ]+|Radeon [\w ]+|AMD [\w ]+|Intel[\w() ]+|Mali-[\w]+|Adreno[\w ]+)/i);
      return (m ? m[1] : String(r)).replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 40);
    } catch (e) { return ''; }
  })();
  const visits = WH.get('visits', 0) + 1;
  WH.set('visits', visits);
  const first = WH.get('first', null) || Date.now();
  WH.set('first', first);

  const D = (WH.D = {
    full: '', first: 'you', user: '', computer: '', host: 'localhost', known: false,
    os, device, browser, gpu,
    cores: navigator.hardwareConcurrency || 0,
    mem: navigator.deviceMemory || 0,
    w: screen.width, h: screen.height, dpr: devicePixelRatio || 1,
    tz, city: (tz.split('/').pop() || 'somewhere').replace(/_/g, ' ').toLowerCase(),
    lang: (navigator.language || 'en').toLowerCase(),
    dark: matchMedia('(prefers-color-scheme: dark)').matches,
    touch: navigator.maxTouchPoints > 0,
    battery: null, charging: null,
    visits, since: first, t0: Date.now()
  });
  D.ago = () => {
    const m = Math.round((Date.now() - D.since) / 60000);
    return m < 2 ? 'a minute ago' : m < 60 ? m + ' minutes ago' : m < 1440 ? Math.round(m / 60) + ' hours ago' : Math.round(m / 1440) + ' days ago';
  };
  D.time = () => { const d = new Date(); return WH.pad(d.getHours()) + ':' + WH.pad(d.getMinutes()); };
  D.secs = () => Math.round((Date.now() - D.t0) / 1000);
  D.hour = () => new Date().getHours();

  const timeout = (p, ms) => Promise.race([p, wait(ms).then(() => null)]);
  const slow = [];
  if (navigator.getBattery) slow.push(timeout(navigator.getBattery().then((b) => { D.battery = Math.round(b.level * 100); D.charging = b.charging; }), 700).catch(() => {}));
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    slow.push(timeout(navigator.userAgentData.getHighEntropyValues(['model', 'platformVersion']).then((h) => { if (h.model) D.device = h.model; D.osv = h.platformVersion; }), 700).catch(() => {}));
  }
  /* the secret door: only exists when serve.py runs on this very machine */
  /* opened by double-click (file://)? the path gives the account away:
     /Users/martinasacchetto/Desktop/... → martina sacchetto */
  const NAMES = 'alessandra alessandro alessia alice andrea angela anna antonio arianna aurora beatrice benedetta bianca camilla carla carlo carlotta caterina cecilia chiara claudia cristina daniela daniele davide diego elena eleonora elisa elisabetta emanuele emma enrico erica federica federico filippo francesca francesco gabriele gaia giacomo gianluca giada ginevra giorgia giorgio giovanna giovanni giulia giulio giuseppe greta ilaria irene laura lorenzo luca lucia ludovica luigi marco margherita maria marta martina massimo matilde matteo mattia michela michele mirko monica nicola nicole noemi paola paolo pietro rachele rebecca riccardo roberta roberto rosa sara serena silvia simona simone sofia stefano tommaso valentina valerio vanessa veronica viola vittoria aaron adam alex alexander alice amanda amber amy ana andrew anna ashley ben benjamin beth brian charlie charlotte chloe chris christopher claire daniel david elizabeth ella emily emma eric ethan grace hannah harry isabella jack jacob james jane jason jennifer jessica john jordan joseph josh joshua julia kate katie kevin laura liam lily lucy luke mark mary matthew megan mia michael molly natalie nathan nick oliver olivia paul rachel rebecca ryan sam samuel sarah sophie thomas tom victoria william zoe lea léa lucas hugo louis jules chloé camille manon pablo lucia javier carmen sofia maria jose juan pedro laura marie anne paul lena lukas leon jonas max felix'.split(' ');
  const guess = (acct) => {
    const a = String(acct || '').toLowerCase();
    const parts = a.split(/[._\-\s]+/).filter(Boolean);
    if (parts.length > 1) return { first: parts[0], full: parts.join(' ') };
    const hit = NAMES.filter((n) => a.startsWith(n)).sort((x, y) => y.length - x.length)[0];
    if (hit) { const rest = a.slice(hit.length); return { first: hit, full: rest.length > 1 ? hit + ' ' + rest : hit }; }
    return { first: a, full: a };
  };
  WH.guess = guess;
  WH.fromPath = (path) => { const m = decodeURIComponent(path).match(/^\/(?:Users|home)\/([^/]+)\/|^\/[A-Za-z]:\/Users\/([^/]+)\//i); return m && (m[1] || m[2]); };
  if (location.protocol === 'file:') {
    const m = decodeURIComponent(location.pathname).match(/^\/(?:Users|home)\/([^/]+)\/|^\/[A-Za-z]:\/Users\/([^/]+)\//i);
    const acct = m && (m[1] || m[2]);
    if (acct && !/^(shared|public|guest|root)$/i.test(acct)) {
      const g = guess(acct);
      D.user = acct;
      D.full = g.full;
      D.first = g.first;
      D.known = true;
      D.fromPath = true;
    }
  }
  const fromDoor = (j) => {
    if (!j || !(j.full || j.user)) return;
    D.user = j.user || '';
    D.computer = j.computer || '';
    D.full = (j.full || '').toLowerCase() || guess(D.user).full;
    D.first = (D.full.split(' ')[0] || D.user).toLowerCase();
    D.known = !!D.full;
  };
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
    /* what the door said last time, so the name is there from the first frame */
    fromDoor(WH.get('door', null));
    slow.push(timeout(fetch('/whoami', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j) return;
      WH.set('door', j);
      fromDoor(j);
    }), 2500).catch(() => {}));
  }

  /* a stranger's machine has no door, so the cat just asks. people always answer. */
  WH.name = (n) => {
    n = String(n || '').trim().toLowerCase().replace(/[<>&"]/g, '').slice(0, 40);
    if (!n) return false;
    D.full = n;
    D.first = n.split(/\s+/)[0];
    D.known = true;
    D.told = true;
    WH.set('name', n);
    WH.fill();
    return true;
  };
  WH.who = Promise.all(slow).then(() => {
    if (!D.known && WH.get('name', '') && WH.name(WH.get('name', ''))) { D.told = false; D.kept = true; }
    if (!D.computer) D.computer = D.device;
    if (!D.user) D.user = 'guest';
    if (!D.full) D.full = 'name withheld (for now)';
    D.host = D.computer.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
    D.prompt = D.user + '@' + D.host + ' ~ %';
    D.gpuLine = D.gpu || 'a graphics chip that won’t say its name';
    WH.fill();
    return D;
  });

  /* fill [data-who="key"] with what we know */
  WH.val = (k) => {
    const v = typeof D[k] === 'function' ? D[k]() : D[k];
    return v == null || v === '' ? '—' : String(v);
  };
  WH.fill = (r = document) => $$('[data-who]', r).forEach((el) => {
    const k = el.dataset.who;
    el.textContent = k === 'First' ? WH.val('first').replace(/^./, (c) => c.toUpperCase()) : WH.val(k);
  });
  WH.t = (s) => s.replace(/\{(\w+)\}/g, (m, k) => WH.val(k));

  /* ═══════════════ lenis + scrolltrigger ═══════════════ */
  let lenis = null;
  if (window.Lenis && !RM) {
    lenis = WH.lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasG()) {
      lenis.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  if (hasG() && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  WH.to = (target, o = {}) => {
    if (lenis) return lenis.scrollTo(target, Object.assign({ duration: 1.4 }, o));
    if (typeof target === 'number') return scrollTo({ top: target, behavior: RM ? 'auto' : 'smooth' });
    const el = typeof target === 'string' ? $(target) : target;
    el && el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const h = a.getAttribute('href'); if (h.length > 1 && $(h)) { e.preventDefault(); WH.to(h); } }));

  /* you lose the scroll for a while */
  let locks = 0;
  const stopKeys = (e) => { if (locks && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key) && !e.target.closest('input, textarea')) e.preventDefault(); };
  const stopWheel = (e) => { if (locks) e.preventDefault(); };
  addEventListener('keydown', stopKeys);
  addEventListener('wheel', stopWheel, { passive: false });
  addEventListener('touchmove', stopWheel, { passive: false });
  WH.lock = () => { locks++; root.classList.add('is-locked'); lenis && lenis.stop(); };
  WH.unlock = () => { locks = Math.max(0, locks - 1); if (!locks) { root.classList.remove('is-locked'); lenis && lenis.start(); } };

  /* ═══════════════ xerox grain ═══════════════ */
  (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 220;
    const x = c.getContext('2d');
    const im = x.createImageData(220, 220);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() < 0.5 ? 0 : 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = Math.random() * 46;
    }
    x.putImageData(im, 0, 0);
    root.style.setProperty('--grain', `url(${c.toDataURL()})`);
  })();

  /* ═══════════════ image slots ═══════════════ */
  WH.fillSlot = (el) => {
    if (el.dataset.filled) return;
    el.dataset.filled = 1;
    const src = el.dataset.img, base = src.replace(/\.(jpe?g|png|webp)$/i, '');
    const tries = [src, ...['jpg', 'png', 'webp'].map((x) => base + '.' + x).filter((s) => s !== src)];
    const lab = document.createElement('span');
    lab.className = 'slot__lab';
    lab.dataset.file = 'img/' + src;
    lab.textContent = el.dataset.desc || '';
    el.appendChild(lab);
    const next = (i) => {
      if (i >= tries.length) return;
      const im = new Image();
      im.onload = () => { im.alt = el.dataset.desc || ''; im.draggable = false; el.appendChild(im); el.classList.add('has-img'); };
      im.onerror = () => next(i + 1);
      im.src = 'img/' + tries[i];
    };
    next(0);
  };
  $$('.slot[data-img]').forEach(WH.fillSlot);

  /* ═══════════════ scramble + rot ═══════════════ */
  const GLY = '#%@&$*!?<>/\\|=+~01░▒▓';
  WH.scramble = (el, dur = 0.9) => {
    const txt = el.dataset.text || el.textContent;
    el.dataset.text = txt;
    if (RM) { el.textContent = txt; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / (dur * 1000));
      const n = Math.floor(p * txt.length);
      el.textContent = txt.slice(0, n) + [...txt.slice(n)].map((c) => (c === ' ' ? ' ' : WH.pick(GLY))).join('');
      if (p < 1) requestAnimationFrame(tick); else el.textContent = txt;
    };
    requestAnimationFrame(tick);
  };
  const scrIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { WH.scramble(e.target); scrIO.unobserve(e.target); } }), { threshold: 0.6 });
  $$('[data-scramble]').forEach((el) => scrIO.observe(el));

  /* text that goes bad: amount 0..1 of the letters get eaten */
  const orig = new WeakMap();
  const texts = (el) => {
    const out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() && !n.parentElement.closest('.cat, script, style') ? 1 : 2) });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  };
  WH.rot = (el, amt = 0.4) => texts(el).forEach((n) => {
    if (!orig.has(n)) orig.set(n, n.nodeValue);
    const o = orig.get(n);
    n.nodeValue = [...o].map((c) => (c.trim() && Math.random() < amt ? WH.pick(GLY) : c)).join('');
  });
  WH.heal = (el) => texts(el).forEach((n) => { if (orig.has(n)) n.nodeValue = orig.get(n); });

  /* ═══════════════ cursor: a crosshair that reads your coordinates ═══════════════ */
  let mx = innerWidth / 2, my = innerHeight / 2;
  const trail = [];
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; trail.push([performance.now(), mx, my]); if (trail.length > 240) trail.shift(); }, { passive: true });
  if (FINE) {
    root.classList.add('has-cursor');
    const mk = (cls) => {
      const c = document.createElement('div');
      c.className = 'cur ' + cls;
      c.setAttribute('aria-hidden', 'true');
      c.innerHTML = '<i class="cur__h"></i><i class="cur__v"></i><i class="cur__ring"></i><b class="cur__xy"></b><b class="cur__lab"></b>';
      document.body.appendChild(c);
      return c;
    };
    const cur = mk('cur--me'), ghost = mk('cur--ghost');
    const xy = $('.cur__xy', cur), lab = $('.cur__lab', cur);
    $('.cur__lab', ghost).textContent = 'not you';
    let cx = mx, cy = my, ghostOn = false;
    WH.ghost = (on) => { ghostOn = on; ghost.classList.toggle('is-on', on); };
    const loop = (now) => {
      cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      xy.textContent = 'x' + WH.pad(Math.round(cx), 4) + ' y' + WH.pad(Math.round(cy), 4);
      if (ghostOn) {
        const t = now - 750;
        let p = trail[0];
        for (const q of trail) { if (q[0] <= t) p = q; else break; }
        if (p) ghost.style.transform = `translate3d(${p[1] + 18}px, ${p[2] + 12}px, 0)`;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button, input, label, [role="button"]');
      cur.classList.toggle('is-hover', !!t);
      const l = t && t.closest('[data-cursor]') ? WH.t(t.closest('[data-cursor]').dataset.cursor) : '';
      lab.textContent = l;
      cur.classList.toggle('has-lab', !!l);
    });
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => cur.classList.add('is-out'));
    document.addEventListener('mouseenter', () => cur.classList.remove('is-out'));
  } else WH.ghost = () => {};

  /* ═══════════════ magnetic ═══════════════ */
  WH.magnet = (el) => {
    if (!FINE || !hasG()) return;
    const s = parseFloat(el.dataset.magnetic) || 0.3;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * s, y: (e.clientY - r.top - r.height / 2) * s, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, .4)' }));
  };
  $$('[data-magnetic]').forEach(WH.magnet);

  /* ═══════════════ the lines ═══════════════ */
  /* strings use {keys} from WH.D. functions can return null when they don't apply to you */
  const late = () => D.hour() < 5 || D.hour() > 23;
  const bat = (s) => () => (D.battery != null && !D.charging ? WH.t(s) : null);
  WH.LINES = {
    idle: [
      'still there, {first}?',
      'you stopped moving. i didn’t.',
      'you’ve been staring for {secs} seconds. i’m counting. you’re not.',
      'blink, {first}. you’re drying out.',
      bat('{battery}% and not plugged in. bold of you.'),
      () => (late() ? WH.t('it’s {time}, {first}. normal people are asleep. i’m not people.') : WH.t('it’s {time} in {city}. don’t you have somewhere to be?')),
      'i renamed “{computer}” while you weren’t looking. kidding. or.',
      () => (D.visits > 2 ? WH.t('visit {visits}. at this point you live here.') : null),
      'i can wait. i have nine lives. you have one.'
    ],
    poke: [
      'don’t touch me.',
      'that tickles. do it again and i delete something.',
      'ok. one more and i read your search history out loud, {first}.',
      'you clicked a cat. on a virus site. on {device}. bold.',
      'purr. (that was sarcastic.)',
      'i’m not a button, {first}. i’m a lifestyle.',
      () => (D.user && D.user !== 'guest' ? WH.t('keep going and i log you out of “{user}”. permanently.') : null)
    ],
    right: ['right click? what were you going to do, inspect me, {first}?', 'there is nothing to save here. not even you.'],
    copy: ['copying me? cute.', 'ctrl+c. i saw that, {first}.', 'stealing from a virus. respect.'],
    back: [
      'oh. you came back.',
      'where did you go? i went through your downloads.',
      'welcome back, {first}. nothing happened. probably.',
      'another tab? cheating on me with {browser}?',
      '“{computer}” missed you. i didn’t.'
    ],
    door: ['that door isn’t built yet. like your firewall.', 'nope. not there yet. neither are you, {first}.', 'locked. i have the only key and i ate it.'],
    fast: ['slow down, {first}. i can’t read you that fast.', 'scrolling away won’t help. i scroll faster.', 'running? on {battery_or_screen}?'],
    up: ['going back up? forgot something?', 'it’s still there. everything i said is still true.'],
    leave: ['closing me? i know where “{computer}” lives.', 'don’t. i’ll just open again.', () => WH.t('bye, {first}. see you at visit {next}.')],
    told: ['you told me your name yourself. people always do.', 'i didn’t hack anything. you typed it. remember?']
  };
  D.battery_or_screen = () => (D.battery != null ? D.battery + '% battery' : 'a ' + D.w + 'px screen');
  D.next = () => D.visits + 1;
  WH.line = (k) => {
    const opts = WH.LINES[k].map((l) => (typeof l === 'function' ? l() : l)).filter(Boolean);
    return WH.t(WH.pick(opts));
  };

  /* ═══════════════ type into an element ═══════════════ */
  WH.type = (el, text, { speed = 28, cat = null } = {}) => new Promise((res) => {
    el.textContent = '';
    if (RM) { el.textContent = text; return res(); }
    let i = 0;
    cat && cat.talk(text.length * speed + 200);
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, text[i - 1] === '.' || text[i - 1] === ',' ? speed * 5 : speed + Math.random() * speed * 0.6);
      else res();
    };
    tick();
  });

  /* ═══════════════ buddy: cat.exe in the corner ═══════════════ */
  const buddy = document.createElement('aside');
  buddy.className = 'buddy';
  buddy.setAttribute('aria-live', 'polite');
  buddy.innerHTML = '<p class="buddy__say"></p><div class="buddy__win" data-cursor="don’t"><div class="buddy__bar"><b>cat.exe</b><span>pid 9 · <i class="buddy__dot"></i> awake</span></div><pre class="buddy__cat"></pre></div>';
  document.body.appendChild(buddy);
  const bCat = new WH.Cat($('.buddy__cat', buddy), { w: 34, h: 16, rest: 'idle' });
  const bSay = $('.buddy__say', buddy);
  let bT = 0, pokes = 0;
  WH.buddy = {
    cat: bCat,
    say(text, mood, ms = 3600) {
      clearTimeout(bT);
      buddy.classList.add('is-talking');
      mood && bCat.mood(mood, ms);
      WH.type(bSay, WH.t(text), { cat: bCat, speed: 24 });
      bT = setTimeout(() => buddy.classList.remove('is-talking'), ms + text.length * 24);
    },
    hide(on) { buddy.classList.toggle('is-hidden', on); }
  };
  $('.buddy__win', buddy).addEventListener('click', () => {
    pokes++;
    WH.buddy.say(pokes > 4 ? WH.line('poke') : WH.t(WH.LINES.poke[(pokes - 1) % 4]), pokes % 3 === 0 ? 'angry' : pokes % 2 ? 'laugh' : 'smug', 2600);
    bCat.glitch(200);
  });

  /* ═══════════════ pop: the big cat jumps in ═══════════════ */
  const pop = document.createElement('div');
  pop.className = 'pop';
  pop.setAttribute('aria-live', 'assertive');
  pop.innerHTML = '<div class="pop__in"><pre class="pop__cat"></pre><p class="pop__say"></p></div>';
  document.body.appendChild(pop);
  const pCat = new WH.Cat($('.pop__cat', pop), { w: 76, h: 36 });
  let popping = null;
  WH.pop = (text, { mood = 'smug', ms = 2600, from = 'bottom', flash = true } = {}) => {
    if (popping) return popping;
    popping = (async () => {
      WH.buddy.hide(true);
      pCat.mood(mood);
      pop.dataset.from = from;
      $('.pop__say', pop).textContent = '';
      pop.classList.add('is-on');
      if (flash) WH.flash();
      if (hasG() && !RM) {
        const off = { bottom: { yPercent: 110 }, left: { xPercent: -110 }, right: { xPercent: 110 }, top: { yPercent: -110 } }[from];
        gsap.fromTo('.pop__in', Object.assign({}, off, { scale: 1.25 }), { xPercent: 0, yPercent: 0, scale: 1, duration: 0.55, ease: 'expo.out' });
      }
      pCat.glitch(300);
      await WH.type($('.pop__say', pop), WH.t(text), { cat: pCat, speed: 30 });
      await wait(ms);
      if (hasG() && !RM) await gsap.to('.pop__in', { yPercent: 110, duration: 0.45, ease: 'expo.in' });
      pop.classList.remove('is-on');
      WH.buddy.hide(false);
      popping = null;
    })();
    return popping;
  };

  /* ═══════════════ breaks ═══════════════ */
  const fx = document.createElement('div');
  fx.className = 'fx';
  fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = '<i class="fx__flash"></i><div class="fx__tears"></div>';
  document.body.appendChild(fx);
  WH.flash = () => { if (RM) return; fx.classList.remove('is-flash'); void fx.offsetWidth; fx.classList.add('is-flash'); };
  WH.shake = (amp = 14, dur = 0.5) => {
    if (RM || !hasG()) return;
    gsap.fromTo('main', { x: 0 }, { x: () => (Math.random() - 0.5) * amp * 2, duration: 0.04, repeat: Math.round(dur / 0.04), yoyo: true, ease: 'none', onComplete: () => gsap.set('main', { clearProps: 'transform' }) });
  };
  WH.tear = (ms = 700) => {
    if (RM) return Promise.resolve();
    const box = $('.fx__tears', fx);
    box.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const s = document.createElement('i');
      s.style.top = Math.random() * 100 + 'vh';
      s.style.height = 2 + Math.random() * 14 + 'vh';
      s.style.setProperty('--dx', (Math.random() - 0.5) * 60 + 'px');
      s.className = Math.random() < 0.4 ? 'is-pink' : '';
      box.appendChild(s);
    }
    root.classList.add('is-torn');
    WH.shake(18, ms / 1000);
    return wait(ms).then(() => { root.classList.remove('is-torn'); box.innerHTML = ''; });
  };

  /* a system box that isn't really the system */
  /* with input: 'placeholder', it resolves { i, value } instead of the button index */
  WH.dialog = ({ title = 'WHOAMI', text = '', buttons = ['ok'], auto = 0, icon = '!', input = '' } = {}) => new Promise((res) => {
    const d = document.createElement('div');
    d.className = 'dlg';
    d.setAttribute('role', 'alertdialog');
    d.innerHTML = `<div class="dlg__box"><div class="dlg__bar"><i></i><i></i><i></i><b>${title}</b></div><div class="dlg__body"><span class="dlg__ic">${icon}</span><p>${WH.t(text)}</p>${input ? `<input class="dlg__in" type="text" autocomplete="off" spellcheck="false" maxlength="40" placeholder="${input}">` : ''}</div><div class="dlg__btns">${buttons.map((b, i) => `<button class="dlg__b${i === buttons.length - 1 ? ' is-main' : ''}">${b}</button>`).join('')}</div></div>`;
    document.body.appendChild(d);
    hasG() && !RM && gsap.from($('.dlg__box', d), { scale: 0.86, opacity: 0, duration: 0.3, ease: 'back.out(2)' });
    let done = false;
    const close = (i) => { if (done) return; done = true; d.classList.add('is-out'); setTimeout(() => d.remove(), 260); res(inp ? { i, value: inp.value } : i); };
    const inp = $('.dlg__in', d);
    $$('.dlg__b', d).forEach((b, i) => b.addEventListener('click', () => close(i)));
    if (inp) {
      setTimeout(() => inp.focus(), 80);
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') close(buttons.length - 1); });
    }
    if (auto) setTimeout(() => {
      if (done) return;
      const b = $$('.dlg__b', d).pop();
      b.classList.add('is-pressed');
      setTimeout(() => close(-1), 420);
    }, auto);
  });

  /* your computer "crashes" (it doesn't) */
  WH.panic = (ms = 2000) => new Promise((res) => {
    const p = document.createElement('div');
    p.className = 'panic';
    p.innerHTML = '<div class="panic__in"><b class="panic__ic">⏻</b><p>your computer needs a moment to think about what it has done.<br>hold the power button for a few seconds, or don’t. i’ll be here either way.</p><p lang="it">il tuo computer ha bisogno di un momento per riflettere su quello che ha fatto.</p><p lang="fr">votre ordinateur a besoin d’un moment pour réfléchir à ce qu’il a fait.</p><p lang="de">dein computer braucht einen moment, um über das nachzudenken, was er getan hat.</p><p lang="ja">コンピュータは自分のしたことを考える時間が必要です。</p></div>';
    document.body.appendChild(p);
    root.classList.add('is-panic');
    setTimeout(() => { p.classList.add('is-out'); root.classList.remove('is-panic'); setTimeout(() => { p.remove(); res(); }, 300); }, RM ? 600 : ms);
  });

  /* ═══════════════ nav: clock + doors that may not exist yet ═══════════════ */
  const clock = $('[data-clock]');
  if (clock) setInterval(() => { const d = new Date(); clock.textContent = WH.pad(d.getHours()) + ':' + WH.pad(d.getMinutes()) + ':' + WH.pad(d.getSeconds()); }, 1000);
  const nav = $('.nav');
  if (nav) {
    let last = 0;
    addEventListener('scroll', () => { const y = scrollY; nav.classList.toggle('is-hidden', y > last && y > innerHeight * 0.8); last = y; }, { passive: true });
    const burger = $('.nav__burger');
    burger && burger.addEventListener('click', () => nav.classList.toggle('is-open'));
  }
  $$('a[data-door]').forEach((a) => {
    let ok = null;
    const check = () => (ok != null ? Promise.resolve(ok) : fetch(a.getAttribute('href'), { method: 'HEAD', cache: 'no-store' }).then((r) => (ok = r.ok)).catch(() => (ok = location.protocol === 'file:')));
    a.addEventListener('pointerenter', check, { once: true });
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      if (await check()) {
        WH.tear(320).then(() => (location.href = href));
      } else {
        WH.tear(380);
        WH.buddy.say(WH.line('door'), 'smug', 2400);
      }
    });
  });

  /* ═══════════════ the tab never forgets ═══════════════ */
  const title = document.title;
  const fav = $('link[rel="icon"]');
  const favOn = fav && fav.href;
  const favEye = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ff1f9b"/><ellipse cx="16" cy="16" rx="12" ry="8" fill="#0d0d0d"/><ellipse cx="16" cy="16" rx="2.4" ry="7" fill="#ff1f9b"/></svg>');
  let tabT = 0, gone = 0;
  document.addEventListener('visibilitychange', () => {
    clearInterval(tabT);
    if (document.hidden) {
      gone = Date.now();
      const t = [WH.t('{first}?'), 'come back', 'i’m still here', WH.t('reading {computer}…'), 'don’t close me'];
      let i = 0;
      document.title = t[0];
      tabT = setInterval(() => (document.title = t[++i % t.length]), 1600);
      if (fav) fav.href = favEye;
    } else {
      document.title = title;
      if (fav) fav.href = favOn;
      if (Date.now() - gone > 2500 && WH.isReady) setTimeout(() => WH.buddy.say(WH.line('back'), 'smug', 2600), 500);
    }
  });

  /* right click, copy, idle */
  let rc = 0;
  addEventListener('contextmenu', (e) => { if (rc++ < 2) { e.preventDefault(); WH.buddy.say(WH.t(WH.LINES.right[rc - 1]), 'angry', 2400); } });
  addEventListener('copy', () => WH.buddy.say(WH.line('copy'), 'smug', 2000));
  let idleT = 0;
  const idle = () => { clearTimeout(idleT); idleT = setTimeout(() => { if (WH.isReady && !locks && !document.hidden) WH.buddy.say(WH.line('idle'), 'stare', 3200); idle(); }, 22000); };
  ['pointermove', 'keydown', 'wheel', 'touchstart'].forEach((ev) => addEventListener(ev, idle, { passive: true }));
  idle();

  /* it notices how you scroll, and when you reach for the close button */
  let lastRemark = 0;
  const remark = (k, mood, gap = 30000) => {
    if (!WH.isReady || locks || Date.now() - lastRemark < gap || $('.pop.is-on') || $('.buddy.is-hidden')) return;
    lastRemark = Date.now();
    WH.buddy.say(WH.line(k), mood, 2400);
  };
  if (lenis) {
    let upFor = 0;
    lenis.on('scroll', (l) => {
      if (Math.abs(l.velocity) > 85) remark('fast', 'laugh');
      upFor = l.direction < 0 ? upFor + Math.abs(l.velocity) : 0;
      if (upFor > 1600) { upFor = 0; remark('up', 'smug'); }
    });
  }
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY < 8 && FINE) remark('leave', 'stare', 20000); });

  /* ═══════════════ konami: sudo ═══════════════ */
  const K = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let ki = 0;
  addEventListener('keydown', (e) => {
    ki = e.key === K[ki] ? ki + 1 : e.key === K[0] ? 1 : 0;
    if (ki === K.length) { ki = 0; WH.sudo(); }
  });
  WH.sudo = async () => {
    root.classList.toggle('is-sudo');
    WH.tear(500);
    await WH.pop(root.classList.contains('is-sudo') ? 'sudo? on me? fine. everything is pink now. forever.' : 'ok. ok. colours back. you’re no fun, {first}.', { mood: 'laugh', ms: 1800 });
  };

  /* ═══════════════ boot: $ whoami ═══════════════ */
  const boot = $('.boot');
  const ready = () => {
    root.classList.add('is-ready');
    WH.isReady = true;
    window.dispatchEvent(new Event('wh:ready'));
  };
  WH.who.then(async () => {
    if (!boot) return requestAnimationFrame(ready);
    const log = $('.boot__log', boot), big = $('.boot__name', boot);
    const fast = visits > 1;
    const d = new Date();
    const L = [
      `Last login: ${d.toDateString()} ${WH.pad(d.getHours())}:${WH.pad(d.getMinutes() - 1 < 0 ? 0 : d.getMinutes() - 1)} on ttys009`,
      `${D.prompt} <b>whoami</b>`,
      `reading system ................. <em>ok</em>`,
      `device ........ ${D.computer}`,
      `os ............ ${D.os}${D.osv ? ' ' + D.osv : ''} · ${D.browser}`,
      `gpu ........... ${D.gpuLine}`,
      `cores ......... ${D.cores || '?'}${D.mem ? ' · ' + D.mem + 'gb ram (at least)' : ''}`,
      D.battery != null ? `battery ....... ${D.battery}%${D.charging ? ' · charging' : ' · not charging'}` : `screen ........ ${D.w}×${D.h} @${D.dpr}x`,
      `location ...... ${D.city} · ${D.time()}`,
      `visits ........ ${visits}${visits > 1 ? ' (i remember)' : ''}`,
      `<b>↳ ${D.known ? D.full : D.first}</b>`
    ];
    let skip = false;
    boot.addEventListener('click', () => (skip = true));
    addEventListener('keydown', () => (skip = true), { once: true });
    if (!RM) {
      for (const [i, l] of L.entries()) {
        if (skip) break;
        log.innerHTML += (i ? '\n' : '') + l;
        await wait(i === 1 ? (fast ? 260 : 620) : fast ? 70 : 150);
      }
      if (!skip) {
        big.innerHTML = D.known ? `hi, ${D.first}.` : visits > 1 ? 'again?' : 'hi.';
        boot.classList.add('is-name');
        await wait(fast ? 650 : 1100);
      }
    }
    boot.classList.add('is-out');
    ready();
    setTimeout(() => boot.remove(), 900);
  });

  /* ═══════════════ it keeps count of everything you do ═══════════════
     WH.S = totals across every visit, WH.s = this visit only. log.html reads them. */
  const S0 = { px: 0, clicks: 0, keys: 0, scroll: 0, tabs: 0, copies: 0, right: 0, secs: 0 };
  WH.S = Object.assign({}, S0, WH.get('stats', {}));
  WH.s = Object.assign({}, S0);
  WH.speed = 0;
  const bump = (k, n = 1) => { WH.S[k] += n; WH.s[k] += n; };
  let lx = null, ly = null, lt = 0, sy = scrollY;
  addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (lx != null) {
      const d = Math.hypot(e.clientX - lx, e.clientY - ly);
      bump('px', d);
      const v = d / Math.max(8, now - lt) * 1000;
      WH.speed += (v - WH.speed) * 0.2;
    }
    lx = e.clientX; ly = e.clientY; lt = now;
  }, { passive: true });
  setInterval(() => { WH.speed *= 0.86; }, 100);
  addEventListener('pointerdown', () => bump('clicks'));
  addEventListener('keydown', () => bump('keys'));
  addEventListener('scroll', () => { bump('scroll', Math.abs(scrollY - sy)); sy = scrollY; }, { passive: true });
  addEventListener('copy', () => bump('copies'));
  addEventListener('contextmenu', () => bump('right'));
  document.addEventListener('visibilitychange', () => document.hidden && bump('tabs'));
  setInterval(() => !document.hidden && bump('secs'), 1000);
  /* a diary: one entry per page you open, with the things you did there.
     WH.note('mugshot') adds a thing. log.html reads WH.H */
  const page = ((document.body.className.match(/pg-(\w+)/) || [])[1]) || 'home';
  const H = (WH.H = WH.get('hist', []));
  const entry = (WH.entry = { t: Date.now(), p: page, s: 0, e: [] });
  H.push(entry);
  if (H.length > 60) H.splice(0, H.length - 60);
  WH.note = (e) => { if (!entry.e.includes(e)) entry.e.push(e); WH.set('hist', H); };
  setInterval(() => !document.hidden && entry.s++, 1000);

  /* your path across the screen, for this session (log.html draws it) */
  const path = (() => { try { return JSON.parse(sessionStorage.getItem('wh-trail')) || []; } catch (e) { return []; } })();
  WH.trail = path;
  let tl = 0;
  addEventListener('pointermove', (e) => {
    const n = performance.now();
    if (n - tl < 40) return;
    tl = n;
    path.push([+(e.clientX / innerWidth).toFixed(4), +(e.clientY / innerHeight).toFixed(4)]);
    if (path.length > 5000) path.splice(0, path.length - 5000);
  }, { passive: true });
  addEventListener('pointerdown', () => path.push(null), { passive: true });

  const saveS = () => {
    WH.set('stats', WH.S);
    WH.set('hist', H);
    try { sessionStorage.setItem('wh-trail', JSON.stringify(path)); } catch (e) {}
  };
  setInterval(saveS, 4000);
  addEventListener('pagehide', saveS);
  WH.meters = (px) => (px / 3780).toFixed(px < 37800 ? 2 : 1);

  /* ═══════════════ footer terminal ═══════════════ */
  const fo = $('.ft__out'), fi = $('.ft__in input');
  if (fo && fi) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const say = (cmd, res) => {
    fo.innerHTML += `\n\n<i>${esc(D.prompt || 'guest@unknown ~ %')} ${esc(cmd)}</i>\n${res}`;
    fo.scrollTop = fo.scrollHeight;
  };
  const CMD = {
    whoami: () => (D.known ? `${esc(D.user)}\n<b>(${esc(D.full)}. i told you i knew.)</b>` : `guest\n<b>(for now.)</b>`),
    help: () => 'whoami · ls · pwd · date · uname · cat · sudo · rm -rf · kill -9 · ping · clear · exit\n<b>there is no help. there is only the cat.</b>',
    ls: () => 'Desktop   Documents   Downloads   Music   Pictures\n<b>all mine now.</b>',
    pwd: () => esc('/Users/' + (D.user || 'guest')) + '\n<b>and i’m right behind you.</b>',
    date: () => esc(new Date().toString()) + '\n<b>you’ve been here ' + D.secs() + ' seconds.</b>',
    uname: () => esc(D.computer + ' · ' + D.os + ' · ' + (D.gpu || 'unknown chip')),
    cat: () => '<b>meow.</b> what did you expect.',
    ping: () => 'pong. <b>i’m faster than you.</b>',
    clear: () => { fo.innerHTML = ''; return ''; },
    exit: () => { WH.tear(500); return '<b>there is no exit.</b> try the page called exit. it doesn’t work either.'; },
    hi: () => WH.t('<b>hi, {first}.</b> finally some manners.'),
    love: () => { WH.buddy.say('i know.', 'smug', 2000); return '<b>i know.</b>'; }
  };
  CMD.hello = CMD.hi; CMD.quit = CMD.exit; CMD.logout = CMD.exit;
  fi.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const raw = fi.value.trim();
    fi.value = '';
    if (!raw) return;
    const c = raw.toLowerCase();
    let r;
    if (c.startsWith('sudo')) r = esc((D.user || 'guest') + ' is not in the sudoers file. this incident will be reported.') + '\n<b>to me.</b>';
    else if (c.startsWith('rm')) { r = '<b>you first.</b>'; WH.shake(12, 0.3); }
    else if (c.startsWith('kill')) { r = '<b>i have nine lives. you have one.</b>'; WH.buddy.say('try it.', 'angry', 1600); }
    else if (c.includes('love')) r = CMD.love();
    else if (CMD[c.split(' ')[0]]) r = CMD[c.split(' ')[0]]();
    else r = `zsh: command not found: ${esc(raw.split(' ')[0])}\n<b>but i found you.</b>`;
    if (c !== 'clear') say(raw, r);
    WH.buddy.cat.talk(600);
  });
  }

  /* ═══════════════ no name yet? it asks, on whatever page you're on ═══════════════
     (the home asks during the scan instead) */
  WH.askName = async () => {
    if (D.known) return true;
    WH.set('asked', 1);
    const r = await WH.dialog({
      title: 'cat.exe',
      text: 'i know your computer, your city, your battery and your screen.<br><br>i just don’t know your name. yet.',
      input: 'your name',
      buttons: ['no', 'tell it'],
      icon: '?'
    });
    if (r.i === 1 && WH.name(r.value)) {
      WH.note && WH.note('told');
      WH.buddy.say('{first}. i knew it. i just wanted to hear you say it.', 'laugh', 2800);
      return true;
    }
    WH.buddy.say('fine. “you” it is. for now.', 'angry', 2200);
    return false;
  };
  addEventListener('wh:ready', () => {
    if (D.known || page === 'home') return;
    /* ask once per visit when it doesn't know, and every time until it does */
    setTimeout(() => !D.known && !$('.dlg') && WH.askName(), 4200);
  });

  /* ═══════════════ signature ═══════════════ */
  console.log('%c\n        /\\_/\\           $ whoami\n       ( @.@ )   ←  me. i was going to ask you the same thing.\n        > v <\n       /|###|\\\n\n   ┌─┐┬ ┬┌─┐┌─┐┌┬┐┬ ┬ ┬  ┌─┐┬─┐┬\n   │ ┬├─┤│ │└─┐ │ │ └┬┘  │ ┬├┬┘│\n   └─┘┴ ┴└─┘└─┘ ┴ ┴─┘┴ o └─┘┴└─┴─┘ ♥\n\n   WHOAMI · personal threat detection for one (1) human\n   concept, design & code by ghostly.grl ♥\n   try WH.help()\n', 'color:#ff1f9b;font-family:monospace;font-size:12px');
  WH.help = () => console.log('WH.D            → everything i know about you\nWH.pop("hi")    → the big cat says something\nWH.panic()      → your computer "crashes"\nWH.sudo()       → pink forever (or ↑↑↓↓←→←→ b a)\nWH.ghost(true)  → someone else moves your mouse');
})();
