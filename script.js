/**
 * Simple Hash-Based Router for SPA.
 * Loads partial HTML files from the /pages/ folder based on the URL hash.
 */
const routes = {
  home: 'pages/home.html',
  'hours-location': 'pages/hours-location.html',
  about: 'pages/about.html',
  'order-online': 'pages/order-online.html',
  contact: 'pages/contact.html',

  // The "menu" route
  menu: 'pages/menu.html',

  // Menu pages
  'gourmet-burgers': 'pages/gourmet-burgers.html',
  wraps: 'pages/wraps.html',
  sides: 'pages/sides.html',
  pasta: 'pages/pasta.html',
  'main-course': 'pages/main-course.html',
  chinese: 'pages/chinese.html',
  'og-momos': 'pages/og-momos.html',
  'cold-beverages': 'pages/cold-beverages.html',
  'hot-beverages': 'pages/hot-beverages.html',
  desserts: 'pages/desserts.html',  // Fixed: Changed from 'deserts' to 'desserts'
  indian: 'pages/indian.html'  // Fixed: Changed from 'indian' to match case
};

// Make routes globally accessible
window.routes = routes;

// Cache for lazy-loaded menu pages - use a more robust approach with size limit
const menuPagesCache = {
  _cache: {},
  _maxSize: 15, // Maximum number of pages to cache
  _accessOrder: [], // Track order of access for LRU eviction
  
  // Get a page from cache
  get: function(key) {
    if (this._cache[key]) {
      // Move this key to the end of access order (most recently used)
      this._updateAccessOrder(key);
      return this._cache[key];
    }
    return null;
  },
  
  // Set a page in cache
  set: function(key, value) {
    // If we're at capacity, remove least recently used item
    if (this._accessOrder.length >= this._maxSize) {
      const oldest = this._accessOrder.shift();
      delete this._cache[oldest];
      console.log('Cache full, removing:', oldest);
    }
    
    // Add new item
    this._cache[key] = value;
    this._accessOrder.push(key);
    console.log('Added to cache:', key);
  },
  
  // Update access order for LRU
  _updateAccessOrder: function(key) {
    const index = this._accessOrder.indexOf(key);
    if (index > -1) {
      this._accessOrder.splice(index, 1);
      this._accessOrder.push(key);
    }
  },
  
  // Check if a key exists in cache
  has: function(key) {
    return key in this._cache;
  },
  
  // Clear the entire cache
  clear: function() {
    this._cache = {};
    this._accessOrder = [];
    console.log('Cache cleared');
  }
};

// Preload all menu pages to avoid blank pages
function preloadMenuPages() {
  console.log('Preloading menu pages...');
  const menuPages = [
    'gourmet-burgers', 'wraps', 'sides', 'pasta', 'main-course', 
    'chinese', 'og-momos', 'cold-beverages', 'hot-beverages', 
    'desserts', 'indian'
  ];
  
  // Create an array of fetch promises
  const fetchPromises = menuPages.map(page => {
    const url = routes[page];
    if (!url) return Promise.resolve(null);
    
    return fetch(url, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`Failed to preload ${page}`);
        return response.text();
      })
      .then(html => {
        menuPagesCache.set(page, html);
        return { page, success: true };
      })
      .catch(error => {
        console.error(`Error preloading ${page}:`, error);
        return { page, success: false };
      });
  });
  
  // Execute all fetches
  return Promise.all(fetchPromises)
    .then(results => {
      const successful = results.filter(r => r && r.success).length;
      console.log(`Preloaded ${successful}/${menuPages.length} menu pages`);
      return successful;
    });
}

