const fs = require('fs');
const { createCanvas, registerFont } = require('canvas');

// Read the JSON files
const contributions = JSON.parse(fs.readFileSync('contributions.json', 'utf8'));
const expenses = JSON.parse(fs.readFileSync('expenses.json', 'utf8'));

// Calculate totals
const totalRaised = contributions.reduce((sum, c) => sum + c.amount, 0);
const totalTarget = 6500000;//expenses.reduce((sum, e) => sum + e.price, 0);
const percentage = Math.min(100, (totalRaised / totalTarget) * 100);

// Format amounts for display
const formatPKR = (num) => {
  return num.toLocaleString('en-PK', { 
    style: 'currency', 
    currency: 'PKR', 
    maximumFractionDigits: 0 
  }).replace('PKR', 'PKR ');
};

// Create canvas
const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Set background
ctx.fillStyle = '#111111';
ctx.fillRect(0, 0, width, height);

// Helper function to draw text with stroke
function drawTextWithStroke(text, x, y, fontSize, fontColor, strokeColor, strokeWidth = 2) {
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.strokeText(text, x, y);
  
  // Draw fill
  ctx.fillStyle = fontColor;
  ctx.fillText(text, x, y);
}

// Draw header
drawTextWithStroke('MASJID FUNDRAISER APPEAL', width/2, 80, 48, '#FFD700', '#000000', 3);

// Draw subtitle
ctx.font = '24px Arial, sans-serif';
ctx.fillStyle = '#FFFFFF';
ctx.textAlign = 'center';
ctx.fillText('Government Pilot Secondary School SIAKH', width/2, 130);

// Draw progress circle
const centerX = width/2;
const centerY = 350;
const radius = 120;
const startAngle = -Math.PI / 2; // Start from top
const endAngle = startAngle + (2 * Math.PI * percentage / 100);

// Draw background circle
ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
ctx.strokeStyle = '#333333';
ctx.lineWidth = 20;
ctx.stroke();

// Draw progress circle
if (percentage > 0) {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// Draw percentage text
drawTextWithStroke(`${Math.round(percentage)}%`, centerX, centerY - 20, 32, '#FFD700', '#000000', 2);

// Draw "Complete" text
ctx.font = '18px Arial, sans-serif';
ctx.fillStyle = '#FFFFFF';
ctx.fillText('Complete', centerX, centerY + 20);

// Draw amount raised
ctx.font = '28px Arial, sans-serif';
ctx.fillStyle = '#FFFFFF';
ctx.fillText(`Raised: ${formatPKR(totalRaised)} / ${formatPKR(totalTarget)}`, width/2, 520);

// Draw quote
ctx.font = '16px Arial, sans-serif';
ctx.fillStyle = '#CCCCCC';
ctx.fontStyle = 'italic';
ctx.fillText('"Whoever builds a masjid for Allah, Allah will build for him a house like it in Paradise"', width/2, 580);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('og-progress.png', buffer);

console.log(`Updated PNG with ${Math.round(percentage)}% progress`);
console.log(`Raised: ${formatPKR(totalRaised)} / ${formatPKR(totalTarget)}`); 