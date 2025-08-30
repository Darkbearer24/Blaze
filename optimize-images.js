/**
 * Image Optimization Helper for Blaze Website
 * Version: 1.9.0
 * 
 * This script optimizes image loading and rendering performance.
 */

// Set image dimensions in HTML to prevent layout shifts
function setImageDimensions() {
  const images = document.querySelectorAll('img:not([width]):not([height])');
  
  images.forEach(img => {
    // Only set dimensions for loaded images
    if (img.complete) {
      applyDimensions(img);
    } else {
      img.onload = () => applyDimensions(img);
    }
  });
}

// Apply width and height attributes to prevent CLS
function applyDimensions(img) {
  // Only set dimensions if not already set
  if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    
    if (width && height) {
      // Set the actual dimensions as attributes
      img.setAttribute('width', width);
      img.setAttribute('height', height);
      
      // Add loading="lazy" for images below the fold
      if (!isInViewport(img) && !img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    }
  }
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Optimize SVG rendering
function optimizeSvgRendering() {
  const svgs = document.querySelectorAll('svg');
  
  svgs.forEach(svg => {
    // Add shape-rendering attribute for better performance
    svg.setAttribute('shape-rendering', 'optimizeSpeed');
    
    // Remove unnecessary attributes
    const unnecessaryAttrs = ['data-name', 'id', 'version'];
    unnecessaryAttrs.forEach(attr => {
      if (svg.hasAttribute(attr)) {
        svg.removeAttribute(attr);
      }
    });
  });
}

// Initialize optimization
document.addEventListener('DOMContentLoaded', () => {
  setImageDimensions();
  optimizeSvgRendering();
  
  // Re-run when content changes (for SPA navigation)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        setTimeout(() => {
          setImageDimensions();
          optimizeSvgRendering();
        }, 100);
      }
    });
  });
  
  // Start observing the document
  observer.observe(document.body, { 
    childList: true,
    subtree: true 
  });
});

// Export functions for use in other scripts
window.blazeImageOptimizer = {
  setImageDimensions,
  optimizeSvgRendering
};
