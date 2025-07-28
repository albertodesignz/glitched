/**
 * Ripple - A click ripple effect
 * Creates circular wave distortions on click events
 */
class Ripple {
  /**
   * Create a Ripple effect
   * @param {Object} options - Configuration options
   * @param {string} [options.containerSelector='body'] - CSS selector for the container
   * @param {string} [options.color='#00ff88'] - Ripple color
   * @param {number} [options.duration=1000] - Ripple duration in milliseconds
   * @param {number} [options.size=300] - Maximum ripple size in pixels
   * @param {number} [options.opacity=0.5] - Ripple opacity
   * @param {number} [options.lineWidth=2] - Ripple line width in pixels
   * @param {number} [options.zIndex=1] - z-index of the ripple container
   */
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || 'body',
      color: options.color || '#00ff88',
      duration: options.duration || 1000,
      size: options.size || 300,
      opacity: options.opacity || 0.5,
      lineWidth: options.lineWidth || 2,
      zIndex: options.zIndex !== undefined ? options.zIndex : 1
    };
    
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.ripples = [];
    this.isActive = true;
    this.animationFrameId = null;
    
    this.init();
  }
  
  init() {
    // Find container
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.error(`Ripple: Container not found with selector ${this.options.containerSelector}`);
      return;
    }
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ripple-canvas';
    
    // Set canvas styles
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${this.options.zIndex};
    `;
    
    // Append canvas to container
    this.container.appendChild(this.canvas);
    
    // Get context and set canvas dimensions
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    // Add event listeners
    window.addEventListener('resize', () => this.resizeCanvas());
    document.addEventListener('click', (event) => this.createRipple(event));
    
    // Start animation
    this.animate();
  }
  
  resizeCanvas() {
    const containerRect = this.container.getBoundingClientRect();
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createRipple(event) {
    if (!this.isActive) return;
    
    const x = event.clientX;
    const y = event.clientY;
    
    // Create main ripple
    this.ripples.push({
      x: x,
      y: y,
      size: 0,
      opacity: this.options.opacity,
      color: this.options.color,
      startTime: Date.now(),
      lineWidth: this.options.lineWidth
    });
    
    // Create second ripple with offset timing for double-effect
    setTimeout(() => {
      this.ripples.push({
        x: x,
        y: y,
        size: 0,
        opacity: this.options.opacity * 0.8,
        color: this.options.color,
        startTime: Date.now(),
        lineWidth: this.options.lineWidth * 0.5
      });
    }, 100);
  }
  
  updateRipples() {
    const currentTime = Date.now();
    const newRipples = [];
    
    for (let i = 0; i < this.ripples.length; i++) {
      const ripple = this.ripples[i];
      const elapsed = currentTime - ripple.startTime;
      const progress = elapsed / this.options.duration;
      
      // Remove ripples that have completed their animation
      if (progress >= 1) continue;
      
      // Update ripple size and opacity
      ripple.size = progress * this.options.size;
      ripple.opacity = this.options.opacity * (1 - progress);
      
      newRipples.push(ripple);
    }
    
    this.ripples = newRipples;
  }
  
  drawRipples() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.ripples.length; i++) {
      const ripple = this.ripples[i];
      
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.size, 0, Math.PI * 2);
      this.ctx.strokeStyle = ripple.color;
      this.ctx.lineWidth = ripple.lineWidth;
      this.ctx.globalAlpha = ripple.opacity;
      
      // Add glow effect
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = ripple.color;
      
      this.ctx.stroke();
      
      // Add second inner ripple
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.size * 0.7, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Reset shadow and alpha
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }
  
  animate() {
    if (!this.isActive) return;
    
    this.updateRipples();
    this.drawRipples();
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
  
  // Update ripple options
  updateOptions(newOptions = {}) {
    Object.assign(this.options, newOptions);
  }
  
  // Toggle activity
  toggleActive(isActive) {
    this.isActive = isActive;
    
    if (isActive && !this.animationFrameId) {
      this.animate();
    }
  }
  
  // Cleanup
  destroy() {
    this.isActive = false;
    cancelAnimationFrame(this.animationFrameId);
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    window.removeEventListener('resize', this.resizeCanvas);
    document.removeEventListener('click', this.createRipple);
  }
}

export { Ripple };