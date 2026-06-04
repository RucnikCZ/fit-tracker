// Run with: node generate-icons.js
// Requires: npm install canvas
// Or just use the SVG icons directly in the browser

const { createCanvas } = require("canvas");
const fs = require("fs");

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0d0d0d";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.18);
  ctx.fill();

  // Yellow accent bar
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(size * 0.12, size * 0.72, size * 0.76, size * 0.06);

  // Text "FT"
  ctx.fillStyle = "#FFD700";
  ctx.font = `bold ${size * 0.48}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FT", size / 2, size * 0.44);

  return canvas.toBuffer("image/png");
}

for (const size of [192, 512]) {
  fs.writeFileSync(`icons/icon-${size}.png`, drawIcon(size));
  console.log(`Generated icons/icon-${size}.png`);
}
