// project-animations.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D tilt effect for project cards
    initProjectCardTilt();
    
    // Initialize project modal functionality
    initProjectModal();
    
    // Add scroll animations for project section
    initProjectScrollAnimations();
  });
  
  // 3D Tilt Effect for Project Cards
  function initProjectCardTilt() {
    const cards = document.querySelectorAll('.work-card');
    
    cards.forEach(card => {
      // Add perspective to parent
      card.style.perspective = '1000px';
      card.style.transformStyle = 'preserve-3d';
      
      // Get the card image and overlay
      const cardImage = card.querySelector('img');
      const cardOverlay = card.querySelector('.work-card-overlay');
      
      // Variables for the tilt effect
      let cardRect = card.getBoundingClientRect();
      let cardWidth = cardRect.width;
      let cardHeight = cardRect.height;
      let centerX = cardRect.left + cardWidth / 2;
      let centerY = cardRect.top + cardHeight / 2;
      let mouseX, mouseY;
      
      const mouseMoveHandler = (e) => {
        // Update card dimensions on every mouse move to handle window resize
        cardRect = card.getBoundingClientRect();
        cardWidth = cardRect.width;
        cardHeight = cardRect.height;
        centerX = cardRect.left + cardWidth / 2;
        centerY = cardRect.top + cardHeight / 2;
        
        // Calculate mouse position relative to card center
        mouseX = e.clientX - centerX;
        mouseY = e.clientY - centerY;
        
        // Calculate rotation angle (max 15 degrees)
        const rotateX = 15 * (mouseY / (cardHeight / 2)) * -1;
        const rotateY = 15 * (mouseX / (cardWidth / 2));
        
        // Calculate elevation (hover effect)
        const elevation = 10;
        
        // Apply transform to card with anime.js
        anime({
          targets: card,
          rotateX: rotateX,
          rotateY: rotateY,
          translateZ: elevation,
          duration: 200,
          easing: 'easeOutQuad',
        });
        
        // Add a subtle movement to the image for parallax effect
        if (cardImage) {
          anime({
            targets: cardImage,
            translateX: rotateY * 0.3,
            translateY: rotateX * 0.3,
            duration: 200,
            easing: 'easeOutQuad',
          });
        }
      };
      
      const mouseLeaveHandler = () => {
        // Reset card position with smooth animation
        anime({
          targets: card,
          rotateX: 0,
          rotateY: 0,
          translateZ: 0,
          duration: 800,
          easing: 'easeOutElastic(1, .6)',
        });
        
        // Reset image position
        if (cardImage) {
          anime({
            targets: cardImage,
            translateX: 0,
            translateY: 0,
            duration: 800,
            easing: 'easeOutElastic(1, .6)',
          });
        }
      };
      
      const mouseEnterHandler = () => {
        // Zoom effect on the image
        if (cardImage) {
          anime({
            targets: cardImage,
            scale: 1.05,
            duration: 800,
            easing: 'easeOutQuad',
          });
        }
        
        // Fade in overlay with staggered text
        if (cardOverlay) {
          // Get overlay children
          const overlayChildren = cardOverlay.children;
          
          anime.timeline({
            duration: 400,
            easing: 'easeOutQuad',
          })
          .add({
            targets: cardOverlay,
            opacity: [0, 1],
          })
          .add({
            targets: overlayChildren,
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 600,
          }, '-=200');
        }
      };
      
      // Add event listeners
      card.addEventListener('mousemove', mouseMoveHandler);
      card.addEventListener('mouseleave', mouseLeaveHandler);
      card.addEventListener('mouseenter', mouseEnterHandler);
      
      // Update card dimensions on window resize
      window.addEventListener('resize', () => {
        cardRect = card.getBoundingClientRect();
        cardWidth = cardRect.width;
        cardHeight = cardRect.height;
        centerX = cardRect.left + cardWidth / 2;
        centerY = cardRect.top + cardHeight / 2;
      });
    });
  }
  
  // Project Modal Functionality
  function initProjectModal() {
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('project-modal-container');
    
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'project-modal-container';
      modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center invisible';
      modalContainer.style.backgroundColor = 'rgba(13, 15, 24, 0.9)';
      document.body.appendChild(modalContainer);
      
      // Add modal content
      modalContainer.innerHTML = `
        <div id="project-modal" class="relative bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden transform scale-95 opacity-0 transition-all duration-300">
          <button id="modal-close" class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center">
            <i class="fas fa-times"></i>
          </button>
          <div id="modal-content" class="overflow-y-auto max-h-[90vh] p-6">
            <!-- Content will be injected here -->
          </div>
        </div>
      `;
    }
    
    // Get modal elements
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const closeButton = document.getElementById('modal-close');
    
    // Function to open modal with specific project data
    function openProjectModal(project) {
      // Set modal content
      modalContent.innerHTML = `
        <div class="modal-project-content">
          <div class="mb-6 overflow-hidden rounded-lg h-64">
            <img src="assets/img/${project.image}" alt="${project.name}" class="w-full h-full object-cover transform transition-transform duration-700">
          </div>
          <h2 class="text-3xl font-bold mb-4">${project.name}</h2>
          <div class="mb-6">
            <p class="text-text text-lg">${project.description}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <h3 class="text-xl font-bold mb-3 text-accent">Technologies</h3>
              <div class="flex flex-wrap gap-2">
                ${project.technologies ? project.technologies.map(tech => `
                  <span class="px-3 py-1 bg-gray-800 rounded-full text-sm">${tech}</span>
                `).join('') : '<span class="px-3 py-1 bg-gray-800 rounded-full text-sm">Web Development</span>'}
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-3 text-accent">Key Features</h3>
              <ul class="list-disc list-inside text-text">
                ${project.features ? project.features.map(feature => `
                  <li>${feature}</li>
                `).join('') : '<li>Interactive UI</li><li>Responsive Design</li>'}
              </ul>
            </div>
          </div>
          <div class="flex justify-center">
            <a href="${project.link}" target="_blank" class="special-button bg-transparent border border-accent text-accent px-6 py-3 rounded-full hover:text-white transition-colors duration-300 inline-flex items-center">
              View Project <i class="fas fa-external-link-alt ml-2"></i>
            </a>
          </div>
        </div>
      `;
      
      // Show modal container
      modalContainer.style.visibility = 'visible';
      
      // Animate modal opening
      anime.timeline({
        duration: 600,
        easing: 'easeOutQuart',
      })
      .add({
        targets: modalContainer,
        backgroundColor: ['rgba(13, 15, 24, 0)', 'rgba(13, 15, 24, 0.9)'],
        duration: 300,
      })
      .add({
        targets: modal,
        scale: [0.95, 1],
        opacity: [0, 1],
        duration: 500,
      }, '-=200')
      .add({
        targets: '.modal-project-content > *',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 500,
      }, '-=300')
      .add({
        targets: '.modal-project-content img',
        scale: [1.1, 1],
        duration: 700,
        easing: 'easeOutQuad',
      }, '-=500');
      
      // Disable body scroll
      document.body.style.overflow = 'hidden';
    }
    
    // Function to close modal
    function closeProjectModal() {
      anime.timeline({
        duration: 300,
        easing: 'easeInQuart',
      })
      .add({
        targets: modal,
        scale: [1, 0.95],
        opacity: [1, 0],
        duration: 300,
        complete: function() {
          modalContainer.style.visibility = 'hidden';
          // Enable body scroll
          document.body.style.overflow = 'auto';
        }
      })
      .add({
        targets: modalContainer,
        backgroundColor: ['rgba(13, 15, 24, 0.9)', 'rgba(13, 15, 24, 0)'],
        duration: 300,
      }, '-=300');
    }
    
    // Add click event to project cards
    document.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('click', function(e) {
        // Prevent opening the link when clicking on the card
        e.preventDefault();
        
        // Get project data from the window.projects array
        const cardIndex = Array.from(card.parentNode.children).indexOf(card);
        if (window.projects && window.projects[cardIndex]) {
          openProjectModal(window.projects[cardIndex]);
        }
      });
    });
    
    // Close modal when clicking the close button
    closeButton.addEventListener('click', closeProjectModal);
    
    // Close modal when clicking outside of it
    modalContainer.addEventListener('click', function(e) {
      if (e.target === modalContainer) {
        closeProjectModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeProjectModal();
      }
    });
  }
  
  // Scroll Animations for Project Section
  function initProjectScrollAnimations() {
    const projectSection = document.getElementById('work');
    if (!projectSection) return;
    
    const sectionHeading = projectSection.querySelector('.section-heading');
    const revealText = projectSection.querySelector('.reveal-text span');
    const projectCards = projectSection.querySelectorAll('.work-card');
    
    // Create observer for the section heading
    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: sectionHeading,
            translateX: [-100, 0],
            opacity: [0, 0.1],
            duration: 1200,
            easing: 'easeOutExpo'
          });
          
          anime({
            targets: revealText,
            translateY: [100, 0],
            duration: 1000,
            easing: 'easeOutQuart'
          });
          
          headingObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    if (sectionHeading) {
      headingObserver.observe(sectionHeading);
    }
    
    // Create observer for the project cards with staggered animation
    const cardsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        anime({
          targets: projectCards,
          translateY: [100, 0],
          opacity: [0, 1],
          delay: anime.stagger(150),
          duration: 800,
          easing: 'easeOutQuad'
        });
        
        cardsObserver.unobserve(entries[0].target);
      }
    }, { threshold: 0.1 });
    
    if (projectCards.length > 0) {
      // Observe the first card to trigger animation for all
      cardsObserver.observe(projectCards[0].parentNode);
    }
  }