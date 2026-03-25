import * as THREE from "three";
import { MEMORIES, HER_NAME, BIRTHDAY_MESSAGE } from "./memories.js";
import { nameToConstellationPoints } from "./constellation-font.js";
import { startMusic, toggleMusic, getIsPlaying } from "./music.js";
import { FRIEND_MESSAGES } from "./friends.js";

// ─── Config ────────────────────────────────────────────────────
const BACKGROUND_STAR_COUNT = 2000;
const CONSTELLATION_SPREAD = 35;
const CONSTELLATION_Z = -60;
const MEMORY_STAR_SPREAD = 80;
const MEMORY_STAR_DEPTH_MIN = -100;
const MEMORY_STAR_DEPTH_MAX = -30;
const CAMERA_DRIFT_SPEED = 0.00015;
const SHOOTING_STAR_INTERVAL = 4000;
const COMET_INTERVAL = 12000;
const COMET_FIRST_DELAY = 8000;

// ─── State ─────────────────────────────────────────────────────
let scene, camera, renderer, clock;
let mouseNorm = { x: 0, y: 0 };
let memoryStars = [];
let constellationStars = [];
let constellationLines;
let shootingStars = [];
let hoveredStar = null;
let isStarted = false;

// ─── DOM refs ──────────────────────────────────────────────────
const container = document.getElementById("canvas-container");
const introOverlay = document.getElementById("intro-overlay");
const enterBtn = document.getElementById("enter-btn");
const popup = document.getElementById("memory-popup");
const popupDate = popup.querySelector(".date");
const popupText = popup.querySelector(".memory-text");
const popupImage = popup.querySelector(".memory-image");
const popupClose = popup.querySelector(".close-btn");
const hint = document.getElementById("hint");
const starLabel = document.getElementById("star-label");
const birthdayMsg = document.getElementById("birthday-msg");
const musicToggle = document.getElementById("music-toggle");
const songCredit = document.getElementById("song-credit");
const cometPopup = document.getElementById("comet-message");
const cometName = cometPopup.querySelector(".friend-name");
const cometText = cometPopup.querySelector(".friend-text");
const cometClose = cometPopup.querySelector(".comet-close");

let friendQueue = [...FRIEND_MESSAGES];
let cometActive = false;

// ─── Materials ─────────────────────────────────────────────────
function createGlowTexture(color, innerRadius, outerRadius) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const center = size / 2;

  const gradient = ctx.createRadialGradient(
    center, center, innerRadius * size,
    center, center, outerRadius * size
  );
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color.replace("1)", "0.4)"));
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

const glowTextureWarm = createGlowTexture("rgba(255,220,150,1)", 0.0, 0.5);
const glowTextureBlue = createGlowTexture("rgba(150,180,255,1)", 0.0, 0.5);
const glowTextureWhite = createGlowTexture("rgba(255,255,255,1)", 0.0, 0.45);
const glowTexturePink = createGlowTexture("rgba(255,180,200,1)", 0.0, 0.5);

// ─── Init ──────────────────────────────────────────────────────
function init() {
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000011, 0.003);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.set(0, 0, 30);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000008);
  container.appendChild(renderer.domElement);

  createNebulaBackground();
  createBackgroundStars();
  createConstellationStars();
  createMemoryStars();

  window.addEventListener("resize", onResize);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onClick);
  window.addEventListener("touchend", onTouchEnd);

  enterBtn.addEventListener("click", startExperience);

  musicToggle.addEventListener("click", () => {
    toggleMusic();
    musicToggle.classList.toggle("paused", !getIsPlaying());
  });

  popupClose.addEventListener("click", () => {
    popup.classList.remove("visible");
  });

  setInterval(spawnShootingStar, SHOOTING_STAR_INTERVAL);

  cometClose.addEventListener("click", () => {});

  animate();
}

