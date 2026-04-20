import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync('public/icon.svg')

async function render(filename, size, { pad = 0 } = {}) {
  const inner = size - pad * 2
  const innerBuf = await sharp(svg).resize(inner, inner).png().toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
    .composite([{ input: innerBuf, top: pad, left: pad }])
    .png()
    .toFile(`public/${filename}`)
  console.log(`wrote public/${filename}`)
}

await render('icon-192.png', 192)
await render('icon-512.png', 512)
await render('apple-touch-icon.png', 180)
// Maskable needs ~10% padding so the safe zone (inner 80%) contains the flags.
await render('icon-maskable-512.png', 512, { pad: 52 })
