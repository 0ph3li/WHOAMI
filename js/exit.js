/* ═══════════════════════════════════════════════════════════════
   WHOAMI — exit.js · try to leave
   concept, design & code by ghostly.grl ♥

   00 exit      a pink exit sign that flickers
   01 close     "leave site?" — the leave button swaps places
                with stay every time you go near it
   02 log out   logging out… there is no user. only cat.exe
   03 uninstall a wizard asks why you're leaving, removes
                everything, then reinstalls it
   04 unplug    drag the plug out: the screen goes black, and
                in the dark two eyes and your real battery level
   05 goodbye   the real exit. the cat says goodbye with all it
                kept, and you're logged out. for real
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, D, FINE } = WH;
  const G = !!window.gsap && !RM;
  const wait = WH.wait;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const name = () => (D.known ? D.first : 'you');
  const tried = new Set();
  let leaving = false;
  const mark = (k, door) => {
    tried.add(k);
    WH.note(k);
    $('.xh__n').textContent = tried.size;
    door && door.classList.add('is-tried');
  };
  /* the real browser asks too, once you've tried a door. not after goodbye. */
  addEventListener('beforeunload', (e) => { if (tried.size && !leaving) { e.preventDefault(); e.returnValue = ''; } });

  addEventListener('wh:ready', () => {
    if (G) {
      gsap.from('.sign', { scale: 0.7, opacity: 0, duration: 1.2, ease: 'expo.out' });
      gsap.from('.xh__bar > span', { opacity: 0, y: -8, duration: 0.5, stagger: 0.06, delay: 0.2 });
      gsap.from('.xh__low > *', { opacity: 0, y: 30, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.4 });
      gsap.to('.xh__down', { y: 6, repeat: -1, yoyo: true, duration: 0.6, ease: 'sine.inOut', delay: 1.2 });
      $$('.door__head').forEach((h) => gsap.from(h.children, { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: h, start: 'top 75%' } }));
    }
    setTimeout(() => WH.buddy.say(D.known ? 'leaving already, {first}? go on. try.' : 'leaving already? go on. try.', 'smug', 2600), 1400);
    door1(); door2(); door3(); door4(); door5();
    window.ScrollTrigger && ScrollTrigger.refresh();
  });

  /* ═══════════════ 01 · close the tab ═══════════════ */
  function door1() {
    const sec = $('.door--1'), box = $('.leave'), btns = $('.leave__btns');
    let swaps = 0;
    const swap = () => {
      const [a, b] = $$('.leave__b', btns);
      btns.insertBefore(b, a);
      swaps++;
    };
    $('.d1__go').addEventListener('click', () => {
      box.hidden = false;
      G && gsap.from('.leave__box', { scale: 0.9, opacity: 0, duration: 0.25, ease: 'back.out(2)' });
    });
    const go = $('.leave__b--go');
    /* on a mouse it runs; on a finger it changes its mind */
    go.addEventListener('pointerenter', () => { if (FINE) swap(); });
    go.addEventListener('click', async () => {
      go.textContent = 'Stay';
      await wait(300);
      done(true);
      go.textContent = 'Leave';
    });
    $('.leave__b--stay').addEventListener('click', () => done(false));
    const done = (tricked) => {
      box.hidden = true;
      mark('door-close', sec);
      WH.buddy.say(tricked ? 'it said stay. you read it wrong. classic.' : swaps > 2 ? `you chased that button ${swaps} times. then you stayed. i knew you would.` : 'you stayed. i knew you would.', 'smug', 2800);
    };
  }

  /* ═══════════════ 02 · log out ═══════════════ */
  function door2() {
    const sec = $('.door--2'), term = $('.d2__term'), btn = $('.d2__go');
    let busy = false;
    btn.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      const user = D.user || 'guest';
      const L = [
        ['logout', 380],
        [`saving session for <em>${esc(user)}</em> ... ok`, 340],
        ['closing 9 processes ......... 8 closed', 420],
        ['<b>process 9 (cat.exe) refused to close</b>', 600],
        [`logging out <em>${esc(user)}</em> ... 99%`, 1300],
        [`<b>error: no such user “${esc(user)}”.</b>`, 500],
        ['there is no user. there is only cat.exe.', 700],
        [`you are now logged in as <b>cat.exe</b>.`, 0]
      ];
      term.innerHTML = '$ ';
      for (const [l, ms] of L) {
        term.innerHTML += l + '\n';
        if (!RM) await wait(ms);
      }
      term.innerHTML += '$ <i class="d2__cur">█</i>';
      WH.tear(400);
      /* for a while, the site watches cat.exe instead of you */
      const live = $$('.nav__live [data-who="first"], [data-who="prompt"]');
      const old = live.map((e) => e.textContent);
      live.forEach((e) => (e.textContent = e.dataset.who === 'prompt' ? 'cat.exe@' + D.host + ' ~ %' : 'cat.exe'));
      mark('logout', sec);
      WH.buddy.say('see? the nav says cat.exe now. that’s you. you’re me now.', 'laugh', 3000);
      await wait(6000);
      live.forEach((e, i) => (e.textContent = old[i]));
      WH.buddy.say(`just kidding, ${name()}. you’re back. you never left.`, 'smug', 2400);
      busy = false;
    });
  }

  /* ═══════════════ 03 · uninstall ═══════════════ */
  function door3() {
    const sec = $('.door--3'), body = $('.wiz__body'), next = $('.wiz__next'), back = $('.wiz__back'), step = $('.wiz__step');
    const REASONS = [['it knows too much', 'i only know what you gave me.'], ['the cat', 'rude.'], ['i’m scared', 'good.'], ['my mum said so', 'say hi to her from me.'], ['it’s 3am', 'it’s ' + D.time() + '. close enough.']];
    let s = 0, chosen = [];
    const show = () => {
      step.textContent = `step ${Math.min(3, s + 1)} of 3`;
      back.disabled = s > 1;
      if (s === 0) {
        body.innerHTML = `<h3>uninstall WHOAMI?</h3>this will remove WHOAMI and cat.exe from “${esc(D.computer)}”.<br><br>are you sure? (you can’t be sure. nobody is.)`;
        next.textContent = 'next →'; next.disabled = false;
      } else if (s === 1) {
        body.innerHTML = '<h3>why are you leaving?</h3>' + REASONS.map((r, i) => `<label><input type="checkbox" value="${i}"> ${r[0]}</label>`).join('');
        next.textContent = 'uninstall';
        $$('input', body).forEach((c) => c.addEventListener('change', () => {
          if (c.checked) WH.buddy.say(REASONS[+c.value][1], 'smug', 1800);
        }));
      } else if (s === 2) run();
    };
    async function run() {
      next.disabled = true; back.disabled = true;
      chosen = $$('input:checked', body).map((c) => REASONS[+c.value][0]);
      body.innerHTML = '<h3>uninstalling…</h3><div class="wiz__bar2"><i></i></div><div class="wiz__log"></div>';
      const bar = $('.wiz__bar2 i', body), log = $('.wiz__log', body);
      const F = [
        ['removing WHOAMI.app', 'ok'],
        ['removing scan history', 'ok'],
        ['removing your name', '<b>can’t. you typed it.</b>'],
        ['removing cat.exe', '<b>in use</b>'],
        ['removing cat.exe (force)', '<b>it hissed</b>'],
        ['removing your diary', '<b>it’s mine</b>'],
        ['cleaning up', 'ok']
      ];
      for (const [i, [f, r]] of F.entries()) {
        log.innerHTML = `${f} ... ${r}<br>` + log.innerHTML;
        bar.style.width = ((i + 1) / F.length) * 100 + '%';
        await wait(RM ? 0 : 520);
      }
      await wait(600);
      /* and back again */
      log.innerHTML = '<b>reinstalling WHOAMI ...</b><br>' + log.innerHTML;
      WH.tear(400);
      for (let p = 100; p >= 0; p -= 4) { bar.style.width = 100 - p + '%'; await wait(RM ? 0 : 30); }
      step.textContent = 'done';
      body.innerHTML = `<h3>WHOAMI was reinstalled.</h3>thank you for choosing WHOAMI.<br><br>${chosen.length ? `your feedback (“${esc(chosen.join('”, “'))}”) has been noted and ignored.` : 'you didn’t say why. it’s ok. nobody ever does.'}`;
      next.textContent = 'finish'; next.disabled = false;
      mark('uninstall', sec);
      WH.pop(D.known ? 'reinstalled, {first}. you’re welcome. i fixed it for you.' : 'reinstalled. you’re welcome.', { mood: 'laugh', ms: 1800 });
      s = 3;
    }
    next.addEventListener('click', () => {
      if (s === 3) { s = 0; show(); return; }
      s++;
      show();
    });
    back.addEventListener('click', () => { s = 0; show(); WH.buddy.say('cancel? i was enjoying that.', 'sad', 1800); });
    show();
  }

  /* ═══════════════ 04 · unplug ═══════════════ */
  function door4() {
    const sec = $('.door--4'), plug = $('.plug'), dark = $('.dark'), say = $('.dark__say');
    const dCat = new WH.Cat($('.dark__cat'), { w: 60, h: 28, mood: 'stare' });
    let sx = 0, id = null, x = 0, out = false;
    const set = (v) => { x = v; plug.style.transform = `translateX(${x}px)`; };
    plug.addEventListener('pointerdown', (e) => { if (out) return; id = e.pointerId; sx = e.clientX - x; plug.setPointerCapture(id); });
    plug.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      set(Math.min(0, e.clientX - sx));
      if (x < -70) { id = null; pull(); }
    });
    const up = () => { if (id == null) return; id = null; if (!out) G ? gsap.to(plug, { x: 0, duration: 0.5, ease: 'back.out(3)', onUpdate: () => (x = gsap.getProperty(plug, 'x')) }) : set(0); };
    plug.addEventListener('pointerup', up);
    plug.addEventListener('pointercancel', up);
    plug.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') pull(); });
    async function pull() {
      if (out) return;
      out = true;
      plug.classList.add('is-out');
      G ? gsap.to(plug, { x: -160, rotation: -8, duration: 0.3, ease: 'power2.out' }) : set(-160);
      await wait(250);
      /* the power is off */
      WH.lock();
      WH.buddy.hide(true);
      dark.hidden = false;
      document.documentElement.classList.add('is-dark');
      say.textContent = '';
      await wait(2200);
      dark.classList.add('is-eyes');
      dCat.mood('stare').glitch(300);
      await wait(900);
      const line = D.battery == null
        ? 'no battery reading. so you’re on a desktop. you just unplugged a lamp.'
        : D.charging
          ? `you’re still charging, ${name()}. i can tell. that was the lamp.`
          : `battery ${D.battery}%. i’ll be here for a while, ${name()}.`;
      await WH.type(say, line, { cat: dCat, speed: 34 });
      mark('unplug', sec);
    }
    $('.dark__back').addEventListener('click', () => {
      dark.hidden = true;
      dark.classList.remove('is-eyes');
      WH.unlock();
      WH.buddy.hide(false);
      out = false;
      plug.classList.remove('is-out');
      G ? gsap.to(plug, { x: 0, rotation: 0, duration: 0.6, ease: 'back.out(2)' }) : set(0);
      x = 0;
      WH.flash();
      WH.buddy.say('welcome back to the light.', 'smug', 2000);
    });
  }

  /* ═══════════════ 05 · goodbye (this one works) ═══════════════ */
  function door5() {
    const sec = $('.door--5'), txt = $('.bye__txt');
    const bCat = new WH.Cat($('.bye__cat'));
    const ev = new Set(WH.H.flatMap((h) => h.e));
    const kept = [
      D.known ? 'your name' : null,
      D.visits > 1 ? `your ${D.visits} visits` : 'your first visit',
      WH.S.px > 190 ? `${WH.meters(WH.S.px)} metres of your mouse` : null,
      ev.has('face') ? '<em>your face</em>' : null,
      ev.has('voice') ? 'the sound of your room' : null,
      ev.has('passwords') ? 'what you read in passwords.txt' : null,
      ev.has('gave') ? '<em>one of your lives</em>' : null,
      'everything in the diary'
    ].filter(Boolean);
    const list = kept.length > 1 ? kept.slice(0, -1).join(', ') + ' and ' + kept[kept.length - 1] : kept[0];
    const lines = [
      `bye, ${esc(name())}.`,
      `i’ll keep “${esc(D.computer)}” warm.`,
      `i’m keeping ${list}.`,
      `see you at visit ${D.visits + 1}.`
    ];
    let said = false;
    const speak = async () => {
      if (said) return;
      said = true;
      bCat.mood('sad');
      txt.innerHTML = '';
      for (const l of lines) {
        const p = document.createElement('p');
        txt.appendChild(p);
        p.innerHTML = l;
        if (G) gsap.from(p, { opacity: 0, y: 14, duration: 0.7, ease: 'expo.out' });
        bCat.talk(l.length * 30);
        await wait(RM ? 0 : 900 + l.length * 22);
      }
    };
    window.ScrollTrigger ? ScrollTrigger.create({ trigger: sec, start: 'top 45%', once: true, onEnter: speak }) : speak();
    $('.bye__go').addEventListener('click', async () => {
      await speak();
      leaving = true;
      mark('goodbye', sec);
      $('.sign').classList.add('is-off');
      WH.buddy.hide(true);
      const e = document.createElement('div');
      e.className = 'end';
      document.body.appendChild(e);
      WH.lock();
      await wait(50);
      e.classList.add('is-on');
      await wait(1300);
      const L = ['$ logout', `saving session for ${esc(D.user || 'guest')} ... ok`, 'closing cat.exe ... ok', '', '<b>[process completed]</b>'];
      for (const l of L) { e.innerHTML += l + '\n'; await wait(RM ? 0 : 520); }
      await wait(1400);
      e.innerHTML += '\n<span>it worked. you left.</span>';
      const a = document.createElement('a');
      a.href = 'index.html';
      a.textContent = '↺ come back';
      a.dataset.cursor = 'again?';
      e.appendChild(a);
      document.title = '[process completed]';
    });
  }
})();