// Preload common assets to improve page load times
function preloadAssets() {
  // Only preload assets that are likely to be needed soon
  const currentHash = window.location.hash.slice(1) || 'home';
  
  // List of common assets to preload
  const commonAssets = [
    'assets/Blaze PNG 3.svg',
    'assets/Get D.svg'
  ];
  
  // Menu assets - only preload the current category and adjacent ones
  const menuAssets = {
    'gourmet-burgers': 'assets/menu/GOURMET BURGERS.svg',
    'wraps': 'assets/menu/WRAPS.svg',
    'sides': 'assets/menu/SIDES.svg',
    'pasta': 'assets/menu/PASTA.svg',
    'main-course': 'assets/menu/MAIN COURSE.svg',
    'chinese': 'assets/menu/CHINESE.svg',
    'og-momos': 'assets/menu/momos.svg',
    'cold-beverages': 'assets/menu/COLD BEVERAGES.svg',
    'hot-beverages': 'assets/menu/HOT BEVERAGES.svg',
    'desserts': 'assets/menu/DESSERTS.svg',
    'indian': 'assets/menu/INDIAN.svg'
  };
  
  // Always preload common assets
  const assetsToPreload = [...commonAssets];
  
  // If we're on a menu page, preload adjacent categories
  if (menuAssets[currentHash]) {
    // Add current category
    assetsToPreload.push(menuAssets[currentHash]);
    
    // Find index of current category
    const categories = Object.keys(menuAssets);
    const currentIndex = categories.indexOf(currentHash);
    
    // Add previous and next categories if they exist
    if (currentIndex > 0) {
      assetsToPreload.push(menuAssets[categories[currentIndex - 1]]);
    }
    if (currentIndex < categories.length - 1) {
      assetsToPreload.push(menuAssets[categories[currentIndex + 1]]);
    }
  } else if (currentHash === 'menu') {
    // If on main menu page, preload first few categories
    assetsToPreload.push(menuAssets['gourmet-burgers']);
    assetsToPreload.push(menuAssets['wraps']);
    assetsToPreload.push(menuAssets['sides']);
  } else if (currentHash === 'about') {
    // If on about page, preload about assets
    assetsToPreload.push('assets/About.svg');
  }
  
  // Create image objects to preload - use a more efficient approach
  const preloadPromises = assetsToPreload.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // Still resolve on error to avoid hanging
      img.src = src;
    });
  });
  
  // Return a promise that resolves when all images are preloaded
  return Promise.all(preloadPromises).catch(() => {
    // Silently catch errors to prevent crashes
    console.log('Some assets failed to preload');
  });
}

