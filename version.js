// Blaze Restaurant Web Application Version
const APP_VERSION = '4.20';
// Make version available globally
window.BLAZE_VERSION = APP_VERSION;
// Store the previous version in localStorage
const previousVersion = localStorage.getItem('blazeVersion');

// Handle version changes or first-time users
if (!previousVersion || previousVersion !== APP_VERSION) {
  // Update localStorage with new version
  localStorage.setItem('blazeVersion', APP_VERSION);
  
  // Only clear storage if it's an update (not first-time use)
  if (previousVersion && previousVersion !== APP_VERSION) {
    // Clear localStorage and sessionStorage (except version info)
    Object.keys(localStorage).forEach(key => {
      if (key !== 'blazeVersion') {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    // Notify service worker about version change
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'VERSION_UPDATE',
        version: APP_VERSION
      });
    }
  }
}

// Log version to console for debugging
console.log(`Blaze Restaurant Web App v${APP_VERSION}`);