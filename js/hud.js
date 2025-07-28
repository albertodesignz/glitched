/**
 * HUD - A cyberpunk/VR heads-up display effect
 * Creates futuristic UI overlays for VR mode
 */
class HUD {
  /**
   * Create a HUD effect
   * @param {Object} options - Configuration options
   * @param {string} [options.containerSelector='body'] - CSS selector for the container
   * @param {string} [options.color='#00ff88'] - HUD elements color
   * @param {boolean} [options.active=false] - Whether HUD is initially active
   * @param {boolean} [options.showFramerate=true] - Whether to show framerate
   * @param {boolean} [options.showTime=true] - Whether to show time
   * @param {boolean} [options.showScanlines=true] - Whether to show scanlines
   * @param {boolean} [options.showCorners=true] - Whether to show corner brackets
   * @param {boolean} [options.showWaveform=true] - Whether to show waveform
   * @param {number} [options.zIndex=5] - z-index of the HUD container
   */
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || 'body',
      color: options.color || '#00ff88',
      active: options.active !== undefined ? options.active : false,
      showFramerate: options.showFramerate !== undefined ? options.showFramerate : true,
      showTime: options.showTime !== undefined ? options.showTime : true,
      showScanlines: options.showScanlines !== undefined ? options.showScanlines : true,
      showCorners: options.showCorners !== undefined ? options.showCorners : true,
      showWaveform: options.showWaveform !== undefined ? options.showWaveform : true,
      showStatus: options.showStatus !== undefined ? options.showStatus : true,
      zIndex: options.zIndex !== undefined ? options.zIndex : 10
    };
    
    this.container = null;
    this.hudElement = null;
    this.frameTimeElement = null;
    this.timeElement = null;
    this.scanlines = null;
    this.corners = [];
    this.waveformCanvas = null;
    this.waveformCtx = null;
    this.waveformPoints = Array(100).fill(0.5);
    
    this.lastFrameTime = 0;
    this.frameRate = 0;
    this.frameRateUpdateInterval = 500; // Update framerate every 500ms
    this.lastFrameRateUpdate = 0;
    
    this.animationFrameId = null;
    
    this.init();
  }
  
  init() {
    // Find container
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.error(`HUD: Container not found with selector ${this.options.containerSelector}`);
      return;
    }
    
    // Create main HUD element
    this.createHUDElements();
    
    // Set visibility based on options
    this.setActive(this.options.active);
    
    // Start animation
    this.animate();
  }
  
  createHUDElements() {
    // Create main HUD container
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'vr-hud';
    
    // Set HUD styles
    this.hudElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      color: ${this.options.color};
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      font-size: 12px;
      z-index: ${this.options.zIndex};
      opacity: 0;
      transition: opacity 0.3s ease;
      text-shadow: 0 0 5px ${this.options.color};
    `;
    
    // Add status notification if enabled
    if (this.options.showStatus) {
      const statusElement = document.createElement('div');
      statusElement.className = 'vr-hud-status';
      statusElement.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 10px 20px;
        border: 1px solid ${this.options.color};
        box-shadow: 0 0 15px ${this.options.color};
        opacity: 0;
        animation: status-fade 1s ease-in-out forwards;
      `;
      statusElement.innerHTML = 'VR MODE ACTIVATED';
      
      // Add keyframes for fade animation
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @keyframes status-fade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
      `;
      document.head.appendChild(styleElement);
      
      this.hudElement.appendChild(statusElement);
    }
    
    // Create framerate display
    if (this.options.showFramerate) {
      this.frameTimeElement = document.createElement('div');
      this.frameTimeElement.className = 'vr-hud-framerate';
      this.frameTimeElement.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 10px;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid ${this.options.color};
        text-shadow: 0 0 5px ${this.options.color};
      `;
      this.hudElement.appendChild(this.frameTimeElement);
    }
    
    // Create time display
    if (this.options.showTime) {
      this.timeElement = document.createElement('div');
      this.timeElement.className = 'vr-hud-time';
      this.timeElement.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 10px;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid ${this.options.color};
        text-shadow: 0 0 5px ${this.options.color};
      `;
      this.hudElement.appendChild(this.timeElement);
    }
    
    // Create scanlines
    if (this.options.showScanlines) {
      this.scanlines = document.createElement('div');
      this.scanlines.className = 'vr-hud-scanlines';
      this.scanlines.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          to bottom,
          transparent 0px,
          transparent 1px,
          rgba(0, 0, 0, 0.1) 2px,
          rgba(0, 0, 0, 0.1) 3px
        );
        opacity: 0.2;
        pointer-events: none;
      `;
      this.hudElement.appendChild(this.scanlines);
    }
    
    // Create corner brackets
    if (this.options.showCorners) {
      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      
      positions.forEach((pos, index) => {
        const corner = document.createElement('div');
        corner.className = `vr-hud-corner vr-hud-corner-${pos}`;
        
        const [vPos, hPos] = pos.split('-');
        const transform = `${vPos === 'top' ? 'top: 10px;' : 'bottom: 10px;'} ${hPos === 'left' ? 'left: 10px;' : 'right: 10px;'}`;
        
        corner.style.cssText = `
          position: absolute;
          ${transform}
          width: 30px;
          height: 30px;
          border-${vPos}: 2px solid ${this.options.color};
          border-${hPos}: 2px solid ${this.options.color};
          box-shadow: 0 0 5px ${this.options.color};
        `;
        
        this.corners.push(corner);
        this.hudElement.appendChild(corner);
      });
    }
    
    // Create waveform display
    if (this.options.showWaveform) {
      this.waveformCanvas = document.createElement('canvas');
      this.waveformCanvas.className = 'vr-hud-waveform';
      this.waveformCanvas.width = 200;
      this.waveformCanvas.height = 50;
      this.waveformCanvas.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.3);
        border: 1px solid ${this.options.color};
      `;
      
      this.waveformCtx = this.waveformCanvas.getContext('2d');
      this.hudElement.appendChild(this.waveformCanvas);
    }
    
    // Add HUD to container
    this.container.appendChild(this.hudElement);
  }
  
  setActive(active) {
    if (active) {
      this.hudElement.style.opacity = '1';
    } else {
      this.hudElement.style.opacity = '0';
    }
  }
  
  updateFrameRate(timestamp) {
    if (!this.frameTimeElement) return;
    
    if (!this.lastFrameTime) {
      this.lastFrameTime = timestamp;
      return;
    }
    
    // Calculate instantaneous FPS
    const deltaTime = timestamp - this.lastFrameTime;
    const instantFPS = 1000 / deltaTime;
    
    // Update average framerate every 500ms
    if (timestamp - this.lastFrameRateUpdate > this.frameRateUpdateInterval) {
      this.frameRate = instantFPS.toFixed(0);
      this.lastFrameRateUpdate = timestamp;
      
      this.frameTimeElement.textContent = `FPS: ${this.frameRate} | RT: ${deltaTime.toFixed(2)}ms`;
    }
    
    this.lastFrameTime = timestamp;
  }
  
  updateTime() {
    if (!this.timeElement) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    
    this.timeElement.textContent = `${hours}:${minutes}:${seconds}.${milliseconds} | SYS:ACTIVE`;
  }
  
  updateWaveform() {
    if (!this.waveformCanvas || !this.waveformCtx) return;
    
    // Generate a new point (simulated audio waveform)
    const newPoint = 0.5 + (Math.sin(Date.now() * 0.005) * 0.2) + (Math.random() * 0.1 - 0.05);
    this.waveformPoints.shift();
    this.waveformPoints.push(newPoint);
    
    // Clear canvas
    this.waveformCtx.clearRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);
    
    // Draw waveform
    this.waveformCtx.beginPath();
    this.waveformCtx.moveTo(0, this.waveformCanvas.height * this.waveformPoints[0]);
    
    for (let i = 1; i < this.waveformPoints.length; i++) {
      const x = (i / this.waveformPoints.length) * this.waveformCanvas.width;
      const y = this.waveformPoints[i] * this.waveformCanvas.height;
      this.waveformCtx.lineTo(x, y);
    }
    
    this.waveformCtx.strokeStyle = this.options.color;
    this.waveformCtx.lineWidth = 1;
    this.waveformCtx.stroke();
    
    // Add glow
    this.waveformCtx.shadowBlur = 5;
    this.waveformCtx.shadowColor = this.options.color;
  }
  
  animate(timestamp) {
    this.updateFrameRate(timestamp);
    this.updateTime();
    this.updateWaveform();
    
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }
  
  // Update HUD options
  updateOptions(newOptions = {}) {
    // Store old active state
    const wasActive = this.options.active;
    
    // Update options
    Object.assign(this.options, newOptions);
    
    // If active state changed, update visibility
    if (wasActive !== this.options.active) {
      this.setActive(this.options.active);
    }
    
    // Update color for all elements
    if (newOptions.color) {
      this.updateColor(newOptions.color);
    }
  }
  
  updateColor(color) {
    if (this.frameTimeElement) {
      this.frameTimeElement.style.borderColor = color;
      this.frameTimeElement.style.textShadow = `0 0 5px ${color}`;
    }
    
    if (this.timeElement) {
      this.timeElement.style.borderColor = color;
      this.timeElement.style.textShadow = `0 0 5px ${color}`;
    }
    
    this.corners.forEach(corner => {
      corner.style.borderColor = color;
      corner.style.boxShadow = `0 0 5px ${color}`;
    });
    
    if (this.waveformCanvas) {
      this.waveformCanvas.style.borderColor = color;
    }
  }
  
  // Cleanup
  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    
    if (this.hudElement && this.hudElement.parentNode) {
      this.hudElement.parentNode.removeChild(this.hudElement);
    }
  }
}

export { HUD };