// Debounce function to limit function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function loadContent() {
  let hash = window.location.hash.slice(1);

  // Default to 'home' if no hash
  if (!hash) {
    hash = 'home';
    window.location.hash = '#home';
  }
  
  // Get the app element
  const appElement = document.getElementById('app');
  if (!appElement) {
    console.error('App element not found');
    return;
  }
  
  // Save scroll position before page change
  if (appElement.dataset.currentPage) {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem(`scrollPos_${appElement.dataset.currentPage}`, scrollPosition);
  }
  
  // Update current page tracking
  appElement.dataset.currentPage = hash;

  // Show loading indicator for all pages
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  // Get the page URL
  const page = routes[hash] || routes['home'];
  if (!page) {
    console.error('Page not found for hash:', hash);
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    appElement.innerHTML = '<div style="text-align:center;padding:2rem;"><p>Page not found. Please try again.</p><button onclick="window.location.hash=\'#home\'" style="padding:0.5rem 1rem;background:#9D1C20;color:white;border:none;border-radius:4px;cursor:pointer;">Return Home</button></div>';
    appElement.style.opacity = '1';
    return;
  }
  
  // Check if this is a menu page that we've already cached
  if (isMenuPage(hash) && menuPagesCache.has(hash)) {
    console.log('Loading cached page:', hash);
    
    try {
      // Use cached content
      const cachedContent = menuPagesCache.get(hash);
      appElement.innerHTML = cachedContent;
      
      // Set opacity without forcing layout recalculation
      requestAnimationFrame(() => {
        appElement.style.opacity = '1';
        appElement.style.transform = 'translateY(0)';
        
        // Hide loading indicator
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      });
      
      // Update navigation
      setActiveLink(hash);
      updateHorizontalNav();
      
      // Run essential post-load functions
      fixSvgPaths();
      adjustSvgImages();
      
      // Preload assets in the background
      setTimeout(() => {
        preloadAssets();
        loadAllIframes();
        
        // Initialize haptic feedback
        if (typeof initHapticFeedback === 'function') {
          initHapticFeedback();
        }
      }, 100);
      
      // Restore scroll position if needed
      restoreScrollPosition(hash);
      
      return;
    } catch (error) {
      console.error('Error using cached content:', error);
      // If there's an error with the cached content, continue to fetch from server
    }
  }
  
  console.log('Loading page from server:', hash, page);
  
  // Fetch the content with timeout and error handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout
  
  fetch(page, { 
    cache: 'no-store',
    signal: controller.signal
  })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.text();
    })
    .then(html => {
      // If this is a menu page, cache it for future use
      if (isMenuPage(hash)) {
        console.log('Caching menu page:', hash);
        menuPagesCache.set(hash, html);
      }
      
      // Update DOM in a single operation
      appElement.innerHTML = html;
      
      // Use requestAnimationFrame for visual updates
      requestAnimationFrame(() => {
        appElement.style.opacity = '1';
        appElement.style.transform = 'translateY(0)';
        
        // Hide loading indicator
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      });
      
      setActiveLink(hash);
      updateHorizontalNav();
      
      // Run essential post-load functions
      fixSvgPaths();
      adjustSvgImages();
      
      // Preload assets in the background
      setTimeout(() => {
        preloadAssets();
        loadAllIframes();
        
        // Initialize haptic feedback
        if (typeof initHapticFeedback === 'function') {
          initHapticFeedback();
        }
      }, 100);
      
      // Restore scroll position if needed
      restoreScrollPosition(hash);
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error('Error loading content:', error);
      
      // Hide loading indicator on error
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      
      // Show a simple error message
      appElement.innerHTML = '<div style="text-align:center;padding:2rem;"><p>Unable to load content. Please try again.</p><button onclick="window.location.hash=\'#home\'" style="padding:0.5rem 1rem;background:#9D1C20;color:white;border:none;border-radius:4px;cursor:pointer;">Return Home</button></div>';
      appElement.style.opacity = '1';
    });
}

// Make loadContent globally accessible
window.loadContent = loadContent;

// Helper function to restore scroll position
function restoreScrollPosition(hash) {
  if (hash === 'home') {
    window.scrollTo(0, 0);
  } else {
    const savedPosition = sessionStorage.getItem(`scrollPos_${hash}`);
    if (savedPosition) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
      }, 50);
    }
  }
}

// Helper function to check if a hash corresponds to a menu page
function isMenuPage(hash) {
  const menuPages = [
    'gourmet-burgers', 'wraps', 'sides', 'pasta', 'main-course', 
    'chinese', 'og-momos', 'cold-beverages', 'hot-beverages', 
    'desserts', 'indian'
  ];
  return menuPages.includes(hash);
}

// Make isMenuPage globally accessible
window.isMenuPage = isMenuPage;

// Function to fix SVG paths to ensure they load correctly
function fixSvgPaths() {
  // Fix menu SVG paths
  const menuSvgs = document.querySelectorAll('.menu-svg');
  menuSvgs.forEach(svg => {
    if (svg && svg.getAttribute('data-src')) {
      svg.setAttribute('src', svg.getAttribute('data-src'));
      svg.removeAttribute('data-src');
    }
  });
}

// Make fixSvgPaths globally accessible
window.fixSvgPaths = fixSvgPaths;

