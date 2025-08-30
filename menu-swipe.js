/**
 * Menu Swipe Navigation
 * Adds touch swipe navigation between menu categories for Blaze Restaurant
 * Version: 2.1.1
 */

// Initialize swipe navigation when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  initSwipeNavigation();
  
  // Also initialize when hash changes (for AJAX navigation)
  window.addEventListener('hashchange', function() {
    initSwipeNavigation();
  });
});

function initSwipeNavigation() {
  // Wait a short time to ensure AJAX content is loaded
  setTimeout(function() {
    // Check if we're on the menu page without a specific category
    if (!window.location.hash || window.location.hash === '#menu') {
      // Set default hash to gourmet-burgers
      const currentUrl = window.location.href.split('#')[0];
      window.history.replaceState(null, '', `${currentUrl}#gourmet-burgers`);
    }
    
    setupSwipeListeners();
  }, 300);
}

function setupSwipeListeners() {
  // Get the menu content container
  const menuContainer = document.getElementById('menu-content-container');
  if (!menuContainer) return;
  
  // Remove any existing event listeners (to prevent duplicates)
  menuContainer.removeEventListener('touchstart', handleTouchStart);
  menuContainer.removeEventListener('touchend', handleTouchEnd);
  
  // Add touch event listeners to the menu container
  menuContainer.addEventListener('touchstart', handleTouchStart, false);
  menuContainer.addEventListener('touchend', handleTouchEnd, false);
  
  // Log initialization for debugging
  console.log('Swipe navigation initialized on', menuContainer);
}

// Menu categories in order - updated to swap og-momos and main-course
const menuCategories = [
  'gourmet-burgers', 'wraps', 'sides', 'pasta', 'og-momos', 
  'chinese', 'main-course', 'cold-beverages', 'hot-beverages', 
  'desserts'
];

// SVG paths for each category - duplicated from menu-wheel.js to avoid dependency
const menuSvgPaths = {
  'gourmet-burgers': './assets/menu/GOURMET BURGERS.svg',
  'wraps': './assets/menu/WRAPS.svg',
  'sides': './assets/menu/Sides.svg',
  'pasta': './assets/menu/Pasta.svg',
  'main-course': './assets/menu/Main Course.svg',
  'chinese': './assets/menu/Chinese.svg',
  'og-momos': './assets/menu/momos.svg',
  'cold-beverages': './assets/menu/Cold Beverages.svg',
  'hot-beverages': './assets/menu/Hot Beverages.svg',
  'desserts': './assets/menu/Desserts.svg'
};

// Variables to track touch events
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

// Handle touch start event
function handleTouchStart(event) {
  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;
  console.log('Touch start detected at', touchStartX, touchStartY);
}

// Handle touch end event
function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].screenX;
  touchEndY = event.changedTouches[0].screenY;
  console.log('Touch end detected at', touchEndX, touchEndY);
  
  // Calculate horizontal and vertical distance
  const horizontalDistance = touchEndX - touchStartX;
  const verticalDistance = Math.abs(touchEndY - touchStartY);
  
  // Only process as swipe if horizontal movement is greater than vertical
  // and greater than minimum threshold (to avoid processing taps as swipes)
  const minSwipeDistance = 50;
  
  console.log('Swipe distance:', horizontalDistance, 'Vertical movement:', verticalDistance);
  
  if (Math.abs(horizontalDistance) > verticalDistance && Math.abs(horizontalDistance) > minSwipeDistance) {
    // Get current category from URL hash or default to first category
    let currentHash = window.location.hash.substring(1);
    if (!isMenuCategory(currentHash)) {
      currentHash = menuCategories[0];
    }
    
    console.log('Current category:', currentHash);
    
    // Find current index in menu categories
    const currentIndex = menuCategories.indexOf(currentHash);
    
    if (horizontalDistance > 0) {
      // Swipe right to left (go to previous category)
      console.log('Swiping to previous category');
      navigateToPreviousCategory(currentIndex);
    } else {
      // Swipe left to right (go to next category)
      console.log('Swiping to next category');
      navigateToNextCategory(currentIndex);
    }
  }
}

