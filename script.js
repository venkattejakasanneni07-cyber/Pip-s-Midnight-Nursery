const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// Pip says hello when visitors tap the character.
const pipMessages = [
  "Pip is saving you a little stardust.",
  "Oh! A visitor. I've polished the moon just for you.",
  "Tiny reminder: you're made of the same stuff as stars.",
  "Shhh... the dreams are almost ready."
];
let helloIndex = 0;
$("#pipHello").addEventListener("click", () => {
  helloIndex = (helloIndex + 1) % pipMessages.length;
  $("#pipMessage").textContent = pipMessages[helloIndex];
  $("#pipHello").classList.add("hello-pop");
  setTimeout(() => $("#pipHello").classList.remove("hello-pop"), 350);
});

// A gentle generated chime, only after the visitor explicitly enables sound.
let audioContext = null;
let soundEnabled = false;
function chime() {
  if (!soundEnabled) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, i) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.07, now + i * 0.12 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.55);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now + i * 0.12);
      oscillator.stop(now + i * 0.12 + 0.6);
    });
  } catch (error) {
    console.info("Audio is not available in this browser.", error);
  }
}
$("#soundToggle").addEventListener("click", async () => {
  soundEnabled = !soundEnabled;
  $("#soundToggle").setAttribute("aria-pressed", String(soundEnabled));
  $("#soundLabel").textContent = soundEnabled ? "Sound on" : "Sound off";
  if (soundEnabled) {
    chime();
  } else if (audioContext) {
    await audioContext.suspend();
  }
});

// Project cards open real detail dialogs.
const projects = {
  lantern: {
    image: "assets/pip_dream_lantern.png",
    alt: "Pip's crescent moon dream lantern",
    kicker: "OBJECT 001 / GUIDANCE",
    title: "The Moonlight Keeper",
    description: "Some dreams wander a little too far from home. Pip built this lantern to leave a trail of warm moonlight wherever a dream might go. Tap the little glow, take a breath, and imagine your own way home.",
    note: "FIELD NOTE: Best used when the night feels bigger than you do. Light level: one brave thought."
  },
  lullaby: {
    image: "assets/pip_lullaby_box.png",
    alt: "Pip's Lullaby Lab music box",
    kicker: "OBJECT 002 / COMFORT",
    title: "The Lullaby Lab",
    description: "A tiny music box that turns the noise of a long day into a softer melody. Pip tests every tune on a very sleepy cloud before it is cleared for delivery.",
    note: "FIELD NOTE: Winding key clockwise adds courage. One full turn equals three deep breaths."
  },
  cloud: {
    image: "assets/pip_portrait.png",
    alt: "Portrait of Pip the Junior Dream Engineer",
    kicker: "OBJECT 003 / CARE",
    title: "The Cloud Concierge",
    description: "Pip's most important invention might be Pipself: a small guide for lost thoughts, bedtime worries, and anyone who needs a reminder that even the dark can be gentle.",
    note: "FIELD NOTE: Open every night. Accepts worries of all sizes. No worry is too tiny."
  }
};
const dialog = $("#projectDialog");
$$(".project-card").forEach(card => {
  card.addEventListener("click", () => {
    const project = projects[card.dataset.project];
    $("#dialogImage").src = project.image;
    $("#dialogImage").alt = project.alt;
    $("#dialogKicker").textContent = project.kicker;
    $("#dialogTitle").textContent = project.title;
    $("#dialogDescription").textContent = project.description;
    $("#dialogNote").textContent = project.note;
    dialog.showModal();
    chime();
  });
});
$("#dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

// Dream engine: the selected mood changes the title, copy and scene palette.
const dreams = {
  wonder: {
    title: "The Almost-Moon Garden",
    description: "A little garden where the moon grows flowers that only bloom when you believe in them.",
    palette: "wonder",
    stamp: "PIP APPROVED"
  },
  peace: {
    title: "The Quiet Between Waves",
    description: "A sleepy island drifts on a lavender sea. Every wave carries one worry away, until all that remains is the sound of being safe.",
    palette: "peace",
    stamp: "SOFTLY SAFE"
  },
  adventure: {
    title: "The Door at Cloud's End",
    description: "A tiny golden door appears at the edge of the sky. Beyond it: floating forests, friendly comets, and a map that draws itself as you go.",
    palette: "adventure",
    stamp: "BRAVE DREAM"
  }
};
let selectedMood = "wonder";
$$(".mood-option").forEach(button => {
  button.addEventListener("click", () => {
    selectedMood = button.dataset.mood;
    $$(".mood-option").forEach(option => {
      const active = option === button;
      option.classList.toggle("active", active);
      option.querySelector(".mood-check").textContent = active ? "●" : "○";
    });
  });
});
$("#generateDream").addEventListener("click", () => {
  const dream = dreams[selectedMood];
  $("#dreamTitle").textContent = dream.title;
  $("#dreamDescription").textContent = dream.description;
  $(".dream-stamp").innerHTML = `${dream.stamp} <span>✳</span>`;
  const scene = $("#dreamScene");
  scene.classList.remove("scene-wonder", "scene-peace", "scene-adventure");
  scene.classList.add(`scene-${dream.palette}`);
  scene.animate(
    [{ opacity: .45, transform: "scale(.985)" }, { opacity: 1, transform: "scale(1)" }],
    { duration: 550, easing: "ease-out" }
  );
  $(".output-status").innerHTML = "<i></i> DREAM CREATED";
  chime();
});

// The hidden 3:17 AM secret. Find the moon near the closing note.
$("#secretMoon").addEventListener("click", () => {
  const message = $("#secretMessage");
  message.hidden = !message.hidden;
  $("#secretMoon").textContent = message.hidden ? "☾" : "✦";
  if (!message.hidden) {
    message.scrollIntoView({ behavior: "smooth", block: "center" });
    chime();
  }
});

// Scroll reveal, with a fallback for browsers without IntersectionObserver.
const revealItems = $$(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

// Tiny pointer response on desktop; disabled on touch screens.
const heroArt = $(".hero-art");
if (window.matchMedia("(pointer: fine)").matches) {
  heroArt.addEventListener("pointermove", event => {
    const bounds = heroArt.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    $(".pip-hero").style.transform = `translate(${x * 9}px, ${y * 7}px)`;
  });
  heroArt.addEventListener("pointerleave", () => {
    $(".pip-hero").style.transform = "";
  });
}