// Adjust SVG images if they exist
function adjustSvgImages() {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    // Adjust about SVG
    const aboutSvg = document.querySelector('.about-svg');
    if (aboutSvg) {
      aboutSvg.style.maxWidth = '100%';
      aboutSvg.style.height = 'auto';
      aboutSvg.style.display = 'block';
      aboutSvg.style.margin = '0 auto';
    }
    
    // Adjust all menu SVGs
    const menuSvgs = document.querySelectorAll('.menu-svg');
    menuSvgs.forEach(svg => {
      if (svg) {
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
      }
    });
  });
}

// Make adjustSvgImages globally accessible
window.adjustSvgImages = adjustSvgImages;

// highlight side nav links
function setActiveLink(hash) {
  const navItems = document.querySelectorAll('.side-nav a');
  navItems.forEach(link => {
    if (link.getAttribute('href') === '#' + hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Optimize the updateHorizontalNav function
function updateHorizontalNav() {
  const horizontalNav = document.querySelector('.horizontal-nav');
  if (!horizontalNav) return;
  
  const activeItem = horizontalNav.querySelector('.horizontal-nav-item.active');
  if (!activeItem) return;
  
  const navContainer = horizontalNav.querySelector('.nav-container');
  if (!navContainer) return;
  
  // Calculate scroll position to center the active item
  const itemRect = activeItem.getBoundingClientRect();
  const navRect = navContainer.getBoundingClientRect();
  const scrollLeft = activeItem.offsetLeft - (navRect.width / 2) + (itemRect.width / 2);
  
  // Use immediate scrolling without animation
  navContainer.scrollTo({
    left: scrollLeft,
    behavior: 'auto' // Changed from 'smooth' to 'auto' for immediate centering
  });
}

// Make updateHorizontalNav globally accessible
window.updateHorizontalNav = updateHorizontalNav;

// Improved haptic feedback function for horizontal navigation
function enableHapticScrollFeedback() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;
  
  // Get all navigation items
  const navItems = navContainer.querySelectorAll('.horizontal-nav-item');
  if (navItems.length === 0) return;
  
  // Add click event listeners to each nav item for haptic feedback
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // Provide haptic feedback on click (if supported)
      if ('vibrate' in navigator) {
        navigator.vibrate(25); // Stronger, more noticeable vibration
      }
      
      // Remove active class from all items
      navItems.forEach(navItem => {
        navItem.classList.remove('active');
      });
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Center the active item immediately
      const itemRect = this.getBoundingClientRect();
      const navRect = navContainer.getBoundingClientRect();
      const scrollLeft = this.offsetLeft - (navRect.width / 2) + (itemRect.width / 2);
      
      // Immediate scrolling without animation
      navContainer.scrollTo({
        left: scrollLeft,
        behavior: 'auto'
      });
    });
  });
}

// Initialize haptic feedback when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  enableHapticScrollFeedback();
});

// Re-initialize haptic feedback after content is loaded
function initHapticFeedback() {
  setTimeout(enableHapticScrollFeedback, 100);
}

// Setup direct loading for iframes to improve performance
function loadAllIframes() {
  // Convert all iframes with data-src to use src directly
  const iframes = document.querySelectorAll('iframe[data-src]');
  
  if (iframes.length === 0) return;
  
  iframes.forEach(iframe => {
    iframe.src = iframe.dataset.src;
    iframe.removeAttribute('data-src');
  });
}

// Preload images for faster loading
function preloadImages() {
  // Convert all images with data-src to use src directly
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  lazyImages.forEach(image => {
    if (image.dataset.src && !image.src.includes(image.dataset.src)) {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    }
  });
  
  // Now handle all menu SVGs to ensure they load properly
  const menuSvgs = document.querySelectorAll('.menu-svg');
  menuSvgs.forEach(svg => {
    // Force reload the image by setting the same src
    const currentSrc = svg.getAttribute('src');
    if (currentSrc) {
      // Create a new image to preload
      const img = new Image();
      img.onload = function() {
        // Once loaded, update the original image if needed
        if (!svg.complete || svg.naturalWidth === 0) {
          svg.src = currentSrc;
        }
      };
      img.src = currentSrc;
    }
  });
}

