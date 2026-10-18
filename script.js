/* ==========================================================
   Pip's Midnight Nursery - script.js
   Sections:
   1. Helpers            2. Stars + optional official artwork
   3. Header + nav       4. Reveal + story progress
   5. Hero immersion     6. Moon + Easter egg
   7. Fact tags          8. Creations modals
   9. Dream Engine      10. Audio + day/night
  11. Portal transition
   Everything runs in the browser. No internet needed after load.
   ========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- 1. Helpers ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var rand = function (min, max) { return Math.random() * (max - min) + min; };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- 2. Stars + optional official artwork ---------- */
  function makeStars(container, count) {
    if (!container) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'star';
      var size = rand(1.5, 3.6);
      s.style.cssText = 'left:' + rand(0, 100) + '%;top:' + rand(0, 100) + '%;width:' + size + 'px;height:' + size + 'px;' +
        '--dur:' + rand(3, 7) + 's;--delay:' + rand(0, 5) + 's';
      frag.appendChild(s);
    }
    container.appendChild(frag);
  }
  var starCount = window.innerWidth < 700 ? 45 : 90;
  makeStars($('#heroStars'), starCount);
  makeStars($('#engineStars'), 50);
  makeStars($('#endStars'), 60);

  /* If a real file exists at data-asset, swap the built-in drawing for it.
     If the file is missing, nothing happens and the drawing stays. */
  $$('.art[data-asset]').forEach(function (box) {
    var src = box.getAttribute('data-asset');
    var img = new Image();
    img.onload = function () {
      img.alt = box.getAttribute('data-alt') || '';
      img.decoding = 'async';
      box.innerHTML = '';
      box.appendChild(img);
    };
    img.onerror = function () { /* keep the SVG placeholder */ };
    img.src = src;
  });

  /* ---------- 3. Header + nav ---------- */
  var header = $('.site-header');
  var nav = $('#siteNav');
  var navToggle = $('#navToggle');

  function onScroll() { header.classList.toggle('solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setNav(open) {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  navToggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); navToggle.focus(); }
  });

  /* ---------- 4. Reveal + story progress ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });

    var scenes = $$('.scene');
    var dots = $$('#storyProgress li');
    var progress = $('#storyProgress');
    var sceneObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var idx = Number(en.target.getAttribute('data-scene'));
          dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
        }
      });
    }, { threshold: 0.5 });
    scenes.forEach(function (s) { sceneObs.observe(s); });
    var storyObs = new IntersectionObserver(function (entries) {
      progress.classList.toggle('show', entries[0].isIntersecting);
    }, { threshold: 0.05 });
    storyObs.observe($('#story'));
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 5. Hero immersion: parallax, cursor star, tap sparkles ---------- */
  var hero = $('.hero');
  var moon = $('#moon');
  var pipWrap = $('.pip-wrap');
  var clouds = $$('.cloud');

  if (!reduceMotion && hero) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (moon) moon.style.translate = (x * -34) + 'px ' + (y * -24) + 'px';
      if (pipWrap) pipWrap.style.translate = (x * 22) + 'px ' + (y * 14) + 'px';
      clouds.forEach(function (c, i) { c.style.marginTop = (y * (10 + i * 8)) + 'px'; });
    }, { passive: true });
  }

  /* touch: a tap lights up the hidden constellation where you touch */
  if (!reduceMotion && hero) {
    hero.addEventListener('pointerdown', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* A glowing circle replaces the mouse arrow (desktop mouse only; touch and keyboard are untouched) */
  var cursorStar = $('#cursorStar');
  if (cursorStar && finePointer && !reduceMotion) {
    var cx = 0, cy = 0, tx = 0, ty = 0, running = false, seen = false;
    /* sparkle trail: tiny gold stars drop behind the dot */
    var lastSx = -99, lastSy = -99, trailLayer = $('#burstLayer');
    var sparkleColors = ['#F5D58A', '#FFF7ED', '#F5C9D5', '#D8C9F0'];
    function sparkle(x, y) {
      if (!trailLayer || trailLayer.childElementCount > 45) return;
      var dx = x - lastSx, dy = y - lastSy;
      if (dx * dx + dy * dy < 400) return;          /* only every ~20px of travel */
      lastSx = x; lastSy = y;
      var s = document.createElement('span');
      var size = rand(7, 14);
      s.className = 'sparkle';
      s.style.cssText = 'left:' + (x + rand(-6, 6)) + 'px;top:' + (y + rand(-6, 6)) + 'px;width:' + size + 'px;height:' + size + 'px;background:' + pick(sparkleColors) + ';--sx:' + rand(-14, 14) + 'px';
      trailLayer.appendChild(s);
      setTimeout(function () { s.remove(); }, 900);
    }
    var follow = function () {
      cx += (tx - cx) * 0.35; cy += (ty - cy) * 0.35;
      cursorStar.style.transform = 'translate(' + (cx - 9) + 'px,' + (cy - 9) + 'px)';
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) requestAnimationFrame(follow);
      else running = false;
    };
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; cx = tx; cy = ty; document.documentElement.classList.add('custom-cursor'); }
      cursorStar.classList.add('on');
      sparkle(e.clientX, e.clientY);
      cursorStar.classList.toggle('hot', !!e.target.closest('a, button, label, summary'));
      if (!running) { running = true; requestAnimationFrame(follow); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cursorStar.classList.remove('on'); });
    document.addEventListener('pointerdown', function () { cursorStar.classList.add('press'); });
    document.addEventListener('pointerup', function () { cursorStar.classList.remove('press'); });
  }

  /* Stars burst where you click or tap */
  var burstLayer = $('#burstLayer');
  document.addEventListener('pointerdown', function (e) {
    if (reduceMotion || !burstLayer) return;
    if (e.target.closest('dialog, input, label, textarea')) return;
    if (burstLayer.childElementCount > 40) return;
    for (var i = 0; i < 6; i++) {
      var b = document.createElement('span');
      b.className = 'burst';
      b.style.left = e.clientX + 'px';
      b.style.top = e.clientY + 'px';
      var ang = rand(0, Math.PI * 2), dist = rand(26, 70);
      b.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
      b.style.setProperty('--by', Math.sin(ang) * dist + 'px');
      b.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-star"/></svg>';
      burstLayer.appendChild(b);
      (function (node) { setTimeout(function () { node.remove(); }, 950); })(b);
    }
  }, { passive: true });

  /* ---------- Dialog helpers (used by creations + Easter egg) ---------- */
  var lastOpener = null;
  function openDialog(dlg, opener) {
    lastOpener = opener || document.activeElement;
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); }
    else { dlg.setAttribute('open', ''); }
    document.body.style.overflow = 'hidden';
  }
  function closeDialog(dlg) {
    if (typeof dlg.close === 'function') { if (dlg.open) dlg.close(); }
    else { dlg.removeAttribute('open'); }
  }
  function wireDialog(dlg, closeBtn) {
    closeBtn.addEventListener('click', function () { closeDialog(dlg); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(dlg); });   /* click outside */
    dlg.addEventListener('close', function () {
      document.body.style.overflow = '';
      if (lastOpener && lastOpener.focus) lastOpener.focus();
    });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDialog(dlg); }); /* fallback for old browsers */
  }

  /* ---------- 6. Moon + Easter egg ---------- */
  var secretModal = $('#secretModal');
  wireDialog(secretModal, $('#secretClose'));
  var moonClicks = 0, moonTimer = null, calmTimer = null;

  function moonState(s) { moon.setAttribute('data-state', s); }
  function calmMoon() { clearTimeout(calmTimer); calmTimer = setTimeout(function () { moonState('sleepy'); }, 1600); }
  moon.addEventListener('pointerenter', function () { moonState('awake'); });
  moon.addEventListener('pointerleave', calmMoon);
  moon.addEventListener('focus', function () { moonState('awake'); });
  moon.addEventListener('blur', calmMoon);

  moon.addEventListener('click', function () {
    moonClicks++;
    moonState('giggle');
    calmMoon();
    clearTimeout(moonTimer);
    moonTimer = setTimeout(function () { moonClicks = 0; }, 2600);   /* clicks must be fairly close together */
    if (moonClicks >= 3) {
      moonClicks = 0;
      rainStars();
      openDialog(secretModal, moon);
    }
  });

  function rainStars() {
    if (reduceMotion || !burstLayer) return;
    for (var i = 0; i < 18; i++) {
      (function (n) {
        setTimeout(function () {
          var b = document.createElement('span');
          b.className = 'burst';
          b.style.left = rand(5, 95) + 'vw';
          b.style.top = rand(5, 40) + 'vh';
          b.style.setProperty('--bx', rand(-30, 30) + 'px');
          b.style.setProperty('--by', rand(60, 220) + 'px');
          b.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-star"/></svg>';
          burstLayer.appendChild(b);
          setTimeout(function () { b.remove(); }, 950);
        }, n * 60);
      })(i);
    }
  }

  $('#secretLullaby').addEventListener('click', function () {
    audio.setOn(true, true);
    this.textContent = 'Humming softly...';
  });

  /* ---------- 7. Fact tags on Pip ---------- */
  var facts = {
    'fact-job': 'Pip is a Junior Dream Engineer. When a dream comes out wobbly or gets forgotten, Pip picks up the tiny tools and fixes it before morning.',
    'fact-power': 'Pip can hear dreams humming, like a very quiet kettle, and follows the hum to find the ones that got lost.',
    'fact-sound': 'Nothing makes Pip sleepier than the lullaby music box with the golden key. Three turns and Pip is yawning.',
    'fact-secret': 'Pip always naps with the moon lantern left on, just in case a dream comes looking in the dark.'
  };
  var factText = $('#factText');
  var tags = $$('.tag');
  tags.forEach(function (t) {
    t.addEventListener('click', function () {
      tags.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      t.setAttribute('aria-expanded', 'true');
      factText.textContent = facts[t.getAttribute('data-fact')];
    });
  });

  /* ---------- 8. Creations modals ---------- */
  var projectModal = $('#projectModal');
  wireDialog(projectModal, $('#modalClose'));
  var modalArt = $('#modalArt'), playBtn = $('#playBtn'), playResult = $('#playResult');

  var constellations = ['The Sleepy Fox', 'The Little Teacup', 'The Whispering Owl', 'The Drowsy Kite', 'The Cosy Whale'];
  var happyDreams = ['a picnic on a warm cloud', 'dancing with fireflies', 'a birthday party for the moon', 'flying over a sea of marshmallows', 'a hug that lasted all night'];
  var landscapes = ['The Marshmallow Meadows', 'Lavender Lake at Dusk', 'The Whispering Cloud Hills', 'Starfruit Orchard', 'The Sleepy Sugar Dunes'];

  var projects = {
    lantern: {
      no: 'Creation No. 1', title: 'Moonlight Lantern', bg: '#FFF3CF', btn: 'Light the lantern',
      story: 'Pip made the Moonlight Lantern from a jar, a thimble of moonlight and one very patient firefly. When it glows, shadows in the corner shyly turn into constellations, so nothing in the dark is ever scary, only sparkly.',
      label: 'Try it: light the lantern and see which constellation appears.',
      source: '#creations .c-lantern .creation-art',
      play: function () {
        modalArt.classList.add('glow-on');
        sprinkle(modalArt, 9);
        return 'A new constellation appears: ' + pick(constellations) + '.';
      }
    },
    box: {
      no: 'Creation No. 2', title: 'The Unicorn Dreambox', bg: '#FBDDE6', btn: 'Wind the music box',
      story: 'Inside the Dreambox lives a unicorn who dances whenever the golden key is turned, and the star chimes ring out softly. Each melody is one of the happiest dreams ever dreamed, kept safe so it can never fade.',
      label: 'Try it: wind the key and open a happy dream.',
      source: '#creations .c-box .creation-art',
      play: function () {
        var played = audio.playPhrase();
        sprinkle(modalArt, 6);
        return 'A happy dream floats out: ' + pick(happyDreams) + '.' + (played ? '' : ' (Your device is keeping the music quiet.)');
      }
    },
    pillow: {
      no: 'Creation No. 7', title: 'Cloud Pillow No. 7', bg: '#E8DDF8', btn: 'Fluff the pillow',
      story: 'Cloud Pillow No. 7 is stitched from the softest cloud edges. Each time someone rests their head on it, it grows a whole new dream landscape, and no two nights are ever the same.',
      label: 'Try it: fluff the pillow to grow tonight\'s dream landscape.',
      source: '#creations .c-pillow .creation-art',
      play: function () {
        var hues = ['#E8DDF8', '#FBDDE6', '#DCEBFA', '#FFF3CF', '#DDF3E6'];
        modalArt.style.setProperty('--modal-bg', pick(hues));
        modalArt.parentNode.style.setProperty('--modal-bg', modalArt.style.getPropertyValue('--modal-bg'));
        sprinkle(modalArt, 7);
        return 'Tonight\'s landscape: ' + pick(landscapes) + '.';
      }
    }
  };
  var currentProject = null;

  function sprinkle(host, n) {
    if (reduceMotion) return;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'particle';
      s.style.cssText = 'left:' + rand(10, 90) + '%;top:' + rand(40, 90) + '%;--s:' + rand(5, 10) + 'px;--x:' + rand(-30, 30) + 'px;--d:' + rand(1.1, 1.9) + 's;--c:' + pick(['#F5D58A', '#FFF7ED', '#F5C9D5']);
      host.appendChild(s);
      (function (node) { setTimeout(function () { node.remove(); }, 2000); })(s);
    }
  }

  $$('.creation').forEach(function (card) {
    card.addEventListener('click', function () {
      var key = card.getAttribute('data-project');
      var p = projects[key];
      currentProject = p;
      $('#modalNo').textContent = p.no;
      $('#modalTitle').textContent = p.title;
      $('#modalStory').textContent = p.story;
      $('#playLabel').textContent = p.label;
      playBtn.textContent = p.btn;
      playResult.textContent = '';
      modalArt.classList.remove('glow-on');
      modalArt.style.position = 'relative';
      modalArt.style.setProperty('--modal-bg', p.bg);
      modalArt.innerHTML = '';
      var src = $(p.source);
      var clone = src.cloneNode(true);
      clone.removeAttribute('data-asset');
      modalArt.appendChild(clone);
      $('#lab').hidden = (key !== 'box');
      openDialog(projectModal, card);
    });
  });
  playBtn.addEventListener('click', function () {
    if (currentProject) playResult.textContent = currentProject.play();
  });

  /* ---------- 9. Dream Engine ---------- */
  var moods = {
    peaceful: {
      label: 'Peaceful', adj: ['Hushed', 'Sleepy'],
      open: 'Everything moves slowly here, as if the whole world were breathing in time with you.',
      lead: 'drifts beside you, slow and unhurried, all the way to',
      end: ['You settle into the quiet like a feather finding its pillow.', 'The last thing you hear is your own gentle breathing, and it sounds like a lullaby.'],
      colors: { a: '#DCE6F7', b: '#D8C9F0', ink: '#252642' },
      motif: '<svg viewBox="0 0 48 48"><path d="M30 5a18 18 0 1 0 0 34a34 34 0 0 1 0-34z" fill="currentColor"/><path d="M6 45q9-5 18 0t18 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
    },
    adventurous: {
      label: 'Adventurous', adj: ['Daring', 'Wild-Hearted'],
      open: 'Your heart does a little leap, because every direction looks like the start of a brave idea.',
      lead: 'races ahead of you, laughing, all the way to',
      end: ['You wake with stardust on your sleeves and a map to somewhere new.', 'You tuck the whole adventure into your pocket for tomorrow.'],
      colors: { a: '#FFE1B8', b: '#F5C9D5', ink: '#3A2433' },
      motif: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 9l6 15-6 15-6-15z" fill="currentColor"/><circle cx="24" cy="24" r="3" fill="#fff"/></svg>'
    },
    mysterious: {
      label: 'Mysterious', adj: ['Whispering', 'Secret'],
      open: 'Silvery fog curls around your ankles, and somewhere nearby a door you cannot see clicks open.',
      lead: 'tiptoes ahead of you, finger to lips, all the way to',
      end: ['You never learn the whole secret, but you wake up smiling, sure that it knows you.', 'The mystery folds itself into a small glowing question that you get to keep.'],
      colors: { a: '#3D3A6E', b: '#252642', ink: '#FFF7ED' },
      motif: '<svg viewBox="0 0 48 48"><circle cx="24" cy="18" r="9" fill="currentColor"/><path d="M19 26h10l5 17H14z" fill="currentColor"/><circle cx="24" cy="18" r="3" fill="#252642"/></svg>'
    },
    magical: {
      label: 'Magical', adj: ['Shimmering', 'Sparkling'],
      open: 'The air fizzes with glitter, and every wish you have ever made floats past like a tiny lantern.',
      lead: 'swirls around you in ribbons of glitter, all the way to',
      end: ['Your wishes settle on your pillow like warm, glittering snow.', 'You wake up with sparkles in your hair, and nobody can quite explain why.'],
      colors: { a: '#F5C9D5', b: '#F5D58A', ink: '#3A2433' },
      motif: '<svg viewBox="0 0 48 48"><path d="M24 3l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill="currentColor"/><path d="M39 30l1.8 5.2L46 37l-5.2 1.8L39 44l-1.8-5.2L32 37l5.2-1.8z" fill="currentColor"/></svg>'
    }
  };
  var companions = {
    moon: { label: 'Moon', title: 'the Sleepy Moon', short: 'The Moon', meet: 'The Moon leans down, round and gentle, and offers you a ride on its silver curve.', gift: 'a pocketful of moonlight' },
    unicorn: { label: 'Unicorn', title: 'the Music-Box Unicorn', short: 'The little unicorn', meet: 'A tiny unicorn trots out of the shadows, its mane chiming softly like a music box.', gift: 'one silver note that never fades' },
    cloud: { label: 'Cloud', title: 'the Pillow Cloud', short: 'The cloud', meet: 'A round cloud drifts up and politely rearranges itself into the comfiest seat you have ever sat on.', gift: 'a blanket of sky-blue fluff' },
    star: { label: 'Star', title: 'the Wandering Star', short: 'The star', meet: 'A small star tumbles toward you, spinning with excitement, and decides you are its new best friend.', gift: 'a wish that fits in your hand' }
  };
  var destinations = {
    cloud: { label: 'Cloud kingdom', noun: 'Cloud Kingdom', scene: 'You arrive in the Cloud Kingdom, where towers of whipped cream cloud rise around you with rainbow bridges stitched between them.', landmark: 'the courtyard of the Cloud Queen\'s pillow palace', secret: 'a hidden staircase that climbs up to the very top of the sky' },
    forest: { label: 'Starlight forest', noun: 'Starlight Forest', scene: 'You arrive in the Starlight Forest, where lantern-leaved trees hum softly and fireflies spell out lazy little words above the path.', landmark: 'the glowing hollow at the heart of the forest', secret: 'a tree whose branches are strung with sleeping wishes' },
    garden: { label: 'Moon garden', noun: 'Moon Garden', scene: 'You arrive in the Moon Garden, where silver flowers open as you pass, each one holding a drop of moonlit dew.', landmark: 'the quiet pond where the moon takes its evening bath', secret: 'a little gate that only opens for people who tiptoe' },
    planet: { label: 'Candy-coloured planet', noun: 'Candy Planet', scene: 'You arrive on a candy-coloured planet, where the ground is soft as sponge cake and rivers of pink lemonade fizz beneath a peppermint-striped sky.', landmark: 'a gumdrop mountain that hums when you wave at it', secret: 'a tiny bakery run by sleepy comets' }
  };

  var form = $('#dreamForm');
  var card = $('#dreamCard');
  var placeholder = $('#dreamPlaceholder');
  var engine = $('#engine');
  var createBtn = $('#createBtn');
  var copyStatus = $('#copyStatus');
  var lastDream = null;

  function getChoices() {
    var fd = new FormData(form);
    return { mood: fd.get('mood') || 'peaceful', companion: fd.get('companion') || 'moon', destination: fd.get('destination') || 'cloud' };
  }

  function buildDream(c) {
    var m = moods[c.mood], co = companions[c.companion], d = destinations[c.destination];
    var title = 'The ' + pick(m.adj) + ' ' + d.noun + ' of ' + co.title;
    var story = [
      d.scene + ' ' + m.open,
      co.meet,
      co.short + ' ' + m.lead + ' ' + d.landmark + ', where you discover ' + d.secret + '.',
      'As a thank-you, you are given ' + co.gift + '. ' + pick(m.end)
    ].join(' ');
    return { title: title, story: story, choices: c };
  }

  function renderDream(dream) {
    var c = dream.choices, m = moods[c.mood];
    card.style.setProperty('--card-a', m.colors.a);
    card.style.setProperty('--card-b', m.colors.b);
    card.style.setProperty('--card-ink', m.colors.ink);
    $('#dreamMotif').innerHTML = m.motif;
    $('#dreamTags').textContent = m.label + ' \u00B7 ' + companions[c.companion].label + ' \u00B7 ' + destinations[c.destination].label;
    $('#dreamTitle').textContent = dream.title;
    $('#dreamStory').textContent = dream.story;
    copyStatus.textContent = '';
    engine.setAttribute('data-mood', c.mood);
    placeholder.hidden = true;
    card.hidden = false;
    /* restart the entrance animation */
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
  }

  function magicParticles(mood) {
    var box = $('#particles');
    if (reduceMotion) return;
    var palette = { peaceful: ['#D8C9F0', '#FFF7ED', '#9FB4E8'], adventurous: ['#F5D58A', '#FFB67A', '#F5C9D5'], mysterious: ['#B9A5F0', '#FFF7ED', '#7B6CC4'], magical: ['#F5D58A', '#F5C9D5', '#FFF7ED'] }[mood];
    for (var i = 0; i < 34; i++) {
      var p = document.createElement('span');
      p.className = 'particle';
      p.style.cssText = 'left:' + rand(4, 96) + '%;top:' + rand(55, 95) + '%;--s:' + rand(5, 12) + 'px;--x:' + rand(-50, 50) + 'px;--d:' + rand(1.2, 2.2) + 's;--c:' + pick(palette) + ';animation-delay:' + rand(0, .5) + 's';
      box.appendChild(p);
      (function (n) { setTimeout(function () { n.remove(); }, 2900); })(p);
    }
  }

  function generate(fromAgain) {
    var c = getChoices();
    createBtn.disabled = true;
    createBtn.textContent = 'Dreaming...';
    engine.setAttribute('data-mood', c.mood);
    magicParticles(c.mood);
    return wait(reduceMotion ? 0 : 1100).then(function () {
      var dream = buildDream(c);
      /* On "Dream again" make sure the dream changes when possible */
      if (fromAgain && lastDream) {
        for (var tries = 0; tries < 8 && dream.title === lastDream.title; tries++) dream = buildDream(c);
      }
      lastDream = dream;
      renderDream(dream);
      saveDream(dream);
      createBtn.disabled = false;
      createBtn.textContent = 'Create My Dream';
      if (window.innerWidth < 900) card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      card.focus({ preventScroll: true });
    });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); generate(false); });
  $('#againBtn').addEventListener('click', function () { generate(true); });
  $$('input[name="mood"]', form).forEach(function (r) {
    r.addEventListener('change', function () { engine.setAttribute('data-mood', r.value); });
  });
  $('#surpriseBtn').addEventListener('click', function () {
    ['mood', 'companion', 'destination'].forEach(function (name) {
      var radios = $$('input[name="' + name + '"]', form);
      pick(radios).checked = true;
    });
    generate(false);
  });

  /* Copy with Clipboard API + safe fallback */
  function setCopyMsg(msg) { copyStatus.textContent = msg; }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  $('#copyBtn').addEventListener('click', function () {
    if (!lastDream) return;
    var text = lastDream.title + '\n\n' + lastDream.story + '\n\n(Dreamed up at Pip\'s Midnight Nursery)';
    var done = function () { setCopyMsg('Copied! Share your dream with someone sleepy.'); };
    var failed = function () {
      if (fallbackCopy(text)) { done(); return; }
      /* Last resort: select the story so the person can copy by hand */
      var range = document.createRange();
      range.selectNodeContents($('#dreamStory'));
      var sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(range);
      setCopyMsg('Could not copy automatically. The story is selected, so press Ctrl+C (or Cmd+C).');
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, failed);
    } else { failed(); }
  });

  /* ---------- 10. Audio: music-box lullaby + chimes, made in the browser (Web Audio API) ---------- */
  /* One switch controls ALL sound. Off by default. Nothing plays until the visitor clicks something. */
  var audio = (function () {
    var ctx = null, master = null, timer = null, step = 0, on = false, ambient = false;
    var btn = $('#soundToggle'), label = $('#soundLabel');
    var N = { G3: 196, C4: 261.63, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880 };
    var melody = ['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'A4', 'C5', 'C5'];
    var scale = ['C5', 'D5', 'E5', 'G5', 'A5'];   /* the five Lullaby Lab keys */
    var supported = !!(window.AudioContext || window.webkitAudioContext);

    function ensure() {
      if (!supported) return false;
      if (!ctx) {
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          master = ctx.createGain();
          master.gain.value = 0.16;
          master.connect(ctx.destination);
        } catch (e) { supported = false; return false; }
      }
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    }
    function note(freq, dur, vol) {
      var t = ctx.currentTime;
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(master);
      osc.start(t); osc.stop(t + dur + 0.05);
    }
    function tick() {
      var name = melody[step % melody.length];
      note(N[name], 1.6, 0.55);
      if (step % 8 === 0) note(N.C4, 2.4, 0.3);
      if (step % 8 === 4) note(N.G3, 2.4, 0.3);
      step++;
    }
    function ui() {
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Mute all sound' : 'Turn sound on');
      if (label) label.textContent = on ? 'Sound on' : 'Sound off';
    }
    function stopAmbient() { clearInterval(timer); ambient = false; }
    function startAmbient() { clearInterval(timer); ambient = true; step = 0; tick(); timer = setInterval(tick, 650); }

    /* withAmbient = also play the gentle looping lullaby */
    function setOn(v, withAmbient) {
      if (v && !ensure()) {
        on = false;
        btn.disabled = true;
        if (label) label.textContent = 'No sound here';
        btn.setAttribute('aria-label', 'Sound is not available in this browser');
        return false;
      }
      on = v;
      stopAmbient();
      if (on && withAmbient) startAmbient();
      ui();
      return on;
    }
    /* Used when a visitor deliberately plays an instrument (music box, lab keys): turns sound on, without the background loop */
    function wake() { return on ? true : setOn(true, false); }

    function playPhrase() {
      if (!wake()) return false;
      var i = 0;
      (function next() {
        if (!on || i >= 8) return;
        note(N[melody[i]], 1.4, 0.55);
        i++;
        setTimeout(next, 330);
      })();
      return true;
    }
    function playNote(i) {
      if (!wake()) return false;
      note(N[scale[i]], 1.8, 0.6);
      return true;
    }
    /* tiny soft click sound, only when sound is already on */
    function chime() {
      if (!on || !ctx) return;
      note(N[scale[Math.floor(Math.random() * scale.length)]], 0.45, 0.22);
    }

    btn.addEventListener('click', function () {
      if (on) setOn(false); else setOn(true, true);
    });
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      clearInterval(timer);
      if (!document.hidden && on && ambient) timer = setInterval(tick, 650);
    });
    ui();
    return { setOn: setOn, playPhrase: playPhrase, playNote: playNote, chime: chime };
  })();

  /* Click chimes (only audible when sound is on) */
  document.addEventListener('click', function (e) {
    if (e.target.closest('#soundToggle, .lab-key')) return;
    if (e.target.closest('.btn, .chip, .tag, .creation, .moon, .jar, .pip-hit')) audio.chime();
  });

  /* Lullaby Lab keys */
  $$('.lab-key').forEach(function (k) {
    k.addEventListener('click', function () {
      var ok = audio.playNote(Number(k.getAttribute('data-note')));
      k.classList.add('pressed');
      setTimeout(function () { k.classList.remove('pressed'); }, 180);
      playResult.textContent = ok ? '' : 'Sound is not available in this browser.';
    });
  });

  /* Day / night toggle */
  var themeBtn = $('#themeToggle'), themeLabel = $('#themeLabel');
  function setDay(isDay) {
    document.documentElement.classList.toggle('day', isDay);
    themeBtn.setAttribute('aria-pressed', String(isDay));
    themeBtn.setAttribute('aria-label', isDay ? 'Switch to night' : 'Switch to day');
    themeLabel.textContent = isDay ? 'Day' : 'Night';
  }
  try { if (localStorage.getItem('pip-theme') === 'day') setDay(true); } catch (err) { /* storage blocked: ignore */ }
  themeBtn.addEventListener('click', function () {
    var next = !document.documentElement.classList.contains('day');
    setDay(next);
    try { localStorage.setItem('pip-theme', next ? 'day' : 'night'); } catch (err) { /* ignore */ }
  });

  /* ---------- Dream shelf: every dream becomes a jar (kept in this browser) ---------- */
  var SHELF_KEY = 'pip-dreams';
  var shelf = [];
  try {
    var stored = JSON.parse(localStorage.getItem(SHELF_KEY) || '[]');
    if (Array.isArray(stored)) shelf = stored.filter(function (d) {
      return d && typeof d.title === 'string' && typeof d.story === 'string' && d.choices && moods[d.choices.mood] && companions[d.choices.companion] && destinations[d.choices.destination];
    }).slice(0, 12);
  } catch (err) { shelf = []; }

  var jarsEl = $('#jars'), shelfEmpty = $('#shelfEmpty'), clearBtn = $('#clearShelf');

  function persistShelf() { try { localStorage.setItem(SHELF_KEY, JSON.stringify(shelf)); } catch (err) { /* storage blocked: shelf lasts until the page closes */ } }

  function renderShelf() {
    jarsEl.innerHTML = '';
    shelfEmpty.hidden = shelf.length > 0;
    clearBtn.hidden = shelf.length === 0;
    shelf.forEach(function (d, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      var col = moods[d.choices.mood].colors;
      b.type = 'button';
      b.className = 'jar';
      b.setAttribute('data-i', String(i));
      b.setAttribute('aria-label', 'Open saved dream: ' + d.title);
      b.style.setProperty('--ja', col.a);
      b.style.setProperty('--jb', col.b);
      var glass = document.createElement('span'); glass.className = 'jar-glass';
      var orb = document.createElement('span'); orb.className = 'jar-orb';
      glass.appendChild(orb);
      var name = document.createElement('span'); name.className = 'jar-name'; name.textContent = d.title;
      b.appendChild(glass); b.appendChild(name);
      li.appendChild(b); jarsEl.appendChild(li);
    });
  }

  function saveDream(dream) {
    shelf.unshift({ title: dream.title, story: dream.story, choices: dream.choices });
    shelf = shelf.slice(0, 12);
    persistShelf();
    renderShelf();
  }

  jarsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.jar');
    if (!b) return;
    var d = shelf[Number(b.getAttribute('data-i'))];
    if (!d) return;
    lastDream = d;
    renderDream(d);
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    card.focus({ preventScroll: true });
  });

  var clearTimer = null;
  clearBtn.addEventListener('click', function () {
    if (clearBtn.getAttribute('data-sure') !== '1') {
      clearBtn.setAttribute('data-sure', '1');
      clearBtn.textContent = 'Tap again to clear';
      clearTimer = setTimeout(function () { clearBtn.removeAttribute('data-sure'); clearBtn.textContent = 'Clear shelf'; }, 3000);
      return;
    }
    clearTimeout(clearTimer);
    clearBtn.removeAttribute('data-sure');
    clearBtn.textContent = 'Clear shelf';
    shelf = [];
    persistShelf();
    renderShelf();
  });
  renderShelf();

  /* ---------- Pip talks when you tap Pip ---------- */
  (function () {
    var hit = $('#pipHit'), bubble = $('#pipBubble'), art = $('.pip-wrap .pip-art');
    if (!hit || !bubble) return;
    var lines = [
      'Hi, I\'m Pip! Shh, the stars are sleeping.',
      'I\'m a Junior Dream Engineer. I fix wobbly dreams.',
      'Want a dream? Try the Dream Engine!',
      'Forgotten dreams are my favourite kind.',
      'Psst... the moon likes company.',
      'Sleepy? Me too. Always a little.'
    ];
    var n = 0, hideTimer = null;
    hit.addEventListener('click', function () {
      bubble.textContent = lines[n % lines.length];
      n++;
      bubble.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { bubble.classList.remove('show'); }, 3400);
      audio.chime();
      if (art && !reduceMotion) {
        art.classList.remove('wiggle'); void art.offsetWidth; art.classList.add('wiggle');
      }
    });
  })();

  /* ---------- Visit odometer (counts visits from THIS browser only) ---------- */
  (function () {
    var box = $('#odometer');
    if (!box) return;
    var visits = 1;
    try {
      visits = Number(localStorage.getItem('pip-visits')) || 0;
      if (!sessionStorage.getItem('pip-counted')) {
        visits += 1;
        localStorage.setItem('pip-visits', String(visits));
        sessionStorage.setItem('pip-counted', '1');
      }
      if (visits < 1) visits = 1;
    } catch (err) { visits = 1; }
    var text = String(Math.min(visits, 999999));
    while (text.length < 6) text = '0' + text;
    box.setAttribute('aria-label', 'Your visit number: ' + visits);
    box.innerHTML = '';
    var wheels = [];
    text.split('').forEach(function (d) {
      var w = document.createElement('span'); w.className = 'wheel';
      var col = document.createElement('span'); col.className = 'wheel-col';
      for (var n = 0; n <= 9; n++) { var c = document.createElement('span'); c.textContent = n; col.appendChild(c); }
      w.appendChild(col); box.appendChild(w); wheels.push([col, Number(d)]);
    });
    function roll() { wheels.forEach(function (p, i) { setTimeout(function () { p[0].style.transform = 'translateY(' + (-p[1] * 10) + '%)'; }, reduceMotion ? 0 : 150 * i); }); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { roll(); io.disconnect(); } }, { threshold: 0.4 });
      io.observe(box);
    } else { roll(); }
  })();

  /* ---------- Welcome-back note from Pip ---------- */
  (function () {
    var note = $('#welcomeNote');
    if (!note) return;
    var visits = 1;
    try { visits = Number(localStorage.getItem('pip-visits')) || 1; } catch (err) { visits = 1; }
    var text;
    if (visits <= 1) {
      text = 'First visit? Pip saved you a cosy spot.';
    } else {
      text = 'Welcome back! This is your visit no. ' + visits + '.';
      if (shelf.length) text += ' Pip is keeping ' + shelf.length + (shelf.length === 1 ? ' dream' : ' dreams') + ' safe for you.';
    }
    note.textContent = text;
    note.hidden = false;
  })();

  /* ---------- 11. Magical transition into the Dream Engine ---------- */
  var portal = $('#portal');
  $$('[data-enter-engine]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var go = function () {
        document.getElementById('engine').scrollIntoView({ behavior: 'auto', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', '#engine');
      };
      if (reduceMotion) { go(); return; }
      portal.classList.add('active');
      setTimeout(go, 520);
      setTimeout(function () { portal.classList.remove('active'); }, 1000);
    });
  });
})();
