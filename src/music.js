/**
 * Music player — uses a local audio file, no external dependencies.
 * Drop your audio file in /public/ and update the path below.
 */

let audio = null;
let isPlaying = false;

const VOLUME = 0.5;

function getAudio() {
  if (!audio) {
    audio = new Audio("/your-song.mp3");
    audio.loop = true;
    audio.volume = 0;
  }
  return audio;
}

function fadeIn(duration = 3000) {
  const a = getAudio();
  a.volume = 0;
  const steps = 30;
  const increment = VOLUME / steps;
  const interval = duration / steps;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    a.volume = Math.min(VOLUME, increment * step);
    if (step >= steps) clearInterval(timer);
  }, interval);
}

function fadeOut(duration = 500) {
  const a = getAudio();
  const startVol = a.volume;
  const steps = 15;
  const decrement = startVol / steps;
  const interval = duration / steps;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    a.volume = Math.max(0, startVol - decrement * step);
    if (step >= steps) {
      clearInterval(timer);
      a.pause();
    }
  }, interval);
}

export function startMusic() {
  if (isPlaying) return;
  const a = getAudio();
  a.play().then(() => {
    isPlaying = true;
    fadeIn();
  }).catch(() => {
    // Autoplay blocked — will retry on next user interaction
  });
}

export function pauseMusic() {
  if (!isPlaying) return;
  isPlaying = false;
  fadeOut();
}

export function resumeMusic() {
  if (isPlaying) return;
  const a = getAudio();
  a.play().then(() => {
    isPlaying = true;
    fadeIn(1000);
  });
}

export function toggleMusic() {
  if (isPlaying) {
    pauseMusic();
  } else if (audio) {
    resumeMusic();
  } else {
    startMusic();
  }
  return isPlaying;
}

export function getIsPlaying() {
  return isPlaying;
}
