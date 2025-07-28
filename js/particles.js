/**
 * Particles - A floating particles system effect
 * Creates cyberpunk/VR style floating particles that react to cursor movement
 */
class Particles {
  /**
   * Create a Particles system
   * @param {Object} options - Configuration options
   * @param {string} [options.containerSelector='body'] - CSS selector for the container
   * @param {number} [options.count=50] - Number of particles
   * @param {string} [options.color='#00ff88'] - Particle color
   * @param {number} [options.maxSize=4] - Maximum particle size in pixels
   * @param {number} [options.minSize=1] - Minimum particle size in pixels
   * @param {number} [options.speed=1] - Particle movement speed
   * @param {number} [options.opacity=0.6] - Particle opacity
   * @param {boolean} [options.mouseInteractive=true] - Whether particles react to mouse movement
   * @param {number} [options.zIndex=-1] - z-index of the particle container
   */
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || 'body',
      count: options.count || 50,
      color: options.color || '#00ff88',
      maxSize: options.maxSize || 4,
      minSize: options.minSize || 1,
      speed: options.speed || 1,
      opacity: options.opacity || 0.6,
      mouseInteractive: options.mouseInteractive !== undefined ? options.mouseInteractive : true,
      zIndex: options.zIndex !== undefined ? options.zIndex : -1
    };
    
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 100 };
    this.isActive = true;
    this.animationFrameId = null;
    
    this.init();
  }
  
  init() {
    // Find container
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.error(`Particles: Container not found with selector ${this.options.containerSelector}`);
      return;
    }
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'particles-canvas';
    
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
    
    // Create particles
    this.createParticles();
    
    // Add event listeners
    window.addEventListener('resize', () => this.resizeCanvas());
    
    if (this.options.mouseInteractive) {
      window.addEventListener('mousemove', (event) => {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
      });
      
      // Reset mouse position when mouse leaves window
      window.addEventListener('mouseout', () => {
        this.mouse.x = undefined;
        this.mouse.y = undefined;
      });
    }
    
    // Start animation
    this.animate();
  }
  
  resizeCanvas() {
    const containerRect = this.container.getBoundingClientRect();
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // If container dimensions change, recreate particles
    if (this.particles.length > 0) {
      this.createParticles();
    }
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.options.count; i++) {
      const size = Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize;
      
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: size,
        color: this.options.color,
        speedX: Math.random() * this.options.speed * 2 - this.options.speed,
        speedY: Math.random() * this.options.speed * 2 - this.options.speed,
        opacity: Math.random() * 0.5 + this.options.opacity,
        blinking: Math.random() > 0.8, // 20% chance of blinking
        blinkRate: Math.random() * 0.02 + 0.01
      });
    }
  }
  
  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Handle boundary conditions (wrap around)
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
      
      // If mouse is active and close to particle, push it away
      if (this.options.mouseInteractive && this.mouse.x && this.mouse.y) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          
          p.x += Math.cos(angle) * force;
          p.y += Math.sin(angle) * force;
        }
      }
      
      // Handle blinking effect
      if (p.blinking) {
        p.opacity += Math.sin(Date.now() * p.blinkRate) * 0.01;
        p.opacity = Math.max(0.1, Math.min(1, p.opacity));
      }
    }
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
      
      // Add glow effect
      this.ctx.shadowBlur = p.size * 2;
      this.ctx.shadowColor = p.color;
      
      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Draw line if particles are close
        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = p.color;
          this.ctx.globalAlpha = (100 - distance) / 500 * p.opacity;
          this.ctx.lineWidth = (p.size + p2.size) / 10;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
    
    // Reset shadow and alpha
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }
  
  animate() {
    if (!this.isActive) return;
    
    this.updateParticles();
    this.drawParticles();
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
  
  // Update particles options
  updateOptions(newOptions = {}) {
    Object.assign(this.options, newOptions);
    
    // Update particles properties based on new options
    this.createParticles();
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
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseout', this.handleMouseOut);
  }
}

export { Particles };