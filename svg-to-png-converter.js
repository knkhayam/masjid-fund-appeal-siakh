const fs = require('fs');
const puppeteer = require('puppeteer');

async function convertSvgToPng() {
  // Read the SVG file
  const svgContent = fs.readFileSync('og-progress.svg', 'utf8');
  
  // Launch browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to match the SVG dimensions
  await page.setViewport({ width: 1200, height: 630 });
  
  // Set the SVG content as the page content
  await page.setContent(svgContent);
  
  // Take screenshot
  const screenshot = await page.screenshot({
    type: 'png',
    omitBackground: false
  });
  
  // Save the PNG
  fs.writeFileSync('og-progress.png', screenshot);
  
  await browser.close();
  
  console.log('SVG converted to PNG successfully!');
}

// Run the conversion
convertSvgToPng().catch(console.error); 