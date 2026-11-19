/* ═══════════════════════════════════════════════════════════════
   WHOAMI — cam.js · incoming call
   concept, design & code by ghostly.grl ♥

   01 incoming  cat.exe is calling. decline and it calls back.
                decline twice and it starts without you
   02 call      your camera comes back as characters, the same
                ones the cat is made of. it looks where you move,
                it hears when you talk, it notices the dark.
                mute, camera off, mugshot, hang up (you can't)
   03 mugshot   a photo of you made of characters, photobombed.
                keep it as a png

   nothing leaves the page: the video goes into a tiny canvas,
   becomes letters, and is thrown away 20 times a second.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, D, FINE } = WH;
  const G = !!window.gsap && !RM;
  const wait = WH.wait;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const inCat = new WH.Cat($('.in__cat'));
  const callCat = new WH.Cat($('.tile__cat'));

  /* ═══════════════ 01 · incoming call ═══════════════ */
  const inSec = $('.in'), ringN = $('.in__n');
  let rings = 0, ringT = 0, declines = 0, started = false;
  const ring = (on) => {
    clearInterval(ringT);
    inSec.classList.toggle('is-ringing', on);
    $('.in__ring').innerHTML = on ? '<i class="dot"></i> ringing <b class="in__n">1</b>' : 'missed call';
    if (on) { rings = 1; ringT = setInterval(() => { rings++; const n = $('.in__n'); n && (n.textContent = rings); }, 1100); }
  };

  addEventListener('wh:ready', () => {
    if (G) {
      gsap.from('.in__l > span', { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.12 });
      gsap.from('.in__bar > span', { opacity: 0, y: -8, duration: 0.5, stagger: 0.06, delay: 0.2 });
      gsap.from('.in__low > *', { opacity: 0, y: 30, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.4 });
    }
    WH.tear(300);
    ring(true);
    WH.buddy.hide(true);
  });

  $('.in__no').addEventListener('click', async () => {
    if (started) return;
    declines++;
    WH.note('decline');
    ring(false);
    WH.tear(420);
    if (declines === 1) {
      inCat.mood('angry', 1800);
      WH.buddy.hide(false);
      WH.buddy.say('you declined. i’ll call back.', 'angry', 2000);
      await wait(2600);
      WH.buddy.hide(true);
      if (!started) { ring(true); WH.flash(); }
    } else {
      await WH.pop('declining twice? ok. i’ll look without asking.', { mood: 'smug', ms: 1500 });
      start(false);
    }
  });
  $('.in__yes').addEventListener('click', () => start(true));

  /* ═══════════════ 02 · the call ═══════════════ */
  const call = $('.call'), tile = $('.tile--you'), out = $('.tile__you'), say = $('.call__say');
  const hud = { dist: $('.hud-dist'), move: $('.hud-move'), light: $('.hud-light'), noise: $('.hud-noise'), look: $('.hud-look') };
  const bars = $$('.tile__mic i');
  const RAMP = '@%#8&*+=~-:. ';   /* dark → light, on paper */
  const CATR = '#%@&$8B#%@W';
  let stream = null, video = null, an = null, buf = null, actx = null;
  let cols = FINE ? 116 : 64, rows = 60, fs = 8;
  const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  let prev = null, live = false, mode = 'none', t0 = 0, ended = false, hangs = 0;
  let muted = false, camOff = false, catMode = 0, lastFrame = '';
  const S = { light: 0.5, move: 0, mx: 0, my: 0, noise: 0, talk: 0, still: 0, quiet: 0, dark: false, center: 0 };

  /* the cat only says one thing at a time, and not too often */
  let sayingUntil = 0;
  const said = new Set();
  const talk = (text, mood, { once = '', gap = 0, force = false } = {}) => {
    const now = performance.now();
    if (once && said.has(once)) return false;
    if (!force && now < sayingUntil + gap) return false;
    once && said.add(once);
    sayingUntil = now + 2600 + text.length * 30;
    mood && callCat.mood(mood, 2800);
    WH.type(say, WH.t(text), { cat: callCat, speed: 30 });
    return true;
  };

  const size = () => {
    const vw = video && video.videoWidth ? video.videoWidth : 4, vh = video && video.videoHeight ? video.videoHeight : 3;
    rows = Math.round((cols * 0.6 * vh) / vw);
    const r = tile.getBoundingClientRect();
    fs = Math.max(4, Math.min((r.width - 24) / (cols * 0.6), (r.height - 24) / rows));
    out.style.setProperty('--fs', fs.toFixed(2) + 'px');
    cv.width = cols; cv.height = rows;
    prev = null;
  };
  addEventListener('resize', () => live && size());

  const beep = (f = 880, d = 0.09, when = 0) => {
    if (!actx) return;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, actx.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.05, actx.currentTime + when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + when + d);
    o.connect(g).connect(actx.destination);
    o.start(actx.currentTime + when); o.stop(actx.currentTime + when + d + 0.02);
  };

  async function start(ask) {
    if (started) return;
    started = true;
    ring(false);
    $('.in__ring').innerHTML = '<i class="dot"></i> connected';
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    /* open the call first: the browser's permission box can take its time */
    WH.to(call, { duration: 1.2 });
    if (ask) {
      $('.tile__wait').innerHTML = 'your browser is asking if i can see you.<br>say yes. i’ll wait. i’m very good at waiting.';
      setTimeout(() => !live && talk('it’s a yes or no question, {first}.', 'stare', { force: true }), 6000);
    }
    if (ask && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const tries = [{ video: { width: 320, height: 240, facingMode: 'user' }, audio: true }, { video: { width: 320, height: 240, facingMode: 'user' } }, { audio: true }];
      for (const c of tries) {
        try { stream = await navigator.mediaDevices.getUserMedia(c); break; } catch (e) { if (e && e.name === 'NotAllowedError') break; }
      }
    }
    const hasV = !!(stream && stream.getVideoTracks().length), hasA = !!(stream && stream.getAudioTracks().length);
    mode = hasV ? 'cam' : 'memory';
    WH.note(mode === 'cam' ? 'face' : 'memory');
    if (hasA) WH.note('voice');
    if (hasV) {
      video = document.createElement('video');
      video.muted = true; video.playsInline = true; video.srcObject = stream;
      await video.play().catch(() => {});
      await new Promise((r) => (video.videoWidth ? r() : video.addEventListener('loadedmetadata', r, { once: true })));
    }
    if (hasA && actx) {
      const src = actx.createMediaStreamSource(stream);
      an = actx.createAnalyser(); an.fftSize = 512;
      buf = new Float32Array(an.fftSize);
      src.connect(an);
    }
    if (!hasA) { hud.noise.textContent = 'no mic'; $('.ctl--mute').disabled = true; }
    if (!hasV) $('.ctl--cam').disabled = true;
    WH.to(call, { duration: 0.6 });
    await wait(700);
    /* on the call the cat talks from its own tile */
    WH.buddy.hide(true);
    ScrollTrigger.create({ trigger: call, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => WH.buddy.hide(s.isActive) });
    beep(660, 0.08); beep(990, 0.12, 0.1);
    WH.flash();
    size();
    tile.classList.add('is-live');
    live = true; t0 = Date.now();
    loop();
    setInterval(clock, 1000);
    await wait(700);
    if (mode === 'cam') {
      callCat.mood('wide', 900);
      talk(D.known ? 'there you are, {first}.' : 'there you are.', 'wide', { force: true });
      setTimeout(() => talk(D.hour() < 5 || D.hour() >= 23 ? 'you look tired. it’s {time}.' : 'you look different in person.', 'smug', { once: 'first', force: true }), 3600);
    } else {
      talk(ask ? 'no camera? fine. i’ll draw you from memory.' : 'i’ll draw you from memory. i remember everything.', 'smug', { force: true });
    }
  }

  const clock = () => {
    if (ended) return;
    const s = Math.round((Date.now() - t0) / 1000);
    const mm = WH.pad(Math.floor(s / 60)) + ':' + WH.pad(s % 60);
    $('.call__time').textContent = mm;
    if (!camOff && mode === 'cam') hud.look.textContent = mm;
    if (s === 20) talk('i’ve been looking at you for 20 seconds. you haven’t looked away once.', 'stare', { once: 's20' });
    if (s === 50) talk('you can stop posing, {first}.', 'smug', { once: 's50' });
    if (s === 90) talk('still here? most people hang up by now. you like me.', 'laugh', { once: 's90' });
    if (s % 17 === 0 && s > 10 && mode === 'cam' && !camOff) { catMode = 14; if (!said.has('cat')) talk('for a second there you were a cat.', 'laugh', { once: 'cat' }); }
  };

  /* your face, as text */
  const esc = (c) => (c === '<' ? '&lt;' : c === '&' ? '&amp;' : c);
  let lastT = 0;
  function loop(now = 0) {
    if (!live) return;
    requestAnimationFrame(loop);
    if (now - lastT < 50) return;
    lastT = now;
    listen();
    if (camOff) return;
    const W = cols, H = rows;
    let lum;
    if (mode === 'cam') {
      cx.save(); cx.translate(W, 0); cx.scale(-1, 1);
      cx.drawImage(video, 0, 0, W, H);
      cx.restore();
      const d = cx.getImageData(0, 0, W, H).data;
      lum = new Float32Array(W * H);
      for (let i = 0, j = 0; i < d.length; i += 4, j++) lum[j] = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
    } else lum = memory(now);
    /* auto contrast */
    let lo = 1, hi = 0, sum = 0;
    for (let j = 0; j < lum.length; j += 3) { const v = lum[j]; if (v < lo) lo = v; if (v > hi) hi = v; sum += v; }
    const mean = sum / Math.ceil(lum.length / 3), span = Math.max(0.12, hi - lo);
    /* movement: where things changed since the last frame */
    let mv = 0, mxs = 0, mys = 0, mw = 0, cIn = 0, cOut = 0, nIn = 0, nOut = 0;
    const hotCell = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const j = y * W + x, v = lum[j];
      if (prev) {
        const df = Math.abs(v - prev[j]);
        if (df > 0.09) { mv += df; mxs += x * df; mys += y * df; mw += df; if (df > (mode === 'cam' ? 0.16 : 0.5)) hotCell[j] = 1; }
      }
      const inC = Math.abs(x / W - 0.5) < 0.22 && Math.abs(y / H - 0.5) < 0.3;
      if (inC) { cIn += v; nIn++; } else { cOut += v; nOut++; }
    }
    prev = lum;
    S.light += (mean - S.light) * 0.1;
    S.move += (mv / (W * H) * 40 - S.move) * 0.2;
    if (mw > 2) { S.mx += ((mxs / mw / W) * 2 - 1 - S.mx) * 0.25; S.my += ((mys / mw / H) * 2 - 1 - S.my) * 0.25; }
    S.center += (Math.abs(cIn / nIn - cOut / nOut) - S.center) * 0.08;
    callCat.lookAt(clamp(S.mx * 1.2, -1, 1), clamp(S.my, -1, 1));
    /* draw */
    const ramp = catMode > 0 ? CATR : RAMP;
    if (catMode > 0) catMode--;
    tile.classList.toggle('is-cat', catMode > 0);
    let html = '';
    for (let y = 0; y < H; y++) {
      let run = '', hot = false;
      for (let x = 0; x < W; x++) {
        const j = y * W + x;
        const n = clamp((lum[j] - lo) / span);
        const c = catMode > 0 ? (n > 0.82 ? ' ' : ramp[(x * 7 + y * 3 + ((now / 90) | 0)) % ramp.length]) : ramp[Math.min(ramp.length - 1, (n * ramp.length) | 0)];
        const h = !!hotCell[j] && c !== ' ';
        if (h !== hot) { html += hot ? run + '</span>' : run; run = h ? '<span class="p">' : ''; hot = h; }
        run += esc(c);
      }
      html += run + (hot ? '</span>' : '') + '\n';
    }
    out.innerHTML = html;
    lastFrame = html;
    react();
  }

  /* no camera: a head and shoulders made of static, breathing */
  const memory = (now) => {
    const W = cols, H = rows, a = new Float32Array(W * H), t = now / 1000;
    const bx = Math.sin(t * 0.7) * 0.03, by = Math.sin(t * 1.3) * 0.01;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = x / W - 0.5 - bx, v = y / H - by;
      const head = (u / 0.17) ** 2 + ((v - 0.42) / 0.27) ** 2 < 1;
      const body = v > 0.72 && Math.abs(u) < 0.42 - (1 - v) * 0.6;
      const eye = Math.abs(Math.abs(u) - 0.065) < 0.03 && Math.abs(v - 0.38) < 0.02;
      let val = head || body ? 0.18 : 0.85;
      if (eye) val = 0.95;
      a[y * W + x] = clamp(val + (Math.random() - 0.5) * 0.35 + (Math.random() < 0.004 ? 0.6 : 0));
    }
    return a;
  };

  /* the microphone */
  function listen() {
    if (!an || muted) { bars.forEach((b) => (b.style.height = '2px')); return; }
    an.getFloatTimeDomainData(buf);
    let s = 0;
    for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    const rms = Math.sqrt(s / buf.length);
    S.noise += (rms - S.noise) * 0.3;
    bars.forEach((b, i) => (b.style.height = 2 + clamp(S.noise * 30 - i * 0.12) * 10 + 'px'));
  }

  /* what the cat notices */
  let wasDark = false;
  function react() {
    const lv = S.light;
    hud.light.textContent = mode !== 'cam' ? 'unknown' : lv < 0.12 ? 'dark. hiding?' : lv < 0.3 ? 'dim' : lv < 0.65 ? 'fine' : 'bright';
    hud.light.classList.toggle('is-hot', lv < 0.12);
    hud.move.textContent = mode !== 'cam' ? 'none (memory)' : S.move < 0.15 ? 'frozen' : S.move < 0.6 ? 'a little' : S.move < 1.6 ? 'fidgeting' : 'a lot';
    hud.move.classList.toggle('is-hot', S.move > 1.6);
    hud.dist.textContent = mode !== 'cam' ? 'far away' : S.center > 0.3 ? 'too close' : S.center > 0.14 ? 'close' : S.center > 0.06 ? 'right there' : 'where are you?';
    if (an) {
      hud.noise.textContent = muted ? 'muted (i read lips)' : S.noise < 0.012 ? 'silence' : S.noise < 0.06 ? 'talking' : 'loud';
      hud.noise.classList.toggle('is-hot', S.noise > 0.06 && !muted);
    }
    if (mode !== 'cam' || ended) return;
    /* dark */
    const dark = lv < 0.1;
    if (dark && !wasDark) WH.note('cover');
    if (dark && !wasDark) talk(an && !muted ? 'covering the camera? cute. i can still hear you.' : 'covering the camera? cute. i’ll wait.', 'smug', { gap: 1500 });
    if (!dark && wasDark) talk('peekaboo.', 'laugh', { force: true });
    wasDark = dark;
    /* movement */
    if (S.move > 2.2) talk(WH.pick(['stop fidgeting, {first}.', 'sit still. i’m trying to memorise you.', 'where are you going?']), 'angry', { gap: 5000 });
    S.still = S.move < 0.12 ? S.still + 1 : 0;
    if (S.still === 140) talk('you’re very still. are you scared?', 'stare', { gap: 2000 });
    if (S.center > 0.32) talk('too close. i can see your pores.', 'wide', { gap: 9000, once: 'close' });
    /* sound */
    if (an && !muted) {
      S.talk = S.noise > 0.02 ? S.talk + 1 : Math.max(0, S.talk - 2);
      S.quiet = S.noise < 0.008 ? S.quiet + 1 : 0;
      if (S.noise > 0.12) talk('shh. somebody might hear you.', 'angry', { gap: 6000 });
      else if (S.talk === 50) talk('i don’t speak human. try meowing.', 'smug', { gap: 4000 });
      if (S.quiet === 260) talk('it’s so quiet in {city}. are you alone?', 'stare', { gap: 3000, once: 'quiet' });
    }
  }

  /* ═══════════════ controls ═══════════════ */
  $('.ctl--mute').addEventListener('click', (e) => {
    if (!stream || ended) return;
    muted = !muted;
    WH.note('mute');
    stream.getAudioTracks().forEach((t) => (t.enabled = !muted));
    e.currentTarget.classList.toggle('is-on', muted);
    talk(muted ? 'muting me? i read lips, {first}.' : 'welcome back. you were saying?', muted ? 'smug' : 'idle', { force: true });
  });
  $('.ctl--cam').addEventListener('click', async (e) => {
    if (!stream || ended) return;
    camOff = !camOff;
    stream.getVideoTracks().forEach((t) => (t.enabled = !camOff));
    e.currentTarget.classList.toggle('is-on', camOff);
    tile.classList.toggle('is-off', camOff);
    if (camOff) {
      talk('camera off. the little light is off too. are you sure?', 'stare', { force: true });
      await wait(3600);
      if (!camOff) return;
      /* it kept a copy */
      tile.classList.remove('is-off');
      out.innerHTML = lastFrame;
      WH.flash();
      talk('i kept a copy.', 'smug', { force: true });
      await wait(700);
      camOff && tile.classList.add('is-off');
    } else talk('there you are again.', 'idle', { force: true });
  });

  let snapping = false;
  $('.ctl--snap').addEventListener('click', snap);
  $('.mug__again').addEventListener('click', () => { WH.to(call, { duration: 1 }); setTimeout(snap, 1100); });
  async function snap() {
    if (!live || snapping || ended) return;
    snapping = true;
    WH.note('mugshot');
    talk('say cheese, {first}.', 'smug', { force: true });
    const c = document.createElement('b');
    c.className = 'call__count';
    tile.appendChild(c);
    for (const n of ['3', '2', '1']) { c.textContent = n; beep(520, 0.06); G && gsap.fromTo(c, { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 }); await wait(700); }
    c.textContent = '';
    beep(1200, 0.18);
    call.classList.remove('is-flash'); void call.offsetWidth; call.classList.add('is-flash');
    const frame = out.textContent;
    tile.removeChild(c);
    const mug = $('.mug');
    mug.hidden = false;
    $('.mug__you').textContent = frame;
    $('.mug__you').style.setProperty('--fs', Math.max(3, Math.min(8, (Math.min(560, innerWidth * 0.9) - 30) / (cols * 0.6))).toFixed(2) + 'px');
    $('.mug__cat').innerHTML = $('.tile__cat').innerHTML;
    const d = new Date();
    $('.mug__name').textContent = D.known ? D.full : 'unknown subject';
    $('.mug__meta').textContent = `case 0309-${WH.pad(D.visits, 3)} · ${d.toLocaleDateString('en-GB')} ${D.time()} · ${D.city} · ${D.computer}`;
    window.ScrollTrigger && ScrollTrigger.refresh();
    await wait(600);
    talk(mode === 'cam' ? 'gorgeous. i’m keeping one too.' : 'from memory. still a good likeness.', 'laugh', { force: true });
    await wait(1200);
    WH.to(mug, { duration: 1.4 });
    if (G) gsap.fromTo('.mug__card', { y: 80, rotation: 6, opacity: 0 }, { y: 0, rotation: -1.5, opacity: 1, duration: 1, ease: 'expo.out', delay: 0.6 });
    snapping = false;
  }

  /* keep it: the mugshot drawn again into a png, here, on your machine */
  $('.mug__keep').addEventListener('click', () => {
    const lines = $('.mug__you').textContent.split('\n');
    const W = 900, H = 1125, plate = 110;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#e3e0d9'; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(13,13,13,.35)'; x.lineWidth = 2;
    for (let i = 1; i < 10; i++) { const y = ((H - plate) / 10) * i; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
    const cw = (W - 60) / cols, fz = cw / 0.6;
    x.font = `700 ${fz}px "JetBrains Mono", monospace`;
    x.fillStyle = '#0d0d0d'; x.textBaseline = 'top';
    const top = (H - plate - lines.length * fz) / 2;
    lines.forEach((l, i) => x.fillText(l, 30, top + i * fz));
    const catLines = $('.mug__cat').textContent.split('\n');
    x.font = `400 6px "JetBrains Mono", monospace`;
    x.fillStyle = '#ff1f9b';
    catLines.forEach((l, i) => x.fillText(l, W - 290, H - plate - catLines.length * 6 - 10 + i * 6));
    x.fillStyle = '#0d0d0d'; x.fillRect(0, H - plate, W, plate);
    x.fillStyle = '#ff1f9b'; x.font = '900 46px "Archivo", sans-serif';
    x.fillText((D.known ? D.full : 'unknown subject').toUpperCase(), 28, H - plate + 18);
    x.fillStyle = '#a9a6a0'; x.font = '400 16px "JetBrains Mono", monospace';
    x.fillText($('.mug__meta').textContent + ' · photobombed by cat.exe', 28, H - plate + 74);
    const a = document.createElement('a');
    a.download = 'whoami-mugshot-' + (D.known ? D.first : 'you') + '.png';
    a.href = c.toDataURL('image/png');
    a.click();
    WH.buddy.hide(false);
    WH.buddy.say('framed. i have the original.', 'smug', 2200);
  });

  $('.ctl--end').addEventListener('click', async () => {
    if (!live || ended) return;
    hangs++;
    beep(440, 0.25);
    if (hangs === 1) {
      call.classList.add('is-ended');
      say.textContent = 'call ended.';
      callCat.mood('sleep');
      await wait(1800);
      WH.tear(500);
      call.classList.remove('is-ended');
      talk('…just kidding. you can’t hang up on me, {first}.', 'laugh', { force: true });
      return;
    }
    ended = true;
    WH.note('hangup');
    call.classList.add('is-ended');
    stop();
    const h = (new Date().getHours() + 5) % 24;
    talk(`fine. i’ll call you tonight. around ${WH.pad(h)}:09.`, 'smug', { force: true });
    $('.call__rec').innerHTML = '<i class="dot"></i> still rec';
    await wait(3200);
    $('.call__rec').textContent = 'off. (probably)';
    callCat.mood('sleep');
  });

  const stop = () => { stream && stream.getTracks().forEach((t) => t.stop()); };
  addEventListener('pagehide', stop);
})();
