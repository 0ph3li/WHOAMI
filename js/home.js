/* ═══════════════════════════════════════════════════════════════
   WHOAMI — home.js
   concept, design & code by ghostly.grl ♥

   01 hero    a normal antivirus for nine seconds. then the scan
              finds one threat, and the page falls apart
   02 know    the worst part of being watched: redactions lift,
              one fact about you at a time (pinned)
   03 eyes    you saw it too, right? the cat's eyes, huge
   04 fine    everything is fine. until it's mine (scroll locked)
   05 scared  don't be scared of the CAT, in stripes
   06 files   rm -rf ~ with a stop button that runs away
   07 over    game over. continue? 9 lives
   ft         a terminal that answers
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, D } = WH;
  const G = !!window.gsap && !RM;
  const wait = WH.wait;
  const cats = {};
  $$('main [data-cat]').forEach((el) => {
    const key = el.className.split(' ')[0].replace(/__cat$|__bigcat$/, (m) => (m === '__bigcat' ? '-big' : ''));
    cats[key] = new WH.Cat(el);
  });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ═══════════════ 01 · hero ═══════════════ */
  const hero = $('.hero');
  let scanned = false, scanning = false;

  const scan = async () => {
    if (scanned || scanning) return;
    scanning = true;
    await WH.who;
    WH.lock();
    WH.to(0, { duration: 0.6 });
    hero.classList.add('is-scanning');
    const log = $('.scan__log'), bar = $('.scan__bar i'), pc = $('.scan__pc');
    const fast = D.visits > 1 ? 0.7 : 1;
    const steps = [
      ['loading signatures', 'ok'],
      ['memory', (D.mem ? D.mem + 'gb, ' : '') + 'clean'],
      ['startup items', '14, fine'],
      ['device', D.computer],
      ['graphics', D.gpuLine],
      ['browser', D.browser + ', ' + (D.dark ? 'dark mode' : 'light mode')],
      ['network', D.city + ', ' + D.time()],
      [D.battery != null ? 'battery' : 'screen', D.battery != null ? D.battery + '%' + (D.charging ? ' charging' : ' draining') : D.w + '×' + D.h],
      ['camera', 'off (light is off)'],
      ['other users', 'none'],
      ['looking for threats', '…']
    ];
    const set = (p) => { bar.style.width = p + '%'; pc.textContent = WH.pad(Math.round(p), 3) + '%'; };
    log.innerHTML = '';
    for (const [i, [k, v]] of steps.entries()) {
      log.innerHTML += `${i ? '\n' : ''}<b>${esc(k)}</b> ${'.'.repeat(Math.max(2, 22 - k.length))} <em>${esc(v)}</em>`;
      log.scrollTop = log.scrollHeight;
      set(((i + 1) / steps.length) * 88);
      await wait((i === steps.length - 1 ? 900 : 380 + Math.random() * 240) * fast);
    }
    /* it stalls. the bar goes back. */
    set(87); await wait(260); set(61); WH.flash(); await wait(320 * fast);
    log.innerHTML += `\n<u>1 threat found.</u>`;
    log.scrollTop = log.scrollHeight;
    $('.hero__ok').innerHTML = '<i class="dot"></i> not quiet';
    for (let p = 61; p <= 100; p += 3) { set(p); await wait(28); }
    set(100);
    /* no door on this machine: so it asks. and you answer. everyone answers. */
    if (!D.known) {
      await wait(500);
      const r = await WH.dialog({
        title: 'identify threat',
        text: 'we found one (1) threat on “{computer}”. to remove it we need its name.<br><br>what’s your name?',
        input: 'first name is enough',
        buttons: ['i’d rather not', 'identify'],
        icon: '?'
      });
      if (r.i === 1 && r.value.trim()) WH.note('told');
      if (!(r.i === 1 && WH.name(r.value))) {
        log.innerHTML += `\n<u>user declined. noted.</u>`;
        WH.buddy.say('rude. i’ll find it anyway.', 'angry', 2000);
      }
    }
    log.innerHTML += `\n<u>identifying… ${esc(D.known ? D.full : 'unknown human')}</u>`;
    log.scrollTop = log.scrollHeight;
    await wait(900 * fast);
    scanning = false;
    scanned = true;
    breakHero();
  };

  const breakHero = async () => {
    WH.note('found');
    WH.tear(520);
    WH.flash();
    if (G) {
      gsap.to('.hl > span', { y: () => innerHeight * (0.9 + Math.random() * 0.4), x: () => (Math.random() - 0.5) * 300, rotation: () => (Math.random() - 0.5) * 70, duration: 1.1, ease: 'power3.in', stagger: 0.09 });
      gsap.to('.hero__tm', { opacity: 0, duration: 0.2 });
    }
    await wait(G ? 650 : 0);
    hero.classList.remove('is-scanning');
    hero.classList.add('is-broken', 'on-pink');
    $('.hero__t').style.visibility = 'hidden';
    const big = cats['hero-big'];
    big && big.mood('wide').glitch(500);
    if (G) {
      gsap.fromTo('.hero__big', { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
      gsap.fromTo('.hero__found', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out', delay: 0.15 });
    } else $$('.hero__big, .hero__found').forEach((e) => (e.style.opacity = 1));
    WH.shake(16, 0.4);
    await wait(900);
    big && big.mood('stare');
    $('.hero__say').style.opacity = 1;
    await WH.type($('.hero__q'), D.told ? `it’s you, ${D.first}. you just told me.` : D.kept ? `it’s you, ${D.first}. you told me last time. i kept it.` : D.known ? `it’s you, ${D.first}. it was always you.` : 'it’s you. whoever you are. i’ll find out.', { cat: big, speed: 44 });
    if (G) {
      gsap.to('.hero__threat', { opacity: 1, duration: 0.3 });
      gsap.to('.hero__down', { opacity: 1, duration: 0.3, delay: 0.5 });
      gsap.to('.hero__down', { y: 6, repeat: -1, yoyo: true, duration: 0.6, ease: 'sine.inOut', delay: 0.8 });
    } else $$('.hero__threat, .hero__down').forEach((e) => (e.style.opacity = 1));
    big && big.mood('smug', 2600);
    WH.unlock();
    WH.buddy.hide(false);
    setTimeout(() => WH.buddy.say(D.told ? WH.line('told') : D.known ? `that was me, by the way. hi, ${D.first}. nice “${D.computer}”.` : 'that was me, by the way. hi.', 'laugh', 2800), 3400);
  };

  $('.hero__go').addEventListener('click', scan);
  addEventListener('wh:ready', () => {
    WH.buddy.hide(true);
    if (G) {
      gsap.from('.hl > span', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.09 });
      gsap.from('.hero__bar > span', { opacity: 0, y: -8, duration: 0.5, stagger: 0.06, delay: 0.2 });
      gsap.from('.hero__side > *', { opacity: 0, y: 24, duration: 0.8, ease: 'expo.out', stagger: 0.08, delay: 0.35 });
    }
    /* nobody escapes the scan: it starts by itself, or when you try to scroll past */
    const auto = setTimeout(scan, D.visits > 1 ? 3800 : 6500);
    const early = (e) => { if (!scanned && !scanning && (e.deltaY > 0 || e.type === 'touchmove')) { clearTimeout(auto); scan(); } };
    addEventListener('wheel', early, { passive: true });
    addEventListener('touchmove', early, { passive: true });
    later();
  });

  /* ═══════════════ everything below is created after the hero, in page order ═══════════════ */
  function later() {
    if (!window.ScrollTrigger) return;
    know();
    eyes();
    fine();
    scared();
    files();
    over();
    ScrollTrigger.refresh();
  }

  /* ═══════════════ 02 · know ═══════════════ */
  function know() {
    const list = $('.know__list');
    const cat = cats.know, say = $('.know__say');
    const late = D.hour() < 5;
    const F = [
      { t: ['your', { b: 3 }, 'name is', { v: () => (D.known ? D.full : 'still a secret') }, { b: 5 }], s: D.told || D.kept ? 'you typed it yourself. adorable.' : D.known ? 'pretty name. i’ll keep it. i already have.' : 'no name? fine. i’ll call you “' + D.device + '”.', m: 'smug' },
      { t: ['you call this machine', { v: () => '“' + D.computer + '”' }, { b: 2 }], s: 'cute. it calls you something else.', m: 'laugh' },
      { t: ['it runs', { v: () => D.os }, { b: 2 }, 'on', { v: () => D.browser }, { b: 4 }], s: 'safe choice. not safe enough.', m: 'smug' },
      { t: ['the graphics chip is', { v: () => D.gpuLine }, { b: 3 }], s: 'nice chip. i’m drawing myself with it right now.', m: 'idle' },
      { t: ['you have', { v: () => (D.cores || 'some') + ' cores' }, { b: 3 }, 'and you’re using', { v: () => 'none of them' }, 'for anything good'], s: 'i’m using six.', m: 'laugh' },
      D.battery != null
        ? { t: ['your battery is at', { v: () => D.battery + '%' }, { b: 2 }, { v: () => (D.charging ? 'and charging.' : 'and not charging.') }], s: D.charging ? 'plugged in. good. we have time.' : 'hurry.', m: D.charging ? 'smug' : 'stare' }
        : { t: ['your screen is', { v: () => D.w + '×' + D.h }, { b: 3 }, 'i can see all of it'], s: 'every pixel. even the dead one.', m: 'stare' },
      { t: ['it’s', { v: () => D.time() }, { b: 2 }, 'in', { v: () => D.city }, { b: 4 }], s: late ? 'shouldn’t you be asleep?' : 'nice weather there. i checked.', m: late ? 'sad' : 'idle' },
      { t: ['you’ve been here', { v: () => D.secs() + ' seconds' }, { b: 2 }, 'visit number', { v: () => D.visits }], s: D.visits > 1 ? 'you keep coming back. i like that.' : 'first time? it won’t be the last.', m: 'smug' },
      { t: ['you like', { v: () => (D.dark ? 'dark mode' : 'light mode') }, { b: 3 }, D.dark ? 'like something hiding' : 'brave. everything shows.'], s: 'mm-hm.', m: 'idle' },
      { t: ['and you’re reading this', { v: () => 'alone' }, { b: 4 }, { v: () => 'right?', hot: 1 }], s: 'right?', m: 'stare', ghost: 1 }
    ];
    list.innerHTML = F.map((f) => '<li>' + f.t.map((x) => {
      if (typeof x === 'string') return `<span>${esc(x)}</span>`;
      if (x.b) return `<i class="bar" style="width:${x.b * 0.9 + Math.random() * 1.2}em;--r:${(Math.random() - 0.5) * 2}deg"></i>`;
      return `<span class="rd${x.hot ? ' is-hot' : ''}"><span></span></span>`;
    }).join('') + '</li>').join('');
    const lis = $$('li', list);
    $('.know__of').textContent = WH.pad(F.length);
    let shown = -1;
    const reveal = (i) => {
      const f = F[i], li = lis[i];
      $$('.rd > span', li).forEach((s, k) => { s.textContent = f.t.filter((x) => x && x.v)[k].v(); });
      cat.mood(f.m);
      WH.type(say, f.s, { cat, speed: 26 });
      $('.know__i').textContent = WH.pad(i + 1);
      if (f.ghost) { WH.ghost(true); setTimeout(() => WH.ghost(false), 5200); }
    };
    const N = F.length;
    const endRd = $('.rd--t');

    /* the title bar can be peeled. every peel says something worse about you.
       the fifth time, the whole page goes under the marker. */
    const endTxt = $('span', endRd);
    const PEEL = [
      () => 'that it’s polite.',
      () => (D.known ? `that it knows your name, ${D.first}.` : 'that it doesn’t need your name.'),
      () => `that it’s ${D.time()} and you’re still here.`,
      () => `that “${D.computer}” told me everything.`,
      () => (D.battery != null ? `that you have ${D.battery}% left. of battery.` : `that you’re in ${D.city}. i checked.`),
      () => 'that you clicked. obviously.',
      () => (D.visits > 1 ? `that this is visit ${D.visits}.` : 'that you’ll come back.')
    ];
    let peels = 0, peelT = 0, busy = false;
    endRd.dataset.cursor = 'peel it';
    endRd.addEventListener('click', async () => {
      if (busy) return;
      peels++;
      WH.note('peel');
      clearTimeout(peelT);
      if (peels % 5 === 0) {
        WH.note('censor');
        busy = true;
        endRd.classList.remove('is-peek');
        endTxt.textContent = PEEL[0]();
        WH.tear(420);
        document.documentElement.classList.add('is-censored');
        cat.mood('laugh');
        await wait(900);
        await WH.pop(D.known ? `curious, ${D.first}? that’s exactly how i got in.` : 'curious? that’s exactly how i got in.', { mood: 'laugh', ms: 1700 });
        document.documentElement.classList.remove('is-censored');
        WH.flash();
        busy = false;
        return;
      }
      endTxt.textContent = PEEL[peels % PEEL.length]();
      endRd.classList.add('is-peek');
      cat.mood(peels % 3 ? 'smug' : 'stare', 1600);
      WH.type(say, WH.pick(['don’t pick at it.', 'it was censored for your own good.', 'stop peeling. it’s rude.', 'you really want to know?', 'every time you click, i learn something too.']), { cat, speed: 24 });
      if (G) gsap.fromTo(endTxt, { skewX: -14, x: -6 }, { skewX: 0, x: 0, duration: 0.5, ease: 'expo.out' });
      peelT = setTimeout(() => { endRd.classList.remove('is-peek'); peelT = setTimeout(() => (endTxt.textContent = PEEL[0]()), 480); }, 2200);
    });

    /* clicking an answer early */
    list.addEventListener('click', (e) => {
      const r = e.target.closest('.rd'), li = r && r.closest('li');
      if (!li) return;
      const i = lis.indexOf(li);
      if (i > shown) {
        li.classList.remove('is-nope'); void li.offsetWidth; li.classList.add('is-nope');
        cat.mood('angry', 1200);
        WH.type(say, D.known ? `no spoilers, ${D.first}. wait your turn.` : 'no spoilers. wait your turn.', { cat, speed: 24 });
      } else {
        cat.mood('smug', 1200);
        WH.type(say, WH.pick(['yes. that one is true.', 'want me to say it louder?', 'i can make it bigger if you like.']), { cat, speed: 24 });
      }
    });
    /* every value is under its bar from the start; reveal() refreshes the live ones */
    lis.forEach((li, i) => $$('.rd > span', li).forEach((s, k) => { s.textContent = F[i].t.filter((x) => x && x.v)[k].v(); }));
    /* the buddy steps aside while the dossier is open */
    ScrollTrigger.create({ trigger: '.know', start: 'top 60%', end: () => '+=' + (N * 0.52 * innerHeight + innerHeight * 0.9), onToggle: (s) => scanned && WH.buddy.hide(s.isActive) });
    ScrollTrigger.create({
      trigger: '.know', start: 'top top', end: '+=' + N * 52 + '%', pin: '.know__pin', scrub: true,
      onUpdate(self) {
        const n = self.progress * (N + 1.2);
        lis.forEach((li, i) => {
          const on = n > i + 0.15;
          li.classList.toggle('is-on', on);
          $$('.rd', li).forEach((r, k) => r.style.setProperty('--k', Math.max(0, Math.min(1, 1 - (n - i - 0.3 - k * 0.12) * 2.2))));
        });
        const cur = Math.min(N - 1, Math.floor(n - 0.15));
        if (cur !== shown && cur >= 0) { shown = cur; reveal(cur); }
        endRd.style.setProperty('--k', Math.max(0, Math.min(1, 1 - (n - N) * 3)));
      }
    });
  }

  /* ═══════════════ 03 · eyes ═══════════════ */
  function eyes() {
    const cat = cats.eyes;
    if (G) {
      gsap.from('.eyes__t span', { yPercent: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.eyes', start: 'top 70%' } });
      gsap.from('.eyes__num span', { xPercent: (i) => (i ? 20 : -20), opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.eyes__num', start: 'top 90%' } });
    }
    ScrollTrigger.create({
      trigger: '.eyes__cat', start: 'top 75%', once: true,
      onEnter: () => { cat.mood('sleep'); setTimeout(() => { cat.mood('wide').glitch(400); WH.shake(8, 0.25); }, 700); setTimeout(() => cat.mood('idle'), 2000); }
    });
    $('.eyes__num').addEventListener('pointerenter', () => { cat.mood('angry', 1600); });
    $('.eyes__cat').addEventListener('click', () => { cat.mood('laugh', 1400); WH.buddy.say('they’re just eyes. relax.', 'smug', 2000); });
  }

  /* ═══════════════ 04 · everything is fine ═══════════════ */
  function fine() {
    const sec = $('.fine'), cards = $$('.card', sec), foot = $('.fine__foot');
    let done = false;
    const run = async () => {
      if (done) return;
      done = true;
      WH.to(sec, { duration: 0.7, offset: 0 });
      await wait(700);
      WH.lock();
      WH.buddy.hide(true);
      for (const [i, c] of cards.entries()) {
        await wait(i === 5 ? 700 : 340);
        c.classList.add('is-bad');
        $('.card__ok', c).textContent = '✗';
        WH.rot(c, 0.28);
        G && gsap.fromTo(c, { x: -8 }, { x: 0, duration: 0.3, ease: 'elastic.out(1, .3)' });
        foot.textContent = `${5 - i}/6 modules ok · ${i < 3 ? 'this is normal' : i < 5 ? 'this is fine' : 'you are not alone'}`;
        if (i === 5) WH.ghost(true);
      }
      await wait(600);
      const ans = await WH.dialog({ title: 'whoami', icon: '◉', text: 'WHOAMI would like to access your camera.<br><small>it already has, but it likes to ask.</small>', buttons: ['allow', 'allow'], auto: 3600 });
      await WH.tear(650);
      await WH.panic(2300);
      sec.classList.add('is-broken', 'on-pink');
      const word = $('.fine__t span:last-child');
      word.textContent = 'is mine.';
      WH.heal(sec);
      cards.forEach((c) => WH.rot(c, 0.08));
      if (G) cards.forEach((c, i) => gsap.to(c, { rotation: (Math.random() - 0.5) * 14, x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.3) * 50, duration: 0.8, ease: 'expo.out', delay: i * 0.04 }));
      foot.textContent = '0/6 modules ok · 1/1 cat ok';
      WH.unlock();
      await WH.pop(ans === -1 ? 'you didn’t even click. i allowed it for you.' : 'you clicked allow. you’d click anything, {first}.', { mood: 'laugh', ms: 2200 });
      setTimeout(() => WH.ghost(false), 3000);
    };
    ScrollTrigger.create({ trigger: sec, start: 'top 12%', once: true, onEnter: run });
  }

  /* ═══════════════ 05 · don't be scared of the CAT ═══════════════ */
  function scared() {
    const stage = $('.scared__stage'), cv = $('.scared__cv'), x = cv.getContext('2d');
    const cat = cats.scared;
    let W = 0, H = 0, rows = [], mxl = -9999, myl = -9999, kick = 0, vis = false, dpr = Math.min(2, devicePixelRatio || 1);
    const build = () => {
      const r = stage.getBoundingClientRect();
      W = Math.round(r.width); H = Math.round(r.height);
      cv.width = W * dpr; cv.height = H * dpr;
      const m = document.createElement('canvas');
      m.width = W; m.height = H;
      const mx = m.getContext('2d');
      mx.fillStyle = '#000';
      mx.font = `900 ${H * 1.12}px Archivo`;
      const tw = mx.measureText('CAT').width;
      mx.save();
      mx.scale(W / tw, 1);
      mx.textBaseline = 'alphabetic';
      mx.fillText('CAT', 0, H * 0.95);
      mx.restore();
      const d = mx.getImageData(0, 0, W, H).data;
      rows = [];
      const step = Math.max(7, Math.round(H / 62)), th = Math.max(3, Math.round(step * 0.55));
      for (let y = 0; y < H; y += step) {
        const runs = [];
        let s = -1;
        for (let xx = 0; xx <= W; xx++) {
          const on = xx < W && d[(y * W + xx) * 4 + 3] > 120;
          if (on && s < 0) s = xx;
          if (!on && s >= 0) { runs.push([s, xx]); s = -1; }
        }
        if (runs.length) rows.push({ y, th, runs });
      }
    };
    const draw = (t) => {
      if (vis) {
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.clearRect(0, 0, W, H);
        x.fillStyle = '#ff1f9b';
        kick *= 0.94;
        for (const r of rows) {
          const dy = r.y - myl;
          const near = Math.exp(-(dy * dy) / 9000);
          const off = Math.sin(r.y * 0.045 + t / 420) * (4 + kick * 40) + near * Math.sin(t / 60 + r.y) * 22;
          for (const [a, b] of r.runs) {
            const near2 = Math.exp(-(((a + b) / 2 - mxl) ** 2) / 40000) * near;
            const L = a + off * (1 + near2 * 2), w = Math.max(2, b - a - near2 * 14);
            /* some runs crumble into dashes, like a bad print */
            if ((b - a) > 60 && ((r.y * 13 + a) % 7) < 2) {
              for (let k = L; k < L + w; k += 14) { x.beginPath(); x.roundRect(k, r.y, 9, r.th, r.th / 2); x.fill(); }
            } else { x.beginPath(); x.roundRect(L, r.y, w, r.th, r.th / 2); x.fill(); }
          }
        }
      }
      requestAnimationFrame(draw);
    };
    const go = () => { build(); requestAnimationFrame(draw); };
    (document.fonts && document.fonts.load ? document.fonts.load('900 100px Archivo').then(go, go) : go());
    addEventListener('resize', () => { clearTimeout(go.t); go.t = setTimeout(build, 200); });
    new IntersectionObserver((es) => (vis = es[0].isIntersecting)).observe(stage);
    stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); mxl = e.clientX - r.left; myl = e.clientY - r.top; });
    stage.addEventListener('pointerleave', () => { mxl = myl = -9999; });
    stage.addEventListener('click', () => { kick = 1; cat.mood('angry', 1300); WH.shake(10, 0.3); WH.buddy.say(WH.pick(['i said don’t be scared. not “touch me”.', 'hiss.', 'pet me again and see what happens.']), 'angry', 2000); });
    const moods = { purr: 'smug', hiss: 'angry', bite: 'angry', run: 'wide' };
    $$('.scared__row li').forEach((li) => li.addEventListener('pointerenter', () => { cat.mood(moods[li.textContent.trim()] || 'idle', 1400); if (li.textContent.trim() === 'run') kick = 0.6; }));
    if (G) {
      gsap.from('.scared__t span', { xPercent: (i) => (i ? 30 : -30), opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.scared', start: 'top 70%' } });
      gsap.fromTo('.scared__cat', { yPercent: 100 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.scared__stage', start: 'top 80%', end: 'center 45%', scrub: true } });
      ScrollTrigger.create({ trigger: '.scared__stage', start: 'center 45%', once: true, onEnter: () => { cat.mood('laugh', 1200); kick = 1; } });
    }
  }

  /* ═══════════════ 06 · perhaps you need a backup? ═══════════════ */
  function files() {
    const out = $('.term__out'), bar = $('.term__bar2 i'), stop = $('.term__stop'), thumbs = $$('.term__thumbs .slot');
    let running = false, dodges = 0, stopped = false;
    const home = '/Users/' + (D.user || 'guest');
    const F = ['Desktop/tesi_finale_v7_DEFINITIVA_ok.docx', 'Pictures/IMG_4031.HEIC', 'Pictures/IMG_4032.HEIC', 'Documents/taxes_2025.pdf', 'Pictures/IMG_4033.HEIC', 'Desktop/Screenshot 2026-11-19 at 03.12.44.png', 'Documents/passwords (not passwords).txt', 'Music/songs to cry to.m3u', 'Downloads/cv_2026_final_FINAL(2).pdf', 'Desktop/untitled folder 7/', 'Documents/diary.txt', 'Library/Messages/chat.db', 'Pictures/Photos Library.photoslibrary', '.ssh/id_ed25519'];
    const add = (h) => { out.innerHTML += (out.innerHTML ? '\n' : '') + h; out.scrollTop = out.scrollHeight; };
    const run = async () => {
      if (running) return;
      running = true;
      await WH.who;
      out.innerHTML = '';
      add(`<i>${esc(D.prompt)}</i> sudo rm -rf ${esc(home)}/*`);
      await wait(700);
      add('Password: ********* <em>(thanks. it was the cat’s name.)</em>');
      await wait(800);
      for (const [i, f] of F.entries()) {
        add(`<s>removed</s> '~/${esc(f)}'`);
        bar.style.width = ((i + 1) / F.length) * 100 + '%';
        const m = f.match(/IMG_403(\d)/);
        if (m) thumbs[+m[1] - 1] && thumbs[+m[1] - 1].classList.add('is-gone');
        if (i === 6) WH.buddy.say('oops.', 'laugh', 1400);
        await wait(stopped ? 160 : 420 + Math.random() * 260);
      }
      add('\n<b>0 files left.</b> 41.2 gb free. you’re welcome.');
      await wait(2200);
      add('restoring from /dev/cat ................ <em>done</em>');
      thumbs.forEach((t) => t.classList.remove('is-gone'));
      bar.style.width = '0%';
      WH.pop('relax. i don’t want your files. your photos are blurry.', { mood: 'laugh', ms: 2000 });
    };
    /* the stop button runs away */
    stop.addEventListener('pointerenter', () => {
      if (dodges >= 4 || !G) return;
      dodges++;
      const foot = stop.parentElement.getBoundingClientRect();
      gsap.to(stop, { x: -(Math.random() * (foot.width - 160)), y: (Math.random() - 0.5) * 70, rotation: (Math.random() - 0.5) * 20, duration: 0.25, ease: 'power3.out' });
      if (dodges === 2) WH.buddy.say('too slow.', 'laugh', 1200);
    });
    stop.addEventListener('click', () => {
      stopped = true;
      G && gsap.to(stop, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1, .4)' });
      stop.textContent = 'stopping…';
      WH.buddy.say('stop? stopping is for people with backups.', 'smug', 2400);
      setTimeout(() => (stop.textContent = 'stop'), 1600);
    });
    ScrollTrigger.create({ trigger: '.term', start: 'top 70%', once: true, onEnter: run });
    ScrollTrigger.create({ trigger: '.files', start: 'top 40%', end: 'bottom 60%', onToggle: (s) => WH.buddy.hide(s.isActive) });
    if (G) gsap.from('.files__t > span', { yPercent: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.files', start: 'top 70%' } });
  }

  /* ═══════════════ 07 · game over ═══════════════ */
  function over() {
    const n = $('.over__n'), hearts = $('.over__hearts'), sub = $('.over__sub'), cat = cats.over;
    let t = 0, left = 9, stopped = false;
    const tick = () => {
      if (stopped) return;
      left--;
      n.textContent = left;
      hearts.textContent = '♥'.repeat(left) + '♡'.repeat(9 - left);
      if (left <= 0) {
        stopped = true;
        sub.innerHTML = WH.t('that was all nine, {first}.<br>i’m keeping them.');
        cat.mood('laugh', 2000);
        return;
      }
      t = setTimeout(tick, 1000);
    };
    ScrollTrigger.create({ trigger: '.crt', start: 'top 60%', once: true, onEnter: () => { t = setTimeout(tick, 1000); } });
    $('.over__yes').addEventListener('click', async () => {
      clearTimeout(t); stopped = true;
      await WH.tear(500);
      WH.to(0, { duration: 2.4 });
      setTimeout(() => WH.pop('again? ok. i’ll be faster this time.', { mood: 'smug', ms: 1600 }), 2400);
    });
    $('.over__no').addEventListener('click', () => {
      clearTimeout(t); stopped = true;
      hearts.textContent = '♡♡♡♡♡♡♡♡♡';
      n.textContent = '0';
      sub.innerHTML = WH.t('nobody gives up on me, {first}.<br>not even you.');
      cat.mood('laugh', 1800);
      WH.shake(10, 0.3);
    });
  }

  WH.who.then(() => WH.fill());
})();