// Add a function to make horizontal nav scrollable with touch/mouse
function enableHorizontalDrag() {
  const horizNav = document.querySelector('.horizontal-nav');
  if (!horizNav) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
  // Add haptic feedback to navigation items
  const navItems = horizNav.querySelectorAll('.horizontal-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Provide haptic feedback when clicking on navigation items
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    });
  });
  
  // Add dots between menu items for visual separation and haptic feedback
  const navContainer = horizNav.querySelector('.nav-container');
  if (navContainer) {
    // First, remove any existing dots to avoid duplicates
    const existingDots = navContainer.querySelectorAll('.nav-dot');
    existingDots.forEach(dot => dot.remove());
    
    // Add dots between menu items
    const items = Array.from(navContainer.querySelectorAll('.horizontal-nav-item'));
    for (let i = 0; i < items.length - 1; i++) {
      const dot = document.createElement('span');
      dot.className = 'nav-dot';
      dot.innerHTML = '•';
      
      // Insert the dot after the current item
      if (items[i].nextSibling) {
        navContainer.insertBefore(dot, items[i].nextSibling);
      } else {
        navContainer.appendChild(dot);
      }
      
      // Add haptic feedback to dots
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        // Provide stronger haptic feedback for dots
        if ('vibrate' in navigator) {
          navigator.vibrate([10, 30, 10]);
        }
      });
    }
  }
  
  horizNav.addEventListener('mousedown', (e) => {
    isDown = true;
    horizNav.style.cursor = 'grabbing';
    startX = e.pageX - horizNav.offsetLeft;
    scrollLeft = horizNav.scrollLeft;
  });
  
  horizNav.addEventListener('mouseleave', () => {
    isDown = false;
    horizNav.style.cursor = 'grab';
  });
  
  horizNav.addEventListener('mouseup', () => {
    isDown = false;
    horizNav.style.cursor = 'grab';
  });
  
  horizNav.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - horizNav.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    horizNav.scrollLeft = scrollLeft - walk;
  });
}

// Add a function to handle scrollbar styling based on browser support
function handleScrollbarStyling() {
  const horizNav = document.querySelector('.horizontal-nav');
  if (!horizNav) return;
  
  // Check if the user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // If the user doesn't prefer reduced motion, add the hide-scrollbar class
  if (!prefersReducedMotion) {
    horizNav.classList.add('hide-scrollbar');
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Preload assets for faster loading
  preloadAssets();
  
  // Initial content load
  loadContent();
  
  // Listen for hash changes
  window.addEventListener('hashchange', loadContent);
  
  // Apply scrollbar hiding
  applyScrollbarHiding();
  
  // Preload menu pages
  preloadMenuPages();
});

// Set up side navigation
const hamburger = document.querySelector('.hamburger');
const sideNav = document.querySelector('.side-nav');

// Toggle side nav
hamburger.addEventListener('click', () => {
  sideNav.classList.toggle('open');
  hamburger.classList.toggle('active'); // Toggle active class for cross animation
});

// Close side nav when clicking navigation links
document.querySelectorAll('.side-nav a').forEach(link => {
  link.addEventListener('click', () => {
    // Don't close for phone number links
    if (!link.getAttribute('href').startsWith('tel:')) {
      sideNav.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });
});

// Close side nav when clicking outside
document.addEventListener('click', (e) => {
  if (!sideNav.contains(e.target) && !hamburger.contains(e.target) && sideNav.classList.contains('open')) {
    sideNav.classList.remove('open');
    hamburger.classList.remove('active');
  }
});

// Enable service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// Add resize event listener to adjust SVG images when window is resized
window.addEventListener('resize', debounce(() => {
  adjustSvgImages();
  updateHorizontalNav();
}, 100));

// Enable horizontal drag scrolling
enableHorizontalDrag();

// Handle scrollbar styling
handleScrollbarStyling();

// Initialize haptic scroll feedback
setTimeout(enableHapticScrollFeedback, 500);

// Re-initialize haptic feedback when hash changes
window.addEventListener('hashchange', function() {
  // Wait for the content to load before initializing
  setTimeout(enableHapticScrollFeedback, 500);
});

// Handle hash changes
window.addEventListener('hashchange', loadContent);

// Add transition styles to the app element
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  }
  
  // Call the direct loading setup function when content is loaded
  loadAllIframes();
});

