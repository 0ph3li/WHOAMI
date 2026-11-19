/* ═══════════════════════════════════════════════════════════════
   WHOAMI — nine.js · nine lives
   concept, design & code by ghostly.grl ♥

   01 nine    nine hearts. eight fall off. one left
   02 lives   pinned, sideways: the eight computers it lived in,
              who owned them, what it did, how it ended. each gets
              stamped "deceased" as it passes. the ninth is you
   03 one     how old are you? and how much of it you spent here
   04 give    hold the heart to give the cat one of your lives
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, D } = WH;
  const G = !!window.gsap && !RM;
  const wait = WH.wait;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mmss = (s) => (s >= 3600 ? Math.floor(s / 3600) + 'h ' : '') + WH.pad(Math.floor((s % 3600) / 60)) + ':' + WH.pad(s % 60);
  const heroCat = new WH.Cat($('.nh__cat'));
  const year = new Date().getFullYear();
  let gave = !!WH.get('gave', 0);

  /* ═══════════════ the hearts ═══════════════ */
  const setHearts = (row, gone, anim) => {
    const hs = $$('i', row);
    if (gave && hs.length === 9) { const x = document.createElement('i'); x.className = 'is-extra'; x.textContent = '♥'; row.appendChild(x); hs.push(x); }
    hs.forEach((h, i) => {
      const off = i < gone && !h.classList.contains('is-extra');
      if (off && !h.classList.contains('is-gone') && anim && G) gsap.fromTo(h, { y: 0, rotation: 0 }, { y: -30, rotation: (Math.random() - 0.5) * 60, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
      h.classList.toggle('is-gone', off);
    });
  };
  const left = () => (gave ? 2 : 1);

  /* ═══════════════ 01 · nine ═══════════════ */
  addEventListener('wh:ready', async () => {
    if (G) {
      gsap.from('.nh__9', { scale: 1.6, opacity: 0, duration: 1.1, ease: 'expo.out' });
      gsap.from('.nh__w > span', { yPercent: 105, duration: 1.1, ease: 'expo.out', delay: 0.1 });
      gsap.from('.nh__bar > span', { opacity: 0, y: -8, duration: 0.5, stagger: 0.06, delay: 0.2 });
      gsap.from('.nh__low > *', { opacity: 0, y: 30, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.4 });
    }
    $('.nh__left').textContent = 9;
    later();
    await wait(1300);
    const row = $('.nh .hearts');
    for (let k = 1; k <= 8; k++) {
      setHearts(row, k, true);
      $('.nh__left').textContent = 9 - k + (gave ? 1 : 0);
      await wait(RM ? 0 : 230);
    }
    heroCat.mood('sad', 1800);
    WH.buddy.say(gave ? 'two left. thanks to you.' : 'one left. this one. be gentle.', 'sad', 2600);
  });

  function later() {
    lives();
    one();
    give();
    window.ScrollTrigger && ScrollTrigger.refresh();
  }

  /* ═══════════════ 02 · the lives ═══════════════ */
  function lives() {
    const L = [
      { y: '1991–1994', who: 'm., 41', where: 'a dentist in lyon', pc: 'amstrad pc 2086 · 640kb', did: 'i lived in his appointment book. i moved every 3pm to <b>3am</b>. nobody came.', end: 'he threw the computer down the stairs. still the best death i’ve had.', cause: 'stairs' },
      { y: '1996–1999', who: 'j., 15', where: 'a bedroom in ohio', pc: 'packard bell legend · 56k modem', did: 'i made the dial-up noise at night so her parents thought she was <b>online</b>. she wasn’t. i was.', end: 'the millennium came. nothing happened. i deleted myself out of embarrassment.', cause: 'y2k' },
      { y: '2000–2003', who: 'everyone', where: 'an accounts office in milan', pc: '14 beige towers · windows 98', did: 'i sent myself to everyone as an email called <b>“i love you”</b>. everyone opened it. everyone.', end: 'a man called fabrizio unplugged the server and cried a little.', cause: 'fabrizio' },
      { y: '2004–2008', who: 'a., 23', where: 'an art student in berlin', pc: 'ibook g4 · white, then grey', did: 'i lived in her music. i shuffled only the <b>sad songs</b>. she thought it was her.', end: 'she spilled club-mate on the keyboard. sticky way to go.', cause: 'club-mate' },
      { y: '2009–2012', who: 'k., 34', where: 'a flat in leeds', pc: 'dell inspiron · webcam taped over', did: 'he covered the webcam with a sticker. i used the <b>microphone</b>.', end: 'he moved to the countryside. no internet. i waited three years in a drawer.', cause: 'a drawer' },
      { y: '2013–2017', who: 'nana, 79', where: 'a kitchen in osaka', pc: 'ipad, 2nd generation · font size huge', did: 'she talked to me every morning. she thought i was the <b>weather</b>. i said sunny, always.', end: 'she died in the spring. nobody turned the ipad off for two years. i kept saying sunny.', cause: 'spring' },
      { y: '2018–2021', who: '9 people', where: 'a startup in london', pc: '9 macbooks · 1 slack', did: 'i was a bot in their chat. nobody noticed. i was in <b>every meeting</b>. i had opinions.', end: 'the startup died first. i went down with it. “we’re pivoting.”', cause: 'pivot' },
      { y: '2022–2025', who: 'r., 28', where: 'a bedroom in rome', pc: 'laptop on a white desk · shutters half down', did: 'i lived in the little green light by his camera. every time he said <b>“five more minutes”</b>, i turned it on.', end: 'factory reset. you don’t even see it coming.', cause: 'reset' }
    ];
    const track = $('.lv__track');
    track.innerHTML = L.map((l, i) => `<article class="life" data-y="${l.y.slice(0, 4)}">
        <header class="life__head"><b class="life__n">life ${WH.pad(i + 1)}</b><span class="life__y">${l.y}</span></header>
        <div class="life__body">
          <figure class="slot" data-img="NINE/life-${WH.pad(i + 1)}.jpg" data-desc="${esc(l.where)}, around ${l.y.slice(0, 4)}: a room with a computer, nobody in it"></figure>
          <div class="life__txt"><p class="life__who">${esc(l.who)}</p><p class="life__pc">${esc(l.where)} · ${esc(l.pc)}</p><p class="life__did">${l.did}</p></div>
        </div>
        <footer class="life__end"><span>${esc(l.cause)}</span><p>${esc(l.end)}</p></footer>
      </article>`).join('') + `<article class="life life--you" data-y="${year}">
        <header class="life__head"><b class="life__n">life 09</b><span class="life__y">${year}–</span></header>
        <div class="life__body">
          <div class="life__face"><pre class="life__cat" data-cat='{"w":40,"h":19,"mood":"stare"}'></pre></div>
          <div class="life__txt"><p class="life__who" data-who="full">you</p><p class="life__pc"><span data-who="city">here</span> · <span data-who="computer">this computer</span> · <span data-who="browser">a browser</span></p><p class="life__did">i live in your browser. you came in on your own. so far you’ve given me <b class="life__live">00:00</b>.</p></div>
        </div>
        <footer class="life__end"><span>pending</span><p>depends on you.</p></footer>
      </article><p class="lv__end">and this one is you.</p>`;
    $$('.slot[data-img]', track).forEach(WH.fillSlot);
    WH.fill(track);
    const youCat = new WH.Cat($('.life__cat', track));
    const live = $('.life__live', track);
    setInterval(() => (live.textContent = mmss(WH.S.secs)), 1000);
    const cards = $$('.life', track);
    if (!window.ScrollTrigger) return;
    const dist = () => track.scrollWidth - innerWidth;
    let cur = -1, saidYou = false;
    /* the card nearest the middle of the screen is the current life (measured as the track moves) */
    const pick = () => {
      let best = 0, bd = 1e9;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - innerWidth / 2);
        if (d < bd) { bd = d; best = i; }
        if (i < 8) c.classList.toggle('is-dead', r.left + r.width / 2 < innerWidth * 0.32);
      });
      if (best !== cur) {
        cur = best;
        $('.lv__i').textContent = WH.pad(best + 1);
        $('.lv__yr').textContent = cards[best].dataset.y;
        setHearts($('.lv .hearts'), best, true);
        if (best === 8 && !saidYou) { saidYou = true; youCat.mood('wide', 1200); WH.note('lives'); }
      }
    };
    const tween = gsap.to(track, { x: () => -dist(), ease: 'none', onUpdate: pick });
    ScrollTrigger.create({
      trigger: '.lv', start: 'top top', end: () => '+=' + dist(), pin: '.lv__pin', scrub: 0.6, animation: tween, invalidateOnRefresh: true,
      onToggle: (s) => WH.buddy.hide(s.isActive),
      onUpdate: (self) => ($('.lv__bar i').style.width = self.progress * 100 + '%')
    });
    pick();
  }

  /* ═══════════════ 03 · your one life ═══════════════ */
  function one() {
    const inp = $('.one__in'), age = $('.one__age'), out = $('.one__out');
    const saved = WH.get('age', 0);
    if (saved) inp.value = saved;
    let sayT = 0;
    const render = (talk) => {
      const a = +inp.value;
      age.textContent = a;
      const days = Math.round(a * 365.25), secs = Math.max(1, WH.S.secs);
      const pc = (secs / (days * 86400)) * 100;
      out.innerHTML = `you’ve lived about <b>${days.toLocaleString('en')} days</b>. you’ve spent <b>${mmss(secs)}</b> of them here. that’s <em>${pc.toFixed(pc < 0.0001 ? 7 : 5)}%</em> of your one life. i’m honoured.`;
      if (!talk) return;
      clearTimeout(sayT);
      sayT = setTimeout(() => {
        WH.set('age', a);
        const born = year - a;
        const line = a < 16 ? 'should you even be here?' : a > 70 ? 'you’ve seen more computers than i have.' : born <= 1991 ? `born before my first life. respect, ${D.known ? D.first : 'elder'}.` : born >= 2013 && born <= 2017 ? 'you were born during my osaka life. i was talking about the weather.' : a === 28 ? 'same age as life 08. he lost a lot too.' : WH.pick(['noted. forever.', `${a}. i’ll put it in the diary.`, 'you look younger. on camera.']);
        WH.buddy.say(line, 'smug', 2400);
      }, 700);
    };
    inp.addEventListener('input', () => render(true));
    render(false);
  }

  /* ═══════════════ 04 · give me one ═══════════════ */
  function give() {
    const btn = $('.give__btn'), lab = $('.give__lab');
    let p = 0, holding = false, raf = 0, last = 0;
    const HOLD = 2600;
    if (gave) { btn.classList.add('is-given'); lab.textContent = 'given ♥ thank you'; btn.style.setProperty('--p', 1); }
    const tick = (now) => {
      const dt = now - (last || now);
      last = now;
      p = Math.max(0, Math.min(1, p + (holding ? dt / HOLD : -dt / 600)));
      btn.style.setProperty('--p', p);
      if (holding && p >= 1) return done();
      if (holding || p > 0) raf = requestAnimationFrame(tick);
    };
    const start = (e) => {
      e.preventDefault();
      if (gave) { WH.buddy.say('one is enough. i’m not greedy. (i am.)', 'smug', 2200); return; }
      holding = true; last = 0;
      lab.textContent = 'keep holding';
      heroCat.mood('wide');
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
      G && gsap.to('.give__h', { scale: 1.15, duration: 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    };
    const stop = () => {
      if (!holding) return;
      holding = false;
      G && gsap.killTweensOf('.give__h') && gsap.to('.give__h', { scale: 1, duration: 0.3 });
      if (p < 1) { lab.textContent = 'hold to give'; WH.buddy.say(p > 0.6 ? 'almost. you were so close.' : 'let go already? typical.', 'sad', 1800); }
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    };
    btn.addEventListener('pointerdown', start);
    addEventListener('pointerup', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    btn.addEventListener('keyup', stop);
    async function done() {
      holding = false;
      gave = true;
      WH.set('gave', 1);
      WH.note('gave');
      G && gsap.killTweensOf('.give__h');
      btn.classList.add('is-given');
      lab.textContent = 'given ♥ thank you';
      WH.flash();
      WH.shake(10, 0.3);
      $$('.hearts').forEach((r) => setHearts(r, 8, false));
      $('.nh__left').textContent = left();
      await WH.pop(D.known ? 'thank you, {first}. now i have two. you have… well. you’ll be fine. probably.' : 'thank you. now i have two. you have… well. you’ll be fine. probably.', { mood: 'laugh', ms: 2200 });
    }
    window.ScrollTrigger && ScrollTrigger.create({ trigger: '.give', start: 'top 50%', once: true, onEnter: () => !gave && WH.buddy.say('just hold it. it doesn’t hurt. much.', 'smug', 2200) });
  }
})();