// ─── Nebula background ─────────────────────────────────────────
function createNebulaBackground() {
  const nebulaCount = 5;
  for (let i = 0; i < nebulaCount; i++) {
    const size = 60 + Math.random() * 100;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    const hue = Math.random() * 60 + 220;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, `hsla(${hue}, 60%, 30%, 0.08)`);
    gradient.addColorStop(0.5, `hsla(${hue}, 40%, 20%, 0.03)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 100,
      -120 - Math.random() * 80
    );
    sprite.scale.set(size, size, 1);
    scene.add(sprite);
  }
}

// ─── Background stars (non-interactive) ────────────────────────
function createBackgroundStars() {
  const positions = new Float32Array(BACKGROUND_STAR_COUNT * 3);
  const sizes = new Float32Array(BACKGROUND_STAR_COUNT);

  for (let i = 0; i < BACKGROUND_STAR_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = -50 - Math.random() * 200;
    sizes[i] = Math.random() * 1.5 + 0.3;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xccccdd,
    size: 0.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
}

// ─── Constellation stars (her name) ────────────────────────────
function createConstellationStars() {
  const namePoints = nameToConstellationPoints(HER_NAME);
  const linePositions = [];

  namePoints.forEach((point, index) => {
    const x = point.x * CONSTELLATION_SPREAD;
    const y = point.y * CONSTELLATION_SPREAD + 5;
    const z = CONSTELLATION_Z;

    const material = new THREE.SpriteMaterial({
      map: glowTextureBlue,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, z);
    sprite.scale.set(2.2, 2.2, 1);
    sprite.userData = { targetOpacity: 0.6, phase: index * 0.3, isConstellation: true };
    scene.add(sprite);
    constellationStars.push(sprite);

    linePositions.push(x, y, z);
  });

  if (linePositions.length >= 6) {
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4466aa,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    constellationLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(constellationLines);
  }
}

// ─── Memory stars (interactive) ────────────────────────────────
function createMemoryStars() {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  MEMORIES.forEach((memory, index) => {
    const sizeMap = { small: 2.5, medium: 3.5, large: 5 };
    const starSize = sizeMap[memory.size] || 3;

    const textures = [glowTextureWarm, glowTexturePink, glowTextureWhite];
    const texture = textures[index % textures.length];

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
    });

    const sprite = new THREE.Sprite(material);

    const theta = goldenAngle * index;
    const radius = 15 + (index / MEMORIES.length) * MEMORY_STAR_SPREAD * 0.5;
    const x = Math.cos(theta) * radius * (0.6 + Math.random() * 0.4);
    const y = Math.sin(theta) * radius * 0.5 + (Math.random() - 0.5) * 20;
    const z = MEMORY_STAR_DEPTH_MIN + Math.random() * (MEMORY_STAR_DEPTH_MAX - MEMORY_STAR_DEPTH_MIN);

    sprite.position.set(x, y, z);
    sprite.scale.set(starSize, starSize, 1);

    sprite.userData = {
      memory,
      baseScale: starSize,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.5 + Math.random() * 1,
      targetOpacity: 0.85,
      isMemory: true,
    };

    scene.add(sprite);
    memoryStars.push(sprite);
  });
}

// ─── Shooting stars ────────────────────────────────────────────
function spawnShootingStar() {
  if (!isStarted) return;

  const startX = (Math.random() - 0.3) * 120;
  const startY = 30 + Math.random() * 30;
  const startZ = -40 - Math.random() * 60;

  const material = new THREE.SpriteMaterial({
    map: glowTextureWhite,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.9,
  });

  const sprite = new THREE.Sprite(material);
  sprite.position.set(startX, startY, startZ);
  sprite.scale.set(1.5, 1.5, 1);

  sprite.userData = {
    velocity: new THREE.Vector3(
      -0.8 - Math.random() * 0.5,
      -0.4 - Math.random() * 0.3,
      0
    ),
    life: 1,
    decay: 0.008 + Math.random() * 0.01,
  };

  scene.add(sprite);
  shootingStars.push(sprite);
}

// ─── Comet with friend message ─────────────────────────────────
function spawnComet() {
  if (!isStarted || cometActive || friendQueue.length === 0) return;

  const friend = friendQueue.shift();
  cometActive = true;

  // Create a bright golden comet
  const material = new THREE.SpriteMaterial({
    map: glowTextureWarm,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0,
  });

  const comet = new THREE.Sprite(material);
  const startX = 80;
  const startY = 20 + Math.random() * 20;
  const startZ = -30;
  comet.position.set(startX, startY, startZ);
  comet.scale.set(6, 6, 1);
  scene.add(comet);

  // Animate comet: fly in, pause in center, show message
  const targetX = (Math.random() - 0.5) * 20;
  const targetY = (Math.random() - 0.5) * 10;
  let progress = 0;
  const flySpeed = 0.012;

  function animateComet() {
    if (progress < 1) {
      progress += flySpeed;
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      comet.position.x = startX + (targetX - startX) * ease;
      comet.position.y = startY + (targetY - startY) * ease;
      comet.material.opacity = Math.min(1, progress * 3);

      // Pulsing glow as it flies
      const pulse = 1 + Math.sin(progress * 20) * 0.3;
      comet.scale.set(6 * pulse, 6 * pulse, 1);

      requestAnimationFrame(animateComet);
    } else {
      // Comet has arrived — show friend message
      cometName.textContent = friend.name;
      cometText.textContent = friend.message;
      cometPopup.classList.add("visible");

      // Slowly fade the comet glow
      let fadeProgress = 0;
      function fadeComet() {
        fadeProgress += 0.01;
        const pulse = 1 + Math.sin(fadeProgress * 5) * 0.15;
        comet.scale.set(5 * pulse, 5 * pulse, 1);
        comet.material.opacity = 0.6 + Math.sin(fadeProgress * 3) * 0.2;
        if (cometActive) requestAnimationFrame(fadeComet);
      }
      fadeComet();
    }
  }

  animateComet();

  // Store comet ref for cleanup
  cometClose.onclick = () => {
    cometPopup.classList.remove("visible");
    cometActive = false;

    // Fade out and remove comet
    let fade = 1;
    function removeFade() {
      fade -= 0.03;
      comet.material.opacity = Math.max(0, fade);
      comet.scale.set(6 * fade, 6 * fade, 1);
      if (fade > 0) {
        requestAnimationFrame(removeFade);
      } else {
        scene.remove(comet);
        comet.material.dispose();
      }
    }
    removeFade();
  };
}

// ─── Raycaster ─────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
raycaster.near = 0.1;
raycaster.far = 200;

function getMemoryStarAtScreen(screenX, screenY) {
  const mouse = new THREE.Vector2(
    (screenX / window.innerWidth) * 2 - 1,
    -(screenY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

  let closest = null;
  let closestDist = Infinity;

  for (const star of memoryStars) {
    const dist = raycaster.ray.distanceToPoint(star.position);
    const threshold = star.userData.baseScale * 0.6;
    if (dist < threshold && dist < closestDist) {
      closest = star;
      closestDist = dist;
    }
  }

  return closest;
}

// ─── Events ────────────────────────────────────────────────────
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
  mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (!isStarted) return;

  const star = getMemoryStarAtScreen(e.clientX, e.clientY);

  if (star && star !== hoveredStar) {
    hoveredStar = star;
    document.body.style.cursor = "pointer";
    starLabel.textContent = star.userData.memory.date;
    starLabel.style.left = `${e.clientX + 15}px`;
    starLabel.style.top = `${e.clientY - 10}px`;
    starLabel.classList.add("visible");
  } else if (!star && hoveredStar) {
    hoveredStar = null;
    document.body.style.cursor = "default";
    starLabel.classList.remove("visible");
  }

  if (hoveredStar) {
    starLabel.style.left = `${e.clientX + 15}px`;
    starLabel.style.top = `${e.clientY - 10}px`;
  }
}

function showMemory(star, screenX, screenY) {
  const memory = star.userData.memory;
  popupDate.textContent = memory.date;
  popupText.textContent = memory.text;

  popupImage.classList.remove("loaded");
  popupImage.src = memory.image;
  popupImage.onload = () => popupImage.classList.add("loaded");

  const popupWidth = 340;
  const popupHeight = 200;
  let left = screenX + 20;
  let top = screenY - 40;

  if (left + popupWidth > window.innerWidth - 20) {
    left = screenX - popupWidth - 20;
  }
  if (top + popupHeight > window.innerHeight - 20) {
    top = window.innerHeight - popupHeight - 20;
  }
  if (top < 20) top = 20;
  if (left < 20) left = 20;

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  popup.classList.add("visible");
}

function onClick(e) {
  if (!isStarted) return;

  const star = getMemoryStarAtScreen(e.clientX, e.clientY);
  if (star) {
    showMemory(star, e.clientX, e.clientY);
  } else {
    popup.classList.remove("visible");
  }
}

function onTouchEnd(e) {
  if (!isStarted || !e.changedTouches.length) return;
  const touch = e.changedTouches[0];
  const star = getMemoryStarAtScreen(touch.clientX, touch.clientY);
  if (star) {
    showMemory(star, touch.clientX, touch.clientY);
  }
}

// ─── Start experience ──────────────────────────────────────────
function startExperience() {
  isStarted = true;
  introOverlay.classList.add("fade-out");

  startMusic();

  setTimeout(() => {
    introOverlay.style.display = "none";
    hint.classList.add("visible");
    birthdayMsg.textContent = BIRTHDAY_MESSAGE;
    musicToggle.classList.add("visible");
    songCredit.classList.add("visible");

    setTimeout(() => {
      birthdayMsg.classList.add("visible");
    }, 3000);

    setTimeout(() => {
      hint.classList.remove("visible");
    }, 8000);

    // Start comet friend messages after a delay
    setTimeout(() => {
      spawnComet();
      setInterval(spawnComet, COMET_INTERVAL);
    }, COMET_FIRST_DELAY);

    setTimeout(() => {
      songCredit.classList.remove("visible");
    }, 10000);
  }, 2000);
}

// ─── Animation loop ────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Gentle camera drift following mouse
  const targetX = mouseNorm.x * 5;
  const targetY = mouseNorm.y * 3;
  camera.position.x += (targetX - camera.position.x) * 0.02;
  camera.position.y += (targetY - camera.position.y) * 0.02;
  camera.lookAt(0, 0, -40);

  // Fade in constellation stars
  if (isStarted) {
    constellationStars.forEach((star) => {
      const pulse = Math.sin(elapsed * 0.8 + star.userData.phase) * 0.15 + 0.85;
      const target = star.userData.targetOpacity * pulse;
      star.material.opacity += (target - star.material.opacity) * 0.02;
    });

    if (constellationLines) {
      constellationLines.material.opacity += (0.15 - constellationLines.material.opacity) * 0.01;
    }
  }

  // Pulse memory stars
  memoryStars.forEach((star) => {
    const { phase, pulseSpeed, targetOpacity, baseScale } = star.userData;
    const pulse = Math.sin(elapsed * pulseSpeed + phase);
    const isHovered = star === hoveredStar;

    const opTarget = isStarted
      ? targetOpacity * (0.6 + pulse * 0.4) * (isHovered ? 1.3 : 1)
      : 0;
    star.material.opacity += (opTarget - star.material.opacity) * 0.04;

    const scaleTarget = baseScale * (1 + pulse * 0.1) * (isHovered ? 1.4 : 1);
    star.scale.setScalar(star.scale.x + (scaleTarget - star.scale.x) * 0.08);
  });

  // Update shooting stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const s = shootingStars[i];
    s.position.add(s.userData.velocity);
    s.userData.life -= s.userData.decay;
    s.material.opacity = s.userData.life;
    s.scale.setScalar(1.5 * s.userData.life);

    if (s.userData.life <= 0) {
      scene.remove(s);
      s.material.dispose();
      shootingStars.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// ─── Go ────────────────────────────────────────────────────────
init();
