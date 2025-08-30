/**
 * Fix Desserts Spelling Script
 * This script corrects all instances of 'deserts' to 'desserts' in menu pages
 */

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');

// Get all HTML files in the pages directory
const menuPages = fs.readdirSync(pagesDir)
  .filter(file => file.endsWith('.html'));

let fixedCount = 0;

// Process each menu page
menuPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file contains the misspelled 'deserts'
  if (content.includes('href="#deserts"') || content.includes('Deserts</a>')) {
    // Replace all instances of the misspelled 'deserts' with 'desserts'
    const oldContent = content;
    content = content.replace(/href="#deserts"/g, 'href="#desserts"');
    content = content.replace(/class="horizontal-nav-item">Deserts/g, 'class="horizontal-nav-item">Desserts');
    
    // Only write to the file if changes were made
    if (content !== oldContent) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(`Fixed desserts spelling in ${page}`);
    }
  }
});

console.log(`Fixed desserts spelling in ${fixedCount} files`);
console.log('All desserts spelling corrections complete!');