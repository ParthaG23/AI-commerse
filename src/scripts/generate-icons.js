const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const svgPath = path.join(__dirname, '../../public/favicon.svg');
const publicDir = path.join(__dirname, '../../public');

async function main() {
  console.log('Reading favicon.svg...');
  if (!fs.existsSync(svgPath)) {
    console.error('Error: favicon.svg not found at', svgPath);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // Sizes to generate as separate files
  const filesToGen = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'logo-192x192.png', size: 192 },
    { name: 'logo-512x512.png', size: 512 },
    { name: 'logo.png', size: 512 }
  ];

  for (const item of filesToGen) {
    const dest = path.join(publicDir, item.name);
    console.log(`Generating ${item.name} (${item.size}x${item.size})...`);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(dest);
  }

  // Generate multi-resolution favicon.ico
  console.log('Generating multi-resolution favicon.ico (16x16, 32x32, 48x48)...');
  const size16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const size32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const size48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = createIco([size16, size32, size48], [16, 32, 48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Successfully generated all favicons!');
}

/**
 * Creates a valid ICO buffer from a list of PNG buffers and their sizes.
 */
function createIco(pngBuffers, sizes) {
  const headerSize = 6;
  const directorySize = 16 * pngBuffers.length;
  
  // Calculate total size
  let totalSize = headerSize + directorySize;
  for (const buf of pngBuffers) {
    totalSize += buf.length;
  }

  const buffer = Buffer.alloc(totalSize);

  // 1. Write Header
  buffer.writeUInt16LE(0, 0);  // Reserved
  buffer.writeUInt16LE(1, 2);  // Image Type (1 for ICO)
  buffer.writeUInt16LE(pngBuffers.length, 4); // Number of images

  // 2. Write Directory entries and 3. Copy image data
  let currentOffset = headerSize + directorySize;

  for (let i = 0; i < pngBuffers.length; i++) {
    const png = pngBuffers[i];
    const size = sizes[i];
    const entryOffset = headerSize + i * 16;

    // Directory entry:
    buffer.writeUInt8(size >= 256 ? 0 : size, entryOffset + 0);      // Width
    buffer.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);      // Height
    buffer.writeUInt8(0, entryOffset + 2);                          // Color palette (0 = no palette)
    buffer.writeUInt8(0, entryOffset + 3);                          // Reserved
    buffer.writeUInt16LE(1, entryOffset + 4);                       // Color planes (1)
    buffer.writeUInt16LE(32, entryOffset + 6);                      // Bits per pixel (32 bit for PNG)
    buffer.writeUInt32LE(png.length, entryOffset + 8);              // Size of image data
    buffer.writeUInt32LE(currentOffset, entryOffset + 12);          // Offset of image data

    // Copy PNG bytes into target buffer
    png.copy(buffer, currentOffset);
    currentOffset += png.length;
  }

  return buffer;
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
