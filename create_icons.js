const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
let crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngBuffer(width, height, pixelDrawer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // Bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Non-interlaced

  function createChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const ihdrChunk = createChunk('IHDR', ihdr);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const color = pixelDrawer(x, y, width, height);
      rawData[pixelOffset] = color[0];     // R
      rawData[pixelOffset + 1] = color[1]; // G
      rawData[pixelOffset + 2] = color[2]; // B
      rawData[pixelOffset + 3] = color[3]; // A
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function drawInvoiceIcon(x, y, w, h) {
  // Normalize coordinates to 0..1
  const nx = x / w;
  const ny = y / h;

  // Background: Deep Navy #0b1329 with subtle gradient towards center
  const distFromCenter = Math.hypot(nx - 0.5, ny - 0.5);
  let bgR = 11 + Math.floor((1 - distFromCenter) * 15);
  let bgG = 19 + Math.floor((1 - distFromCenter) * 25);
  let bgB = 41 + Math.floor((1 - distFromCenter) * 45);

  // Rounded icon container border (optional for circle/squircle)
  // Invoice Sheet Dimensions: [0.22, 0.16] to [0.78, 0.84]
  const docLeft = 0.22;
  const docRight = 0.78;
  const docTop = 0.16;
  const docBottom = 0.84;
  const docCornerFold = 0.16; // Folded corner size

  // Document Shadow
  if (nx >= docLeft + 0.02 && nx <= docRight + 0.04 && ny >= docTop + 0.03 && ny <= docBottom + 0.04) {
    bgR = Math.max(0, bgR - 15);
    bgG = Math.max(0, bgG - 20);
    bgB = Math.max(0, bgB - 25);
  }

  // Inside Invoice Document
  if (nx >= docLeft && nx <= docRight && ny >= docTop && ny <= docBottom) {
    // Check top-right folded corner cut
    const isTopRightCorner = (nx > docRight - docCornerFold) && (ny < docTop + docCornerFold);
    const cornerCut = (nx - (docRight - docCornerFold)) + ((docTop + docCornerFold) - ny);

    if (isTopRightCorner && cornerCut > docCornerFold) {
      // Top right folded corner triangle (turned over)
      if (cornerCut < docCornerFold * 1.05) {
        return [203, 213, 225, 255]; // Fold line border #cbd5e1
      }
      return [226, 232, 240, 255]; // Fold triangle fill #e2e8f0
    }

    // Header bar on invoice sheet (0.22 -> 0.78, top 0.16 to 0.32)
    if (ny >= docTop && ny <= 0.32) {
      // If within folded area
      if (isTopRightCorner && cornerCut > docCornerFold) {
        return [226, 232, 240, 255];
      }
      // Top blue header banner #0284c7 -> #0369a1
      const isTopDocBorder = (ny <= docTop + 0.02 || nx <= docLeft + 0.02 || (nx >= docRight - 0.02 && !isTopRightCorner));
      return [2, 132, 199, 255];
    }

    // Letter "M" or Invoice Header Badge inside the top header (ny 0.20 to 0.28, nx 0.28 to 0.38)
    if (ny >= 0.20 && ny <= 0.28 && nx >= 0.28 && nx <= 0.38) {
      return [255, 255, 255, 255]; // White badge
    }

    // Top Header Title Lines (ny 0.21 to 0.23, nx 0.43 to 0.62)
    if (ny >= 0.21 && ny <= 0.23 && nx >= 0.43 && nx <= 0.62) {
      return [224, 242, 254, 255]; // Light cyan line #e0f2fe
    }
    if (ny >= 0.25 && ny <= 0.27 && nx >= 0.43 && nx <= 0.55) {
      return [186, 230, 253, 255]; // Light cyan sub-line
    }

    // Document Body Background: Pure Crisp White #ffffff
    // Invoice Table Lines:
    // Row 1: nx 0.28 to 0.72, ny 0.38 to 0.42
    if (ny >= 0.38 && ny <= 0.41 && nx >= 0.28 && nx <= 0.72) {
      return [241, 245, 249, 255]; // Light table header #f1f5f9
    }
    if (ny >= 0.39 && ny <= 0.40 && nx >= 0.30 && nx <= 0.52) {
      return [100, 116, 139, 255]; // Table header text line #64748b
    }

    // Line 1 (Product Row)
    if (ny >= 0.46 && ny <= 0.48 && nx >= 0.28 && nx <= 0.58) {
      return [148, 163, 184, 255]; // Product line #94a3b8
    }
    if (ny >= 0.46 && ny <= 0.48 && nx >= 0.64 && nx <= 0.72) {
      return [15, 23, 42, 255]; // Price line #0f172a
    }

    // Line 2 (Product Row)
    if (ny >= 0.53 && ny <= 0.55 && nx >= 0.28 && nx <= 0.52) {
      return [203, 213, 225, 255]; // Product line #cbd5e1
    }
    if (ny >= 0.53 && ny <= 0.55 && nx >= 0.64 && nx <= 0.72) {
      return [15, 23, 42, 255]; // Price line
    }

    // Line 3 (Product Row)
    if (ny >= 0.60 && ny <= 0.62 && nx >= 0.28 && nx <= 0.48) {
      return [203, 213, 225, 255]; // Product line
    }
    if (ny >= 0.60 && ny <= 0.62 && nx >= 0.64 && nx <= 0.72) {
      return [15, 23, 42, 255]; // Price line
    }

    // Divider Line
    if (ny >= 0.66 && ny <= 0.67 && nx >= 0.28 && nx <= 0.72) {
      return [226, 232, 240, 255]; // Border #e2e8f0
    }

    // Total Highlight Box (ny 0.70 to 0.78, nx 0.45 to 0.72)
    if (ny >= 0.70 && ny <= 0.78 && nx >= 0.42 && nx <= 0.72) {
      return [2, 132, 199, 255]; // Vibrant Blue Total Box #0284c7
    }
    // White Total text line inside box
    if (ny >= 0.73 && ny <= 0.75 && nx >= 0.46 && nx <= 0.68) {
      return [255, 255, 255, 255];
    }

    // QR Code / Stamp emblem on bottom left (ny 0.69 to 0.79, nx 0.28 to 0.38)
    if (ny >= 0.70 && ny <= 0.78 && nx >= 0.28 && nx <= 0.38) {
      const qx = Math.floor((nx - 0.28) * 40);
      const qy = Math.floor((ny - 0.70) * 40);
      if ((qx + qy) % 2 === 0 || (qx === 0 || qx === 3 || qy === 0 || qy === 3)) {
        return [16, 185, 129, 255]; // Emerald green QR/Stamp accent #10b981
      }
      return [240, 253, 244, 255];
    }

    return [255, 255, 255, 255]; // White sheet fill
  }

  // Outer icon border
  return [bgR, bgG, bgB, 255];
}

function drawSplashScreen(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Background: Rich Deep Navy Slate #0b1329
  const distFromCenter = Math.hypot(nx - 0.5, ny - 0.5);
  let r = 11 + Math.floor((1 - distFromCenter) * 12);
  let g = 19 + Math.floor((1 - distFromCenter) * 20);
  let b = 41 + Math.floor((1 - distFromCenter) * 35);

  // Center emblem box: 160x160 relative
  const boxW = Math.min(0.4, 240 / w);
  const boxH = Math.min(0.3, 240 / h);
  const left = 0.5 - boxW / 2;
  const right = 0.5 + boxW / 2;
  const top = 0.45 - boxH / 2;
  const bottom = 0.45 + boxH / 2;

  if (nx >= left && nx <= right && ny >= top && ny <= bottom) {
    const iconX = (nx - left) / boxW;
    const iconY = (ny - top) / boxH;
    return drawInvoiceIcon(iconX * 100, iconY * 100, 100, 100);
  }

  // Subtle accent bar below emblem
  if (ny >= 0.63 && ny <= 0.635 && nx >= 0.35 && nx <= 0.65) {
    return [2, 132, 199, 255];
  }

  return [r, g, b, 255];
}

// Generate all required icons & splash screens
console.log('Generating crisp invoice app icons and splash screens...');

const webAssetsDir = path.join(__dirname, 'app', 'assets');
if (!fs.existsSync(webAssetsDir)) fs.mkdirSync(webAssetsDir, { recursive: true });

// 1. Web / PWA icons
fs.writeFileSync(path.join(webAssetsDir, 'icon-192.png'), createPngBuffer(192, 192, drawInvoiceIcon));
fs.writeFileSync(path.join(webAssetsDir, 'icon-512.png'), createPngBuffer(512, 512, drawInvoiceIcon));
console.log('Created web icons in app/assets/');

// 2. Android Mipmap Icons
const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

const mipmaps = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

mipmaps.forEach(m => {
  const targetDir = path.join(resDir, m.dir);
  if (fs.existsSync(targetDir)) {
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), createPngBuffer(m.size, m.size, drawInvoiceIcon));
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), createPngBuffer(m.size, m.size, drawInvoiceIcon));
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), createPngBuffer(m.size, m.size, drawInvoiceIcon));
    console.log(`Updated Android launcher icons in ${m.dir} (${m.size}x${m.size})`);
  }
});

