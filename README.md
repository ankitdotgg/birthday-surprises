# Birthday Surprises

An interactive 3D starfield experience where every star holds a memory. Built with Three.js and Claude as a birthday gift.

Her name is spelled out as a constellation across the night sky. Glowing stars scattered around the scene each contain a photo and a heartfelt caption. Friends send birthday wishes as comets streaking across the sky. Background music fades in as the experience begins.

![Preview](https://img.shields.io/badge/Built_with-Three.js-black?style=flat-square&logo=three.js) ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## What It Does

- **Constellation Name** — Her name is rendered as connected stars in the sky
- **Memory Stars** — Click any glowing star to reveal a photo and caption
- **Comet Wishes** — Friends' birthday messages fly in as comets
- **Background Music** — Your chosen song plays with fade-in/fade-out controls
- **Shooting Stars** — Periodic shooting stars streak across the sky
- **Nebula Background** — Subtle colored nebulae add depth to the scene
- **Responsive** — Works on desktop, tablet, and mobile (touch supported)

## Quick Start

```bash
git clone https://github.com/ARS-DEVELOPER/birthday-surprises.git
cd birthday-surprises
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Personalize It

### 1. Add Photos

Drop your photos into `public/photos/` named sequentially:

```
public/photos/01.jpeg
public/photos/02.jpeg
public/photos/03.jpeg
...
```

### 2. Edit Memories

Open `src/memories.js` and replace the placeholder entries:

```js
export const MEMORIES = [
  {
    date: "Where It All Began",
    text: "Your caption for this photo.",
    image: "/photos/01.jpeg",
    size: "large",  // "small", "medium", or "large"
  },
  // ... add more
];

export const HER_NAME = "SARA";  // spelled out as a constellation
export const BIRTHDAY_MESSAGE = "Happy Birthday, Sara ✨";
```

### 3. Add Friend Wishes

Open `src/friends.js` to add messages from friends:

```js
export const FRIEND_MESSAGES = [
  {
    name: "Alex",
    message: "Happy birthday! You're the best!",
  },
  // ... add more friends
];
```

### 4. Add Music

Drop an audio file into `public/` and update `src/music.js`:

```js
audio = new Audio("/your-song.mp3");
```

Update the song credit in `index.html`:

```html
<div id="song-credit">Song Name — Artist</div>
```

### 5. Customize the Intro

Edit the intro text in `index.html` to personalize the landing screen:

```html
<h1 class="intro-hindi">Your headline here</h1>
<p class="intro-sub">Your subtitle here</p>
<p class="intro-birthday">Happy Birthday, Name</p>
<p class="intro-from">— your sign-off</p>
<button id="enter-btn">Enter</button>
```

The intro also displays a circular photo — change the `src` in the `<img>` tag to use any of your photos.

## Deploy

Build for production:

```bash
npm run build
```

The `dist/` folder contains everything. Deploy it anywhere — Vercel, Netlify, a Raspberry Pi, or any static file server.

### Deploy to a Raspberry Pi

```bash
# Build locally
npm run build

# Copy to Pi
rsync -avz --delete dist/ user@your-pi-ip:/path/to/serve/

# Serve with nginx (example config)
# server { listen 5555; root /path/to/serve; try_files $uri $uri/ /index.html; }
```

## Tech Stack

- **Three.js** — 3D rendering, particle systems, sprite materials
- **Vite** — Build tool and dev server
- **Vanilla JS** — No framework, pure DOM manipulation
- **CSS** — Custom animations, backdrop blur, responsive design

## How It Works

1. **Intro Screen** — Photo with glowing border, animated text, enter button
2. **Constellation** — Name is converted to coordinate points and rendered as connected stars
3. **Memory Stars** — Positioned using golden angle distribution for natural spread
4. **Raycasting** — Three.js raycaster detects hover/click on star sprites
5. **Comets** — Friend messages animate in as glowing sprites, pause, then display a card
6. **Music** — HTML5 Audio with volume fade-in/fade-out for smooth transitions

## License

MIT — Use it, fork it, gift it.
