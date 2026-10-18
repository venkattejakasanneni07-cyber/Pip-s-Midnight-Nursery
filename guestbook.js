
import { createClient } from
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Replace these two placeholders with your own Supabase details.
const SUPABASE_URL = 'https://obvmloxxjfvpuxynetuh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WP9pxlm-1Lsa5mNbQq6EBQ_LPpUrHto';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.querySelector('#guestbookForm');
const nameInput = document.querySelector('#guestName');
const wishInput = document.querySelector('#guestWish');
const status = document.querySelector('#guestbookStatus');
const entries = document.querySelector('#guestbookEntries');

async function loadWishes() {
  status.textContent = 'Loading dreams...';

  const { data, error } = await supabase
    .from('dream_guestbook')
    .select('id, display_name, wish, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Could not load wishes:', error);
    status.textContent = 'Could not load dreams. Please try again.';
    return;
  }

  entries.replaceChildren();

  for (const dream of data) {
    const item = document.createElement('li');
    const name = document.createElement('strong');
    const message = document.createElement('p');

    name.textContent = dream.display_name;
    message.textContent = dream.wish;

    item.append(name, message);
    entries.appendChild(item);
  }

  status.textContent = data.length
    ? `${data.length} dreams are shining in Pip's sky.`
    : 'The dream sky is quiet. Be the first to leave a wish!';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const display_name = nameInput.value.trim();
  const wish = wishInput.value.trim();

  if (
    !display_name ||
    !wish ||
    display_name.length > 30 ||
    wish.length > 280
  ) {
    status.textContent = 'Enter a name and a wish within the limits.';
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  status.textContent = 'Sending your dream...';

  try {
    const { error } = await supabase
      .from('dream_guestbook')
      .insert([{ display_name, wish }]);

    if (error) throw error;

    form.reset();
    status.textContent =
      "Your dream has reached Pip! It will appear after approval.";
  } catch (error) {
    console.error('Could not save wish:', error);
    status.textContent =
      'Your dream could not be saved. Please try again.';
  } finally {
    button.disabled = false;
  }
});

loadWishes();
