# Pip's Midnight Nursery

A hackathon website for haX.baby "Baby's First Website", Track 1. Plain HTML, CSS and JavaScript. No installs, no build step, no API keys.

## 1. Folder structure

```
pips-midnight-nursery/
  index.html
  style.css
  script.js
  README.md
  assets/
    images/        <- put the official artwork here
    audio/         <- not needed (the lullaby is made in the browser)
```

## 2. Run it

1. Install VS Code and the "Live Server" extension (free).
2. In VS Code: File > Open Folder > choose `pips-midnight-nursery`.
3. Right-click `index.html` > "Open with Live Server". (Double-clicking index.html also works.)

## 3. Adding the official artwork

No official files were available while this was built, so every picture is a built-in original SVG drawing. The site works fully like this.

To use the official art, copy your files into `assets/images/` using these exact names. Whatever file exists is swapped in automatically. Anything missing keeps its drawing, so nothing breaks.

| File name | Used for |
|---|---|
| `pip.png` | Hero Pip |
| `pip-portrait.png` | Meet Pip section |
| `pip-waving.png` | Story scene 4 |
| `pip-sleeping.png` | Goodnight scene |
| `nightlight.png` | Moonlight Lantern card, modal and favourites |
| `music-box.png` | Unicorn Dreambox card, modal and favourites |
| `cloud-pillow.png` | Cloud Pillow No. 7 |

If your official files have other names, rename them to the names above (or change the `data-asset="..."` text in `index.html`). PNG, and the same name with `.png` only, is expected. To use JPG or WebP, change the extension in `index.html`.

## 4. Where to test each official requirement

1. **What they are**: scroll to "Meet Pip". Tap the four floating labels on Pip.
2. **What they do**: "Creations" section. Open each of the three cards and press the button inside the pop-up.
3. **Their story**: "Story" section. Four scenes that fade in as you scroll.
4. **Immersion**: move the mouse over the hero (star follows, parallax), click or tap anywhere (star burst), hover the moon (it wakes up), use the Lullaby button in the header (off by default).
5. **Mobile layout**: browser DevTools (F12) > device toolbar. Try 360, 390, 768, 1024 and 1440 px wide. Check no sideways scrolling and that the menu button opens the menu.
6. **Hidden Easter egg**: click or tap the big moon in the hero three times quickly (or focus it with Tab and press Enter three times).

## 5. Full test checklist

- [ ] Header links jump to the right sections (also on mobile via the menu button).
- [ ] Escape closes the mobile menu and any pop-up.
- [ ] Hero buttons: "Enter Pip's Dreamworld" goes to Meet Pip, "Discover Pip's little universe" goes to the Story.
- [ ] "Dream Engine" links play the star-ring transition and land on the engine.
- [ ] Dream Engine: pick options, press "Create My Dream". A card appears with a title, story and motif.
- [ ] Try different moods: the background and card colours change.
- [ ] "Dream again" gives a fresh version. "Surprise me" picks random options.
- [ ] "Copy my dream": message appears. Paste somewhere to confirm.
- [ ] Lullaby button toggles sound and the label changes. Sound is silent on load.
- [ ] Turn on "Reduce motion" in your computer's accessibility settings. Animations should calm down and everything should still work.
- [ ] Tab through the page. A gold or rose outline should always show where you are.

## 6. Publish for free

**Netlify Drop (easiest):** go to https://app.netlify.com/drop, drag the whole `pips-midnight-nursery` folder onto the page. You get a link in seconds.

**GitHub Pages:**
1. Create a free account and a new public repository.
2. Upload `index.html`, `style.css`, `script.js` and the `assets` folder (drag them into the repo page, then Commit).
3. Repository > Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`, Save.
4. Wait a minute or two. Your link looks like `https://YOURNAME.github.io/REPONAME/`.

## 7. Common problems

- **Blank page or nothing moves**: open DevTools (F12) > Console and read the red message. Usually a file was renamed. Keep `index.html`, `style.css` and `script.js` in the same folder.
- **Images don't change after adding files**: file names are case-sensitive on the web. Use exactly `pip.png`, not `Pip.PNG`. Refresh with Ctrl+Shift+R.
- **Works locally, broken after publishing**: make sure the `assets` folder was uploaded, and that `index.html` is at the top level, not inside another folder.
- **Copy button says it could not copy**: some browsers block clipboard access on plain `file://` pages. It works on Live Server, Netlify and GitHub Pages. If not, the story is selected for you to copy by hand.
- **Fonts look different**: the Google fonts need internet once. Without them, the site uses safe fallback fonts and still works.
