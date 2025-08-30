const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const menuPages = [
  'gourmet-burgers.html',
  'wraps.html',
  'sides.html',
  'pasta.html',
  'main-course.html',
  'chinese.html',
  'og-momos.html',
  'cold-beverages.html',
  'hot-beverages.html',
  'desserts.html',
  'indian.html'
];

// Fix SVG paths in all menu pages
menuPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the SVG path by adding './' prefix if not already present
  const imgMatch = content.match(/<img src="([^"]+)" alt="[^"]+" class="menu-svg" \/>/i);
  if (imgMatch) {
    const imgSrc = imgMatch[1];
    const altText = imgMatch[0].match(/alt="([^"]+)"/i)[1];
    
    // Check if the path already starts with './' or '/'
    if (!imgSrc.startsWith('./') && !imgSrc.startsWith('/')) {
      // Replace the img tag with one that has the correct path
      const newImgTag = `<img src="./${imgSrc}" alt="${altText}" class="menu-svg" />`;
      content = content.replace(imgMatch[0], newImgTag);
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Updated SVG path in ${page}`);
    } else {
      console.log(`SVG path in ${page} already correct`);
    }
  } else {
    console.log(`No SVG image found in ${page}`);
  }
  
  // Also fix the desserts link (was incorrectly spelled as 'deserts' in some files)
  if (content.includes('deserts')) {
    content = content.replace(/href="#deserts"/g, 'href="#desserts"');
    content = content.replace(/class="horizontal-nav-item">Deserts/g, 'class="horizontal-nav-item">Desserts');
    fs.writeFileSync(filePath, content);
    console.log(`Fixed desserts spelling in ${page}`);
  }
});

console.log('All menu pages updated successfully!');

// Also update the class for any existing menu-content-img to menu-svg
menuPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace menu-content-img with menu-svg
  const updatedContent = content.replace(/class="menu-content-img"/g, 'class="menu-svg"');
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated class in ${page}`);
  }
});
