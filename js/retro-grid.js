/**
 * RetroGrid - An animated scrolling retro grid effect
 * Vanilla JS implementation based on MagicUI's RetroGrid component
 */
class RetroGrid {
  /**
   * Create a RetroGrid
   * @param {Object} options - Configuration options
   * @param {string} [options.containerSelector] - CSS selector for the container
   * @param {number} [options.angle=65] - Rotation angle of the grid in degrees
   * @param {number} [options.cellSize=60] - Grid cell size in pixels
   * @param {number} [options.opacity=0.5] - Grid opacity value between 0 and 1
   * @param {string} [options.lightLineColor="gray"] - Grid line color in light mode
   * @param {string} [options.darkLineColor="gray"] - Grid line color in dark mode
   * @param {number} [options.lineWidth=1] - Width of grid lines in pixels
   * @param {boolean} [options.fullScreen=false] - Whether to create a full-screen grid
   * @param {number} [options.zIndex=-1] - Z-index of the grid
   */
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || 'body',
      angle: options.angle || 65,
      cellSize: options.cellSize || 60,
      opacity: options.opacity || 0.5,
      lightLineColor: options.lightLineColor || "#00ff88",
      darkLineColor: options.darkLineColor || "#00ff88",
      lineWidth: options.lineWidth || 1,
      fullScreen: options.fullScreen || false,
      zIndex: options.zIndex !== undefined ? options.zIndex : -1
    };
    
    this.container = null;
    this.gridElement = null;
    
    this.init();
  }
  
  init() {
    // Find or create container
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.error(`RetroGrid: Container not found with selector ${this.options.containerSelector}`);
      return;
    }
    
    // Set up container styles if needed
    if (!this.container.style.position || this.container.style.position === 'static') {
      this.container.style.position = 'relative';
    }
    if (!this.container.style.overflow) {
      this.container.style.overflow = 'hidden';
    }
    
    // Create grid elements
    this.createGridElements();
  }
  
  createGridElements() {
    // Create main grid container
    this.gridElement = document.createElement('div');
    this.gridElement.className = 'retro-grid';
    
    let position = this.options.fullScreen ? 'fixed' : 'absolute';
    
    this.gridElement.style.cssText = `
      pointer-events: none;
      position: ${position};
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      overflow: hidden;
      perspective: 200px;
      opacity: ${this.options.opacity};
      z-index: ${this.options.zIndex};
    `;
    
    // Create rotated container
    const rotatedContainer = document.createElement('div');
    rotatedContainer.className = 'retro-grid-rotated';
    rotatedContainer.style.cssText = `
      position: absolute;
      inset: 0;
      transform: rotateX(${this.options.angle}deg);
    `;
    
    // Create animated grid
    const gridLines = document.createElement('div');
    gridLines.className = 'retro-grid-lines';
    gridLines.style.cssText = `
      background-image: 
        linear-gradient(to right, ${this.options.lightLineColor} ${this.options.lineWidth}px, transparent 0),
        linear-gradient(to bottom, ${this.options.lightLineColor} ${this.options.lineWidth}px, transparent 0);
      background-repeat: repeat;
      background-size: ${this.options.cellSize}px ${this.options.cellSize}px;
      height: 300vh;
      inset: 0% 0px;
      margin-left: -200%;
      transform-origin: 100% 0 0;
      width: 600vw;
      animation: retro-grid-animation 15s linear infinite;
      filter: drop-shadow(0 0 5px ${this.options.lightLineColor}) drop-shadow(0 0 10px ${this.options.lightLineColor});
    `;
    
    // Create fade gradient with radial opacity
    const fadeGradient = document.createElement('div');
    fadeGradient.className = 'retro-grid-fade';
    fadeGradient.style.cssText = `
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.7) 80%),
        linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 90%);
    `;
    
    // Assemble the components
    rotatedContainer.appendChild(gridLines);
    this.gridElement.appendChild(rotatedContainer);
    this.gridElement.appendChild(fadeGradient);
    this.container.appendChild(this.gridElement);
    
    // Add the keyframes animation if it doesn't exist yet
    if (!document.getElementById('retro-grid-keyframes')) {
      const keyframesStyle = document.createElement('style');
      keyframesStyle.id = 'retro-grid-keyframes';
      keyframesStyle.textContent = `
        @keyframes retro-grid-animation {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(keyframesStyle);
    }
  }
  
  // Update grid options
  updateOptions(newOptions = {}) {
    Object.assign(this.options, newOptions);
    
    if (this.gridElement) {
      // Remove old grid
      this.gridElement.remove();
      
      // Create new grid with updated options
      this.createGridElements();
    }
  }
  
  // Remove the grid
  destroy() {
    if (this.gridElement) {
      this.gridElement.remove();
      this.gridElement = null;
    }
  }
}

export { RetroGrid };