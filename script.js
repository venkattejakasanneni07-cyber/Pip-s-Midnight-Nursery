// ==========================================
// 1. MODAL LOGIC (For the Creations section)
// ==========================================
const modals = document.querySelectorAll('.modal');
const openButtons = document.querySelectorAll('.open-modal');

// Open modal
openButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const targetModal = document.getElementById(targetId);
    if (targetModal) {
      targetModal.hidden = false;
    }
  });
});

// Close modal when clicking the "X"
modals.forEach(modal => {
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.hidden = true;
    });
  }
});

// Close modal when pressing the "Escape" key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modals.forEach(modal => modal.hidden = true);
  }
});


// ==========================================
// 2. DREAM ENGINE LOGIC
// ==========================================
const choices = {
  mood: null,
  companion: null,
  place: null
};

// Handle clicking the option buttons
const chips = document.querySelectorAll('.chip');
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const group = chip.getAttribute('data-group');
    
    // Remove active style from other buttons in the same group
    document.querySelectorAll(`.chip[data-group="${group}"]`).forEach(c => {
      c.style.backgroundColor = ''; // reset color
      c.style.color = '';
    });
    
    // Highlight the clicked button
    chip.style.backgroundColor = '#252642';
    chip.style.color = '#FFF7ED';
    
    // Save the choice
    choices[group] = chip.getAttribute('data-value');
  });
});

// The text library for generating dreams
const moodText = {
  peaceful: "A Quiet",
  adventurous: "A Wild",
  magical: "A Shimmering"
};

const companionText = {
  moon: "the moon hums beside you",
  unicorn: "a unicorn braids starlight into your hair",
  star: "a star keeps time with your heartbeat"
};

const placeText = {
  "cloud-kingdom": "the Cloud Kingdom",
  "starlight-forest": "the Starlight Forest",
  "moon-garden": "the Moon Garden"
};

// Handle form submission (Create My Dream)
const engineForm = document.getElementById('engine-form');
engineForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Stops page from refreshing
  
  const hint = document.getElementById('engine-hint');
  
  // Check if they picked all 3
  if (!choices.mood || !choices.companion || !choices.place) {
    hint.textContent = "Pip needs all three choices first ✨";
    return;
  }
  
  hint.textContent = ""; // Clear hint
  
  // Generate the text
  const title = `${moodText[choices.mood]} Dream in ${placeText[choices.place]}`;
  const story = `You drift into ${placeText[choices.place]}, where ${companionText[choices.companion]}. Tonight feels completely ${choices.mood} — the kind of night Pip saves in the unicorn music box for later.`;
  
  // Update the HTML
  document.getElementById('dream-title').textContent = title;
  document.getElementById('dream-story').textContent = story;
  
  // Show the card
  const cardWrap = document.getElementById('dream-card-wrap');
  cardWrap.hidden = false;
  
  // Scroll down to it
  cardWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
});


// ==========================================
// 3. COPY TO CLIPBOARD
// ==========================================
const copyBtn = document.getElementById('copy-dream');
const copyFeedback = document.getElementById('copy-feedback');

copyBtn.addEventListener('click', async () => {
  const title = document.getElementById('dream-title').textContent;
  const story = document.getElementById('dream-story').textContent;
  const fullText = `${title}\n\n${story}`;
  
  try {
    // Modern way to copy
    await navigator.clipboard.writeText(fullText);
    copyFeedback.textContent = "Copied! Pip tucked it in your pocket. ✨";
  } catch (err) {
    // Fallback if browser blocks it
    copyFeedback.textContent = "Press Ctrl+C to copy.";
  }
  
  // Clear message after 3 seconds
  setTimeout(() => {
    copyFeedback.textContent = "";
  }, 3000);
});

// Dream Again button (Hides the card)
document.getElementById('dream-again').addEventListener('click', () => {
  document.getElementById('dream-card-wrap').hidden = true;
  // Scroll back up to the buttons
  document.getElementById('engine-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
});