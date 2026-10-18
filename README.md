# Pip's Midnight Nursery

Entry for haX.baby "Baby's First Website", Track 1. Plain HTML, CSS and JavaScript. No installs and no build step. The only online part is the live dream guestbook, which uses a free Supabase database (see "Guestbook (Supabase)" below).

## Folder structure

```
pips-midnight-nursery/
  index.html
  style.css
  script.js
  guestbook.js     <- live guestbook (Supabase)
  STORY.md
  README.md
  assets/
    images/     <- put the official haX images here
```

## Run it

1. Open the folder in VS Code (File > Open Folder).
2. Install the free "Live Server" extension.
3. Right-click `index.html` > "Open with Live Server". The guestbook is a JavaScript module, so it needs Live Server or the live site. If you only double-click `index.html`, the rest of the page works but the guestbook cannot load.

## Official art (already included)

The four official haX pictures are in `assets/images/`, resized to small JPGs so the page loads fast:

| File | Used for |
|---|---|
| `pip_avatar_cloud.jpg` | Hero Pip and story scene 4 |
| `pip_portrait.jpg` | Meet Pip and the goodnight scene |
| `pip_lullaby_box.jpg` | Music box (favourites and Dreambox card) |
| `pip_dream_lantern.jpg` | Moon lantern (favourites and Lantern card) |

Cloud Pillow No. 7 has no official picture, so it uses an original SVG drawing. If a picture file is ever missing, a built-in drawing shows instead, so nothing breaks.

## Brief checklist (from https://hax.baby/baby-problem)

| Requirement | Where to test it |
|---|---|
| 1. What they are | "Meet Pip": Junior Dream Engineer, baby, gentle. Tap the 4 labels. |
| 2. What they do | "Creations": 3 projects, each with a pop-up and a small toy. |
| 3. Their story | "Story": 4 scenes revealed by scrolling. |
| 4. Immersion | Star follows the mouse, parallax, taps burst into stars, moon wakes on hover, sound with a mute switch (top right, always visible). |
| 5. Mobile friendly | DevTools (F12) > phone icon: 360, 390, 768, 1024, 1440 px. No sideways scroll. |
| 6. Hidden Easter egg | Tap the big moon 3 times quickly (or Tab to it and press Enter 3 times). |
| Mute switch | "Sound" button in the header. Off by default. Mutes everything. |
| Sections about 150 words or less | Each section is under 150 words. |
| Credit every source | Footer "Credits" in the goodnight section. |
| Day/night or mood toggle (Tier 1) | "Night/Day" button in the header, plus the Dream Engine mood colours. |
| Lullaby Lab with real audio (Tier 2) | Creations > The Unicorn Dreambox > star keys, plus the looping lullaby (all made with the Web Audio API). |
| Click sounds + mute (side quest) | Turn sound on, then press any button. |
| Sparkle cursor trail (side quest) | Move the mouse on a computer: gold stars drop behind the dot. |
| Hit counter odometer (side quest) | Bottom of the page: "Your visit no." rolls into place. It counts visits from this browser only, not all visitors. |
| Live dream guestbook (Tier 3 + side quest) | "Dreams left for Pip" (after the chat, before the goodnight scene, also in the menu). Type a name and a wish and press "Leave a dream". The wish is saved online in Supabase and appears for everyone after the owner approves it. Character counters, a one-minute cooldown per browser, and no HTML is ever inserted from visitor text. |
| Early-web touches | Scrolling ticker under the hero, and the retro badges ("Best viewed in any browser at bedtime") at the bottom. |
| Hidden constellation | Hero sky: move the mouse (or tap) and gold star lines light up under it. |
| Character reacts to cursor (Tier 1) | Hero: Pip's eyes follow the mouse anywhere on the page, and Pip drifts, leans and nods toward it. On a phone, tap the hero and Pip looks and leans toward your tap, then settles. The eyes are small overlays on the untouched official picture; they are skipped if the picture fails to load or reduced motion is on. |
| Mood toggle changes Pip (Tier 1) | "Night/Day" button: the palette changes, a sleepy "z z Z" badge becomes a bright sun by Pip, and Pip says a line about the new mood. |
| Dream Delivery map (Tier 2) | Between Creations and the Dream Engine: scroll and a gold route draws itself while a star travels along it, lighting five stops. With reduced motion, the finished route is shown. |
| Interactive storybook (Tier 2) | "The night Pip mended her first dream" (after the Dream Engine): 5 pages that flip like paper. Use the Back/Next buttons, swipe on a phone, or press the left/right arrow keys. |
| Nightlight / flashlight (Tier 2) | "Find Pip's hidden wishes": move the light with the mouse or a finger, or use the arrow keys. Six wishes hide in the dark and stay lit when found. "Hide them again" reshuffles them. |
| Mini-game (Tier 2) | "Catch the falling dreams": press Start, then slide Pip's cloud with the mouse, a finger, or the arrow keys. 30 seconds, no losing, best score kept in this browser. |
| Character remembers visitor (Tier 3) | Chat section: type your name and press "Remember me". Reload: the hero note greets you by name, by time of day, with your visit number and last dream. "Forget me" clears it. Stored in this browser only. |
| Character chats back (Tier 3) | "Chat with Pip" (before the goodnight scene): type or tap a suggestion. Pip answers in character with rules (no server, not a real AI). Try: "Who are you?", "joke", "I can't sleep", "my name is ...". |
| Fast loading (Tier 3 target) | Fonts load without blocking, images resized (about 90 KB in total), hero picture preloaded, image sizes set to avoid layout shift. The Supabase library is only downloaded when the visitor scrolls near the guestbook, the lower sky layers of stars are built only when they come near the screen, and the lower-page features start one at a time after the page has loaded. Check with Lighthouse (mobile, in a private window) on the live URL. |
| Pip talks | Tap Pip in the hero: a speech bubble with a different line each tap. |
| Dream shelf | Make dreams in the Dream Engine: each is saved as a glowing jar below it. Tap a jar to reopen the dream. "Clear shelf" empties it (kept in this browser only). |
| Welcome back | Under the hero buttons: Pip greets returning visitors and mentions saved dreams. |

