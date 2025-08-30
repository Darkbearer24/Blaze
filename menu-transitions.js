/**
 * Menu Transitions
 * Handles seamless transitions between menu categories without resetting to default
 */

document.addEventListener('DOMContentLoaded', function() {
  // Store the current active category index
  let currentCategoryIndex = 0;
  
  // Get all menu categories from routes in script.js - Updated to swap og-momos and main-course
  const menuCategories = [
    'gourmet-burgers',
    'wraps',
    'sides',
    'pasta',
    'og-momos',
    'chinese',
    'main-course',
    'cold-beverages',
    'hot-beverages',
    'desserts'
  ];
  
  // Initialize the current category based on the URL hash
  function initializeCurrentCategory() {
    let hash = window.location.hash.slice(1);
    
    // If no hash or just 'menu', default to gourmet-burgers
    if (!hash || hash === 'menu') {
      hash = 'gourmet-burgers';
      // Update URL hash silently
      const currentUrl = window.location.href.split('#')[0];
      window.history.replaceState(null, '', `${currentUrl}#${hash}`);
    }
    
    const categoryIndex = menuCategories.indexOf(hash);
    if (categoryIndex !== -1) {
      currentCategoryIndex = categoryIndex;
    } else {
      // If invalid category, default to first one
      currentCategoryIndex = 0;
    }
  }
  
  // Call initialization
  initializeCurrentCategory();
  
  // Function to handle category transitions
  function handleCategoryTransition(newCategoryHash) {
    // Remove the # if present
    const category = newCategoryHash.startsWith('#') ? newCategoryHash.slice(1) : newCategoryHash;
    
    // Find the index of the new category
    const newCategoryIndex = menuCategories.indexOf(category);
    
    // If category not found or same as current, do nothing
    if (newCategoryIndex === -1 || newCategoryIndex === currentCategoryIndex) {
      // Even if it's the same category, ensure it's centered
      updateActiveNavItem(category);
      return;
    }
    
    // Determine the direction of the slide
    const direction = newCategoryIndex > currentCategoryIndex ? 'left' : 'right';
    
    // Get the app element where content is loaded
    const appElement = document.getElementById('app');
    if (!appElement) return;
    
    // Create a container for the animation
    const animationContainer = document.createElement('div');
    animationContainer.className = 'menu-transition-container';
    animationContainer.style.position = 'relative';
    animationContainer.style.width = '100%';
    animationContainer.style.height = '100%';
    animationContainer.style.overflow = 'hidden';
    
    // Clone the current content
    const currentContent = appElement.innerHTML;
    const currentContentElement = document.createElement('div');
    currentContentElement.className = 'menu-content current';
    currentContentElement.innerHTML = currentContent;
    currentContentElement.style.position = 'absolute';
    currentContentElement.style.top = '0';
    currentContentElement.style.left = '0';
    currentContentElement.style.width = '100%';
    currentContentElement.style.transition = 'transform 0.3s ease-in-out';
    
    // Add the current content to the animation container
    animationContainer.appendChild(currentContentElement);
    
    // Update the active class in the horizontal nav immediately
    // This ensures the active item is centered before the transition starts
    updateActiveNavItem(category);
    
    // Fetch the new content
    const page = `pages/${category}.html`;
    fetch(page, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        // Create element for new content
        const newContentElement = document.createElement('div');
        newContentElement.className = 'menu-content new';
        newContentElement.innerHTML = html;
        newContentElement.style.position = 'absolute';
        newContentElement.style.top = '0';
        newContentElement.style.width = '100%';
        newContentElement.style.transition = 'transform 0.3s ease-in-out';
        
        // Position the new content based on direction
        if (direction === 'left') {
          // Coming from right
          newContentElement.style.left = '100%';
        } else {
          // Coming from left
          newContentElement.style.left = '-100%';
        }
        
        // Add the new content to the animation container
        animationContainer.appendChild(newContentElement);
        
        // Replace the app content with our animation container
        appElement.innerHTML = '';
        appElement.appendChild(animationContainer);
        
        // Trigger the animation after a small delay to ensure DOM is updated
        setTimeout(() => {
          if (direction === 'left') {
            // Current slides left, new slides in from right
            currentContentElement.style.transform = 'translateX(-100%)';
            newContentElement.style.transform = 'translateX(-100%)';
          } else {
            // Current slides right, new slides in from left
            currentContentElement.style.transform = 'translateX(100%)';
            newContentElement.style.transform = 'translateX(100%)';
          }
          
          // After animation completes, update the DOM without reloading
          setTimeout(() => {
            // Instead of replacing innerHTML, extract the content we need
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(html, 'text/html');
            
            // Get the horizontal nav from the new content if it exists
            const newNav = htmlDoc.querySelector('.horizontal-nav');
            const currentNav = document.querySelector('.horizontal-nav');
            
            // Get the menu container from the new content
            const newMenuContainer = htmlDoc.querySelector('.menu-container');
            const currentMenuContainer = document.querySelector('.menu-container');
            
            // Only update the menu container content, not the navigation
            if (newMenuContainer && currentMenuContainer) {
              currentMenuContainer.innerHTML = newMenuContainer.innerHTML;
            } else {
              // If we can't find the specific elements, fall back to replacing the entire content
              appElement.innerHTML = html;
            }
            
            // Update the current category index
            currentCategoryIndex = newCategoryIndex;
            
            // Fix SVG paths and adjust images
            if (typeof window.fixSvgPaths === 'function') window.fixSvgPaths();
            if (typeof window.adjustSvgImages === 'function') window.adjustSvgImages();
            if (typeof window.preloadImages === 'function') window.preloadImages();
            // Ensure images and iframes are loaded
            if (typeof window.loadAllIframes === 'function') window.loadAllIframes();
          }, 300); // Match the transition duration
        }, 50);
      })
      .catch(error => {
        console.error('Error loading page:', error);
        appElement.innerHTML = '<p>Page not found. <a href="#home">Return to Home</a></p>';
      });
  
  
  // Function to update the active class in the horizontal nav and center it
  function updateActiveNavItem(activeCategory) {
    const horizontalNav = document.querySelector('.horizontal-nav');
    if (!horizontalNav) return;
    
    const navItems = horizontalNav.querySelectorAll('.horizontal-nav-item');
    let activeItem = null;
    
    // Update active class
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href === `#${activeCategory}`) {
        item.classList.add('active');
        activeItem = item;
      } else {
        item.classList.remove('active');
      }
    });
    
    // Center the active item if found
    if (activeItem) {
      const navContainer = horizontalNav.querySelector('.nav-container');
      if (navContainer) {
        // Calculate scroll position to center the active item
        const itemRect = activeItem.getBoundingClientRect();
        const navRect = navContainer.getBoundingClientRect();
        const scrollLeft = activeItem.offsetLeft - (navRect.width / 2) + (itemRect.width / 2);
        
        // Use smooth scrolling for better UX
        navContainer.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
        
        // Also update the horizontal nav itself in case it's scrollable
        horizontalNav.scrollLeft = scrollLeft;
      }
    }
  }
  }
  
  // Add CSS for the transitions
  const style = document.createElement('style');
  style.textContent = `
    .menu-transition-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .menu-content {
      position: absolute;
      top: 0;
      width: 100%;
      transition: transform 0.3s ease-in-out;
    }
  `;
  document.head.appendChild(style);
  
  // Intercept clicks on horizontal nav items
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // Check if the click is on a horizontal nav item
    if (target.classList.contains('horizontal-nav-item')) {
      event.preventDefault();
      
      const href = target.getAttribute('href');
      if (href && href.startsWith('#')) {
        const category = href.slice(1);
        
        // Handle the transition
        handleCategoryTransition(category);
        
        // Update the URL hash without triggering hashchange
        history.pushState(null, '', href);
        
        // Provide haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(25);
        }
        
        // Remove active class from all items
        document.querySelectorAll('.horizontal-nav-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Add active class to clicked item
        target.classList.add('active');
        
        // Center the active item immediately
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
          const itemRect = target.getBoundingClientRect();
          const navRect = navContainer.getBoundingClientRect();
          const scrollLeft = target.offsetLeft - (navRect.width / 2) + (itemRect.width / 2);
          
          // Immediate scrolling without animation
          navContainer.scrollTo({
            left: scrollLeft,
            behavior: 'auto'
          });
        }
        
        // Manually trigger content loading to match the new hash
        if (typeof window.loadContent === 'function') {
          // Use setTimeout to ensure the hash change is processed first
          setTimeout(() => {
            window.loadContent();
          }, 0);
        } else {
          // Fallback method if loadContent isn't accessible
          const hash = href.slice(1);
          const page = window.routes ? window.routes[hash] : 'pages/' + hash + '.html';
          
          if (page) {
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
              loadingIndicator.style.display = 'flex';
            }
            
            fetch(page, { cache: 'no-store' })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.text();
              })
              .then(html => {
                const appElement = document.getElementById('app');
                if (appElement) {
                  appElement.innerHTML = html;
                  appElement.style.opacity = '1';
                  
                  // Hide loading indicator
                  if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                  }
                  
                  // Run essential post-load functions if they exist
                  if (typeof window.fixSvgPaths === 'function') window.fixSvgPaths();
                  if (typeof window.adjustSvgImages === 'function') window.adjustSvgImages();
                  if (typeof window.initHapticFeedback === 'function') window.initHapticFeedback();
                }
              })
              .catch(error => {
                console.error('Error loading page:', error);
                
                // Hide loading indicator on error
                if (loadingIndicator) {
                  loadingIndicator.style.display = 'none';
                }
                
                // Show error message in app element
                const appElement = document.getElementById('app');
                if (appElement) {
                  appElement.innerHTML = '<div style="text-align:center;padding:2rem;"><p>Unable to load content. Please try again.</p><button onclick="window.loadContent()" style="padding:0.5rem 1rem;background:#9D1C20;color:white;border:none;border-radius:4px;cursor:pointer;">Retry</button></div>';
                  appElement.style.opacity = '1';
                }
              });
          }
        }
      }
    }
  });
  
  // Handle back/forward browser navigation
  window.addEventListener('popstate', function() {
    const hash = window.location.hash.slice(1);
    if (menuCategories.includes(hash)) {
      handleCategoryTransition(hash);
    }
  });
});