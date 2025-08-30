const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');

// Get all HTML files in the pages directory
const menuPages = fs.readdirSync(pagesDir)
  .filter(file => file.endsWith('.html'));

// The new navigation structure based on the image
const newNavigation = `<nav class="horizontal-nav">
  <div class="nav-container">
    <a href="#gourmet-burgers" class="horizontal-nav-item">Gourmet Burgers</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#wraps" class="horizontal-nav-item">Wraps</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#sides" class="horizontal-nav-item">Sides</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#pasta" class="horizontal-nav-item">Pasta</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#og-momos" class="horizontal-nav-item">OG Momos</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#chinese" class="horizontal-nav-item">Chinese</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#indian" class="horizontal-nav-item">Indian</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#cold-beverages" class="horizontal-nav-item">Cold</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#hot-beverages" class="horizontal-nav-item">Hot</a>
    <img src="assets/separator.svg" alt="" class="nav-separator" />
    <a href="#desserts" class="horizontal-nav-item">Desserts</a>
  </div>
</nav>`;

// Process each menu page
let updatedCount = 0;

menuPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the current page identifier to set the active class
  const pageIdentifier = page.replace('.html', '');
  let activeNavigation = newNavigation;
  
  // Set the active class for the current page
  if (pageIdentifier === 'gourmet-burgers') {
    activeNavigation = activeNavigation.replace('href="#gourmet-burgers" class="horizontal-nav-item"', 'href="#gourmet-burgers" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'wraps') {
    activeNavigation = activeNavigation.replace('href="#wraps" class="horizontal-nav-item"', 'href="#wraps" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'sides') {
    activeNavigation = activeNavigation.replace('href="#sides" class="horizontal-nav-item"', 'href="#sides" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'pasta') {
    activeNavigation = activeNavigation.replace('href="#pasta" class="horizontal-nav-item"', 'href="#pasta" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'og-momos') {
    activeNavigation = activeNavigation.replace('href="#og-momos" class="horizontal-nav-item"', 'href="#og-momos" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'chinese') {
    activeNavigation = activeNavigation.replace('href="#chinese" class="horizontal-nav-item"', 'href="#chinese" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'indian') {
    activeNavigation = activeNavigation.replace('href="#indian" class="horizontal-nav-item"', 'href="#indian" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'cold-beverages') {
    activeNavigation = activeNavigation.replace('href="#cold-beverages" class="horizontal-nav-item"', 'href="#cold-beverages" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'hot-beverages') {
    activeNavigation = activeNavigation.replace('href="#hot-beverages" class="horizontal-nav-item"', 'href="#hot-beverages" class="horizontal-nav-item active"');
  } else if (pageIdentifier === 'desserts') {
    activeNavigation = activeNavigation.replace('href="#desserts" class="horizontal-nav-item"', 'href="#desserts" class="horizontal-nav-item active"');
  }
  
  // Find where the current nav starts and ends
  const navStartIndex = content.indexOf('<nav class="horizontal-nav">');
  const navEndIndex = content.indexOf('</nav>') + 6;
  
  if (navStartIndex !== -1 && navEndIndex !== -1) {
    // Replace the navigation section
    const newContent = content.substring(0, navStartIndex) + 
      activeNavigation + 
      content.substring(navEndIndex);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, newContent);
    updatedCount++;
    console.log(`Updated navigation in ${page}`);
  } else {
    console.log(`Navigation section not found in ${page}`);
  }
});

// Create Indian and Desserts pages if they don't exist
const newPages = [
  { name: 'indian.html', title: 'Indian', imgSrc: 'assets/menu/Indian.svg' },
  { name: 'desserts.html', title: 'Desserts', imgSrc: 'assets/menu/Desserts.svg' }
];

newPages.forEach(page => {
  const filePath = path.join(pagesDir, page.name);
  
  // Check if the file already exists
  if (!fs.existsSync(filePath)) {
    // Create a new page with the correct navigation
    let activeNavigation = newNavigation;
    
    // Set the active class for this page
    const pageIdentifier = page.name.replace('.html', '');
    activeNavigation = activeNavigation.replace(`href="#${pageIdentifier}" class="horizontal-nav-item"`, `href="#${pageIdentifier}" class="horizontal-nav-item active"`);
    
    const pageContent = `<!-- pages/${page.name} -->
${activeNavigation}

<div class="menu-container">
  <img src="${page.imgSrc}" alt="${page.title}" class="menu-svg" />
</div>
`;
    
    fs.writeFileSync(filePath, pageContent);
    console.log(`Created new page: ${page.name}`);
  }
});

console.log(`Updated navigation in ${updatedCount} pages`);
console.log('Navigation update complete!');