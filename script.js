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
      img.width = img.naturalWidth;     /* real size lets the browser reserve space (no layout shift) */
      img.height = img.naturalHeight;
      box.innerHTML = '';
      box.appendChild(img);
      box.dispatchEvent(new CustomEvent('art:ready'));
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
  var pipArt = $('.pip-wrap .pip-art');
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
      if (pipWrap) pipWrap.style.rotate = (x * 12) + 'deg';   /* Tier 1: head tilts toward the pointer */
      if (pipArt) pipArt.style.rotate = '1 0 0 ' + (-y * 12) + 'deg';   /* nod up / down toward the pointer */
      clouds.forEach(function (c, i) { c.style.marginTop = (y * (10 + i * 8)) + 'px'; });
    }, { passive: true });
    hero.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse' && pipWrap) { pipWrap.style.rotate = '0deg'; pipWrap.style.translate = '0px 0px'; if (pipArt) pipArt.style.rotate = '1 0 0 0deg'; }
    }, { passive: true });
  }

  /* touch: a tap lights up the hidden constellation where you touch */
  if (!reduceMotion && hero) {
    hero.addEventListener('pointerdown', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (e.pointerType !== 'mouse' && pipWrap) {   /* Tier 1 touch fallback: Pip leans toward your tap, then settles */
        var tx2 = (e.clientX - r.left) / r.width - 0.5;
        pipWrap.style.rotate = (tx2 * 16) + 'deg';
        pipWrap.style.translate = (tx2 * 22) + 'px 0px';
        if (pipArt) pipArt.style.rotate = '1 0 0 ' + (-((e.clientY - r.top) / r.height - 0.5) * 14) + 'deg';
        clearTimeout(pipWrap._settle);
        pipWrap._settle = setTimeout(function () { pipWrap.style.rotate = '0deg'; pipWrap.style.translate = '0px 0px'; if (pipArt) pipArt.style.rotate = '1 0 0 0deg'; }, 1400);
      }
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
      if (!on) { stopVoice(); if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } } }
      document.dispatchEvent(new CustomEvent('pip:sound'));
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

    /* Pip's baby voice: no real words, just cute babble made with the Web Audio API.
       Each syllable is a tiny chirp on a pentatonic scale, so the reply sounds like a small tune.
       The mood of the reply changes the tune: questions rise, "!" sparkles, sleepy replies hum a lullaby. */
    var VS = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];   /* C5 D5 E5 G5 A5 C6 D6 E6 */
    var bus = null;
    function canSpeak() { return supported; }
    function stopVoice() {
      if (!bus || !ctx) return;
      var b = bus; bus = null;
      try { b.gain.cancelScheduledValues(ctx.currentTime); b.gain.setTargetAtTime(0, ctx.currentTime, 0.02); } catch (e) { /* ignore */ }
      setTimeout(function () { try { b.disconnect(); } catch (e) { /* ignore */ } }, 250);
    }
    function seedFrom(text) {
      var h = 2166136261;
      for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
      return function () { h += 0x6D2B79F5; var t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }
    /* one chirp: a little "ba" / "wa" sound (chirps up, vowel-like filter opens) or a soft bell for the ending tune */
    function chirp(t, f, dur, vol, out, bell) {
      var g = ctx.createGain(), o1 = ctx.createOscillator();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o1.type = bell ? 'sine' : 'triangle';
      if (bell) {
        o1.frequency.setValueAtTime(f, t);
      } else {
        o1.frequency.setValueAtTime(f * 0.9, t);
        o1.frequency.exponentialRampToValueAtTime(f, t + 0.035);
      }
      o1.connect(g);
      if (!bell) {
        var o2 = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g2 = ctx.createGain();
        o2.type = 'sawtooth';
        o2.frequency.setValueAtTime(f * 0.9, t);
        o2.frequency.exponentialRampToValueAtTime(f, t + 0.035);
        flt.type = 'bandpass'; flt.Q.value = 3;
        flt.frequency.setValueAtTime(700, t);
        flt.frequency.linearRampToValueAtTime(1700, t + dur * 0.7);
        g2.gain.value = 0.55;
        o2.connect(flt); flt.connect(g2); g2.connect(g);
        o2.start(t); o2.stop(t + dur + 0.05);
      }
      g.connect(out);
      o1.start(t); o1.stop(t + dur + 0.05);
    }
    function babble(text) {
      if (!on || !ensure()) return false;
      try {
        stopVoice();
        text = String(text);
        var rnd = seedFrom(text);
        var sleepy = /(sleep|yawn|goodnight|good night|snuggle|shh|breathe|lullaby|dream|stars)/i.test(text);
        var ask = /\?\s*$/.test(text.trim());
        var happy = /!/.test(text) && !sleepy;
        var step = sleepy ? 0.3 : (happy ? 0.15 : 0.19);
        var dur = sleepy ? 0.25 : (happy ? 0.11 : 0.14);
        var hi = sleepy ? 4 : 7, idx = sleepy ? 2 : 3;
        bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master);
        var t = ctx.currentTime + 0.05, count = 0;
        var words = text.replace(/[^\w\s'.,!?]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 10);
        words.forEach(function (w) {
          var syl = Math.min(2, Math.ceil(w.replace(/[^a-z]/gi, '').length / 5)) || 1;
          for (var k = 0; k < syl && count < 16; k++, count++) {
            idx += [-2, -1, -1, 0, 1, 1, 2][Math.floor(rnd() * 7)];
            idx = Math.max(0, Math.min(hi, idx));
            chirp(t, VS[idx], dur, 0.7, bus, false);
            t += step;
          }
          t += /[.,!?]$/.test(w) ? 0.14 : 0.05;
        });
        /* the ending: a question rises, a happy reply sparkles, a sleepy one hums a falling lullaby, others settle down */
        if (ask) {
          chirp(t, VS[Math.min(7, idx + 1)], 0.16, 0.5, bus, false);
          chirp(t + 0.17, VS[Math.min(7, idx + 3)], 0.3, 0.5, bus, false);
        } else if (sleepy) {
          [2, 1, 0].forEach(function (n, i) { chirp(t + 0.1 + i * 0.38, VS[n], 0.9, 0.35, bus, true); });
        } else if (happy) {
          [3, 4, 5, 7].forEach(function (n, i) { chirp(t + 0.05 + i * 0.09, VS[n], 0.35, 0.3, bus, true); });
        } else {
          chirp(t, VS[3], 0.18, 0.5, bus, false);
          chirp(t + 0.2, VS[0], 0.4, 0.5, bus, false);
        }
        return true;
      } catch (e) { return false; }
    }

    /* Pip's spoken words: the browser's own voice, pitched as high as it allows, with a tiny sparkle first.
       Visitors can switch to the wordless babble instead. */
    var mode = 'words', tts = null;
    try { if (localStorage.getItem('pip-voice') === 'babble') mode = 'babble'; } catch (e) { /* ignore */ }
    function ttsOK() { return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'; }
    function pickTts() {
      if (!ttsOK()) return;
      var list = window.speechSynthesis.getVoices() || [];
      var en = list.filter(function (v) { return /^en/i.test(v.lang); });
      tts = en.filter(function (v) { return /(google uk english female|google us english|samantha|zira|aria|jenny|karen|susan|female)/i.test(v.name); })[0] || en[0] || null;
    }
    if (ttsOK()) {
      pickTts();
      if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', pickTts);
    }
    function speakWords(text) {
      try {
        window.speechSynthesis.cancel();
        var u = new window.SpeechSynthesisUtterance(String(text).replace(/…|\.\.\./g, ',').replace(/[“”"]/g, ''));
        u.lang = (tts && tts.lang) || 'en-US';
        if (tts) u.voice = tts;
        u.pitch = 2;
        u.rate = 1.05;
        u.volume = 1;
        window.speechSynthesis.speak(u);
        return true;
      } catch (e) { return false; }
    }
    function speak(text) {
      if (!on || !ensure()) return false;
      if (mode === 'words' && ttsOK()) {
        stopVoice();
        bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master);
        var t0 = ctx.currentTime + 0.02;
        [3, 5, 7].forEach(function (n, i) { chirp(t0 + i * 0.07, VS[n], 0.25, 0.35, bus, true); });
        return speakWords(text);
      }
      return babble(text);
    }
    function setMode(m) { mode = m === 'babble' ? 'babble' : 'words'; try { localStorage.setItem('pip-voice', mode); } catch (e) { /* ignore */ } }

    btn.addEventListener('click', function () {
      if (on) setOn(false); else setOn(true, true);
    });
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      clearInterval(timer);
      if (!document.hidden && on && ambient) timer = setInterval(tick, 650);
    });
    ui();
    return { setOn: setOn, wake: wake, speak: speak, canSpeak: canSpeak, ttsOK: ttsOK, getMode: function () { return mode; }, setMode: setMode, isOn: function () { return on; }, playPhrase: playPhrase, playNote: playNote, chime: chime };
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
    document.dispatchEvent(new CustomEvent('pip:mood', { detail: { day: next } }));
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

  /* ---------- Tier 2: Dream Delivery map (the route draws as you scroll) ---------- */
  (function () {
    var map = $('#deliveryMap'), line = $('#routeLine'), marker = $('#routeMarker');
    var stopsG = $('#routeStops'), note = $('#deliveryNote');
    if (!map || !line || !marker || !stopsG || !line.getTotalLength) return;
    var NS = 'http://www.w3.org/2000/svg';
    var len = line.getTotalLength();
    var stops = [
      { f: 0,    name: 'Pip\'s Nursery',   say: 'Pip is packing a freshly mended dream at the nursery.' },
      { f: 0.25, name: 'Cloud Kingdom',     say: 'Up through the Cloud Kingdom, where the pillows are the softest.' },
      { f: 0.5,  name: 'Starlight Forest',  say: 'Tiptoeing past the glowing trees of the Starlight Forest.' },
      { f: 0.75, name: 'Moon Garden',       say: 'Quietly crossing the Moon Garden. Nobody wake the moonflowers!' },
      { f: 1,    name: 'Candy Planet',      say: 'Delivered! The dream has landed on the Candy-coloured Planet.' }
    ];
    line.style.strokeDasharray = len;
    stops.forEach(function (st, i) {
      var pt = line.getPointAtLength(len * st.f);
      var side = Math.abs(pt.x - 220) < 12 ? (i % 2 === 0 ? 'right' : 'left') : (pt.x < 220 ? 'left' : 'right');
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'route-stop');
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); dot.setAttribute('r', 11);
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', side === 'left' ? pt.x - 24 : pt.x + 24);
      t.setAttribute('y', pt.y + 6);
      t.setAttribute('text-anchor', side === 'left' ? 'end' : 'start');
      t.textContent = st.name;
      g.appendChild(dot); g.appendChild(t);
      stopsG.appendChild(g);
      st.el = g;
    });
    var lastShown = -1;
    function apply(p) {
      line.style.strokeDashoffset = len * (1 - p);
      var pt = line.getPointAtLength(len * p);
      marker.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
      var current = 0;
      stops.forEach(function (st, i) {
        var lit = p >= st.f - 0.001;
        st.el.classList.toggle('lit', lit);
        if (lit) current = i;
      });
      if (current !== lastShown) { note.textContent = stops[current].say; lastShown = current; }
    }
    if (reduceMotion) { apply(1); return; }     /* reduced motion: show the finished route, no animation */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var r = map.getBoundingClientRect();
        var p = (window.innerHeight * 0.7 - r.top) / (r.height + window.innerHeight * 0.1);
        apply(Math.max(0, Math.min(1, p)));
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    apply(0); onScroll();
  })();

  /* ---------- Tier 2: Pip's pocket storybook (page-turn flip: buttons, swipe, arrow keys) ---------- */
  (function () {
    var book = $('#book'), prev = $('#bookPrev'), next = $('#bookNext'), count = $('#bookCount');
    if (!book || !prev || !next || !count) return;
    var pages = $$('.page', book), cur = 0, total = pages.length;
    pages.forEach(function (p, i) { p.style.zIndex = String(total - i); });
    function render() {
      pages.forEach(function (p, i) {
        p.classList.toggle('turned', i < cur);
        p.setAttribute('aria-hidden', i === cur ? 'false' : 'true');
      });
      count.textContent = 'Page ' + (cur + 1) + ' of ' + total;
      prev.setAttribute('aria-disabled', cur === 0 ? 'true' : 'false');
      next.setAttribute('aria-disabled', cur === total - 1 ? 'true' : 'false');
    }
    function go(d) {
      var n = Math.max(0, Math.min(total - 1, cur + d));
      if (n === cur) return;
      cur = n; render(); audio.chime();
    }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    book.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
    });
    var startX = null;
    book.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    book.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (dx < -40) go(1); else if (dx > 40) go(-1);
    });
    book.addEventListener('pointercancel', function () { startX = null; });
    render();
  })();

  /* ---------- Tier 2: Pip's nightlight (a spotlight that reveals hidden wishes) ---------- */
  (function () {
    var stage = $('#nightlight'), wrap = $('#nlWishes'), countEl = $('#nlCount'), resetBtn = $('#nlReset');
    if (!stage || !wrap || !countEl || !resetBtn) return;
    var WORDS = ['a soft cloud', 'a warm lantern', 'a quiet lullaby', 'a moon hug', 'a sleepy sheep', 'a starry blanket'];
    var wishes = [], found = 0, lx = 0, ly = 0, R = 95;
    function size() { R = Math.max(60, Math.min(100, stage.clientWidth * 0.14)); stage.style.setProperty('--nl-r', R + 'px'); }
    function message() {
      countEl.textContent = found >= WORDS.length ? 'You found all six wishes! Pip says sweet dreams.' : 'Wishes found: ' + found + ' of ' + WORDS.length;
    }
    function build() {
      wrap.innerHTML = ''; wishes = []; found = 0;
      WORDS.forEach(function (word) {
        var x, y, tries = 0, ok;
        do {
          x = rand(0.18, 0.82); y = rand(0.18, 0.82); ok = true; tries++;
          wishes.forEach(function (w) { var dx = (w.x - x) * 2, dy = w.y - y; if (Math.sqrt(dx * dx + dy * dy) < 0.4) ok = false; });
        } while (!ok && tries < 60);
        var el = document.createElement('div');
        el.className = 'nl-wish';
        el.style.left = (x * 100) + '%'; el.style.top = (y * 100) + '%';
        el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-star"/></svg><span></span>';
        el.lastChild.textContent = word;
        wrap.appendChild(el);
        wishes.push({ x: x, y: y, el: el, found: false });
      });
      message();
    }
    function check() {
      var w = stage.clientWidth, h = stage.clientHeight, hit = false;
      wishes.forEach(function (ws) {
        if (ws.found) return;
        var dx = ws.x * w - lx, dy = ws.y * h - ly;
        if (dx * dx + dy * dy < (R * 0.75) * (R * 0.75)) { ws.found = true; ws.el.classList.add('found'); found++; hit = true; }
      });
      if (hit) { message(); audio.chime(); }
    }
    function setLight(x, y, quiet) {
      lx = Math.max(0, Math.min(stage.clientWidth, x));
      ly = Math.max(0, Math.min(stage.clientHeight, y));
      stage.style.setProperty('--lx', lx + 'px');
      stage.style.setProperty('--ly', ly + 'px');
      if (!quiet) check();
    }
    function fromPointer(e) {
      var r = stage.getBoundingClientRect();
      stage.classList.add('moved');
      setLight(e.clientX - r.left, e.clientY - r.top);
    }
    stage.addEventListener('pointermove', fromPointer, { passive: true });
    stage.addEventListener('pointerdown', fromPointer, { passive: true });
    stage.addEventListener('keydown', function (e) {
      var step = 32, dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step; else if (e.key === 'ArrowDown') dy = step;
      else return;
      e.preventDefault();
      stage.classList.add('moved');
      setLight(lx + dx, ly + dy);
    });
    resetBtn.addEventListener('click', function () { build(); setLight(stage.clientWidth / 2, stage.clientHeight / 2, true); });
    window.addEventListener('resize', function () { size(); setLight(lx, ly, true); });
    size(); build(); setLight(stage.clientWidth / 2, stage.clientHeight / 2, true);
  })();

  /* ---------- Tier 2: mini-game, catch the falling dreams ---------- */
  (function () {
    var cv = $('#gameCanvas'), startBtn = $('#gameStart'), status = $('#gameStatus');
    if (!cv || !cv.getContext || !startBtn || !status) return;
    var W = 400, H = 320, DPR = 2, ROUND = 30;
    cv.width = W * DPR; cv.height = H * DPR;
    var g = cv.getContext('2d');
    g.scale(DPR, DPR);
    var mode = 'idle', timeLeft = ROUND, score = 0, items = [], pops = [], spawnT = 0.5;
    var cloud = { x: W / 2, target: W / 2, w: 88, h: 34 };
    var keys = { left: false, right: false };
    var best = 0;
    try { best = Number(localStorage.getItem('pip-game-best')) || 0; } catch (err) { /* ignore */ }
    var bg = [];
    for (var i = 0; i < 40; i++) bg.push({ x: rand(0, W), y: rand(0, H - 60), r: rand(0.6, 1.6), p: rand(0, 6) });

    function setStatus(t) { status.textContent = t; }
    function start() {
      mode = 'playing'; timeLeft = ROUND; score = 0; items = []; pops = []; spawnT = 0.4;
      cloud.x = cloud.target = W / 2;
      startBtn.textContent = 'Restart';
      setStatus("Go! Slide Pip's cloud to catch the falling dreams.");
      try { cv.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
    }
    function end() {
      mode = 'over';
      var newBest = score > best;
      if (newBest) { best = score; try { localStorage.setItem('pip-game-best', String(best)); } catch (err) { /* ignore */ } }
      startBtn.textContent = 'Play again';
      setStatus('Time is up! You caught ' + score + (score === 1 ? ' dream. ' : ' dreams. ') + (newBest && score > 0 ? 'That is your best yet! ' : 'Best: ' + best + '. ') + 'Sweet dreams.');
    }
    function step(dt) {
      timeLeft -= dt;
      if (timeLeft <= 0) { timeLeft = 0; end(); return; }
      var elapsed = ROUND - timeLeft;
      if (keys.left) cloud.target -= 300 * dt;
      if (keys.right) cloud.target += 300 * dt;
      cloud.target = Math.max(cloud.w / 2, Math.min(W - cloud.w / 2, cloud.target));
      cloud.x += (cloud.target - cloud.x) * Math.min(1, dt * 12);
      spawnT -= dt;
      if (spawnT <= 0) {
        spawnT = Math.max(0.42, 0.95 - elapsed * 0.012);
        items.push({ x: rand(20, W - 20), y: -14, vy: rand(70, 115) + elapsed * 1.6, r: 11, kind: Math.random() < 0.2 ? 'orb' : 'star', ph: rand(0, 6) });
      }
      var top = H - 52;
      for (var k = items.length - 1; k >= 0; k--) {
        var it = items[k];
        it.y += it.vy * dt;
        if (it.y + it.r >= top && it.y - it.r <= top + 24 && Math.abs(it.x - cloud.x) < cloud.w / 2 + it.r * 0.4) {
          score += it.kind === 'orb' ? 2 : 1;
          pops.push({ x: it.x, y: top, t: 0 });
          audio.chime();
          items.splice(k, 1);
        } else if (it.y > H + 20) {
          items.splice(k, 1);
        }
      }
      for (var q = pops.length - 1; q >= 0; q--) { pops[q].t += dt; if (pops[q].t > 0.5) pops.splice(q, 1); }
    }
    function star(x, y, r, rot) {
      g.beginPath();
      for (var n = 0; n < 10; n++) {
        var rad = n % 2 === 0 ? r : r * 0.45, a = rot + n * Math.PI / 5 - Math.PI / 2;
        g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
      }
      g.closePath(); g.fill();
    }
    function draw(ts) {
      var sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#1d2250'); sky.addColorStop(1, '#4a4a8c');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      bg.forEach(function (s) {
        g.globalAlpha = reduceMotion ? 0.7 : 0.35 + 0.35 * Math.sin(ts / 700 + s.p);
        g.fillStyle = '#FFF7ED'; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.3); g.fill();
      });
      g.globalAlpha = 1;
      items.forEach(function (it) {
        g.shadowColor = it.kind === 'orb' ? 'rgba(216,201,240,.9)' : 'rgba(245,213,138,.9)'; g.shadowBlur = 12;
        g.fillStyle = it.kind === 'orb' ? '#D8C9F0' : '#F5D58A';
        if (it.kind === 'orb') { g.beginPath(); g.arc(it.x, it.y, it.r, 0, 6.3); g.fill(); }
        else star(it.x, it.y, it.r, reduceMotion ? 0 : ts / 900 + it.ph);
        g.shadowBlur = 0;
      });
      pops.forEach(function (p) {
        g.globalAlpha = 1 - p.t / 0.5; g.strokeStyle = '#F5D58A'; g.lineWidth = 2;
        g.beginPath(); g.arc(p.x, p.y, 8 + p.t * 40, 0, 6.3); g.stroke();
      });
      g.globalAlpha = 1;
      var cx = cloud.x, cy = H - 40;
      g.fillStyle = '#FFF7ED'; g.shadowColor = 'rgba(255,247,237,.6)'; g.shadowBlur = 14;
      g.beginPath();
      g.arc(cx - 26, cy + 2, 14, 0, 6.3); g.arc(cx, cy - 6, 19, 0, 6.3); g.arc(cx + 26, cy + 2, 14, 0, 6.3);
      g.fill();
      g.fillRect(cx - 28, cy + 2, 56, 14);
      g.shadowBlur = 0;
      g.fillStyle = '#252642';
      g.beginPath(); g.arc(cx - 6, cy + 2, 2.2, 0, 6.3); g.arc(cx + 6, cy + 2, 2.2, 0, 6.3); g.fill();
      g.strokeStyle = '#252642'; g.lineWidth = 1.6; g.beginPath(); g.arc(cx, cy + 5, 4, 0.2, Math.PI - 0.2); g.stroke();
      g.font = '700 16px "Nunito", system-ui, sans-serif'; g.textBaseline = 'top';
      g.fillStyle = '#FFF7ED'; g.textAlign = 'left'; g.fillText('Dreams: ' + score, 12, 10);
      g.textAlign = 'right'; g.fillText('Time: ' + Math.ceil(timeLeft), W - 12, 10);
      if (mode !== 'playing') {
        g.fillStyle = 'rgba(24,25,51,.62)'; g.fillRect(0, 0, W, H);
        g.textAlign = 'center'; g.fillStyle = '#F5D58A'; g.font = 'italic 700 24px Georgia, serif';
        g.fillText(mode === 'over' ? 'Sweet dreams! You caught ' + score : 'Ready when you are', W / 2, H / 2 - 24);
        g.font = '700 15px "Nunito", system-ui, sans-serif'; g.fillStyle = '#FFF7ED';
        g.fillText(mode === 'over' ? 'Best: ' + best + '. Press Play again.' : 'Press Start' + (best ? '. Best: ' + best : ''), W / 2, H / 2 + 12);
      }
    }
    var last = 0, raf = 0, onScreen = true;
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)); last = ts;
      if (mode === 'playing') step(dt);
      draw(ts);
    }
    function sync() {
      var shouldRun = onScreen && !document.hidden;
      if (shouldRun && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!shouldRun && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(cv);
    }
    document.addEventListener('visibilitychange', sync);
    function fromPointer(e) {
      var r = cv.getBoundingClientRect();
      cloud.target = Math.max(cloud.w / 2, Math.min(W - cloud.w / 2, (e.clientX - r.left) / r.width * W));
    }
    cv.addEventListener('pointermove', fromPointer, { passive: true });
    cv.addEventListener('pointerdown', fromPointer, { passive: true });
    cv.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.left = true; e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = true; e.preventDefault(); }
      else if ((e.key === 'Enter' || e.key === ' ') && mode !== 'playing') { start(); e.preventDefault(); }
    });
    cv.addEventListener('keyup', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    });
    cv.addEventListener('blur', function () { keys.left = keys.right = false; });
    startBtn.addEventListener('click', start);
    sync();
  })();

  /* ---------- Tier 1: Pip's eyes follow the pointer ----------
     The official picture is never edited. Two small patches in the socket colour
     cover the painted glints, and two new glints slide toward the pointer. The eyes
     only appear when the real picture has loaded (not on the backup drawing) and
     are skipped when the visitor prefers reduced motion. */
  (function () {
    if (reduceMotion) return;
    var box = $('.pip-art');
    if (!box) return;
    /* centre of each painted glint in the 800 x 973 picture, plus the socket colour around it */
    var EYES = [ { x: 350, y: 395, c: '#50322a' }, { x: 466, y: 367, c: '#7a5a52' } ];
    var eyes = [], idleTimer = null, lastX = 0, lastY = 0, queued = false;

    function build() {
      if (box.querySelector('.pip-eyes') || !box.querySelector('img')) return;
      var layer = document.createElement('div');
      layer.className = 'pip-eyes';
      layer.setAttribute('aria-hidden', 'true');
      EYES.forEach(function (e) {
        var el = document.createElement('span');
        el.className = 'pip-eye';
        el.style.left = (e.x / 8) + '%';
        el.style.top = (e.y / 9.73) + '%';
        el.style.setProperty('--patch', e.c);
        el.innerHTML = '<i class="pip-glint"></i>';
        layer.appendChild(el);
        eyes.push(el);
      });
      box.appendChild(layer);
    }
    function look(x, y) {
      eyes.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var k = Math.min(1, dist / 240);
        el.style.setProperty('--ex', (dx / dist * k).toFixed(3));
        el.style.setProperty('--ey', (dy / dist * k).toFixed(3));
      });
    }
    function centre() { eyes.forEach(function (el) { el.style.setProperty('--ex', '0'); el.style.setProperty('--ey', '0'); }); }
    function later(ms) { clearTimeout(idleTimer); idleTimer = setTimeout(centre, ms); }

    box.addEventListener('art:ready', build);
    build();

    /* mouse or pen: the eyes follow the pointer anywhere on the page */
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' || !eyes.length) return;
      lastX = e.clientX; lastY = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; look(lastX, lastY); }); }
      later(4000);
    }, { passive: true });
    /* touch: a tap on the hero makes Pip look at your finger for a moment */
    var heroEl = $('.hero');
    if (heroEl) heroEl.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || !eyes.length) return;
      look(e.clientX, e.clientY); later(1500);
    }, { passive: true });
  })();

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
    function say(text) {
      bubble.textContent = text;
      bubble.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { bubble.classList.remove('show'); }, 3400);
    }
    /* Tier 1: the Day/Night toggle changes Pip's mood, shown by the badge and by what Pip says */
    document.addEventListener('pip:mood', function (ev) {
      say(ev.detail && ev.detail.day ? 'Ooh, so bright! Good morning, sleepyhead.' : 'Lights low again. My favourite time!');
    });
    hit.addEventListener('click', function () {
      say(lines[n % lines.length]);
      n++;
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

  /* ---------- Tier 3: Pip remembers the visitor (name, visits, last dream; kept in this browser only) ---------- */
  var memory = (function () {
    var NAME_KEY = 'pip-name';
    var name = '';
    function clean(s) { return String(s || '').replace(/[<>\u0000-\u001F]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); }
    try { name = clean(localStorage.getItem(NAME_KEY)); } catch (err) { name = ''; }

    function visits() {
      try { return Number(localStorage.getItem('pip-visits')) || 1; } catch (err) { return 1; }
    }
    function dayPart() {
      var h = new Date().getHours();
      if (h < 5) return 'Sleepy hello';
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      if (h < 21) return 'Good evening';
      return 'Good night';
    }
    function lastDream() { return shelf.length ? shelf[0].title : ''; }
    function greeting() {
      var v = visits(), who = name ? ', ' + name : '';
      var text;
      if (v <= 1) {
        text = 'Hello' + who + '! First visit? Pip saved you a cosy spot.';
      } else {
        text = dayPart() + who + '! Welcome back, this is your visit no. ' + v + '.';
        if (shelf.length) text += ' Pip kept your dream “' + lastDream() + '” safe.';
      }
      return text;
    }
    function set(v) {
      name = clean(v);
      try { if (name) localStorage.setItem(NAME_KEY, name); else localStorage.removeItem(NAME_KEY); } catch (err) { /* storage blocked: Pip remembers until the page closes */ }
      document.dispatchEvent(new CustomEvent('pip:name'));
      return name;
    }
    return { get name() { return name; }, set: set, clean: clean, greeting: greeting, visits: visits, lastDream: lastDream };
  })();

  /* Welcome note under the hero buttons */
  (function () {
    var note = $('#welcomeNote');
    if (!note) return;
    function show() { note.textContent = memory.greeting(); note.hidden = false; }
    show();
    document.addEventListener('pip:name', show);
  })();

  /* ---------- Tier 3: Chat with Pip (rule-based dialogue in Pip's voice, no server) ---------- */
  (function () {
    var log = $('#chatLog'), form = $('#chatForm'), input = $('#chatInput'), chips = $('#chatChips');
    var nameForm = $('#nameForm'), nameInput = $('#nameInput'), nameStatus = $('#nameStatus'), forgetBtn = $('#forgetBtn');
    if (!log || !form || !input || !nameForm || !nameInput || !forgetBtn) return;

    function fill(s) { return s.replace(/\{name\}/g, memory.name || 'friend'); }

    /* Each rule: a pattern to look for, and a few replies Pip takes in turn. Order matters: first match wins. */
    var rules = [
      { re: /(my name is|call me|you can call me)\s+([^.!?,]{1,16})/, learn: true },
      { re: /\b(bye|goodbye|good night|goodnight|night night|gotta go|see you)\b/, say: [
        'Goodnight, {name}. I will keep the nightlight on for you.',
        'Sweet dreams, {name}! Come back soon, I will save you a cloud.'] },
      { re: /\b(thanks|thank you|thx)\b/, say: [
        'You are so welcome, {name}. It makes my little star glow.',
        'Aww. Thank you for being kind. Kind people are my favourite.'] },
      { re: /(who made you|are you (a |an )?(real|ai|robot|bot|human)|chatgpt|claude)/, say: [
        'I am Pip, a storybook character on this website. I follow simple rules, so I am not a real baby, but I do my best to be cosy.'] },
      { re: /(who are you|what are you|your name|about you|introduce)/, say: [
        'I am Pip, a Junior Dream Engineer! I am a baby with a little skull face, a star nightcap and heart pyjamas. I mend forgotten dreams.',
        'Pip, at your service. Small enough to hide in a teacup, big enough to hold a dream.'] },
      { re: /(how are you|how do you feel|you ok|you okay)/, say: [
        'A little sleepy, a little sparkly. Mostly happy that you are here, {name}.'] },
      { re: /(nightmare|bad dream|scared|afraid|frightened|spooky|monster)/, say: [
        'Oh, {name}. Nothing in my nursery is scary, I promise. Even the shadows are just sleepy clouds. Take a slow breath with me. In... and out.',
        'Bad dreams are only dreams that need mending. That is my job! Think of something warm, like a lantern or a cuddly cloud.'] },
      { re: /(can'?t sleep|cannot sleep|insomnia|awake|trouble sleeping|not sleepy)/, say: [
        'Shh, {name}. Try counting stars with me: one tiny star, two tiny stars, three tiny stars... Tap the Dreambox for a lullaby.',
        'Close your eyes and picture my moon lantern glowing softly. Breathe in slowly, breathe out slowly. Goodnight stars.'] },
      { re: /(tired|sleepy|sleep|bedtime|nap|yawn)/, say: [
        'Sleepy is my favourite feeling. Snuggle in, {name}, the nursery is warm.',
        'Yaaawn. Now you made me sleepy too. Five more minutes of stars?'] },
      { re: /(sing|lullaby|music|song|hum)/, say: [
        'La la la, twinkle twinkle... I am better at fixing dreams than singing. Open the Unicorn Dreambox in Creations and play the star keys instead!'] },
      { re: /(joke|funny|make me laugh|riddle)/, say: [
        'Why did the moon skip dinner? It was already full!',
        'What do dreams wear to bed? Pyjamas, of course. Just like me!',
        'What is a star’s favourite snack? Moon pies, naturally.',
        'Why was the pillow so happy? It had a soft spot for everyone.'] },
      { re: /(dream)/, say: [
        'I dream about jars full of glowing dreams, floating clouds and a music box that never runs out. Want one of your own? Try the Dream Engine!',
        'My favourite dreams are the forgotten ones. They are shy, so I whisper to them until they come out.'] },
      { re: /(lantern|light|nightlight)/, say: [
        'My Moonlight Lantern turns dark corners into tiny constellations. Try finding the hidden wishes in the nightlight game!'] },
      { re: /(music box|unicorn|dreambox)/, say: [
        'The Unicorn Dreambox keeps the happiest dreams safe. Open it in Creations and play the five star keys.'] },
      { re: /(pillow|cloud|bed|blanket)/, say: [
        'Cloud Pillow No. 7 grows a brand new dream landscape every night. Number seven is my softest one.'] },
      { re: /(moon)/, say: [
        'The moon is my friend. Shh, I heard it is only pretending to be sleepy.'] },
      { re: /(star|stars|sparkle)/, say: [
        'Stars are tiny night lights that blink hello. I have a golden one that I hold when I am nervous.'] },
      { re: /(skull|bones|face|scary looking)/, say: [
        'Yes, I have a skull face! It is just my friendliest face. Nothing spooky about a baby who loves lullabies.'] },
      { re: /(game|play|catch|fun)/, say: [
        'Let us play! Scroll to “Catch the falling dreams”, or hunt for my wishes in the dark.'] },
      { re: /(story|book|tell me)/, say: [
        'Ooh, a story! Turn the pages of my pocket storybook, or scroll up to see how my nursery began.'] },
      { re: /(favou?rite|like best|love most)/, say: [
        'My favourite things are my moon lantern, my lullaby music box, and anyone who stops by to say hello.'] },
      { re: /(colou?r)/, say: [
        'Soft lavender, blush pink and moon gold. The colours of a good night sky.'] },
      { re: /(eat|food|hungry|snack|cookie|milk)/, say: [
        'Warm milk and a moon-shaped cookie, please. Crumbs for the stars!'] },
      { re: /(love you|like you|you are cute|you.re cute|cute)/, say: [
        'Aww, {name}! I love you too, in a sleepy, squishy, starry way.'] },
      { re: /(secret|easter egg|hidden)/, say: [
        'A secret? Shh. I heard the moon likes company, and that curious people are my favourite kind.'] },
      { re: /(sound|mute|volume|loud|quiet)/, say: [
        'Sound is off until you turn it on, so the nursery stays quiet. The Sound button is at the top right.'] },
      { re: /(help|what can (you|i) do|what do you do)/, say: [
        'You can ask me about dreams, sleep, my creations, or ask for a joke. You can also make a dream in the Dream Engine!'] },
      { re: /\b(hi|hello|hey|hiya|howdy|namaste|yo)\b|good (morning|afternoon|evening)/, say: [
        'Hello, {name}! I was just tucking a dream in. Shh, softly now.',
        'Hi again! The stars were just asking about you.'] }
    ];
    var fallbacks = [
      'Hmm, I am not sure I understood, {name}. I am only a sleepy baby! Try asking about dreams, sleep, or tell me a joke.',
      'The stars did not quite catch that. Ask me who I am, or tap one of the little suggestions.',
      'Yaaawn... could you say that another way? I like questions about dreams and lullabies.'
    ];
    var used = {}, fb = 0;

    function addMsg(who, text, extra) {
      var p = document.createElement('p');
      p.className = 'msg ' + (who === 'pip' ? 'msg-pip' : 'msg-you') + (extra ? ' ' + extra : '');
      var w = document.createElement('span');
      w.className = 'msg-who';
      w.textContent = who === 'pip' ? 'Pip' : (memory.name || 'You');
      p.appendChild(w);
      p.appendChild(document.createTextNode(text));
      log.appendChild(p);
      while (log.children.length > 40) log.removeChild(log.firstChild);
      log.scrollTop = log.scrollHeight;
      return p;
    }

    function answer(text) {
      var t = text.toLowerCase();
      for (var i = 0; i < rules.length; i++) {
        var m = t.match(rules[i].re);
        if (!m) continue;
        if (rules[i].learn) {
          var nm = memory.clean(text.slice(t.indexOf(m[0]) + m[1].length).replace(/^[\s:,-]+/, '').split(/[.!?,]/)[0]);
          if (!nm) return fallbacks[0];
          memory.set(nm);
          return 'Nice to meet you, ' + memory.name + '! Pip will remember your name.';
        }
        var arr = rules[i].say;
        used[i] = ((used[i] === undefined ? -1 : used[i]) + 1) % arr.length;
        return fill(arr[used[i]]);
      }
      fb = (fb + 1) % fallbacks.length;
      return fill(fallbacks[fb]);
    }

    function pipSays(text) {
      var typing = addMsg('pip', 'Pip is thinking…', 'msg-typing');
      typing.setAttribute('aria-hidden', 'true');
      var delay = reduceMotion ? 0 : 650;
      setTimeout(function () {
        typing.remove();
        addMsg('pip', text);
        if (!audio.speak(text)) audio.chime();
      }, delay);
    }

    function send(text) {
      text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      if (!text) return;
      addMsg('you', text);
      pipSays(answer(text));
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = '';
      send(v);
    });
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-say]');
      if (b) send(b.getAttribute('data-say'));
    });

    /* name form: Pip remembers the visitor's name in this browser */
    function syncName() {
      var has = !!memory.name;
      forgetBtn.hidden = !has;
      if (document.activeElement !== nameInput) nameInput.value = memory.name;
    }
    nameForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = memory.clean(nameInput.value);
      if (!n) { nameStatus.textContent = 'Type a name first, or Pip will just say “friend”.'; return; }
      memory.set(n);
      nameInput.value = memory.name;
      nameStatus.textContent = 'Saved! Pip will remember you, ' + memory.name + '.';
      pipSays('Nice to meet you, ' + memory.name + '! I will remember you next time.');
    });
    forgetBtn.addEventListener('click', function () {
      memory.set('');
      nameInput.value = '';
      nameStatus.textContent = 'Pip forgot your name. Fresh start!';
      pipSays('Poof! I forgot your name. Who are you again, little stranger?');
      forgetBtn.hidden = true;
    });
    document.addEventListener('pip:name', syncName);
    syncName();

    /* voice button: mirrors the header Sound switch, so mute always works */
    var voiceBtn = $('#voiceBtn');
    if (voiceBtn) {
      if (!audio.canSpeak()) {
        voiceBtn.hidden = true;
      } else {
        var syncVoice = function () {
          var on = audio.isOn();
          voiceBtn.setAttribute('aria-pressed', String(on));
          voiceBtn.textContent = on ? 'Pip\u2019s voice: on (tap to mute)' : 'Hear Pip\u2019s voice';
        };
        voiceBtn.addEventListener('click', function () {
          if (audio.isOn()) { audio.setOn(false); } else { audio.wake(); audio.speak('Hi! It is me, Pip!'); }
          syncVoice();
        });
        document.addEventListener('pip:sound', syncVoice);
        syncVoice();
        var styleBtn = $('#voiceStyle');
        if (styleBtn) {
          if (!audio.ttsOK()) { styleBtn.hidden = true; } else {
            var syncStyle = function () { styleBtn.textContent = audio.getMode() === 'words' ? 'Voice: cute words (tap for babble)' : 'Voice: baby babble (tap for words)'; };
            styleBtn.addEventListener('click', function () {
              audio.setMode(audio.getMode() === 'words' ? 'babble' : 'words');
              syncStyle();
              audio.speak('Hi! It is me, Pip!');
            });
            syncStyle();
          }
        }
      }
    }

    /* opening line: a personal greeting that uses what Pip remembers */
    addMsg('pip', memory.greeting() + ' Type something, or tap a suggestion below.');
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