// Function to enable haptic feedback for horizontal scrolling with iPhone dock-like behavior
function enableHapticScrollFeedback() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;
  
  // Create edge indicators
  const leftIndicator = document.createElement('div');
  leftIndicator.className = 'edge-indicator left';
  
  const rightIndicator = document.createElement('div');
  rightIndicator.className = 'edge-indicator right';
  
  const horizontalNav = document.querySelector('.horizontal-nav');
  horizontalNav.appendChild(leftIndicator);
  horizontalNav.appendChild(rightIndicator);
  
  // Initialize scroll tracking variables
  let scrollVelocity = 0;
  let lastScrollTime = 0;
  let lastScrollLeft = navContainer.scrollLeft;
  let isAtLeftEdge = true;
  let isAtRightEdge = false;
  let lastItemTriggered = null;
  
  // Check if we can use the vibration API
  const canVibrate = 'vibrate' in navigator;
  
  // Get all navigation items for edge detection
  const navItems = document.querySelectorAll('.horizontal-nav-item');
  const navDots = document.querySelectorAll('.nav-dot');
  
  // Function to detect items at screen edges and trigger navigation
  function detectEdgeItems() {
    const containerRect = navContainer.getBoundingClientRect();
    const leftEdge = containerRect.left;
    const rightEdge = containerRect.right;
    
    // Check each navigation item
    navItems.forEach(item => {
      if (item === lastItemTriggered) return; // Skip if this was the last triggered item
      
      const itemRect = item.getBoundingClientRect();
      const href = item.getAttribute('href');
      
      if (!href || !href.startsWith('#')) return;
      
      // Check if item's right edge is entering the left side of the screen
      if (itemRect.right >= leftEdge && itemRect.right <= leftEdge + itemRect.width / 2) {
        if (window.location.hash !== href) {
          // Apply visual feedback
          item.classList.add('scroll-pulse');
          setTimeout(() => item.classList.remove('scroll-pulse'), 300);
          
          // Haptic feedback
          if (canVibrate) navigator.vibrate(20);
          
          // Store as last triggered and navigate
          lastItemTriggered = item;
          
          // Use pushState to update URL without triggering a page reload
          history.pushState(null, '', href);
          
          // Manually trigger the navigation
          const targetSection = document.querySelector(href);
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
        return;
      }
      
      // Check if item's left edge is entering the right side of the screen
      if (itemRect.left <= rightEdge && itemRect.left >= rightEdge - itemRect.width / 2) {
        // Item is at the right edge, navigate to this section
        const href = item.getAttribute('href');
        if (href && href.startsWith('#')) {
          const sectionId = href.substring(1);
          if (window.location.hash !== href) {
            // Apply visual feedback
            item.classList.add('scroll-pulse');
            setTimeout(() => item.classList.remove('scroll-pulse'), 300);
            
            // Haptic feedback
            if (canVibrate) navigator.vibrate(20);
            
            // Store as last triggered to prevent repeated triggers
            lastItemTriggered = item;
            
            // Navigate to the section
            window.location.hash = href;
          }
        }
        return;
      }
    });
    
    // Also check nav dots with similar logic
    navDots.forEach((dot, index) => {
      if (dot === lastItemTriggered) return;
      
      const dotRect = dot.getBoundingClientRect();
      
      // Check if dot is at either edge
      if ((dotRect.right >= leftEdge && dotRect.right <= leftEdge + dotRect.width / 2) ||
          (dotRect.left <= rightEdge && dotRect.left >= rightEdge - dotRect.width / 2)) {
        
        // Apply visual feedback
        dot.classList.add('scroll-pulse');
        setTimeout(() => dot.classList.remove('scroll-pulse'), 300);
        
        // Haptic feedback
        if (canVibrate) navigator.vibrate(10);
        
        // Store as last triggered
        lastItemTriggered = dot;
      }
    });
  }
  
  // Track scroll events for velocity calculation and edge detection
  navContainer.addEventListener('scroll', () => {
    const now = performance.now();
    const dt = now - lastScrollTime;
    
    if (dt > 0) {
      // Calculate scroll velocity in pixels per millisecond
      scrollVelocity = (navContainer.scrollLeft - lastScrollLeft) / dt;
      
      // Check if we're at the edges
      const newIsAtLeftEdge = navContainer.scrollLeft <= 10;
      const newIsAtRightEdge = navContainer.scrollLeft >= (navContainer.scrollWidth - navContainer.clientWidth - 10);
      
      // Trigger edge haptic feedback and visual indicators
      if (newIsAtLeftEdge !== isAtLeftEdge) {
        isAtLeftEdge = newIsAtLeftEdge;
        if (isAtLeftEdge && scrollVelocity < -0.3) {
          // Left edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          leftIndicator.classList.add('visible');
          setTimeout(() => leftIndicator.classList.remove('visible'), 500);
        }
      }
      
      if (newIsAtRightEdge !== isAtRightEdge) {
        isAtRightEdge = newIsAtRightEdge;
        if (isAtRightEdge && scrollVelocity > 0.3) {
          // Right edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          rightIndicator.classList.add('visible');
          setTimeout(() => rightIndicator.classList.remove('visible'), 500);
        }
      }
    }
    
    lastScrollLeft = navContainer.scrollLeft;
    lastScrollTime = now;
  });
  
  // Touch events for better mobile experience
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;
  
  navContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartTime = performance.now();
  }, { passive: true });
  
  navContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const touchEndTime = performance.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Calculate swipe velocity
    const touchDistance = touchEndX - touchStartX;
    const touchVelocity = Math.abs(touchDistance / touchDuration);
    
    // If it was a fast swipe, trigger haptic feedback
    if (touchVelocity > 1.0) {
      if (canVibrate) navigator.vibrate(15);
      
      // Show edge indicators for fast swipes
      if (touchDistance < 0 && !isAtRightEdge) {
        rightIndicator.classList.add('visible');
        setTimeout(() => rightIndicator.classList.remove('visible'), 500);
      } else if (touchDistance > 0 && !isAtLeftEdge) {
        leftIndicator.classList.add('visible');
        setTimeout(() => leftIndicator.classList.remove('visible'), 500);
      }
    }
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  // Side navigation is already set up outside this event listener
  // No need to add duplicate event listeners here
});

// Apply scrollbar hiding based on browser support
function applyScrollbarHiding() {
  // Test for Firefox scrollbar-width support
  const style = document.createElement('style');
  try {
    style.appendChild(document.createTextNode(':root{scrollbar-width:none}'));
    document.head.appendChild(style);
    const isScrollbarWidthSupported = getComputedStyle(document.documentElement).scrollbarWidth === 'none';
    document.head.removeChild(style);
    
    if (isScrollbarWidthSupported) {
      // Apply the class only if scrollbar-width is supported
      const navContainers = document.querySelectorAll('.nav-container');
      navContainers.forEach(container => {
        container.classList.add('hide-scrollbar');
      });
    }
  } catch (e) {
    // If there's an error, the property is not supported
    console.log('scrollbar-width not supported in this browser');
  }
}