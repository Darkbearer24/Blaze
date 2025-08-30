/**
 * AJAX Navigation for Horizontal Menu
 * Prevents page reloads when navigating between menu categories
 * Maintains the position of selected buttons
 */

document.addEventListener('DOMContentLoaded', function() {
  // Store the current active category
  let currentCategory = '';
  
  // Get all menu categories from routes in script.js
  const menuCategories = [
    'gourmet-burgers',
    'wraps',
    'sides',
    'pasta',
    'og-momos',
    'chinese',
    'indian',
    'cold-beverages',
    'hot-beverages',
    'desserts'
  ];
  
  // Initialize the current category based on the URL hash
  function initializeCurrentCategory() {
    const hash = window.location.hash.slice(1);
    if (menuCategories.includes(hash)) {
      currentCategory = hash;
    } else if (window.location.hash === '#menu') {
      // Default to first category if on menu page
      currentCategory = menuCategories[0];
    }
  }
  
  // Call initialization
  initializeCurrentCategory();
  
  // Function to handle AJAX navigation between menu categories
  function handleAjaxNavigation(targetCategory) {
    // If category not found or same as current, just update active state
    if (!menuCategories.includes(targetCategory) || targetCategory === currentCategory) {
      updateActiveNavItem(targetCategory);
      return;
    }
    
    // Show loading indicator if available
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    
    // Fetch the target page content
    const page = `pages/${targetCategory}.html`;
    fetch(page, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        // Parse the HTML content
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(html, 'text/html');
        
        // Get the menu container from the new content
        const newMenuContainer = htmlDoc.querySelector('.menu-container');
        const currentMenuContainer = document.querySelector('.menu-container');
        
        // Only update the menu container content, not the navigation
        if (newMenuContainer && currentMenuContainer) {
          // Apply a fade-out effect
          currentMenuContainer.style.opacity = '0';
          currentMenuContainer.style.transition = 'opacity 0.2s ease-out';
          
          // After fade-out, update content and fade back in
          setTimeout(() => {
            currentMenuContainer.innerHTML = newMenuContainer.innerHTML;
            currentMenuContainer.style.opacity = '1';
            
            // Update the current category
            currentCategory = targetCategory;
            
            // Update the URL hash without triggering hashchange
            history.pushState(null, '', `#${targetCategory}`);
            
            // Update active navigation item
            updateActiveNavItem(targetCategory);
            
            // Fix SVG paths and adjust images if those functions exist
            if (typeof fixSvgPaths === 'function') fixSvgPaths();
            if (typeof adjustSvgImages === 'function') adjustSvgImages();
            if (typeof preloadImages === 'function') preloadImages();
            if (typeof loadAllIframes === 'function') loadAllIframes();
            
            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = 'none';
          }, 200);
        } else {
          // If we can't find the specific elements, reload the page
          window.location.hash = `#${targetCategory}`;
        }
      })
      .catch(error => {
        console.error('Error loading page:', error);
        // Hide loading indicator
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        // Fallback to normal navigation
        window.location.hash = `#${targetCategory}`;
      });
  }
  
  // Function to update the active class in the horizontal nav
  function updateActiveNavItem(activeCategory) {
    const horizontalNav = document.querySelector('.horizontal-nav');
    if (!horizontalNav) return;
    
    const navItems = horizontalNav.querySelectorAll('.horizontal-nav-item');
    let activeItem = null;
    
    // Update active class
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      const itemCategory = href ? href.slice(1) : '';
      
      if (itemCategory === activeCategory) {
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
      }
    }
  }
  
  // Intercept clicks on horizontal nav items
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // Check if the click is on a horizontal nav item
    if (target.classList.contains('horizontal-nav-item')) {
      event.preventDefault();
      
      const href = target.getAttribute('href');
      if (href && href.startsWith('#')) {
        const category = href.slice(1);
        
        // Handle the AJAX navigation
        handleAjaxNavigation(category);
      }
    }
  });
  
  // Handle back/forward browser navigation
  window.addEventListener('popstate', function() {
    const hash = window.location.hash.slice(1);
    if (menuCategories.includes(hash)) {
      handleAjaxNavigation(hash);
    }
  });
});