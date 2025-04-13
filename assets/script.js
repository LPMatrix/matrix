// Loading Animation
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('loader-progress-bar');
  
  // Simulate loading progress with anime.js
  anime({
    targets: progressBar,
    width: '100%',
    easing: 'easeInOutQuart',
    duration: 2000,
    complete: function() {
      // Hide loader with a fade-out animation
      anime({
        targets: loader,
        opacity: 0,
        duration: 800,
        easing: 'easeOutQuad',
        complete: function() {
          loader.style.display = 'none';
          // Initialize animations after loader is hidden
          initAnimations();
        }
      });
    }
  });
});

// // Mobile Menu Toggle
const menuToggle = document.getElementById("menuToggle");
      const mobileMenu = document.getElementById("mobileMenu");
      const menuLinks = document.querySelectorAll('[data-menu-link]');
      
      // Toggle the mobile menu
      function toggleMobileMenu() {
        menuToggle.classList.toggle("active");
        mobileMenu.classList.toggle("active");
        
        // Prevent scrolling when menu is open
        if (mobileMenu.classList.contains("active")) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }
      }
      
      // Event listener for menu toggle
      menuToggle.addEventListener("click", toggleMobileMenu);
      
      // Close menu when clicking on a link
      menuLinks.forEach(link => {
        link.addEventListener('click', function() {
          toggleMobileMenu();
        });
      });
      
      // iOS vh unit fix
      function setVhProperty() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
      
      setVhProperty();
      window.addEventListener('resize', setVhProperty);
      
      // Disable cursor on touch devices
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        const cursor = document.getElementById('cursor');
        if (cursor) {
          cursor.style.display = 'none';
        }
      }
      
      // Close the menu when clicking outside
      document.addEventListener('click', function(event) {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(event.target) && 
            !menuToggle.contains(event.target)) {
          toggleMobileMenu();
        }
      });

// Custom Cursor
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
  // Use anime.js for smoother cursor movement
  anime({
    targets: cursor,
    left: e.clientX,
    top: e.clientY,
    duration: 50,
    easing: 'linear'
  });
});

document.addEventListener('mousedown', () => {
  anime({
    targets: cursor,
    scale: 0.8,
    duration: 150,
    easing: 'easeOutQuad'
  });
});

document.addEventListener('mouseup', () => {
  anime({
    targets: cursor,
    scale: 1,
    duration: 150,
    easing: 'easeOutQuad'
  });
});

// Add hover effects for links and buttons with custom cursor
document.querySelectorAll('a, button, .skill-pill, .work-card').forEach(item => {
  item.addEventListener('mouseenter', () => {
    anime({
      targets: cursor,
      scale: 1.5,
      duration: 200,
      easing: 'easeOutQuad'
    });
  });
  
  item.addEventListener('mouseleave', () => {
    anime({
      targets: cursor,
      scale: 1,
      duration: 200,
      easing: 'easeOutQuad'
    });
  });
});

// Scroll Progress
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.offsetHeight;
  const winHeight = window.innerHeight;
  const scrollPercent = scrollTop / (docHeight - winHeight);
  const scrollProgress = document.getElementById('scrollProgress');
  
  anime.set(scrollProgress, {
    width: `${scrollPercent * 100}%`
  });
  
  // Navbar Background
  const mainNav = document.getElementById('mainNav');
  if (scrollTop > 50) {
    if (!mainNav.classList.contains('scrolled')) {
      mainNav.classList.add('scrolled');
      anime({
        targets: mainNav,
        backgroundColor: 'rgba(13, 15, 24, 1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '1rem 0',
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  } else {
    if (mainNav.classList.contains('scrolled')) {
      mainNav.classList.remove('scrolled');
      anime({
        targets: mainNav,
        backgroundColor: 'rgba(13, 15, 24, 0)',
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        padding: '2rem 0',
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }
});

// Particle Background
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const particleCount = 100;
  const connectionDistance = 120;
  
  // Create particle objects
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      color: 'rgba(255, 255, 255, 0.2)',
      speed: Math.random() * 0.5 + 0.1,
      directionX: Math.random() * 2 - 1,
      directionY: Math.random() * 2 - 1,
      // Add properties for anime.js animations
      originalX: 0,
      originalY: 0,
      targetX: 0,
      targetY: 0
    });
    
    // Store original position for mouse interaction
    particles[i].originalX = particles[i].x;
    particles[i].originalY = particles[i].y;
  }
  
  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let mouseRadius = 150;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      
      // Update position
      p.x += p.directionX * p.speed;
      p.y += p.directionY * p.speed;
      
      // Bounce off walls
      if (p.x < 0 || p.x > canvas.width) p.directionX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.directionY *= -1;
      
      // Mouse repulsion
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouseRadius) {
        const force = (mouseRadius - distance) / mouseRadius;
        const dirX = dx / distance;
        const dirY = dy / distance;
        p.x -= dirX * force * 2;
        p.y -= dirY * force * 2;
      }
      
      // Connect particles that are close to each other
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const distance = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
        
        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(63, 140, 255, ${0.5 - distance / connectionDistance})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animateParticles);
  }
  
  animateParticles();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Animations initialization
