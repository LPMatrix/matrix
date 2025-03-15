/**
 * Mubaraq Sanusi Portfolio
 * Awwards-Worthy JavaScript
 */

// Loading Animation
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('loader-progress-bar');
    
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Hide loader after a short delay
        setTimeout(() => {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
            // Initialize animations after loader is hidden
            initAnimations();
          }, 500);
        }, 500);
      }
      progressBar.style.width = `${progress}%`;
    }, 200);
  });
  
  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  function toggleMobileMenu() {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('overflow-hidden');
  }
  
  menuToggle.addEventListener('click', toggleMobileMenu);
  
  // Add click event to mobile menu links
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', toggleMobileMenu);
  });
  
  // Custom Cursor
  const cursor = document.getElementById('cursor');
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
  
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });
  
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  
  // Add hover effects for links and buttons with custom cursor
  document.querySelectorAll('a, button, .skill-pill, .work-card').forEach(item => {
    item.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursor.style.mixBlendMode = 'difference';
    });
    
    item.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.mixBlendMode = 'difference';
    });
  });
  
  // Scroll Progress
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.offsetHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    const scrollProgress = document.getElementById('scrollProgress');
    scrollProgress.style.width = `${scrollPercent * 100}%`;
    
    // Navbar Background
    const mainNav = document.getElementById('mainNav');
    if (scrollTop > 50) {
      mainNav.classList.add('bg-primary', 'shadow-lg');
      mainNav.classList.remove('py-8');
      mainNav.classList.add('py-4');
    } else {
      mainNav.classList.remove('bg-primary', 'shadow-lg');
      mainNav.classList.remove('py-4');
      mainNav.classList.add('py-8');
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
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        color: 'rgba(255, 255, 255, 0.2)',
        speed: Math.random() * 0.5 + 0.1,
        directionX: Math.random() * 2 - 1,
        directionY: Math.random() * 2 - 1
      });
    }
    
    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        p.x += p.directionX * p.speed;
        p.y += p.directionY * p.speed;
        
        if (p.x < 0 || p.x > canvas.width) p.directionX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.directionY *= -1;
        
        // Connect particles that are close to each other
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distance = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 - distance / 500})`;
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
  
  // GSAP Animations
  function initAnimations() {
    // Register ScrollTrigger plugin
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      // Stagger Fade In animations
      const fadeElements = document.querySelectorAll('.stagger-fade-in');
      fadeElements.forEach((el, index) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
      
      // Parallax text animation
      const parallaxTexts = document.querySelectorAll('.parallax-text');
      parallaxTexts.forEach((text) => {
        gsap.to(text, {
          backgroundPositionY: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: text.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
      
      // Section heading animations
      const sectionHeadings = document.querySelectorAll('.section-heading');
      sectionHeadings.forEach((heading) => {
        gsap.fromTo(
          heading,
          { opacity: 0, x: -100 },
          {
            opacity: 0.1,
            x: 0,
            duration: 1,
            scrollTrigger: {
              trigger: heading,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
      
      // Hero text animation
      const heroTextElements = document.querySelectorAll('#hero h1 span, #hero p, #hero .flex');
      gsap.fromTo(
        heroTextElements,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          stagger: 0.2,
          delay: 0.5
        }
      );
    }
    
    // Try to initialize smooth scroll if the library is available
    try {
      if (typeof LocomotiveScroll !== 'undefined') {
        const smoothScroll = new LocomotiveScroll({
          el: document.getElementById('smooth-content'),
          smooth: true,
          smoothMobile: false,
          inertia: 0.5
        });
        
        // Update ScrollTrigger when Locomotive Scroll updates
        if (typeof ScrollTrigger !== 'undefined') {
          smoothScroll.on('scroll', ScrollTrigger.update);
        }
      }
    } catch (e) {
      console.log('Locomotive Scroll not available, falling back to native scroll');
    }
    
    // Initialize particles
    initParticles();
    
    // Reveal text animation for section titles
    document.querySelectorAll('.reveal-text span').forEach(textSpan => {
      textSpan.style.transform = 'translateY(0)';
    });
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
      
      if (!nameInput.value.trim()) {
        nameInput.style.borderColor = 'red';
        isValid = false;
      } else {
        nameInput.style.borderColor = '';
      }
      
      if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
        emailInput.style.borderColor = 'red';
        isValid = false;
      } else {
        emailInput.style.borderColor = '';
      }
      
      if (!messageInput.value.trim()) {
        messageInput.style.borderColor = 'red';
        isValid = false;
      } else {
        messageInput.style.borderColor = '';
      }
      
      if (isValid) {
        // Here you would typically send the form data to a server
        // For now, just show a success message
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-check mr-2"></i> Message Sent!';
        submitButton.classList.add('bg-green-500', 'text-white');
        submitButton.classList.remove('bg-transparent', 'border-accent', 'text-accent');
        
        // Reset form
        contactForm.reset();
        
        // Reset button after delay
        setTimeout(() => {
          submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Send Message';
          submitButton.classList.remove('bg-green-500', 'text-white');
          submitButton.classList.add('bg-transparent', 'border-accent', 'text-accent');
        }, 3000);
      }
    });
  }
  
  // Initialize SmoothScroll for anchor links
  document.addEventListener('DOMContentLoaded', function() {
    try {
      if (typeof SmoothScroll !== 'undefined') {
        const scroll = new SmoothScroll('a[href*="#"]', {
          speed: 800,
          speedAsDuration: true,
          offset: 50
        });
      }
    } catch (e) {
      console.log('SmoothScroll not available, using native scroll behavior');
    }
    
    // Initialize animations after page is fully loaded
    // This is a fallback in case the load event doesn't fire
    setTimeout(initAnimations, 1000);
  });
  
  // Add magnetic effect to buttons
  document.querySelectorAll('.magnetic-button').forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const position = button.getBoundingClientRect();
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;
      
      button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0px, 0px)';
    });
  });
  
  // Add dark/light theme toggle (additional feature)
  function createThemeToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors duration-300';
    toggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    
    toggleButton.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      toggleButton.innerHTML = document.body.classList.contains('light-mode') ? 
        '<i class="fas fa-moon"></i>' : 
        '<i class="fas fa-sun"></i>';
    });
    
    document.body.appendChild(toggleButton);
  }
  
  // Optional: Enable this feature if desired
  // createThemeToggle();