/* ═══════════════════════════════════════════════════════════════
   WHOAMI — log.js · the log
   concept, design & code by ghostly.grl ♥

   01 log      tail -f you (newest on top): every move, click, key, scroll and
               silence on this page, written down as it happens
   02 numbers  everything WH.S counted, across every visit
   03 drawing  your mouse path this session, drawn. replay it
   04 diary    one entry per page you opened, in the cat's words
   05 forget   the one honest button: clears everything the site
               kept about you, for real
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, D, FINE } = WH;
  const G = !!window.gsap && !RM;
  const wait = WH.wait;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const mmss = (s) => (s >= 3600 ? Math.floor(s / 3600) + 'h ' : '') + WH.pad(Math.floor((s % 3600) / 60)) + ':' + WH.pad(s % 60);
  const fgCat = new WH.Cat($('.fg__cat'));

  /* ═══════════════ 01 · tail -f you ═══════════════ */
  const out = $('.lh__out');
  let n = 0, sinceCat = 0;
  const stamp = () => { const d = new Date(); return WH.pad(d.getHours()) + ':' + WH.pad(d.getMinutes()) + ':' + WH.pad(d.getSeconds()) + '.' + String(d.getMilliseconds()).padStart(3, '0'); };
  const CAT = ['noted.', 'interesting.', 'again?', 'i saw that.', 'mm.', 'writing that down twice.', 'bold.', 'sure, {first}.'];
  const log = (html, cat = false) => {
    const li = document.createElement('li');
    if (cat) li.className = 'is-cat';
    li.innerHTML = `<time>${stamp()}</time><span>${cat ? 'cat.exe: ' + esc(WH.t(html)) : html}</span>`;
    out.prepend(li);
    while (out.children.length > 60) out.lastChild.remove();
    $('.lh__n').textContent = ++n;
    if (!cat && ++sinceCat > 5 && Math.random() < 0.35) { sinceCat = 0; setTimeout(() => log(WH.pick(CAT), true), 500); }
  };
  WH.who.then(() => {
    const since = new Date(Math.min(D.since, (WH.H[0] || {}).t || D.since));
    $('.lh__since').textContent = since.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + WH.pad(since.getHours()) + ':' + WH.pad(since.getMinutes());
  });

  /* where things are on the page, in words */
  const where = (el) => {
    if (!el || !el.closest) return 'the page';
    if (el.closest('.nav')) return 'the nav';
    if (el.closest('.buddy')) return 'me';
    if (el.closest('.ft')) return 'the footer';
    const s = el.closest('section');
    return s ? ({ top: 'the log', numbers: 'your numbers', drawing: 'your drawing', diary: 'my diary', forget: 'the forget button' }[s.id] || 'the page') : 'the page';
  };
  const label = (el) => {
    const t = el && el.closest && el.closest('a, button, input, .sw, li, h1, h2, p');
    if (!t) return null;
    const txt = (t.getAttribute('aria-label') || t.textContent || '').replace(/\s+/g, ' ').trim();
    return txt ? cut(txt.toLowerCase(), 34) : null;
  };

  function listen() {
    /* mouse, summed up every 1.2s */
    let dx = 0, dy = 0, px = null, py = null, lastEl = null, still = 0;
    addEventListener('pointermove', (e) => {
      if (px != null) { dx += e.clientX - px; dy += e.clientY - py; }
      px = e.clientX; py = e.clientY; lastEl = e.target; still = 0;
    }, { passive: true });
    setInterval(() => {
      const d = Math.hypot(dx, dy);
      if (d > 40) {
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        const w = where(lastEl);
        const extra = w === 'the nav' ? ' <em>thinking of leaving?</em>' : w === 'me' ? ' <em>hi.</em>' : dir === 'up' && py < 80 ? ' <em>towards the close button?</em>' : '';
        log(`moved the mouse <b>${Math.round(d)}px ${dir}</b>, over ${esc(w)}.${extra}`);
      }
      dx = dy = 0;
    }, 1200);
    /* nothing at all */
    setInterval(() => { if (++still === 9 && !document.hidden) log(`did nothing for <b>9 seconds</b>. <em>breathing, probably.</em>`); }, 1000);
    ['wheel', 'keydown', 'touchstart', 'pointerdown'].forEach((ev) => addEventListener(ev, () => (still = 0), { passive: true }));
    /* clicks */
    addEventListener('pointerdown', (e) => {
      const l = label(e.target);
      log(l ? `clicked <b>“${esc(l)}”</b> at ${Math.round(e.clientX)}, ${Math.round(e.clientY)}.` : `clicked on <b>nothing</b> at ${Math.round(e.clientX)}, ${Math.round(e.clientY)}. <em>why.</em>`);
    });
    /* scroll, summed up */
    let sd = 0, lastY = scrollY, seen = new Set();
    addEventListener('scroll', () => { sd += scrollY - lastY; lastY = scrollY; }, { passive: true });
    setInterval(() => {
      if (Math.abs(sd) > 60) log(`scrolled <b>${sd > 0 ? 'down' : 'up'} ${Math.abs(Math.round(sd))}px</b>.${sd < 0 ? ' <em>going back?</em>' : ''}`);
      sd = 0;
      $$('main section').forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5 && !seen.has(s.id)) { seen.add(s.id); s.id !== 'top' && log(`reached <b>${where(s)}</b>.`); }
      });
    }, 1000);
    /* keys, as words */
    let typed = '', kT = 0;
    addEventListener('keydown', (e) => {
      const k = e.key.length === 1 ? e.key : e.key === 'Backspace' ? '⌫' : e.key === 'Enter' ? '⏎' : e.key === ' ' ? '␣' : null;
      if (!k) { log(`pressed <b>${esc(e.key.toLowerCase())}</b>.`); return; }
      typed += k;
      clearTimeout(kT);
      kT = setTimeout(() => {
        const inTerm = document.activeElement && document.activeElement.closest && document.activeElement.closest('.ft__in');
        log(`typed <b>“${esc(cut(typed, 40))}”</b>${inTerm ? ' into my terminal' : ''}.${typed.length > 12 ? ' <em>chatty.</em>' : ''}`);
        typed = '';
      }, 900);
    });
    addEventListener('copy', () => { const t = String(getSelection()).trim(); log(`copied <b>“${esc(cut(t, 36))}”</b>. <em>keeping a souvenir?</em>`); });
    let selT = 0;
    document.addEventListener('selectionchange', () => {
      clearTimeout(selT);
      selT = setTimeout(() => { const t = String(getSelection()).trim(); if (t.length > 2) log(`selected <b>“${esc(cut(t, 36))}”</b>.`); }, 700);
    });
    let goneAt = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { goneAt = Date.now(); log('left the tab.'); }
      else log(`came back after <b>${Math.round((Date.now() - goneAt) / 1000)} seconds</b>. <em>i kept writing.</em>`);
    });
    let rT = 0;
    addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => log(`resized the window to <b>${innerWidth}×${innerHeight}</b>. <em>hiding?</em>`), 400); });
    addEventListener('contextmenu', () => log('right-clicked. <em>looking for the source?</em>'));
  }

  addEventListener('wh:ready', async () => {
    if (G) {
      gsap.from('.lh__t span', { yPercent: 100, duration: 1.2, ease: 'expo.out' });
      gsap.from('.lh__bar > span', { opacity: 0, y: -8, duration: 0.5, stagger: 0.06, delay: 0.2 });
      gsap.from('.lh__lede, .lh__stream', { opacity: 0, y: 30, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.3 });
    }
    const last = WH.H.length > 1 ? WH.H[WH.H.length - 2] : null;
    const opening = [
      `session opened by <b>${esc(D.known ? D.full : 'an unknown human')}</b>.`,
      `device <b>${esc(D.computer)}</b>, ${esc(D.os)}, ${esc(D.browser)}.`,
      `location <b>${esc(D.city)}</b>, local time ${D.time()}.`,
      `page loads so far: <b>${D.visits}</b>.${D.visits > 5 ? ' <em>you live here now.</em>' : ''}`,
      last ? `before this you were on <b>${last.p}</b> for ${mmss(last.s)}.` : 'first page. <em>welcome.</em>',
      'opened /var/log/' + esc(D.user) + '.log. <em>that’s this page.</em>'
    ];
    for (const l of opening) { log(l); await wait(RM ? 0 : 260); }
    listen();
    later();
    setTimeout(() => WH.buddy.say('everything you do here gets written down. even reading this.', 'smug', 3000), 1600);
  });

  function later() {
    numbers();
    drawing();
    diary();
    forget();
    window.ScrollTrigger && ScrollTrigger.refresh();
  }

  /* ═══════════════ 02 · numbers ═══════════════ */
  function numbers() {
    const S = WH.S;
    $('.nu__v').textContent = WH.H.length;
    const m = +WH.meters(S.px), sc = +WH.meters(S.scroll);
    const T = [
      { k: 'mouse, moved', v: m, d: 2, u: 'm', c: m < 0.46 ? 'not even one cat long. lazy.' : `that’s ${Math.round(m / 0.46)} ${Math.round(m / 0.46) === 1 ? 'cat' : 'cats'}, nose to tail.` },
      { k: 'clicks', v: S.clicks, u: '', c: `${(S.clicks / 9).toFixed(1)} per life. i have nine.` },
      { k: 'keys pressed', v: S.keys, u: '', c: S.keys === 1 ? 'one key. i read it anyway.' : S.keys ? 'i read every one of them.' : 'not one key. careful. or shy.' },
      { k: 'scrolled', v: sc, d: 1, u: 'm', c: `about ${Math.max(1, Math.round(sc / 3))} floors. you could have taken the stairs.` },
      { k: 'time here', v: S.secs, u: 't', c: `${Math.max(1, Math.round(S.secs / 60))} minutes you won’t get back. i will.` },
      { k: 'times you left the tab', v: S.tabs, u: '', c: S.tabs ? 'you always come back.' : 'never left me. good.' }
    ];
    const grid = $('.nu__grid');
    grid.innerHTML = T.map((t) => `<li><span class="nu__k">${t.k}</span><b class="nu__n">0</b><p class="nu__c">${esc(t.c)}</p></li>`).join('');
    const ns = $$('.nu__n', grid);
    const show = (i, v) => { const t = T[i]; ns[i].innerHTML = t.u === 't' ? mmss(Math.round(v)) : v.toFixed(t.d || 0) + (t.u ? `<small>${t.u}</small>` : ''); };
    if (G && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: grid, start: 'top 75%', once: true, onEnter: () => T.forEach((t, i) => { const o = { v: 0 }; gsap.to(o, { v: t.v, duration: 1.6, ease: 'expo.out', delay: i * 0.08, onUpdate: () => show(i, o.v) }); }) });
      gsap.from($$('li', grid), { y: 40, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: grid, start: 'top 80%' } });
    } else T.forEach((t, i) => show(i, t.v));
  }

  /* ═══════════════ 03 · drawing ═══════════════ */
  function drawing() {
    const frame = $('.dr__frame'), cv = $('.dr__cv'), x = cv.getContext('2d'), dot = $('.dr__you'), say = $('.dr__say');
    let W = 0, H = 0, playing = false;
    const pts = () => WH.trail;
    const size = () => { const r = frame.getBoundingClientRect(); const k = Math.min(2, devicePixelRatio); cv.width = r.width * k; cv.height = r.height * k; W = cv.width; H = cv.height; };
    const draw = (upto = Infinity, pink = false) => {
      const P = pts();
      x.clearRect(0, 0, W, H);
      x.lineJoin = x.lineCap = 'round';
      const seg = (from, to, col, lw) => {
        x.strokeStyle = col; x.lineWidth = lw;
        x.beginPath();
        let pen = false;
        for (let i = from; i < Math.min(to, P.length); i++) {
          const p = P[i];
          if (!p) { pen = false; continue; }
          pen ? x.lineTo(p[0] * W, p[1] * H) : x.moveTo(p[0] * W, p[1] * H);
          pen = true;
        }
        x.stroke();
      };
      seg(0, P.length, pink ? 'rgba(13,13,13,.18)' : '#0d0d0d', Math.max(1.2, W / 900));
      if (pink) seg(0, upto, '#ff1f9b', Math.max(2.4, W / 450));
      /* clicks are dots */
      x.fillStyle = '#ff1f9b';
      for (let i = 1; i < Math.min(upto, P.length); i++) if (!P[i - 1] && P[i]) { x.beginPath(); x.arc(P[i][0] * W, P[i][1] * H, Math.max(4, W / 220), 0, 7); x.fill(); }
      $('.dr__pts').textContent = P.filter(Boolean).length.toLocaleString('en');
      frame.classList.toggle('has-path', P.length > 10);
    };
    size();
    draw();
    addEventListener('resize', () => { size(); draw(); });
    const comment = () => {
      const c = pts().filter(Boolean).length;
      return c < 50 ? 'you barely moved. suspicious.' : c < 600 ? 'a nervous little scribble. very you.' : 'you drew a cat. everyone does, eventually.';
    };
    if (window.ScrollTrigger) ScrollTrigger.create({ trigger: frame, start: 'top 80%', onEnter: () => { size(); draw(); WH.type(say, comment(), { speed: 26 }); }, onEnterBack: () => { size(); draw(); } });
    $('.dr__play').addEventListener('click', async () => {
      const P = pts();
      if (playing || P.length < 10) { WH.buddy.say('nothing to replay. move first.', 'smug', 1800); return; }
      playing = true;
      size();
      WH.ghost && WH.ghost(true);
      dot.style.opacity = 1;
      const N = P.length, dur = Math.min(9000, 2000 + N * 3), t0 = performance.now();
      await new Promise((res) => {
        const step = (now) => {
          const k = Math.min(1, (now - t0) / dur), i = Math.floor(k * (N - 1));
          draw(i + 1, true);
          let p = P[i], j = i;
          while (!p && j > 0) p = P[--j];
          if (p) dot.style.transform = `translate(${p[0] * frame.clientWidth}px, ${p[1] * frame.clientHeight}px)`;
          k < 1 ? requestAnimationFrame(step) : res();
        };
        requestAnimationFrame(step);
      });
      dot.style.opacity = 0;
      WH.ghost && WH.ghost(false);
      WH.type(say, WH.t('that was you, {first}. i watched the whole thing. twice now.'), { speed: 26 });
      playing = false;
    });
  }

  /* ═══════════════ 04 · diary ═══════════════ */
  function diary() {
    const BASE = {
      home: 'you came in through the front door.',
      scan: 'you let me scan you.',
      cam: 'you picked up when i called.',
      files: 'you went through your own files.',
      log: 'you came here to read about yourself.',
      nine: 'you came to see my other lives.',
      exit: 'you tried to leave.'
    };
    const EV = {
      told: 'you told me your name. just like that.', found: 'the scan found you. it always does.',
      peel: 'you picked at the black bar.', censor: 'you made everything black. i liked it.',
      core: 'you reached the core. i was there.', quarantine: 'you filled the quarantine. it didn’t help.',
      'cat-try': 'you tried to put me in quarantine. rude.', print: 'you printed your report. i hope you framed it.',
      still: 'you sat perfectly still, like furniture.', face: '<em>you showed me your face.</em>',
      memory: 'you didn’t show me your face. i drew it anyway.', voice: 'i heard your room.',
      decline: 'you declined my call.', mugshot: 'you posed for a mugshot.', cover: 'you covered the camera. cute.',
      mute: 'you muted me.', hangup: 'you hung up on me. twice.', open: 'you opened your own files.',
      passwords: '<em>you read passwords.txt.</em>', zip: 'you opened dont_open.zip. it said don’t.',
      trash: 'you threw things away.', lives: 'you read about the eight before you.', 'door-close': 'you tried to close the tab. you stayed.', logout: 'you tried to log out. you became me for a minute.', uninstall: 'you uninstalled me. i reinstalled myself.', unplug: 'you pulled the plug. i was still there in the dark.', goodbye: '<em>you said goodbye.</em> and came back anyway.', gave: '<em>you gave me one of your lives.</em> i’m keeping it.', optimise: 'you let me optimise you.', empty: 'you emptied the trash. i kept copies.'
    };
    const H = WH.H.slice(-24).reverse();
    const firstT = WH.H[0] && WH.H[0].t;
    const list = $('.di__list');
    list.innerHTML = H.map((h, i) => {
      const d = new Date(h.t);
      const now = i === 0;
      let t = now ? '<em>you’re reading this. right now.</em> hi.' : BASE[h.p] || 'you were here.';
      t += ' ' + h.e.map((e) => EV[e]).filter(Boolean).join(' ');
      if (!now) t += h.s < 3 ? ' you left almost immediately.' : h.s > 120 ? ` you stayed ${mmss(h.s)}. you like it here.` : ` you stayed ${mmss(h.s)}.`;
      if (h.t === firstT && !now) t += ' first time. you didn’t know yet.';
      return `<li${now ? ' class="is-now"' : ''}><p class="di__d">${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}<span>${WH.pad(d.getHours())}:${WH.pad(d.getMinutes())}</span><b>${h.p}</b></p><p class="di__txt">${t}</p></li>`;
    }).join('') + '<li class="di__sign" style="display:block;border:0">— cat.exe</li>';
    if (G && window.ScrollTrigger) $$('li', list).forEach((li) => gsap.from(li, { opacity: 0, y: 30, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 88%' } }));
    window.ScrollTrigger && ScrollTrigger.create({ trigger: '.di', start: 'top 50%', once: true, onEnter: () => WH.buddy.say(WH.H.length > 3 ? 'i write about you every time. it’s a hobby.' : 'not much yet. come back more.', 'smug', 2600) });
  }

  /* ═══════════════ 05 · forget me (for real) ═══════════════ */
  function forget() {
    $('.fg__go').addEventListener('click', async () => {
      fgCat.mood('wide');
      const r = await WH.dialog({ title: 'forget me', text: 'this deletes everything WHOAMI kept in this browser: your name, your visits, your numbers, your drawing, the diary.<br><br>the cat will not remember you.', buttons: ['keep me', 'forget me'], icon: '?' });
      if (r !== 1) { fgCat.mood('smug', 2000); WH.buddy.say('i knew you’d stay.', 'smug', 2000); return; }
      fgCat.mood('sad');
      await WH.pop('fine. i’ll forget you. (i won’t.)', { mood: 'sad', ms: 1400 });
      WH.forgot = true;
      WH.trail.length = 0;
      try {
        Object.keys(localStorage).filter((k) => k.startsWith('wh-')).forEach((k) => localStorage.removeItem(k));
        sessionStorage.removeItem('wh-trail');
      } catch (e) {}
      document.documentElement.classList.add('is-forgot');
      await wait(1400);
      const f = document.createElement('div');
      f.className = 'forgot';
      document.body.appendChild(f);
      for (const c of 'who are you?') { f.textContent += c; await wait(90); }
      await wait(1600);
      location.href = 'index.html';
    });
  }
})();