function initAnimations() {
  // Hero section animations
  anime.timeline({
    easing: 'easeOutExpo',
  })
  .add({
    targets: '#hero .stagger-fade-in',
    translateY: [40, 0],
    opacity: [0, 1],
    delay: anime.stagger(150),
    duration: 1200
  })
  .add({
    targets: '.hero-image-container',
    translateY: [60, 0],
    opacity: [0, 1],
    duration: 1000
  }, '-=800');
  
  // Initialize IntersectionObserver for scroll animations
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Section headings animation
        if (entry.target.classList.contains('section-heading')) {
          anime({
            targets: entry.target,
            translateX: [-100, 0],
            opacity: [0, 0.1],
            duration: 1200,
            easing: 'easeOutQuad'
          });
        }
        
        // Staggered fade in animations for section content
        if (entry.target.querySelectorAll('.stagger-fade-in').length > 0) {
          anime({
            targets: entry.target.querySelectorAll('.stagger-fade-in'),
            translateY: [40, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutQuad'
          });
        }
        
        // Reveal text animations
        if (entry.target.querySelectorAll('.reveal-text span').length > 0) {
          anime({
            targets: entry.target.querySelectorAll('.reveal-text span'),
            translateY: [100, 0],
            duration: 800,
            delay: anime.stagger(80),
            easing: 'easeOutQuad'
          });
        }
        
        // Work cards animation
        if (entry.target.querySelectorAll('.work-card').length > 0) {
          anime({
            targets: entry.target.querySelectorAll('.work-card'),
            translateY: [60, 0],
            opacity: [0, 1],
            delay: anime.stagger(150),
            duration: 800,
            easing: 'easeOutQuad'
          });
        }
        
        // Skill pills animation
        if (entry.target.querySelectorAll('.skill-pill').length > 0) {
          anime({
            targets: entry.target.querySelectorAll('.skill-pill'),
            scale: [0.8, 1],
            opacity: [0, 1],
            delay: anime.stagger(80),
            duration: 600,
            easing: 'easeOutElastic(1, .5)'
          });
        }
        
        // Experience items timeline animation
        if (entry.target.querySelectorAll('.experience-item').length > 0) {
          anime({
            targets: entry.target.querySelectorAll('.experience-item'),
            translateX: [-30, 0],
            opacity: [0, 1],
            delay: anime.stagger(200),
            duration: 800,
            easing: 'easeOutQuad'
          });
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all sections
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
  
  // Observe section headings separately
  document.querySelectorAll('.section-heading').forEach(heading => {
    observer.observe(heading);
  });
  
  // Initialize particles
  initParticles();
  
  // Initialize smooth scroll behavior
  initSmoothScroll();
  
  // Animate the nav items
  anime({
    targets: '.nav-item',
    translateY: [10, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    duration: 800,
    easing: 'easeOutQuad'
  });
}

function initSmoothScroll() {
  // Try to use SmoothScroll library if available
  try {
    if (typeof SmoothScroll !== 'undefined') {
      const scroll = new SmoothScroll('a[href*="#"]', {
        speed: 800,
        speedAsDuration: true,
        offset: 50,
        easing: 'easeInOutCubic'
      });
    }
  } catch (e) {
    console.log('SmoothScroll not available, using fallback');
    
    // Fallback smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerOffset = 60;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          anime({
            targets: document.scrollingElement || document.documentElement,
            scrollTop: offsetPosition,
            duration: 800,
            easing: 'easeInOutQuad'
          });
        }
      });
    });
  }
}

