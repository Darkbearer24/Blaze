/**
 * Menu Navigation
 * A simplified horizontal menu navigation system for Blaze Restaurant
 * Version: 2.1.1
 */

// Initialize the menu navigation
document.addEventListener('DOMContentLoaded', function() {
  initMenuNav();
  
  // Check if we're on the menu page and initialize content
  if (window.location.hash === '#menu' || !window.location.hash) {
    // Default to gourmet-burgers when on the main menu page
    setTimeout(() => {
      // Set URL hash to gourmet-burgers
      const currentUrl = window.location.href.split('#')[0];
      window.history.replaceState(null, '', `${currentUrl}#gourmet-burgers`);
      loadMenuContent('gourmet-burgers');
    }, 100);
  }
});

function initMenuNav() {
  const menuNavItems = document.querySelectorAll('.menu-nav-item');
  
  if (!menuNavItems.length) return;
  
  // Set default hash to gourmet-burgers if no hash is present
  if (!window.location.hash || window.location.hash === '#menu') {
    const currentUrl = window.location.href.split('#')[0];
    window.history.replaceState(null, '', `${currentUrl}#gourmet-burgers`);
  }
  
  // Set initial active state based on URL hash
  updateActiveMenuItem();
  
  // Add click event listeners to menu items
  menuNavItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the category from data attribute
      const category = this.getAttribute('data-category');
      
      // Update URL hash without triggering a page reload
      const currentUrl = window.location.href.split('#')[0];
      window.history.pushState(null, '', `${currentUrl}#${category}`);
      
      // Provide haptic feedback on mobile devices
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Add visual feedback
      this.classList.add('haptic-pulse');
      setTimeout(() => {
        this.classList.remove('haptic-pulse');
      }, 300);
      
      // Update active menu item
      updateActiveMenuItem();
      
      // Load the menu content
      loadMenuContent(category);
    });
  });
  
  // Listen for popstate (back/forward buttons)
  window.addEventListener('popstate', function() {
    const currentHash = window.location.hash.slice(1);
    if (isMenuCategory(currentHash)) {
      updateActiveMenuItem();
      loadMenuContent(currentHash);
    }
  });
  
  // Function to update active menu item based on current hash
  function updateActiveMenuItem() {
    const currentHash = window.location.hash.slice(1) || 'gourmet-burgers';
    
    // Remove active class from all items
    menuNavItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current item
    const activeItem = document.querySelector(`.menu-nav-item[data-category="${currentHash}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
      
      // Scroll active item into view (centered)
      const container = document.querySelector('.menu-nav-container');
      if (container) {
        const itemRect = activeItem.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const scrollLeft = (itemRect.left + itemRect.width / 2) - (containerRect.left + containerRect.width / 2);
        container.scrollLeft += scrollLeft;
      }
    }
  }
  
  // Initial load of menu content
  const initialHash = window.location.hash.slice(1);
  if (isMenuCategory(initialHash)) {
    loadMenuContent(initialHash);
  } else if (initialHash === 'menu') {
    // Default to gourmet-burgers if we're on the menu page
    loadMenuContent('gourmet-burgers');
  }
}

// Function to check if a hash is a menu category
function isMenuCategory(hash) {
  const menuCategories = [
    'gourmet-burgers', 'wraps', 'sides', 'pasta', 'og-momos', 
    'chinese', 'main-course', 'cold-beverages', 'hot-beverages', 
    'desserts'
  ];
  
  return menuCategories.includes(hash);
}

// Function to load menu content
function loadMenuContent(category) {
  const menuContainer = document.getElementById('menu-content-container');
  if (!menuContainer) return;
  
  // Show loading spinner
  menuContainer.innerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
  
  // Get the correct SVG path based on category
  let svgPath;
  
  switch(category) {
    case 'gourmet-burgers':
      svgPath = './assets/menu/GOURMET BURGERS.svg';
      break;
    case 'wraps':
      svgPath = './assets/menu/WRAPS.svg';
      break;
    case 'sides':
      svgPath = './assets/menu/Sides.svg';
      break;
    case 'pasta':
      svgPath = './assets/menu/Pasta.svg';
      break;
    case 'main-course':
      svgPath = './assets/menu/Main Course.svg';
      break;
    case 'chinese':
      svgPath = './assets/menu/Chinese.svg';
      break;
    case 'og-momos':
      svgPath = './assets/menu/momos.svg';
      break;
    case 'cold-beverages':
      svgPath = './assets/menu/Cold Beverages.svg';
      break;
    case 'hot-beverages':
      svgPath = './assets/menu/Hot Beverages.svg';
      break;
    case 'desserts':
      svgPath = './assets/menu/Desserts.svg';
      break;
    default:
      svgPath = './assets/menu/GOURMET BURGERS.svg';
  }
  
  // Create an image element
  const img = new Image();
  img.src = svgPath;
  img.alt = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  img.className = 'menu-svg';
  
  // Handle load success
  img.onload = function() {
    menuContainer.innerHTML = '';
    menuContainer.appendChild(img);
  };
  
  // Handle load error
  img.onerror = function() {
    console.error(`Failed to load menu image: ${svgPath}`);
    menuContainer.innerHTML = `
      <div class="menu-error">
        <h2>${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
        <p>Menu content is being updated. Please check back soon!</p>
      </div>
    `;
  };
}

// Override the default loadContent function for menu pages
const originalLoadContent = window.loadContent;
if (originalLoadContent) {
  window.loadContent = function() {
    let hash = window.location.hash.slice(1);
    
    // If this is a menu category, handle it with our custom function
    if (isMenuCategory(hash)) {
      // We're already on the menu page, just update the content
      if (document.getElementById('menu-navigation')) {
        updateActiveMenuItem();
        loadMenuContent(hash);
        return;
      }
      
      // We need to load the menu page first, then the content
      hash = 'menu';
      window.location.hash = '#menu';
      
      // Let the original loadContent handle loading the menu page
      originalLoadContent();
      
      // After a short delay, initialize our menu navigation
      setTimeout(() => {
        initMenuNav();
        // Load the default menu content (gourmet-burgers)
        loadMenuContent('gourmet-burgers');
      }, 300);
      
      return;
    }
    
    // If we're navigating to the main menu page, load default content
    if (hash === 'menu') {
      // Let the original loadContent handle loading the menu page
      originalLoadContent();
      
      // After a short delay, initialize our menu navigation and load default content
      setTimeout(() => {
        initMenuNav();
        
        // Set URL hash to gourmet-burgers and load its content
        const currentUrl = window.location.href.split('#')[0];
        window.history.replaceState(null, '', `${currentUrl}#gourmet-burgers`);
        loadMenuContent('gourmet-burgers');
      }, 300);
      
      return;
    }
    
    // For non-menu pages, use the original function
    originalLoadContent();
  };
}

// Make functions globally available
window.initMenuNav = initMenuNav;
window.loadMenuContent = loadMenuContent;
window.isMenuCategory = isMenuCategory;

// Function to update active menu item (global access)
function updateActiveMenuItem() {
  const currentHash = window.location.hash.slice(1) || 'gourmet-burgers';
  const menuNavItems = document.querySelectorAll('.menu-nav-item');
  
  // Remove active class from all items
  menuNavItems.forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to current item
  const activeItem = document.querySelector(`.menu-nav-item[data-category="${currentHash}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    
    // Scroll active item into view (centered)
    const container = document.querySelector('.menu-nav-container');
    if (container) {
      const itemRect = activeItem.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const scrollLeft = (itemRect.left + itemRect.width / 2) - (containerRect.left + containerRect.width / 2);
      container.scrollLeft += scrollLeft;
    }
  }
}

// Make updateActiveMenuItem globally available
window.updateActiveMenuItem = updateActiveMenuItem;