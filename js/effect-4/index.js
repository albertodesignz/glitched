import { TextAnimator } from './text-animator.js';
import { RetroGrid } from '../retro-grid.js';
import { Particles } from '../particles.js';
import { Ripple } from '../ripple.js';
import { HUD } from '../hud.js';

let retroGrid;
let particles;
let ripple;
let hud;

const init = () => {
  document.querySelectorAll('.list__item').forEach(item => {
    const cols = Array.from(item.querySelectorAll('.hover-effect'));
    const animators = cols.map(col => new TextAnimator(col));

    item.addEventListener('mouseenter', () => {
      animators.forEach(animator => animator.animate());
    });
    item.addEventListener('mouseleave', () => {
      animators.forEach(animator => animator.animateBack());
    });
  });

  // Same for all links
  document.querySelectorAll('a.hover-effect').forEach(item => {
    const animator = new TextAnimator(item);
    item.addEventListener('mouseenter', () => {
      animator.animate();
    });
    item.addEventListener('mouseleave', () => {
      animator.animateBack();
    });
  });

  // Initialize retro grid
  retroGrid = new RetroGrid({
    containerSelector: 'body',
    angle: 65,
    cellSize: 60,
    opacity: 0.6,
    lightLineColor: '#ff0040',
    darkLineColor: '#ff0040',
    lineWidth: 1,
    fullScreen: true,
    zIndex: -1
  });
  
  // Initialize particles
  particles = new Particles({
    containerSelector: 'body',
    count: 40,
    color: '#ff0040',
    maxSize: 3,
    minSize: 1,
    opacity: 0.4,
    speed: 0.3,
    zIndex: 0
  });
  
  // Initialize ripple effect
  ripple = new Ripple({
    containerSelector: 'body',
    color: '#ff0040',
    duration: 1500,
    size: 250,
    opacity: 0.5,
    lineWidth: 2,
    zIndex: 2
  });
  
  // Initialize HUD (initially inactive)
  hud = new HUD({
    containerSelector: 'body',
    color: '#ff0040',
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

init();