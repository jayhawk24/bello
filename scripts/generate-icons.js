/*
  Generates PWA PNG icons from the bellhop SVG.
  Outputs: public/icons/icon-192.png, public/icons/icon-512.png
*/
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

async function main() {
  const src = path.join(__dirname, '..', 'public', 'icons', 'bell.svg')
  const outDir = path.join(__dirname, '..', 'public', 'icons')
  if (!fs.existsSync(src)) {
    console.error('Source SVG not found:', src)
    process.exit(1)
  }
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const targets = [
    { file: 'icon-192.png', size: 192 },
    { file: 'icon-512.png', size: 512 },
  ]

  for (const t of targets) {
    const out = path.join(outDir, t.file)
    await sharp(src)
      .resize(t.size, t.size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(out)
    console.log('Generated', out)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