// 3. Android Splash Screens
const splashes = [
  { file: 'drawable/splash.png', w: 480, h: 800 },
  { file: 'drawable-port-mdpi/splash.png', w: 320, h: 480 },
  { file: 'drawable-port-hdpi/splash.png', w: 480, h: 800 },
  { file: 'drawable-port-xhdpi/splash.png', w: 720, h: 1280 },
  { file: 'drawable-port-xxhdpi/splash.png', w: 960, h: 1600 },
  { file: 'drawable-port-xxxhdpi/splash.png', w: 1280, h: 1920 },
  { file: 'drawable-land-mdpi/splash.png', w: 480, h: 320 },
  { file: 'drawable-land-hdpi/splash.png', w: 800, h: 480 },
  { file: 'drawable-land-xhdpi/splash.png', w: 1280, h: 720 },
  { file: 'drawable-land-xxhdpi/splash.png', w: 1600, h: 960 },
  { file: 'drawable-land-xxxhdpi/splash.png', w: 1920, h: 1280 },
];

splashes.forEach(s => {
  const targetPath = path.join(resDir, s.file);
  const dirName = path.dirname(targetPath);
  if (fs.existsSync(dirName)) {
    fs.writeFileSync(targetPath, createPngBuffer(s.w, s.h, drawSplashScreen));
    console.log(`Updated Splash screen ${s.file} (${s.w}x${s.h})`);
  }
});

console.log('✅ All icons and splash screens successfully generated!');