## Guestbook (Supabase)

The guestbook is the one feature that talks to a server. It uses a free Supabase project and `guestbook.js`.

- **Reading:** only rows with `approved = true` are shown (newest 30).
- **Writing:** visitors can only insert rows, and a new row always starts with `approved = false`. The owner approves a wish by setting `approved` to true in the Supabase Table Editor.
- **Safety:** Row Level Security is on. The key in `guestbook.js` is the *publishable* key, which is meant to be public. The secret / service_role key is never used or stored in this project. Visitor text is shown with `textContent`, so it cannot run as HTML.

### Set it up yourself

1. Create a free project at https://supabase.com.
2. In the SQL Editor, run:

```sql
create table if not exists dream_guestbook (
  id bigint generated always as identity primary key,
  display_name text not null check (char_length(display_name) between 1 and 30),
  wish text not null check (char_length(wish) between 1 and 280),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table dream_guestbook enable row level security;

create policy "public can read approved"
  on dream_guestbook for select
  to anon using (approved = true);

create policy "public can insert"
  on dream_guestbook for insert
  to anon with check (approved = false);

grant usage on schema public to anon;
grant select, insert on public.dream_guestbook to anon;
grant usage, select on all sequences in schema public to anon;
```

3. In Project Settings > API, copy the **Project URL** (it ends at `.supabase.co`, with nothing after it) and the **Publishable key**.
4. Put them at the top of `guestbook.js` as `SUPABASE_URL` and `SUPABASE_KEY`.

## Sound

Everything is made live in the browser with the Web Audio API, so there are no audio files to supply or credit.
- The header "Sound" button turns all sound on or off. It is off when the page loads.
- On: a gentle looping music-box lullaby plus soft chimes on buttons.
- Playing the music box or a star key also turns sound on (without the loop). Press "Sound" again to mute.

## What you still must do for submission (due 19 Oct 2026, 17:17 IST)

- [ ] Public GitHub repo with commits made between 17 and 19 October (commit often, with clear messages).
- [ ] Live website URL (Netlify Drop or GitHub Pages).
- [ ] A short write-up of a few paragraphs about how you built it.
- [ ] Credits (already in the site footer; paste them into the form too).
- [ ] Run Lighthouse (Chrome DevTools > Lighthouse > Mobile) on the live URL and aim for 90+.
- [ ] Open the live site once and check the browser console (F12) for red errors.

## Publish

**Netlify Drop:** drag the whole folder onto https://app.netlify.com/drop.

**GitHub Pages:** create a public repo, upload the files and `assets` folder, then Settings > Pages > Deploy from branch `main`, folder `/ (root)`.

## Common problems

- **Images do not show online:** names are case-sensitive and the `assets/images` folder must be uploaded next to `index.html`. Press Ctrl+Shift+R after changes.
- **Red "ERR_FILE_NOT_FOUND" in the console:** an image is missing from `assets/images/`. Make sure the whole `assets` folder is uploaded.
- **Works locally, broken online:** make sure `index.html` is at the top level and the `assets` folder was uploaded too.
- **Guestbook says "Could not load dreams" or "could not be saved":** open the browser console (F12). A 404 usually means `SUPABASE_URL` has `/rest/v1/` on the end (remove it). Error `42501` means a Row Level Security policy or a table permission is missing (run the SQL above again). It also cannot load when `index.html` is opened by double-clicking; use Live Server or the live site.
- **Copy button says it could not copy:** some browsers block copying on plain `file://` pages. It works on Live Server, Netlify and GitHub Pages.
