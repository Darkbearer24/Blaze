/**
 * Menu Scroll Behavior
 * Handles scrolling behavior for menu pages:
 * 1. Makes horizontal nav sticky at the top
 * 2. Hides side nav when scrolling up
 * 3. Shows side nav when scrolling down
 * 4. Ensures menu container scrolls to the end of SVG
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the necessary elements
  const horizontalNav = document.querySelector('.horizontal-nav');
  const menuContainer = document.querySelector('.menu-container');
  const sideNav = document.querySelector('.side-nav');
  
  if (!horizontalNav || !menuContainer || !sideNav) return;

  // Variables to track scroll position and direction
  let lastScrollTop = 0;
  let scrollDirection = 'down';
  
  // Function to handle scroll events
  function handleScroll() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Determine scroll direction
    scrollDirection = currentScrollTop > lastScrollTop ? 'down' : 'up';
    
    // Handle side nav visibility based on scroll direction
    if (scrollDirection === 'up' && sideNav.classList.contains('open')) {
      // Hide side nav when scrolling up
      sideNav.classList.remove('open');
    } else if (scrollDirection === 'down' && !sideNav.classList.contains('open') && currentScrollTop > 100) {
      // Show side nav when scrolling down (after scrolling a bit)
      sideNav.classList.add('open');
    }
    
    // Update last scroll position
    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }
  
  // Prevent horizontal nav from being scrollable directly
  horizontalNav.addEventListener('wheel', function(e) {
    if (e.deltaY !== 0) {
      // Prevent default only for vertical scrolling
      e.preventDefault();
      
      // Scroll the menu container instead
      menuContainer.scrollBy({
        top: e.deltaY,
        behavior: 'smooth'
      });
    }
  }, { passive: false });
  
  // Add scroll event listener to window
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Ensure the menu container height adjusts to content
  function adjustMenuContainerHeight() {
    const menuSvg = menuContainer.querySelector('.menu-svg');
    if (menuSvg) {
      // Wait for SVG to load to get its height
      menuSvg.onload = function() {
        // Set the menu container height to match the SVG height
        menuContainer.style.height = 'auto';
      };
      
      // If SVG is already loaded
      if (menuSvg.complete) {
        menuContainer.style.height = 'auto';
      }
    }
  }
  
  // Call the function to adjust height
  adjustMenuContainerHeight();
});