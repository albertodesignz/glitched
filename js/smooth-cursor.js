class SmoothCursor {
  constructor(options = {}) {
    this.springConfig = {
      damping: 45,
      stiffness: 400,
      mass: 1,
      restDelta: 0.001,
      ...options.springConfig
    };

    this.cursorElement = options.cursor || this.createDefaultCursor();
    this.isMoving = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.lastUpdateTime = Date.now();
    this.previousAngle = 0;
    this.accumulatedRotation = 0;

    // Spring values
    this.currentPos = { x: 0, y: 0 };
    this.targetPos = { x: 0, y: 0 };
    this.currentRotation = 0;
    this.targetRotation = 0;
    this.currentScale = 1;
    this.targetScale = 1;

    this.init();
  }

  createDefaultCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'smooth-cursor';
    cursor.innerHTML = `
      <svg width="25" height="27" viewBox="0 0 50 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_91_7928)">
          <path d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z" fill="#00ff88"/>
          <path d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z" stroke="white" stroke-width="2.25825"/>
        </g>
        <defs>
          <filter id="filter0_d_91_7928" x="0.602397" y="0.952444" width="49.0584" height="52.428" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="2.25825"/>
            <feGaussianBlur stdDeviation="2.25825"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_91_7928"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_91_7928" result="shape"/>
          </filter>
        </defs>
      </svg>
    `;
    
    cursor.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      transform: translate(-50%, -50%);
      will-change: transform;
      transition: transform 0.1s ease-out;
    `;

    return cursor;
  }

  init() {
    document.body.appendChild(this.cursorElement);
    document.body.style.cursor = 'none';
    
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundClick = this.handleClick.bind(this);
    
    window.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('click', this.boundClick);
    
    // Start animation loop
    this.animate();
  }

  updateVelocity(currentPos) {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    if (deltaTime > 0) {
      this.velocity = {
        x: (currentPos.x - this.lastMousePos.x) / deltaTime,
        y: (currentPos.y - this.lastMousePos.y) / deltaTime,
      };
    }

    this.lastUpdateTime = currentTime;
    this.lastMousePos = currentPos;
  }

  handleMouseMove(e) {
    const currentPos = { x: e.clientX, y: e.clientY };
    this.updateVelocity(currentPos);

    const speed = Math.sqrt(
      Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)
    );

    this.targetPos = currentPos;

    if (speed > 0.1) {
      const currentAngle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI) + 90;

      let angleDiff = currentAngle - this.previousAngle;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      this.accumulatedRotation += angleDiff;
      this.targetRotation = this.accumulatedRotation;
      this.previousAngle = currentAngle;

      this.targetScale = 0.95;
      this.isMoving = true;

      // Reset scale after movement stops
      clearTimeout(this.scaleTimeout);
      this.scaleTimeout = setTimeout(() => {
        this.targetScale = 1;
        this.isMoving = false;
      }, 150);
    }
  }

  handleClick() {
    // Add click effect to cursor
    this.cursorElement.classList.add('click-effect');
    setTimeout(() => {
      this.cursorElement.classList.remove('click-effect');
    }, 300);
    
    // Trigger a brief scale animation
    this.targetScale = 1.3;
    setTimeout(() => {
      this.targetScale = 1;
    }, 200);
  }

  // Simple spring animation function
  spring(current, target, velocity, config) {
    const { stiffness, damping, mass } = config;
    const force = -stiffness * (current - target);
    const dampingForce = -damping * velocity;
    const acceleration = (force + dampingForce) / mass;
    
    velocity += acceleration * 0.016; // 60fps
    current += velocity * 0.016;
    
    return { value: current, velocity };
  }

  animate() {
    // Spring animation for position
    const posXResult = this.spring(
      this.currentPos.x, 
      this.targetPos.x, 
      this.velocityX || 0, 
      this.springConfig
    );
    this.currentPos.x = posXResult.value;
    this.velocityX = posXResult.velocity;

    const posYResult = this.spring(
      this.currentPos.y, 
      this.targetPos.y, 
      this.velocityY || 0, 
      this.springConfig
    );
    this.currentPos.y = posYResult.value;
    this.velocityY = posYResult.velocity;

    // Spring animation for rotation
    const rotResult = this.spring(
      this.currentRotation, 
      this.targetRotation, 
      this.velocityRot || 0, 
      { ...this.springConfig, damping: 60, stiffness: 300 }
    );
    this.currentRotation = rotResult.value;
    this.velocityRot = rotResult.velocity;

    // Spring animation for scale
    const scaleResult = this.spring(
      this.currentScale, 
      this.targetScale, 
      this.velocityScale || 0, 
      { ...this.springConfig, stiffness: 500, damping: 35 }
    );
    this.currentScale = scaleResult.value;
    this.velocityScale = scaleResult.velocity;

    // Apply transforms
    this.cursorElement.style.transform = `
      translate(-50%, -50%) 
      translate(${this.currentPos.x}px, ${this.currentPos.y}px) 
      rotate(${this.currentRotation}deg) 
      scale(${this.currentScale})
    `;

    requestAnimationFrame(() => this.animate());
  }

  destroy() {
    window.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('click', this.boundClick);
    document.body.style.cursor = 'auto';
    if (this.cursorElement && this.cursorElement.parentNode) {
      this.cursorElement.parentNode.removeChild(this.cursorElement);
    }
    clearTimeout(this.scaleTimeout);
  }
}

export { SmoothCursor };