/* ═══════════════════════════════════════════════════════════════
   WHOAMI — files.js · your files
   concept, design & code by ghostly.grl ♥

   01 your files  another cursor walks in and drags the word
                  "files" into a folder called /cat
   02 desktop     your desktop, made of your own details. open a
                  file and the cat reviews it. drag things around,
                  drop them on the trash. look away and it tidies
   03 sorted      the folders it made for your life
   04 storage     the real room your browser has, and the cat
                  filling it. optimise storage = more cat
   05 trash       empty it. it kept copies
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, D, FINE } = WH;
  const G = !!window.gsap && !RM;
  const wait = WH.wait;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const year = new Date().getFullYear();
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + WH.pad(d.getMonth() + 1) + '-' + WH.pad(d.getDate()); };
  const dotTime = () => D.time().replace(':', '.');
  const qlCat = new WH.Cat($('.ql__pre'));
  const name = () => (D.known ? D.first : 'you');

  /* ═══════════════ 01 · someone else's cursor ═══════════════ */
  async function intrude() {
    const sec = $('.fh'), cur = $('.intruder'), word = $('.fh__word'), dir = $('.fh__dir');
    if (!G) { sec.classList.add('is-taken'); word.style.visibility = 'hidden'; return; }
    const box = sec.getBoundingClientRect();
    const rel = (el, fx = 0.5, fy = 0.5) => { const r = el.getBoundingClientRect(); return { x: r.left - box.left + r.width * fx, y: r.top - box.top + r.height * fy }; };
    const w = rel(word, 0.4, 0.45), d = rel(dir, 0.5, 0.35);
    gsap.set(cur, { x: box.width + 40, y: box.height * 0.2, opacity: 1 });
    WH.buddy.hide(true);
    await gsap.to(cur, { x: w.x, y: w.y, duration: 1.6, ease: 'power2.inOut' });
    await wait(350);
    const gh = $('.fh__ghost');
    Object.assign(gh.style, { left: word.offsetLeft + 'px', top: word.offsetTop + 'px', width: word.offsetWidth + 'px', height: word.offsetHeight * 0.92 + 'px' });
    cur.classList.add('is-down');
    word.classList.add('is-held');
    sec.classList.add('is-taken');
    await wait(250);
    const wr = word.getBoundingClientRect();
    const dx = d.x - w.x, dy = d.y - w.y;
    gsap.to(cur, { x: d.x, y: d.y, duration: 1.4, ease: 'power2.inOut' });
    await gsap.to(word, { x: dx, y: dy, scale: 0.06, rotation: -8, duration: 1.4, ease: 'power2.inOut', transformOrigin: '40% 45%' });
    word.style.visibility = 'hidden';
    cur.classList.remove('is-down');
    dir.classList.add('is-open');
    $('.fh__n').textContent = '1 item';
    WH.flash();
    await wait(400);
    dir.classList.remove('is-open');
    await gsap.to(cur, { x: box.width + 60, y: -40, duration: 1.2, ease: 'power2.in' });
    WH.buddy.hide(false);
    WH.buddy.say('that wasn’t you, by the way. you didn’t move your mouse.', 'smug', 3200);
  }
  $('.fh__dir').addEventListener('click', () => WH.buddy.say('/cat is private. like your files used to be.', 'angry', 2200));

  addEventListener('wh:ready', () => {
    if (G) {
      gsap.from('.fh__l > span', { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.12 });
      gsap.from('.fh__bar > span', { opacity: 0, y: -8, duration: 0.5, stagger: 0.06, delay: 0.2 });
      gsap.from('.fh__low > *', { opacity: 0, y: 30, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.4 });
    }
    WH.tear(300);
    setTimeout(intrude, 1900);
    later();
  });

  function later() {
    TRASH[3][0] = `${name()}_diary_DO_NOT_READ.txt`;
    desktop();
    sorted();
    storage();
    trash();
    window.ScrollTrigger && ScrollTrigger.refresh();
  }

  /* ═══════════════ 02 · the desktop ═══════════════ */
  const binList = $('.tr__list');
  const TRASH = [
    ['old_you.jpg', 'last year'],
    [`new_year_resolutions_${year - 1}.txt`, 'january'],
    ['the_email_you_didnt_send.eml', 'drafts'],
    [`${name()}_diary_DO_NOT_READ.txt`, 'read']
  ];
  const binIco = () => $('.fi--trash .ico');
  const renderBin = () => {
    binList.innerHTML = TRASH.length ? TRASH.map(([n, w, c]) => `<li${c ? ' class="is-copy"' : ''}>${esc(n)}<span>${esc(w)}</span></li>`).join('') : '<li class="tr__empty">empty. for now.</li>';
    $('.tr__n').textContent = TRASH.length + (TRASH.length === 1 ? ' item' : ' items');
    binIco() && binIco().classList.toggle('is-full', TRASH.length > 0);
  };

  function desktop() {
    const area = $('.dk__area');
    const F = [
      { n: `${name()}_cv_FINAL_final_v3.pdf`, i: 'doc', t: 'pdf', k: 'pdf document',
        body: () => `<b>${esc(D.known ? D.full.toUpperCase() : 'YOUR NAME HERE')}</b>\n\nskills: multitasking (14 tabs), staying up late, being “a quick learner”\nexperience: you, ${year - 3}–present\nlocation: ${esc(D.city)}\n\nreferences available on request.\ni requested. they said no.`,
        cat: 'final v3. bold of you to call anything final.' },
      { n: `Screenshot ${today()} at ${dotTime()}.png`, i: 'img', img: 'FILES/shot-01.jpg', desc: 'a screenshot you took and never looked at again', k: 'png image',
        cat: 'you screenshot things you’ll never look at again. like this.' },
      { n: 'passwords.txt', i: 'txt', k: 'plain text',
        body: () => `email ........ <span class="rd">same as always</span>\nbank ......... <span class="rd">same as email</span>\nwifi ......... <span class="rd">on the router</span>\n${esc(D.computer)} .. <span class="rd">${esc(name())}${year % 100}!</span>\n\n(click the black bits. i already did.)`,
        cat: 'i didn’t open this. (i opened this.)', redact: 1 },
      { n: 'untitled folder (7)', i: 'folder', k: 'folder',
        body: () => '<span class="big">empty.</span>\n\nseven untitled folders. you’re not a person, you’re a draft.',
        cat: 'empty. like the other six.' },
      { n: `IMG_${WH.pad(D.visits, 2)}${WH.pad(D.secs() % 100, 2)}.HEIC`, i: 'img', img: 'FILES/img-02.jpg', desc: 'a blurry photo from your camera roll', k: 'heic image',
        cat: 'blurry. like your plans.' },
      { n: `${D.city.replace(/\s+/g, '_')}_trip_ideas.docx`, i: 'doc', t: 'docx', k: 'word document',
        body: () => `trip ideas\n\n1. go somewhere\n2. don’t\n3. stay in ${esc(D.city)}\n4. open a strange website at ${D.time()}\n5. talk to a cat\n\n(you did 3, 4 and 5. proud of you.)`,
        cat: 'great itinerary. you’re on step 5.' },
      { n: 'dont_open.zip', i: 'zip', t: 'zip', k: 'archive', zip: 1,
        body: () => '<span class="big">meow.</span>',
        cat: 'you opened it. of course you did.' },
      { n: `${D.browser}_tabs_restore.txt`, i: 'txt', k: 'plain text',
        body: () => 'how to tell if your antivirus is evil\ncan cats read\nwhoami meaning\nhow to delete yourself from the internet\nhow to delete yourself from the internet (2)\nis it normal for a website to know your name\ncat ascii art\nhow to close a tab that doesn’t want to close',
        cat: 'interesting search history. very normal. very healthy.' },
      { n: `voice memo ${today()}.m4a`, i: 'audio', t: 'm4a', k: 'audio · 0:47', wave: 1,
        cat: 'i listened. you sound different in your head.' },
      { n: `budget_${year}.xlsx`, i: 'sheet', t: 'xlsx', k: 'spreadsheet',
        body: () => '<table><tr><td>coffee</td><td>too much</td></tr><tr><td>clothes</td><td>“an investment”</td></tr><tr><td>subscriptions you forgot</td><td>7</td></tr><tr><td>antivirus</td><td>0 (it’s me)</td></tr><tr><td>savings</td><td>0</td></tr></table>',
        cat: 'savings: zero. same as your firewall.' },
      { n: 'cat.exe', i: 'app', k: 'application',
        body: () => '<span class="big">no.</span>\n\nyou don’t open me. i open you.',
        cat: 'running since you got here. pid 9. don’t bother.' }
    ];
    /* icons, placed like a real messy desktop */
    let html = F.map((f, i) => {
      const ico = f.i === 'img' ? `<span class="ico ico--img"><figure class="slot" data-img="${f.img}" data-desc="${esc(f.desc)}"></figure></span>`
        : f.i === 'app' ? '<span class="ico ico--app">=^.^=</span>'
        : `<span class="ico ico--${f.i}">${f.t ? `<span>${f.t}</span>` : ''}</span>`;
      return `<div class="fi" data-i="${i}" role="button" tabindex="0" aria-label="${esc(f.n)}">${ico}<span class="fi__n">${esc(f.n)}</span></div>`;
    }).join('');
    html += '<div class="fi fi--trash" data-trash role="button" tabindex="0" aria-label="trash"><span class="ico ico--trash"></span><span class="fi__n">Trash</span></div>';
    area.innerHTML = html;
    $$('.slot[data-img]', area).forEach(WH.fillSlot);
    const els = $$('.fi', area), trashEl = $('.fi--trash', area);
    renderBin();
    const pos = new Map();
    const place = (el, x, y, anim) => {
      pos.set(el, { x, y });
      if (G && anim) gsap.to(el, { x, y, duration: 0.9, ease: 'expo.inOut' });
      else el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const layout = (shuffle = false) => {
      const W = area.clientWidth, H = area.clientHeight, cw = W < 600 ? 92 : 124, ch = W < 600 ? 104 : 118;
      const colsN = Math.max(2, Math.floor((W - 20) / cw)), rowsN = Math.max(2, Math.floor((H - 20) / ch));
      let cells = [];
      for (let c = 0; c < colsN; c++) for (let r = 0; r < rowsN; r++) cells.push([c, r]);
      /* the trash lives top-right */
      const tcell = [colsN - 1, 0];
      cells = cells.filter(([c, r]) => !(c === tcell[0] && r === tcell[1]));
      if (shuffle) cells.sort(() => Math.random() - 0.5);
      else cells = cells.filter((c, k) => k % 2 === 0 || c[1] === 0).concat(cells.filter((c, k) => !(k % 2 === 0 || c[1] === 0)));
      els.filter((e) => e !== trashEl && !e.hidden).forEach((e, k) => {
        const [c, r] = cells[k % cells.length];
        place(e, 10 + c * cw + (Math.random() - 0.5) * 18, 10 + r * ch + (Math.random() - 0.5) * 12, shuffle);
      });
      place(trashEl, 10 + tcell[0] * cw, 10 + tcell[1] * ch, false);
    };
    layout();
    addEventListener('resize', () => layout());
    const count = () => ($('.dk__count').textContent = els.filter((e) => !e.hidden && e !== trashEl).length + ' items');
    count();

    /* drag, click to open, drop on the trash */
    const overTrash = (x, y) => { const r = trashEl.getBoundingClientRect(); return x > r.left - 10 && x < r.right + 10 && y > r.top - 10 && y < r.bottom + 10; };
    els.forEach((el) => {
      let sx, sy, ox, oy, moved, id = null;
      el.addEventListener('pointerdown', (e) => {
        id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
        const p = pos.get(el); ox = p.x; oy = p.y;
        el.setPointerCapture(id);
        els.forEach((o) => o.classList.toggle('is-sel', o === el));
        G && gsap.killTweensOf(el);
      });
      el.addEventListener('pointermove', (e) => {
        if (e.pointerId !== id) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 5) return;
        moved = true;
        el.classList.add('is-drag');
        const W = area.clientWidth - 100, H = area.clientHeight - 100;
        place(el, clamp(ox + dx, 0, W), clamp(oy + dy, 0, H));
        el !== trashEl && trashEl.classList.toggle('is-over', overTrash(e.clientX, e.clientY));
      });
      const up = (e) => {
        if (e.pointerId !== id) return;
        id = null;
        el.classList.remove('is-drag');
        trashEl.classList.remove('is-over');
        if (el === trashEl) { if (!moved) WH.to('#trash'); return; }
        if (moved && overTrash(e.clientX, e.clientY)) return bin(el);
        if (!moved) open(+el.dataset.i);
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') el === trashEl ? WH.to('#trash') : open(+el.dataset.i); });
    });

    const bin = (el) => {
      const f = F[+el.dataset.i];
      if (f.i === 'app') {
        layout(true);
        WH.shake(10, 0.3);
        WH.buddy.say('trash me? i live in the trash. it’s cosy. no.', 'angry', 2400);
        return;
      }
      el.hidden = true;
      WH.note('trash');
      TRASH.unshift([f.n, 'just now']);
      renderBin();
      count();
      G && gsap.fromTo(trashEl, { scale: 1.2 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
      WH.buddy.say(WH.pick(['into the trash. very decisive.', 'deleted. (not really.)', 'bye, ' + f.n.split('.')[0] + '.']), 'smug', 2000);
    };

    /* look away and it rearranges everything */
    let still = 0, tidies = 0;
    const tidy = () => {
      clearTimeout(still);
      still = setTimeout(() => {
        const r = area.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || !$('.ql').hidden || WH.isReady !== true) return tidy();
        tidies++;
        layout(true);
        if (tidies === 2) {
          /* a new file appears that you didn't make */
          const n = document.createElement('div');
          n.className = 'fi is-new';
          n.innerHTML = `<span class="ico ico--txt"></span><span class="fi__n">${esc(name())}_was_here.txt</span>`;
          area.appendChild(n);
          place(n, area.clientWidth / 2 - 56, area.clientHeight / 2 - 50);
          n.addEventListener('click', () => WH.pop('i wrote it for you. it says “meow”.', { mood: 'laugh', ms: 1400 }));
          G && gsap.from(n, { scale: 0, rotation: 30, duration: 0.6, ease: 'back.out(2)' });
        }
        WH.buddy.say(tidies === 1 ? 'i tidied up while you weren’t looking. you’re welcome.' : tidies === 2 ? 'i made you a file. look.' : WH.pick(['tidier.', 'you really should look at me more.', 'everything is where i want it now.']), 'smug', 2400);
        tidy();
      }, 6500);
    };
    ['pointermove', 'keydown', 'wheel', 'touchstart'].forEach((ev) => addEventListener(ev, tidy, { passive: true }));
    tidy();

    /* ═══ quick look ═══ */
    const ql = $('.ql'), body = $('.ql__body'), say = $('.ql__say');
    let opened = 0;
    async function open(i) {
      const f = F[i];
      opened++;
      WH.note('open');
      if (f.redact) WH.note('passwords');
      if (f.zip) WH.note('zip');
      $('.ql__name').textContent = f.n;
      $('.ql__kind').textContent = f.k;
      ql.hidden = false;
      WH.buddy.hide(true);
      say.textContent = '';
      G && gsap.fromTo('.ql__box', { scale: 0.85, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)' });
      if (f.zip) {
        body.innerHTML = 'extracting dont_open.zip…\n\n<span class="zip">0%</span>';
        for (let p = 0; p <= 100; p += 7) { $('.zip', body).textContent = Math.min(100, p) + '%'; await wait(60); }
        WH.tear(500);
        qlCat.mood('laugh', 2600);
      }
      if (f.i === 'img') body.innerHTML = `<figure class="slot" data-img="${f.img}" data-desc="${esc(f.desc)}"></figure>`;
      else if (f.wave) {
        body.innerHTML = '<div class="wave">' + Array.from({ length: 64 }, () => `<i style="height:${8 + Math.random() * 92}%"></i>`).join('') + '</div>\n0:00 / 0:47 · playing (only i can hear it)';
        const bars = $$('.wave i', body);
        let k = 0;
        const t = setInterval(() => { if (ql.hidden || k >= bars.length) return clearInterval(t); bars[k++].classList.add('is-on'); }, 90);
      } else body.innerHTML = f.body();
      $$('.slot[data-img]', body).forEach(WH.fillSlot);
      if (f.redact) $$('.rd', body).forEach((r) => r.addEventListener('click', () => { r.classList.add('is-open'); qlCat.mood('laugh', 1200); }));
      qlCat.mood(f.zip ? 'laugh' : 'smug', 2600);
      WH.type(say, WH.t(f.cat), { cat: qlCat, speed: 26 });
    }
    const close = () => {
      if (ql.hidden) return;
      ql.hidden = true;
      WH.buddy.hide(false);
      if (opened === 3) WH.buddy.say('three files. you’re snooping on yourself. i love it.', 'laugh', 2400);
    };
    $('.ql__x').addEventListener('click', close);
    ql.addEventListener('click', (e) => { if (e.target === ql) close(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    if (G) gsap.from(els, { opacity: 0, scale: 0.6, duration: 0.6, ease: 'back.out(2)', stagger: 0.04, scrollTrigger: { trigger: area, start: 'top 75%' } });
    window.ScrollTrigger && ScrollTrigger.create({ trigger: area, start: 'top 55%', once: true, onEnter: () => WH.buddy.say('your desktop. well. it was.', 'smug', 2400) });
  }

  /* ═══════════════ 03 · sorted by the cat ═══════════════ */
  function sorted() {
    const late = D.hour() < 5 || D.hour() >= 23;
    const R = [
      ['things you’ll never finish', 214, ['novel_ch1.docx', 'learn_japanese/', 'portfolio_v2 (draft)', 'gym_plan.pdf'], 'i counted. i stopped at 214 out of politeness.'],
      ['people you didn’t text back', 31, ['mum (3 missed)', 'that guy from the party', 'group chat (99+)', 'the dentist'], 'they’re fine. probably.'],
      ['photos of food', 1208, ['IMG_2201 (pasta)', 'IMG_2202 (same pasta)', 'IMG_2203 (pasta, again, closer)'], 'you eat with your phone first.'],
      [late ? `${D.time()} decisions` : '3am decisions', 47, ['cart (14 items)', 'haircut_reference.jpg', 'draft: “hey u up”', 'this website'], late ? 'you’re making one right now.' : 'see you at 3am.'],
      ['proof', 9, ['receipts.zip', 'screenshot of what they said', 'screenshot of what you said'], 'for court. or for me.'],
      [`everything about ${name()}`, D.visits * 1000 + D.secs(), ['name', 'computer', 'city', 'battery', 'face (cam.html)', 'this visit (' + D.visits + ')'], 'growing. you’re very generous.']
    ];
    $('.so__list').innerHTML = R.map(([n, c, files, q], i) => `<li class="sw" data-cursor="peek"><span class="sw__i">${WH.pad(i + 1)}</span><span class="sw__n">${esc(n)}</span><span class="sw__c">${c.toLocaleString('en')} items</span><div class="sw__more"><div>${files.map((f) => `<span>${esc(f)}</span>`).join('')}<q>${esc(q)}</q></div></div></li>`).join('');
    const rows = $$('.sw');
    rows.forEach((r) => r.addEventListener('click', () => r.classList.toggle('is-on')));
    if (G && window.ScrollTrigger) gsap.from(rows, { y: 40, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.so__list', start: 'top 80%' } });
    window.ScrollTrigger && ScrollTrigger.create({ trigger: '.so', start: 'top 50%', once: true, onEnter: () => WH.buddy.say('i made folders. you never do.', 'smug', 2200) });
  }

  /* ═══════════════ 04 · storage ═══════════════ */
  function storage() {
    const bar = $('.st__bar'), leg = $('.st__leg');
    let total = 0, optimised = false;
    const SEG = [
      { n: 'photos', c: '#bdbab3', p: 22 },
      { n: 'apps', c: '#8d8b86', p: 14 },
      { n: 'system data (?)', c: '#5c5c5c', p: 18 },
      { n: 'documents', c: '#e3e0d9', p: 9 },
      { n: 'cat', c: 'var(--pink)', p: 4, cat: 1 }
    ];
    bar.innerHTML = SEG.map((s) => `<i style="background:${s.c}"></i>`).join('');
    const segs = $$('i', bar);
    const fmt = (p) => (total ? (total * p / 100).toFixed(1) + ' gb' : p.toFixed(0) + '%');
    const draw = () => {
      segs.forEach((s, i) => (s.style.flexBasis = SEG[i].p + '%'));
      leg.innerHTML = SEG.map((s) => `<li style="--c:${s.c}">${s.n} <b>${fmt(s.p)}</b></li>`).join('') + `<li style="--c:transparent">free <b>${fmt(Math.max(0, 100 - SEG.reduce((a, s) => a + s.p, 0)))}</b></li>`;
    };
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((e) => {
        if (e && e.quota) {
          total = e.quota / 1e9;
          $('.st__cap').textContent = total.toFixed(1) + ' gb that your browser is allowed to use';
        }
        draw();
      }).catch(draw);
    } else draw();
    draw();
    /* the cat grows while you scroll past */
    if (window.ScrollTrigger) ScrollTrigger.create({
      trigger: '.st', start: 'top 85%', end: 'bottom 30%', scrub: true,
      onUpdate: (s) => { if (optimised) return; SEG[4].p = 4 + s.progress * 30; draw(); }
    });
    $('.st__opt').addEventListener('click', async () => {
      if (optimised) { WH.buddy.say('already optimised. it can’t get more optimal than me.', 'smug', 2200); return; }
      const r = await WH.dialog({ title: 'optimise storage', text: 'WHOAMI will remove photos, apps, system data and documents to make room for more important things.', buttons: ['cancel', 'optimise'] });
      optimised = true;
      WH.note('optimise');
      if (r === 0) WH.buddy.say('cancel? i heard optimise.', 'smug', 1800);
      for (let k = 0; k < 4; k++) { SEG[k].p = 0; draw(); WH.shake(5, 0.15); await wait(380); }
      SEG[4].p = 97;
      draw();
      WH.flash();
      await WH.pop('optimised. 97% cat. the other 3% is you. for now.', { mood: 'laugh', ms: 1800 });
    });
  }

  /* ═══════════════ 05 · trash ═══════════════ */
  function trash() {
    let empties = 0;
    $('.tr__go').addEventListener('click', async () => {
      if (!TRASH.length) { WH.buddy.say('it’s already empty. look closer.', 'stare', 2000); return; }
      const r = await WH.dialog({ title: 'trash', text: `are you sure you want to permanently erase the ${TRASH.length} items in the trash?<br><br>you can’t undo this.`, buttons: ['cancel', 'empty trash'], icon: '✕' });
      if (r !== 1) { WH.buddy.say('scared to let go. relatable.', 'sad', 2000); return; }
      empties++;
      WH.note('empty');
      const lis = $$('li', binList);
      if (G) await gsap.to(lis, { x: 60, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.in' });
      const gone = TRASH.splice(0).map(([n]) => n);
      renderBin();
      WH.tear(400);
      await wait(1400);
      /* it kept copies */
      gone.forEach((n) => TRASH.push(['copy of ' + n, 'kept by cat.exe', 1]));
      renderBin();
      G && gsap.from($$('li', binList), { x: -40, opacity: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06 });
      WH.pop(empties === 1 ? 'i kept copies, {first}. obviously.' : 'copies of copies. i never throw anything away. especially you.', { mood: 'laugh', ms: 1800 });
    });
    window.ScrollTrigger && ScrollTrigger.create({ trigger: '.tr', start: 'top 55%', once: true, onEnter: () => WH.buddy.say('go on. empty it. see what happens.', 'smug', 2200) });
  }
})();
