import { TextAnimator } from './text-animator.js';
import { SmoothCursor } from '../smooth-cursor.js';
import { RetroGrid } from '../retro-grid.js';
import { Particles } from '../particles.js';
import { Ripple } from '../ripple.js';
import { HUD } from '../hud.js';

let isVRActive = false;
let smoothCursor;
let retroGrid;
let particles;
let ripple;
let hud;

const init = () => {
  // Store original text content for glitch effect
  document.querySelectorAll('.list__item-col').forEach(col => {
    col.setAttribute('data-text', col.textContent);
  });

  document.querySelectorAll('.list__item').forEach(item => {
    const cols = Array.from(item.querySelectorAll('.hover-effect'));
    const animators = cols.map(col => new TextAnimator(col));

    item.addEventListener('mouseenter', () => {
      if (!isVRActive) {
        animators.forEach(animator => animator.animate());
      }
    });
    item.addEventListener('mouseleave', () => {
      if (!isVRActive) {
        animators.forEach(animator => animator.animateBack());
      }
    });
  });

  // Same for all links
  document.querySelectorAll('a.hover-effect').forEach(item => {
    const animator = new TextAnimator(item);
    item.addEventListener('mouseenter', () => {
      if (!isVRActive) {
        animator.animate();
      }
    });
    item.addEventListener('mouseleave', () => {
      if (!isVRActive) {
        animator.animateBack();
      }
    });
  });

  // VR Keypress Effect
  document.addEventListener('keydown', (e) => {
    if (!isVRActive) {
      activateVRMode();
    }
  });

  // VR Mouse Click Effect
  document.addEventListener('click', (e) => {
    if (!isVRActive) {
      activateVRMode();
    }
  });

  // Initialize smooth cursor
  smoothCursor = new SmoothCursor({
    springConfig: {
      damping: 45,
      stiffness: 400,
      mass: 1,
      restDelta: 0.001,
    }
  });
  
  // Initialize retro grid
  retroGrid = new RetroGrid({
    containerSelector: 'body',
    angle: 65,
    cellSize: 60,
    opacity: 0.6,
    lightLineColor: '#00ff88',
    darkLineColor: '#00ff88',
    lineWidth: 1,
    fullScreen: true,
    zIndex: -1
  });
  
  // Initialize particles
  particles = new Particles({
    containerSelector: 'body',
    count: 40,
    color: '#00ff88',
    maxSize: 3,
    minSize: 1,
    opacity: 0.4,
    speed: 0.3,
    zIndex: 0
  });
  
  // Initialize ripple effect
  ripple = new Ripple({
    containerSelector: 'body',
    color: '#00ff88',
    duration: 1500,
    size: 250,
    opacity: 0.5,
    lineWidth: 2,
    zIndex: 2
  });
  
  // Initialize HUD (initially inactive)
  hud = new HUD({
    containerSelector: 'body',
    color: '#00ff88',
    active: false,
    showFramerate: true,
    showTime: true,
    showScanlines: true,
    showCorners: true,
    showWaveform: true,
    showStatus: true,
    zIndex: 10
  });
};

const activateVRMode = () => {
  isVRActive = true;
  
  // Add VR classes
  document.body.classList.add('vr-active');
  document.querySelector('.content').classList.add('vr-glitch');
  
  // Create explicit ripple at center on activation
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const clickEvent = new MouseEvent('click', {
    clientX: centerX,
    clientY: centerY
  });
  document.dispatchEvent(clickEvent);
  
  // Intensify retro grid during VR mode
  retroGrid.updateOptions({
    opacity: 1.0,
    cellSize: 30,
    lineWidth: 1,
    lightLineColor: '#ff0040',
    darkLineColor: '#ff0040'
  });
  
  // Intensify particles
  particles.updateOptions({
    color: '#ff0040',
    count: 60,
    maxSize: 4,
    speed: 0.8,
    opacity: 0.7
  });
  
  // Change ripple color
  ripple.updateOptions({
    color: '#ff0040',
    size: 300,
    opacity: 0.8,
    lineWidth: 3
  });
  
  // Activate HUD
  hud.updateOptions({
    active: true,
    color: '#ff0040'
  });
  
  // Auto-deactivate after animation
  setTimeout(() => {
    document.body.classList.remove('vr-active');
    document.querySelector('.content').classList.remove('vr-glitch');
    
    // Reset retro grid
    retroGrid.updateOptions({
      opacity: 0.6,
      cellSize: 60,
      lineWidth: 1,
      lightLineColor: '#00ff88',
      darkLineColor: '#00ff88'
    });
    
    // Reset particles
    particles.updateOptions({
      color: '#00ff88',
      count: 40,
      maxSize: 3,
      speed: 0.3,
      opacity: 0.4
    });
    
    // Reset ripple
    ripple.updateOptions({
      color: '#00ff88',
      size: 200,
      opacity: 0.3,
      lineWidth: 1
    });
    
    // Deactivate HUD
    hud.updateOptions({
      active: false
    });
    
    isVRActive = false;
  }, 2000); // Extended VR mode duration to 2 seconds to better show effects
};

init();