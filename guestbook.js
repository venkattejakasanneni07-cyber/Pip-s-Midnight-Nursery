// Project URL (no /rest/v1/ at the end) and the PUBLISHABLE key.
// This key is safe in the browser because Row Level Security protects the table.
const SUPABASE_URL = 'https://obvmloxxjfvpuxynetuh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WP9pxlm-1Lsa5mNbQq6EBQ_LPpUrHto';

const SUPABASE_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm';

// The Supabase library is only downloaded when the visitor scrolls near the
// guestbook (or presses send), so it never slows down the first page load.
let clientPromise = null;
function getClient() {
  if (!clientPromise) {
    clientPromise = import(SUPABASE_LIB).then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_KEY)
    );
  }
  return clientPromise;
}

const form = document.querySelector('#guestbookForm');
const nameInput = document.querySelector('#guestName');
const wishInput = document.querySelector('#guestWish');
const nameCount = document.querySelector('#guestNameCount');
const wishCount = document.querySelector('#guestWishCount');
const status = document.querySelector('#guestbookStatus');
const entries = document.querySelector('#guestbookEntries');

const COOLDOWN_MS = 60 * 1000; // one wish per minute per browser
const COOLDOWN_KEY = 'pip-guestbook-last';

function updateCounts() {
  nameCount.textContent = `${nameInput.value.length} / 30`;
  wishCount.textContent = `${wishInput.value.length} / 280`;
}
nameInput.addEventListener('input', updateCounts);
wishInput.addEventListener('input', updateCounts);

function secondsToWait() {
  try {
    const last = Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
    return Math.max(0, Math.ceil((last + COOLDOWN_MS - Date.now()) / 1000));
  } catch (e) {
    return 0;
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadWishes() {
  status.textContent = 'Loading dreams...';

  let data, error;
  try {
    const supabase = await getClient();
    ({ data, error } = await supabase
    .from('dream_guestbook')
    .select('id, display_name, wish, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(30));
  } catch (e) {
    error = e;
  }

  if (error) {
    console.error('Could not load wishes:', error);
    status.textContent = 'Could not load dreams. Please try again later.';
    return;
  }

  entries.replaceChildren();

  for (const dream of data) {
    const item = document.createElement('li');
    const name = document.createElement('strong');
    const message = document.createElement('p');
    const when = document.createElement('time');

    name.textContent = dream.display_name;   // textContent: visitor text is never run as HTML
    message.textContent = dream.wish;
    when.dateTime = dream.created_at;
    when.textContent = formatDate(dream.created_at);

    item.append(name, message, when);
    entries.appendChild(item);
  }

  status.textContent = data.length
    ? `${data.length} ${data.length === 1 ? 'dream is' : 'dreams are'} shining in Pip's sky.`
    : 'The dream sky is quiet. Be the first to leave a wish!';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const display_name = nameInput.value.trim();
  const wish = wishInput.value.trim();

  if (!display_name || !wish || display_name.length > 30 || wish.length > 280) {
    status.textContent = 'Please enter a name (up to 30 letters) and a wish (up to 280).';
    return;
  }

  const wait = secondsToWait();
  if (wait > 0) {
    status.textContent = `Pip is still reading your last dream. Try again in ${wait}s.`;
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  status.textContent = 'Sending your dream...';

  try {
    const supabase = await getClient();
    const { error } = await supabase
      .from('dream_guestbook')
      .insert([{ display_name, wish }]);

    if (error) throw error;

    try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (e) { /* ignore */ }
    form.reset();
    updateCounts();
    status.textContent = 'Your dream has reached Pip! It will appear after approval.';
  } catch (error) {
    console.error('Could not save wish:', error);
    status.textContent = 'Your dream could not be saved. Please try again.';
  } finally {
    button.disabled = false;
  }
});

updateCounts();

// Load the wishes when the guestbook is close to the screen.
const guestbookSection = document.querySelector('#guestbook');
if ('IntersectionObserver' in window && guestbookSection) {
  const observer = new IntersectionObserver((items) => {
    if (items.some((i) => i.isIntersecting)) {
      observer.disconnect();
      loadWishes();
    }
  }, { rootMargin: '600px 0px' });
  observer.observe(guestbookSection);
} else {
  loadWishes();
}
