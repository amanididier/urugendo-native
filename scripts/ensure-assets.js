/**
 * Run from repo root: node scripts/ensure-assets.js
 * Creates minimal PNG icons if missing so Expo can start.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crc]);
}

function png(w, h, r = 22, g = 163, b = 74) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(1 + w * 3);
    for (let x = 0; x < w; x++) {
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = b;
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const files = {
    'icon.png': 128,
    'splash-icon.png': 128,
    'favicon.png': 48,
    'android-icon-foreground.png': 128,
    'android-icon-background.png': 128,
    'android-icon-monochrome.png': 128,
  };
  for (const [name, size] of Object.entries(files)) {
    const p = path.join(dir, name);
    if (!fs.existsSync(p) || fs.statSync(p).size < 50) {
      fs.writeFileSync(p, png(size, size));
      console.log('created', p);
    } else {
      console.log('ok', p);
    }
  }
}

ensure(path.join(__dirname, '../apps/passenger/assets'));
ensure(path.join(__dirname, '../apps/agency/assets'));
console.log('Done. Restart Expo: npx expo start -c');