// Navigate to the previous menu category
function navigateToPreviousCategory(currentIndex) {
  // If at the first category, loop to the last
  const prevIndex = currentIndex <= 0 ? menuCategories.length - 1 : currentIndex - 1;
  const prevCategory = menuCategories[prevIndex];
  
  console.log('Navigating to previous category:', prevCategory);
  
  // Add swipe animation class first
  addSwipeAnimation('swipe-right');
  
  // Short delay to allow animation to start before changing content
  setTimeout(() => {
    // Directly load the SVG without going through the default loading mechanism
    directlyLoadMenuSvg(prevCategory);
    
    // Update URL hash without triggering the hashchange event
    updateUrlHashSilently(prevCategory);
    
    // Update active menu item
    if (typeof window.updateActiveMenuItem === 'function') {
      window.updateActiveMenuItem(prevCategory);
    }
  }, 150);
}

// Navigate to the next menu category
function navigateToNextCategory(currentIndex) {
  // If at the last category, loop to the first
  const nextIndex = currentIndex >= menuCategories.length - 1 ? 0 : currentIndex + 1;
  const nextCategory = menuCategories[nextIndex];
  
  console.log('Navigating to next category:', nextCategory);
  
  // Add swipe animation class first
  addSwipeAnimation('swipe-left');
  
  // Short delay to allow animation to start before changing content
  setTimeout(() => {
    // Directly load the SVG without going through the default loading mechanism
    directlyLoadMenuSvg(nextCategory);
    
    // Update URL hash without triggering the hashchange event
    updateUrlHashSilently(nextCategory);
    
    // Update active menu item
    if (typeof window.updateActiveMenuItem === 'function') {
      window.updateActiveMenuItem(nextCategory);
    }
  }, 150);
}

// Directly load the SVG for a menu category without using loadMenuContent
function directlyLoadMenuSvg(category) {
  const menuContainer = document.getElementById('menu-content-container');
  if (!menuContainer) return;
  
  // Get the SVG path for this category
  const svgPath = menuSvgPaths[category];
  if (!svgPath) return;
  
  // Create a temporary loading indicator
  menuContainer.innerHTML = '<div class="menu-loading"></div>';
  
  // Create a new image element
  const img = new Image();
  
  // Set up load event
  img.onload = function() {
    // Replace loading indicator with the loaded SVG
    menuContainer.innerHTML = '';
    
    // Create SVG element
    const svgImg = document.createElement('img');
    svgImg.src = svgPath;
    svgImg.alt = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    svgImg.className = 'menu-svg';
    
    // Add to container
    menuContainer.appendChild(svgImg);
  };
  
  // Set up error event
  img.onerror = function() {
    console.error('Failed to load SVG:', svgPath);
    // If direct loading fails, fall back to the standard method
    if (typeof window.loadMenuContent === 'function') {
      window.loadMenuContent(category);
    }
  };
  
  // Start loading the image
  img.src = svgPath;
}

// Update URL hash without triggering the hashchange event
function updateUrlHashSilently(hash) {
  const scrollPosition = window.scrollY;
  
  // Remove the hashchange event listener temporarily
  const hashChangeListener = window.onhashchange;
  window.onhashchange = null;
  
  // Update the URL
  window.history.replaceState(null, '', `#${hash}`);
  
  // Restore the hashchange event listener after a short delay
  setTimeout(() => {
    window.onhashchange = hashChangeListener;
  }, 100);
  
  // Restore scroll position if needed
  window.scrollTo(0, scrollPosition);
}

// Add swipe animation
function addSwipeAnimation(direction) {
  const menuContainer = document.getElementById('menu-content-container');
  if (!menuContainer) return;
  
  menuContainer.classList.add(direction);
  
  // Remove the animation class after the animation completes
  setTimeout(() => {
    menuContainer.classList.remove(direction);
  }, 300);
}

// Function to check if a hash is a menu category
function isMenuCategory(hash) {
  return menuCategories.includes(hash);
}

// Make the function globally available
window.initSwipeNavigation = initSwipeNavigation;