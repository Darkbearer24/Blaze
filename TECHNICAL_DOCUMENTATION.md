# Blaze Restaurant Web Application - Technical Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [API Specifications](#api-specifications)
4. [Implementation Guide](#implementation-guide)
5. [Configuration Reference](#configuration-reference)
6. [Troubleshooting](#troubleshooting)
7. [Performance Considerations](#performance-considerations)
8. [Security Best Practices](#security-best-practices)
9. [Version History](#version-history)
10. [Frequently Asked Questions](#frequently-asked-questions)

## 1. Introduction

### Purpose and Scope
The Blaze Restaurant Web Application is a modern Single Page Application (SPA) designed to showcase restaurant menu items, provide location information, and facilitate online ordering. Built with vanilla JavaScript and Express.js, it delivers a fast, responsive user experience across all devices.

### Key Features
- **Single Page Application (SPA)** with hash-based routing
- **Progressive Web App (PWA)** capabilities with service worker
- **Responsive design** optimized for mobile and desktop
- **Intelligent caching** system for menu pages
- **Network-aware asset optimization**
- **Real-time scroll position preservation**
- **Haptic feedback** for mobile interactions

### Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express.js
- **Fonts**: Custom fonts (Beautiful Freak Bold, Teko)
- **Assets**: SVG graphics for scalability
- **Testing**: Jest framework

## 2. System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
├─────────────────────────────────────────────────────────────┤
│  index.html (App Shell)                                    │
│  ├── script.js (SPA Router & Core Logic)                   │
│  ├── styles.css (Main Stylesheet)                          │
│  ├── menu-wheel.css (Menu-specific Styles)                 │
│  └── service-worker.js (PWA Caching)                       │
├─────────────────────────────────────────────────────────────┤
│  Dynamic Content Loading                                    │
│  ├── pages/ (HTML Partials)                                │
│  ├── assets/ (Images, Fonts, Icons)                        │
│  └── Cache Layer (menuPagesCache)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Express.js Server                            │
├─────────────────────────────────────────────────────────────┤
│  server.js                                                  │
│  ├── Static File Serving                                    │
│  ├── SPA Route Handling (*)                                 │
│  └── Network Interface Detection                            │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Components
1. **App Shell** (`index.html`)
   - Fixed header with logo and navigation
   - Dynamic content area (`#app`)
   - Side navigation panel
   - Floating action buttons

2. **Router System** (`script.js`)
   - Hash-based routing
   - Dynamic content loading
   - Cache management
   - Scroll position preservation

3. **Asset Management**
   - Intelligent image compression
   - Network-aware loading
   - Lazy loading with Intersection Observer

#### Backend Components
1. **Express Server** (`server.js`)
   - Static file serving
   - SPA fallback routing
   - Network IP detection

### File Structure
```
blaze-website/
├── index.html              # Main app shell
├── server.js              # Express server
├── script.js              # Core SPA logic
├── styles.css             # Main stylesheet
├── menu-wheel.css         # Menu-specific styles
├── service-worker.js      # PWA service worker
├── manifest.json          # PWA manifest
├── package.json           # Dependencies
├── pages/                 # HTML partials
│   ├── home.html
│   ├── menu.html
│   ├── about.html
│   ├── contact.html
│   ├── hours-location.html
│   ├── order-online.html
│   └── [menu-categories].html
├── assets/                # Static assets
│   ├── fonts/
│   ├── icons/
│   ├── menu/
│   └── menu-icons/
└── [utility-scripts].js   # Helper scripts
```

## 3. API Specifications

### Server Endpoints

#### Static File Serving
```http
GET /*
Description: Serves static files from the application directory
Response: File content with appropriate MIME type
Cache-Control: Browser-dependent
```

#### SPA Fallback Route
```http
GET *
Description: Fallback route that serves index.html for all unmatched routes
Response: index.html content
Content-Type: text/html
```

### Client-Side Routing

#### Route Configuration
```javascript
const routes = {
  home: 'pages/home.html',
  'hours-location': 'pages/hours-location.html',
  about: 'pages/about.html',
  'order-online': 'pages/order-online.html',
  contact: 'pages/contact.html',
  menu: 'pages/menu.html',
  // Menu categories
  'gourmet-burgers': 'pages/gourmet-burgers.html',
  wraps: 'pages/wraps.html',
  sides: 'pages/sides.html',
  pasta: 'pages/pasta.html',
  'main-course': 'pages/main-course.html',
  chinese: 'pages/chinese.html',
  'og-momos': 'pages/og-momos.html',
  'cold-beverages': 'pages/cold-beverages.html',
  'hot-beverages': 'pages/hot-beverages.html',
  desserts: 'pages/desserts.html',
  indian: 'pages/indian.html'
};
```

#### Navigation API
```javascript
// Navigate to a page
window.location.hash = '#page-name';

// Programmatic navigation
loadContent(); // Loads current hash

// Cache management
menuPagesCache.get(key);     // Retrieve cached page
menuPagesCache.set(key, value); // Cache a page
menuPagesCache.clear();      // Clear all cache
```

### Error Handling

#### HTTP Error Codes
- **404**: Page not found - Shows fallback error message
- **500**: Server error - Network timeout or server unavailable
- **Network errors**: Handled gracefully with retry mechanisms

#### Client-Side Error Handling
```javascript
// Fetch timeout (8 seconds)
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 8000);

// Error fallback UI
appElement.innerHTML = `
  <div style="text-align:center;padding:2rem;">
    <p>Unable to load content. Please try again.</p>
    <button onclick="window.location.hash='#home'">Return Home</button>
  </div>
`;
```

## 4. Implementation Guide

### Step 1: Environment Setup

#### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

#### Installation
```bash
# Clone or download the project
cd blaze-website

# Install dependencies
npm install

# Start the development server
npm start
```

#### Development Server
```bash
# The server will start on:
# Local: http://localhost:3000
# Network: http://[your-ip]:3000
```

### Step 2: Adding New Pages

#### Create HTML Partial
```html
<!-- pages/new-page.html -->
<div class="page-container">
  <h1>New Page Title</h1>
  <p>Page content goes here...</p>
</div>
```

#### Register Route
```javascript
// In script.js, add to routes object
const routes = {
  // ... existing routes
  'new-page': 'pages/new-page.html'
};
```

#### Add Navigation Link
```html
<!-- In index.html side navigation -->
<li><a href="#new-page">NEW PAGE</a></li>
```

### Step 3: Customizing Styles

#### CSS Variables
```css
:root {
  --theme-color: #9d1c20;        /* Primary brand color */
  --theme-color-light: #c12228;   /* Lighter variant */
  --theme-color-dark: #8a1a1e;    /* Darker variant */
  --header-height: 3.75rem;       /* Header height */
  --logo-width: 7rem;             /* Logo width */
}
```

#### Responsive Breakpoints
```css
/* Mobile-first approach */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

### Step 4: Asset Optimization

#### Image Optimization
```javascript
// Network-aware image loading
function applyQualitySetting(img) {
  let src = img.dataset.src || img.src;
  
  if (imageQuality === 'high') {
    src = img.dataset.highQuality;
  } else if (imageQuality === 'medium') {
    src = img.dataset.mediumQuality;
  } else {
    src = img.dataset.lowQuality;
  }
  
  img.src = src;
}
```

#### SVG Optimization
- Use SVG for icons and graphics
- Optimize SVG files for smaller file sizes
- Implement lazy loading for non-critical images

## 5. Configuration Reference

### Server Configuration

#### Environment Variables
```bash
# Port configuration
PORT=3000  # Default port (optional)

# Node environment
NODE_ENV=production  # or development
```

#### Server Settings
```javascript
// server.js configuration
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';  // Listen on all interfaces

// Static file serving
app.use(express.static(path.join(__dirname)));
```

### Cache Configuration

#### Menu Pages Cache
```javascript
const menuPagesCache = {
  _maxSize: 15,        // Maximum cached pages
  _accessOrder: [],    // LRU tracking
  // ... cache methods
};
```

#### Browser Cache Headers
```javascript
// Cache control for static assets
app.use(express.static(path.join(__dirname), {
  maxAge: '1d',        // 1 day cache
  etag: true,          // Enable ETags
  lastModified: true   // Enable Last-Modified headers
}));
```

### PWA Configuration

#### Manifest Settings
```json
{
  "name": "Blaze Restaurant",
  "short_name": "Blaze",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#9d1c20",
  "icons": [
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Performance Settings

#### Preloading Configuration
```html
<!-- Critical resource preloading -->
<link rel="preload" href="assets/Blaze PNG 3.svg" as="image">
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="script.js" as="script">
```

#### Lazy Loading Settings
```javascript
// Intersection Observer configuration
const imageObserver = new IntersectionObserver((entries) => {
  // ... lazy loading logic
}, {
  rootMargin: '50px',    // Load 50px before entering viewport
  threshold: 0.1         // Trigger at 10% visibility
});
```

## 6. Troubleshooting

### Common Issues and Solutions

#### Issue: Pages Not Loading
**Symptoms**: Blank page or loading spinner persists

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify route exists in `routes` object
3. Ensure HTML partial file exists in `pages/` directory
4. Check network connectivity

```javascript
// Debug route loading
console.log('Current hash:', window.location.hash);
console.log('Route exists:', routes[hash]);
```

#### Issue: Images Not Displaying
**Symptoms**: Broken image icons or missing graphics

**Solutions**:
1. Verify image paths are correct
2. Check file extensions match actual files
3. Ensure images are in `assets/` directory
4. Check browser network tab for 404 errors

```javascript
// Debug image loading
img.onerror = function() {
  console.error('Failed to load image:', this.src);
};
```

#### Issue: Navigation Not Working
**Symptoms**: Clicking links doesn't change content

**Solutions**:
1. Verify hash change event listener is active
2. Check if `loadContent()` function is defined
3. Ensure navigation links use correct hash format

```javascript
// Debug navigation
window.addEventListener('hashchange', function() {
  console.log('Hash changed to:', window.location.hash);
});
```

#### Issue: Server Won't Start
**Symptoms**: Error messages when running `npm start`

**Solutions**:
1. Check if port 3000 is already in use
2. Verify Node.js and npm are installed
3. Run `npm install` to ensure dependencies are installed
4. Check for syntax errors in `server.js`

```bash
# Check if port is in use
netstat -an | findstr :3000

# Kill process using port (Windows)
taskkill /F /PID <process-id>
```

### Performance Issues

#### Slow Page Loading
**Causes**: Large images, network issues, cache problems

**Solutions**:
1. Enable image compression
2. Implement proper caching
3. Use CDN for static assets
4. Optimize SVG files

#### Memory Leaks
**Causes**: Event listeners not removed, large cache size

**Solutions**:
1. Remove event listeners on page unload
2. Limit cache size (currently set to 15 pages)
3. Clear cache periodically

```javascript
// Clear cache when memory usage is high
if (performance.memory && performance.memory.usedJSHeapSize > 50000000) {
  menuPagesCache.clear();
}
```

## 7. Performance Considerations

### Optimization Techniques

#### 1. Caching Strategy
- **Menu Pages**: Cached in memory with LRU eviction
- **Static Assets**: Browser cache with appropriate headers
- **Service Worker**: Offline caching for PWA functionality

#### 2. Lazy Loading
```javascript
// Intersection Observer for images
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      applyQualitySetting(img);
      imageObserver.unobserve(img);
    }
  });
});
```

#### 3. Network Optimization
- **Adaptive Quality**: Images adjust based on network speed
- **Preloading**: Critical resources loaded early
- **Compression**: Gzip compression for text assets

#### 4. Code Splitting
```javascript
// Dynamic imports for non-critical features
if (typeof initHapticFeedback === 'function') {
  setTimeout(() => {
    initHapticFeedback();
  }, 100);
}
```

### Performance Metrics

#### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### Monitoring
```javascript
// Performance monitoring
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
});
```

### Optimization Checklist
- [ ] Enable gzip compression
- [ ] Optimize images (WebP format when possible)
- [ ] Minify CSS and JavaScript
- [ ] Use CDN for static assets
- [ ] Implement proper caching headers
- [ ] Enable HTTP/2
- [ ] Optimize font loading
- [ ] Remove unused CSS/JavaScript

## 8. Security Best Practices

### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:; 
               font-src 'self';">
```

### HTTPS Configuration
```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Input Validation
```javascript
// Sanitize hash values
function sanitizeHash(hash) {
  return hash.replace(/[^a-zA-Z0-9-]/g, '');
}
```

### Security Headers
```javascript
// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### File Upload Security
- Validate file types and sizes
- Scan uploads for malware
- Store uploads outside web root
- Use secure file naming conventions

## 9. Version History

### Version 4.20 (Current)
- **Release Date**: Current
- **Changes**:
  - Enhanced caching system with LRU eviction
  - Improved network-aware asset loading
  - Added haptic feedback for mobile devices
  - Optimized scroll position preservation
  - Updated dependencies (Express 4.18.2, Jest 29.5.0)

### Version 2.1.2
- **Release Date**: Previous
- **Changes**:
  - Implemented service worker for PWA functionality
  - Added manifest.json for app installation
  - Improved responsive design
  - Enhanced asset preloading

### Migration Guide

#### Upgrading from Version 2.x to 4.x
1. Update `package.json` dependencies
2. Clear browser cache
3. Update service worker registration
4. Test all menu page navigation

```bash
# Update dependencies
npm update

# Clear cache
npm run clean  # if available
```

## 10. Frequently Asked Questions

### Q: How do I add a new menu category?
**A**: 
1. Create HTML file in `pages/` directory
2. Add route to `routes` object in `script.js`
3. Add navigation link in `index.html`
4. Create corresponding SVG assets

### Q: Why are some images not loading on slow networks?
**A**: The app uses network-aware loading. On slow connections, lower quality images are served. Ensure you have multiple quality versions of images with appropriate `data-*` attributes.

### Q: How can I customize the theme colors?
**A**: Modify the CSS custom properties in `:root` selector in `styles.css`:
```css
:root {
  --theme-color: #your-color;
  --theme-color-light: #your-light-color;
  --theme-color-dark: #your-dark-color;
}
```

### Q: Can I deploy this to a different port?
**A**: Yes, set the `PORT` environment variable:
```bash
PORT=8080 npm start
```

### Q: How do I enable HTTPS in development?
**A**: Use a reverse proxy like nginx or modify `server.js` to use HTTPS certificates:
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

### Q: How do I optimize for SEO?
**A**: Since this is an SPA, consider:
1. Implementing server-side rendering (SSR)
2. Adding meta tags for each route
3. Creating a sitemap.xml
4. Using structured data markup

### Q: Can I integrate with a backend API?
**A**: Yes, modify the route handlers to fetch data from APIs:
```javascript
// Example API integration
fetch('/api/menu-items')
  .then(response => response.json())
  .then(data => {
    // Render menu items
  });
```

### Q: How do I handle form submissions?
**A**: Add form handling to your routes:
```javascript
// In server.js
app.use(express.json());
app.post('/api/contact', (req, res) => {
  // Handle form submission
  res.json({ success: true });
});
```

---

**Documentation Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Blaze Development Team  
**Contact**: [Contact Information]  

For additional support or questions not covered in this documentation, please refer to the project repository or contact the development team.