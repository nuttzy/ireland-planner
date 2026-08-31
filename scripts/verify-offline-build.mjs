import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const distDir = path.join(root, 'dist')
const workerPath = path.join(distDir, 'service-worker.js')
const maximumAssetBytes = 5 * 1024 * 1024
const runtimeExtensions = new Set([
  '.html', '.js', '.css', '.json', '.webmanifest', '.png', '.jpg', '.jpeg',
  '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf',
])

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filePath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(filePath) : [filePath]
  })
}

function relativeTo(directory, filePath) {
  return path.relative(directory, filePath).split(path.sep).join('/')
}

const errors = []
const places = JSON.parse(fs.readFileSync(path.join(root, 'src/data/places.json'), 'utf8'))

for (const place of places) {
  const imagePath = path.join(publicDir, place.image.replace(/^\//, ''))
  if (!fs.existsSync(imagePath)) {
    errors.push(`Missing image for ${place.id}: ${place.image}`)
  }
}

for (const filePath of walk(publicDir)) {
  if (/\.tiff?$/i.test(filePath)) {
    errors.push(`TIFF files cannot be part of the offline build: ${relativeTo(publicDir, filePath)}`)
  }
}

if (!fs.existsSync(workerPath)) {
  errors.push('dist/service-worker.js was not generated')
}

const workerSource = fs.existsSync(workerPath) ? fs.readFileSync(workerPath, 'utf8') : ''
const precachedUrls = new Set(
  [...workerSource.matchAll(/url\s*:\s*["']([^"']+)["']/g)].map(match => match[1])
)

const requiredFiles = fs.existsSync(distDir)
  ? walk(distDir).filter(filePath => {
      const relativePath = relativeTo(distDir, filePath)
      const extension = path.extname(filePath).toLowerCase()
      return runtimeExtensions.has(extension)
        && relativePath !== 'service-worker.js'
        && !relativePath.startsWith('workbox-')
    })
  : []

let totalBytes = 0
for (const filePath of requiredFiles) {
  const relativePath = relativeTo(distDir, filePath)
  const bytes = fs.statSync(filePath).size
  totalBytes += bytes

  if (bytes > maximumAssetBytes) {
    errors.push(`Asset exceeds 5 MiB precache limit: ${relativePath}`)
  }
  if (!precachedUrls.has(relativePath) && !precachedUrls.has(`/${relativePath}`)) {
    errors.push(`Asset is missing from the precache manifest: ${relativePath}`)
  }
}

if (errors.length > 0) {
  console.error('Offline build verification failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log(
  `Offline build verified: ${requiredFiles.length} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB precached.`
)