// Form validation and submission
const contactForm = document.querySelector('#contact form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simple validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    let isValid = true;
    
    // Validation with animation feedback
    if (!nameInput.value.trim()) {
      anime({
        targets: nameInput,
        borderColor: ['#ff3333', '#3F8CFF'],
        duration: 1000,
        easing: 'easeInOutQuad'
      });
      nameInput.style.borderColor = '#ff3333';
      isValid = false;
    } else {
      nameInput.style.borderColor = '';
    }
    
    if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
      anime({
        targets: emailInput,
        borderColor: ['#ff3333', '#3F8CFF'],
        duration: 1000,
        easing: 'easeInOutQuad'
      });
      emailInput.style.borderColor = '#ff3333';
      isValid = false;
    } else {
      emailInput.style.borderColor = '';
    }
    
    if (!messageInput.value.trim()) {
      anime({
        targets: messageInput,
        borderColor: ['#ff3333', '#3F8CFF'],
        duration: 1000,
        easing: 'easeInOutQuad'
      });
      messageInput.style.borderColor = '#ff3333';
      isValid = false;
    } else {
      messageInput.style.borderColor = '';
    }
    
    if (isValid) {
      // Animated success state
      const submitButton = contactForm.querySelector('button[type="submit"]');
      
      anime.timeline({
        duration: 400,
        easing: 'easeOutQuad'
      })
      .add({
        targets: submitButton,
        scale: [1, 0.95, 1.05, 1],
        backgroundColor: '#10B981',
        color: '#ffffff',
        borderColor: '#10B981',
        complete: function() {
          submitButton.innerHTML = '<i class="fas fa-check mr-2"></i> Message Sent!';
        }
      })
      .add({
        targets: [nameInput, emailInput, messageInput],
        opacity: [1, 0.7, 1],
        duration: 1000
      })
      
      // Reset form
      contactForm.reset();
      
      // Reset button after delay
      setTimeout(() => {
        anime({
          targets: submitButton,
          backgroundColor: 'rgba(0,0,0,0)',
          color: '#3F8CFF',
          borderColor: '#3F8CFF',
          duration: 500,
          easing: 'easeOutQuad',
          complete: function() {
            submitButton.innerHTML = 'Send Message <i class="fas fa-paper-plane ml-2"></i>';
          }
        });
      }, 3000);
    }
  });
}

// Add magnetic effect to buttons with anime.js
document.querySelectorAll('.magnetic-button').forEach(button => {
  button.addEventListener('mousemove', (e) => {
    const position = button.getBoundingClientRect();
    const x = e.clientX - position.left - position.width / 2;
    const y = e.clientY - position.top - position.height / 2;
    
    anime({
      targets: button,
      translateX: x * 0.3,
      translateY: y * 0.3,
      duration: 0, // Instant for smooth tracking
    });
  });
  
  button.addEventListener('mouseleave', () => {
    anime({
      targets: button,
      translateX: 0,
      translateY: 0,
      duration: 600,
      easing: 'easeOutElastic(1, .5)'
    });
  });
});

// Hover animations for skill pills
document.querySelectorAll('.skill-pill').forEach(pill => {
  pill.addEventListener('mouseenter', () => {
    anime({
      targets: pill,
      scale: 1.05,
      backgroundColor: 'rgba(63, 140, 255, 0.2)',
      duration: 300,
      easing: 'easeOutQuad'
    });
  });
  
  pill.addEventListener('mouseleave', () => {
    anime({
      targets: pill,
      scale: 1,
      backgroundColor: 'rgba(31, 41, 55, 1)', // bg-gray-800
      duration: 300,
      easing: 'easeOutQuad'
    });
  });
});

// Special animations for work cards
document.querySelectorAll('.work-card').forEach(card => {
  const overlay = card.querySelector('.work-card-overlay');
  
  card.addEventListener('mouseenter', () => {
    anime({
      targets: overlay,
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutQuad'
    });
    
    anime({
      targets: card.querySelector('img'),
      scale: 1.1,
      duration: 800,
      easing: 'easeOutQuad'
    });
  });
  
  card.addEventListener('mouseleave', () => {
    anime({
      targets: overlay,
      opacity: 0,
      duration: 400,
      easing: 'easeOutQuad'
    });
    
    anime({
      targets: card.querySelector('img'),
      scale: 1,
      duration: 800,
      easing: 'easeOutQuad'
    });
  });
});

// Add theme toggle functionality
function createThemeToggle() {
  const toggleButton = document.createElement('button');
  toggleButton.className = 'fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors duration-300';
  toggleButton.innerHTML = '<i class="fas fa-sun"></i>';
  toggleButton.setAttribute('aria-label', 'Toggle light/dark mode');
  
  toggleButton.addEventListener('click', () => {
    // Animate theme change
    anime({
      targets: 'body',
      backgroundColor: document.body.classList.contains('light-mode') ? '#0D0F18' : '#F5F5F7',
      color: document.body.classList.contains('light-mode') ? '#FBFBFB' : '#121212',
      duration: 800,
      easing: 'easeOutQuad'
    });
    
    document.body.classList.toggle('light-mode');
    toggleButton.innerHTML = document.body.classList.contains('light-mode') ? 
      '<i class="fas fa-moon"></i>' : 
      '<i class="fas fa-sun"></i>';
  });
  
  document.body.appendChild(toggleButton);
}

// Initialize theme toggle
document.addEventListener('DOMContentLoaded', function() {
  createThemeToggle();
});