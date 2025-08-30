/**
 * Asset Compression Helper for Blaze Website
 * Version: 1.9.0
 * 
 * This script helps optimize image loading by dynamically adjusting image quality
 * based on network conditions and device capabilities.
 */

// Initialize the compression system
(function() {
  // Check if the browser supports the Network Information API
  const connection = navigator.connection || 
                    navigator.mozConnection || 
                    navigator.webkitConnection || 
                    null;
  
  // Default to high quality if we can't detect network
  let imageQuality = 'high';
  
  // Determine image quality based on network type
  if (connection) {
    const networkType = connection.effectiveType || connection.type;
    
    // Set quality based on network speed
    if (networkType === '4g' || networkType === 'wifi') {
      imageQuality = 'high';
    } else if (networkType === '3g') {
      imageQuality = 'medium';
    } else {
      imageQuality = 'low';
    }
    
    // Listen for changes in network quality
    connection.addEventListener('change', function() {
      updateImageQuality();
    });
  }
  
  // Update image quality based on current network conditions
  function updateImageQuality() {
    if (!connection) return;
    
    const networkType = connection.effectiveType || connection.type;
    
    // Update quality setting
    if (networkType === '4g' || networkType === 'wifi') {
      imageQuality = 'high';
    } else if (networkType === '3g') {
      imageQuality = 'medium';
    } else {
      imageQuality = 'low';
    }
    
    // Apply new quality to visible images
    optimizeVisibleImages();
  }
  
  // Optimize images that are currently visible
  function optimizeVisibleImages() {
    const images = document.querySelectorAll('img[data-quality]');
    
    images.forEach(img => {
      if (isInViewport(img)) {
        applyQualitySetting(img);
      }
    });
  }
  
  // Apply quality setting to an image
  function applyQualitySetting(img) {
    // Skip if already optimized for current quality
    if (img.dataset.appliedQuality === imageQuality) return;
    
    // Get the appropriate source based on quality
    let src = img.dataset.src || img.src;
    
    // If we have quality-specific versions available
    if (img.dataset.highQuality && img.dataset.mediumQuality && img.dataset.lowQuality) {
      if (imageQuality === 'high') {
        src = img.dataset.highQuality;
      } else if (imageQuality === 'medium') {
        src = img.dataset.mediumQuality;
      } else {
        src = img.dataset.lowQuality;
      }
    }
    
    // Update the source
    if (src && img.src !== src) {
      img.src = src;
    }
    
    // Mark as processed
    img.dataset.appliedQuality = imageQuality;
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
  
  // Initialize optimization on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Set data-quality attribute on all images
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('data-quality')) {
        img.setAttribute('data-quality', 'auto');
      }
    });
    
    // Optimize visible images
    optimizeVisibleImages();
    
    // Set up intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            applyQualitySetting(img);
            imageObserver.unobserve(img);
          }
        });
      });
      
      // Observe all images
      document.querySelectorAll('img[data-quality]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  });
  
  // Re-optimize on resize and scroll
  let optimizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(optimizeTimeout);
    optimizeTimeout = setTimeout(optimizeVisibleImages, 100);
  });
  
  window.addEventListener('scroll', function() {
    clearTimeout(optimizeTimeout);
    optimizeTimeout = setTimeout(optimizeVisibleImages, 100);
  });
  
  // Export functions for use in other scripts
  window.blazeCompression = {
    updateImageQuality,
    optimizeVisibleImages,
    getCurrentQuality: () => imageQuality
  };
})();
