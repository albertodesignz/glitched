import { gsap } from 'gsap'
import { SplitType } from 'split-type'

// Terminal typing effect
function initTerminalTyping() {
  const terminalLines = document.querySelectorAll('.terminal-line')
  
  terminalLines.forEach((line, index) => {
    const text = line.textContent
    line.textContent = ''
    
    // Create a typing effect
    gsap.to(line, {
      duration: 0.05,
      delay: index * 0.1,
      onStart: () => {
        line.style.opacity = '1'
      },
      onUpdate: function() {
        const progress = this.progress()
        const charCount = Math.floor(text.length * progress)
        line.textContent = text.substring(0, charCount)
      },
      onComplete: () => {
        line.textContent = text
      }
    })
  })
}

// Terminal cursor blink
function initTerminalCursor() {
  const lastLine = document.querySelector('.terminal-line:last-child')
  if (lastLine) {
    const cursor = document.createElement('span')
    cursor.textContent = '_'
    cursor.style.animation = 'cursor-blink 1s infinite'
    lastLine.appendChild(cursor)
  }
}

// Add some terminal interactivity
function initTerminalInteractivity() {
  const terminalWindow = document.querySelector('.terminal-window')
  
  if (terminalWindow) {
    // Add hover effect to terminal window
    terminalWindow.addEventListener('mouseenter', () => {
      gsap.to(terminalWindow, {
        boxShadow: '0 0 30px rgba(0, 255, 0, 0.5)',
        duration: 0.3
      })
    })
    
    terminalWindow.addEventListener('mouseleave', () => {
      gsap.to(terminalWindow, {
        boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
        duration: 0.3
      })
    })
    
    // Add click effect to terminal buttons
    const terminalButtons = document.querySelectorAll('.terminal-button')
    terminalButtons.forEach(button => {
      button.addEventListener('click', () => {
        gsap.to(button, {
          scale: 0.8,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        })
      })
    })
  }
}

// Add glitch effect randomly
function initGlitchEffect() {
  const terminalWindow = document.querySelector('.terminal-window')
  
  if (terminalWindow) {
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        gsap.to(terminalWindow, {
          x: Math.random() * 4 - 2,
          y: Math.random() * 4 - 2,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        })
      }
    }, 2000)
  }
}

// Add some dynamic terminal content
function addDynamicTerminalContent() {
  const terminalContent = document.querySelector('.terminal-content')
  
  if (terminalContent) {
    const commands = [
      '$ ping -c 3 google.com',
      'PING google.com (142.250.190.78) 56(84) bytes of data.',
      '64 bytes from 142.250.190.78: icmp_seq=1 time=15.2 ms',
      '64 bytes from 142.250.190.78: icmp_seq=2 time=14.8 ms',
      '64 bytes from 142.250.190.78: icmp_seq=3 time=15.1 ms',
      '',
      '--- google.com ping statistics ---',
      '3 packets transmitted, 3 received, 0% packet loss, time 2003ms',
      'rtt min/avg/max/mdev = 14.800/15.033/15.200/0.200 ms',
      '$ free -h',
      '              total        used        free      shared  buff/cache   available',
      'Mem:           15Gi       4.2Gi       8.1Gi       1.2Gi       2.7Gi       9.5Gi',
      'Swap:         8.0Gi          0B       8.0Gi',
      '$ uptime',
      '10:45:00 up 2:15,  1 user,  load average: 0.52, 0.48, 0.45',
      '$ _'
    ]
    
    let currentIndex = 0
    
    setInterval(() => {
      if (currentIndex < commands.length) {
        const newLine = document.createElement('div')
        newLine.className = 'terminal-line'
        newLine.textContent = commands[currentIndex]
        newLine.style.opacity = '0'
        
        terminalContent.appendChild(newLine)
        
        gsap.to(newLine, {
          opacity: 0.8,
          duration: 0.3,
          delay: 0.1
        })
        
        currentIndex++
      }
    }, 3000)
  }
}

// Initialize all terminal effects
function initTerminalEffects() {
  // Wait for DOM to be ready
  setTimeout(() => {
    initTerminalTyping()
    initTerminalCursor()
    initTerminalInteractivity()
    initGlitchEffect()
    addDynamicTerminalContent()
  }, 500)
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initTerminalEffects)

// Export for potential use in other modules
export { initTerminalEffects } 