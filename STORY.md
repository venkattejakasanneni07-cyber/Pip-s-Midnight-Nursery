# The story behind Pip's Midnight Nursery

(Draft for the submission form. Edit it so it sounds like you, and change anything that is not true for you.)

I entered Baby's First Website solo, on Track 1, as a beginner web developer. I wanted the site to feel like stepping into a bedtime storybook rather than a normal portfolio, so I built it as a small night-time world around Pip, the Junior Dream Engineer.

The page opens on a starry sky with drifting clouds, Pip waving from a cloud and a sleepy moon. The moon is the hidden Easter egg: tap it three times and it wakes up with a secret message from Pip. Further down you meet Pip, follow a four-scene origin story that fades in as you scroll, and open three of Pip's creations: the Moonlight Lantern, the Unicorn Dreambox and Cloud Pillow No. 7. The Dreambox contains a small Lullaby Lab with five playable star keys.

The centrepiece is the Dream Engine. You choose a mood, a companion and a destination, and it writes a dream just for you, with its own title, story, colours and sparkles. It runs entirely in the browser, with no server needed. There is also a day/night toggle, and a sound button that is always visible and off by default. All sound (the lullaby loop, the chimes and the music-box keys) is synthesised live with the Web Audio API, so there are no audio files.

A few small details reward curious visitors: a hidden constellation in the hero sky that lights up under your cursor or finger, a speech bubble when you tap Pip, a "dream shelf" where every dream you make is kept as a glowing jar, and a welcome-back note that remembers how many times you have visited. These small memories are stored only in your own browser, so there is no tracking.

I used plain HTML, CSS and JavaScript so I could understand every line. I built the site with the help of an AI assistant (Claude), and then tested it myself on desktop and phone sizes, with keyboard only, and with reduced motion switched on. The Pip, lantern and music-box artwork comes from the official haX Creator Asset Pack; everything else is original SVG and code. Credits are in the page footer.

For the legendary tier I gave Pip a memory and a voice. Pip remembers your name, how many times you have visited and your last dream, and greets you by the time of day. You can also chat with Pip: it answers in character using simple rules written by hand (no server, and it is not a real AI). I also worked on loading speed with non-blocking fonts, smaller images, and by starting the lower-page features one at a time after the page loads.

The one place the site talks to a server is the live dream guestbook. Visitors leave a name and a wish, and it is saved in a free Supabase database. Wishes only appear after I approve them, so the wall stays kind. I set up Row Level Security so visitors can only add new wishes and read approved ones, and the key in the page is the public one that is designed to be exposed. Getting it working taught me a lot: my first version failed because I had pasted the wrong project address, and then because the table had no permissions for visitors. Reading the real error codes in the console and fixing one thing at a time is how I solved both. The Supabase library is also loaded only when you scroll near the guestbook, so it does not slow the first screen.

What I would add next: a small page for approving wishes without opening the database, and more dream parts so every dream feels even more unique.
