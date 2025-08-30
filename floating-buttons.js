/**
 * Floating Buttons Controller
 * Shows/hides floating buttons based on the current page and navigation state
 */
document.addEventListener('DOMContentLoaded', function() {
  // Add debug message
  console.log('Floating buttons script loaded');
  
  // Get elements
  const floatingButtons = document.querySelector('.floating-buttons');
  const sideNav = document.querySelector('.side-nav');
  const hamburger = document.querySelector('.hamburger');
  
  // Debug element detection
  console.log('Found floating buttons:', !!floatingButtons);
  console.log('Found side nav:', !!sideNav);
  console.log('Found hamburger:', !!hamburger);
  
  if (!floatingButtons) return;
  
  // Initial check when page loads
  toggleFloatingButtons();
  
  // Listen for hash changes to toggle buttons visibility
  window.addEventListener('hashchange', toggleFloatingButtons);
  
  // Add a click event listener to the hamburger menu
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      console.log('Hamburger clicked, nav open:', sideNav.classList.contains('open'));
      // Toggle buttons visibility immediately after the side nav is toggled
      setTimeout(toggleFloatingButtons, 50);
    });
  }
  
  // Add a global click listener to handle clicks outside the nav
  document.addEventListener('click', function(e) {
    if (!sideNav.contains(e.target) && !hamburger.contains(e.target)) {
      // Check if nav was open and is now closing
      if (sideNav.classList.contains('open')) {
        setTimeout(toggleFloatingButtons, 50);
      }
    }
  });
  
  // Add click listeners to all navigation links
  document.querySelectorAll('.side-nav a').forEach(link => {
    link.addEventListener('click', () => {
      // When a nav link is clicked, update button visibility
      setTimeout(toggleFloatingButtons, 50);
    });
  });
  
  // Function to toggle floating buttons visibility
  function toggleFloatingButtons() {
    const currentHash = window.location.hash.slice(1);
    const isNavOpen = sideNav.classList.contains('open');
    
    console.log('Toggle buttons - Current hash:', currentHash, 'Nav open:', isNavOpen);
    
    // Show buttons only on home page (empty hash or #home) AND when navigation is closed
    if ((currentHash === '' || currentHash === 'home') && !isNavOpen) {
      console.log('Showing floating buttons');
      floatingButtons.style.display = 'flex';
    } else {
      console.log('Hiding floating buttons');
      floatingButtons.style.display = 'none';
    }
  }
});
