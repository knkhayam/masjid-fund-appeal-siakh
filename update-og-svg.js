const fs = require('fs');

// Read the JSON files
const contributions = JSON.parse(fs.readFileSync('contributions.json', 'utf8'));
const expenses = JSON.parse(fs.readFileSync('expenses.json', 'utf8'));

// Calculate totals
const totalRaised = contributions.reduce((sum, c) => sum + c.amount, 0);
const totalTarget = expenses.reduce((sum, e) => sum + e.price, 0);
const percentage = Math.min(100, (totalRaised / totalTarget) * 100);

// Calculate SVG circle properties
const radius = 120;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference - (percentage / 100) * circumference;

// Format amounts for display
const formatPKR = (num) => {
  return num.toLocaleString('en-PK', { 
    style: 'currency', 
    currency: 'PKR', 
    maximumFractionDigits: 0 
  }).replace('PKR', 'PKR ');
};

// Generate the SVG content
const svgContent = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#111111"/>
  
  <!-- Header -->
  <text x="600" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FFD700">
    MASJID FUNDRAISER APPEAL
  </text>
  
  <!-- Subtitle -->
  <text x="600" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#FFFFFF">
    Government Pilot Secondary School SIAKH
  </text>
  
  <!-- Progress Circle -->
  <g transform="translate(600, 350)">
    <!-- Background circle -->
    <circle cx="0" cy="0" r="${radius}" fill="none" stroke="#333333" stroke-width="20"/>
    
    <!-- Progress circle -->
    <circle cx="0" cy="0" r="${radius}" fill="none" stroke="#FFD700" stroke-width="20" 
            stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round">
      <animate attributeName="stroke-dashoffset" from="${circumference}" to="${strokeDashoffset}" dur="2s" fill="freeze"/>
    </circle>
    
    <!-- Progress text -->
    <text x="0" y="-20" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#FFD700">
      ${Math.round(percentage)}%
    </text>
    <text x="0" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF">
      Complete
    </text>
  </g>
  
  <!-- Amount raised -->
  <text x="600" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#FFFFFF">
    Raised: ${formatPKR(totalRaised)} / ${formatPKR(totalTarget)}
  </text>
  
  <!-- Quote -->
  <text x="600" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#CCCCCC" font-style="italic">
    "Whoever builds a masjid for Allah, Allah will build for him a house like it in Paradise"
  </text>
</svg>`;

// Write the updated SVG
fs.writeFileSync('og-progress.svg', svgContent);

console.log(`Updated SVG with ${Math.round(percentage)}% progress`);
console.log(`Raised: ${formatPKR(totalRaised)} / ${formatPKR(totalTarget)}`); 