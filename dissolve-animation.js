(function() {
  // List of all menu sections in order
  const menuSections = [
    'gourmet-burgers',
    'wraps',
    'sides',
    'pasta',
    'main-course',
    'chinese',
    'og-momos',
    'cold-beverages',
    'hot-beverages'
  ];

  // Cache DOM references and state variables
  let menuContainer;
  let animating = false;
  // Initialize currentCategoryIndex using sessionStorage (if available) or default to 0
  let currentCategoryIndex = sessionStorage.getItem('currentCategoryIndex')
    ? parseInt(sessionStorage.getItem('currentCategoryIndex'))
    : 0;

  // Debounce function to limit function calls
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // On DOM load, initialize the menu container and only update the current category if not already stored
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      initMenuContainer();
      const hash = window.location.hash.replace('#', '');
      if (hash && menuSections.indexOf(hash) !== -1) {
        // Only update if there's no stored value (i.e. first load)
        if (!sessionStorage.getItem('currentCategoryIndex')) {
          currentCategoryIndex = menuSections.indexOf(hash);
          sessionStorage.setItem('currentCategoryIndex', currentCategoryIndex);
        }
      } else {
        currentCategoryIndex = 0;
        sessionStorage.setItem('currentCategoryIndex', currentCategoryIndex);
      }
    }, 300);
  });

  // On hash change, reinitialize container (but do not reset currentCategoryIndex)
  window.addEventListener('hashchange', function() {
    setTimeout(initMenuContainer, 300);
  });

  // Initialize the menu container if present
  function initMenuContainer() {
    menuContainer = document.querySelector('.menu-container');
    if (!menuContainer) return;
  }

  // Function to animate the transition between categories.
  // It calculates the slide direction based on the current active state.
  function animateDissolveTransition(newCategory) {
    if (animating) return; // Prevent overlapping animations

    const newCategoryIndex = menuSections.indexOf(newCategory);
    if (newCategoryIndex === -1) return; // Invalid category

    const direction = newCategoryIndex > currentCategoryIndex ? 'forward' : 'backward';
    const currentContent = document.querySelector('.menu-container .active-section');
    const newContent = document.querySelector(`#${newCategory}`);

    // Fallback if elements are missing
    if (!currentContent || !newContent) {
      window.location.hash = '#' + newCategory;
      updateHorizontalNavForSwipe(newCategory);
      currentCategoryIndex = newCategoryIndex;
      sessionStorage.setItem('currentCategoryIndex', currentCategoryIndex);
      return;
    }

    animating = true;
    
    // Apply animation classes based on the computed direction
    if (direction === 'forward') {
      currentContent.classList.add('slide-out-left');
      newContent.classList.add('slide-in-right');
    } else {
      currentContent.classList.add('slide-out-right');
      newContent.classList.add('slide-in-left');
    }

    // After animation ends, clean up, update state, and persist the new active index
    newContent.addEventListener('animationend', function handler() {
      currentContent.classList.remove('active-section', 'slide-out-left', 'slide-out-right');
      newContent.classList.remove('slide-in-right', 'slide-in-left');
      newContent.classList.add('active-section');
      currentCategoryIndex = newCategoryIndex;
      sessionStorage.setItem('currentCategoryIndex', currentCategoryIndex);
      window.location.hash = '#' + newCategory;
      updateHorizontalNavForSwipe(newCategory);
      animating = false;
      newContent.removeEventListener('animationend', handler);
    });
  }

  // Update horizontal navigation to center the active category
  function updateHorizontalNavForSwipe(targetSection) {
    const horizontalNav = document.querySelector('.horizontal-nav');
    if (!horizontalNav) return;

    // Update active state on nav items
    const navItems = horizontalNav.querySelectorAll('.horizontal-nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href');
      if (href && href === '#' + targetSection) {
        item.classList.add('active');
      }
    });

    // Center the active nav item in its container
    const activeItem = horizontalNav.querySelector('.horizontal-nav-item.active');
    if (!activeItem) return;
    const navContainer = horizontalNav.querySelector('.nav-container');
    if (!navContainer) return;
    const itemRect = activeItem.getBoundingClientRect();
    const navRect = navContainer.getBoundingClientRect();
    const scrollLeft = activeItem.offsetLeft - (navRect.width / 2) + (itemRect.width / 2);
    navContainer.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }

  // Listen for window resize to update if needed (debounced)
  window.addEventListener('resize', debounce(() => {
    // Any resize-related adjustments can go here
  }, 100));

  // Expose the animateDissolveTransition function to be callable from nav click events
  window.animateDissolveTransition = animateDissolveTransition;
})();
