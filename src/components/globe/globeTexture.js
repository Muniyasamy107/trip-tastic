import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/* Tiny deterministic value-noise field, used to "draw" continent-ish  */
/* landmasses onto a canvas so the globe needs zero external assets.   */
/* ------------------------------------------------------------------ */

const hash = (x, y, z) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123
  return n - Math.floor(n)
}

const smooth = (t) => t * t * (3 - 2 * t)
const lerp = (a, b, t) => a + (b - a) * t

function noise3(x, y, z) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const u = smooth(x - xi)
  const v = smooth(y - yi)
  const w = smooth(z - zi)
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz)

  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), u)
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), u)
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), u)
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), u)

  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w)
}

function fbm(x, y, z) {
  let sum = 0
  let amp = 0.55
  let freq = 1
  for (let i = 0; i < 4; i += 1) {
    sum += amp * noise3(x * freq, y * freq, z * freq)
    freq *= 2.07
    amp *= 0.5
  }
  return sum
}

/** True when the sample point should render as "land". */
export function landAt(x, y, z) {
  const n = fbm(x * 2.6 + 4.2, y * 2.6 - 1.8, z * 2.6 + 9.1)
  return n > 0.56
}

/**
 * Lat/lon -> unit vector, matching three.js' SphereGeometry UV layout so the
 * procedural halftone continents and the arc/pin layer line up exactly.
 */
export function latLonToUnit(lat, lon) {
  const theta = ((90 - lat) * Math.PI) / 180
  const phi = ((lon + 180) * Math.PI) / 180
  return {
    x: -Math.sin(theta) * Math.cos(phi),
    y: Math.cos(theta),
    z: Math.sin(theta) * Math.sin(phi),
  }
}

export function isLand(lat, lon) {
  const p = latLonToUnit(lat, lon)
  return landAt(p.x, p.y, p.z)
}

let cached = null

export function getGlobeTexture() {
  if (cached) return cached

  const W = 1024
  const H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Deep ocean base with a subtle vertical gradient.
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#0d221d')
  grad.addColorStop(0.5, '#0f2a23')
  grad.addColorStop(1, '#0b1e1a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Halftone dots — green at the equator, warm ochre toward the poles.
  const step = 5
  for (let py = 0; py < H; py += step) {
    const v = 1 - (py + 0.5) / H
    const theta = v * Math.PI
    const lat = 90 - theta * (180 / Math.PI)
    for (let px = 0; px < W; px += step) {
      const u = (px + 0.5) / W
      const phi = u * Math.PI * 2
      const nx = -Math.sin(theta) * Math.cos(phi)
      const ny = Math.cos(theta)
      const nz = Math.sin(theta) * Math.sin(phi)
      if (!landAt(nx, ny, nz)) continue

      const polar = Math.min(Math.abs(lat) / 90, 1)
      const r = Math.round(lerp(150, 224, polar * 0.85))
      const g = Math.round(lerp(178, 158, polar * 0.6))
      const b = Math.round(lerp(96, 72, polar * 0.8))
      const alpha = 0.55 + 0.4 * (1 - polar)
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`
      ctx.beginPath()
      ctx.arc(px, py, 1.45, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Hairline graticule for the "instrument" feel.
  ctx.strokeStyle = 'rgba(233,166,58,0.10)'
  ctx.lineWidth = 1
  for (let i = 1; i < 12; i += 1) {
    const y = (H / 12) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  for (let i = 1; i < 24; i += 1) {
    const x = (W / 24) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  cached = texture
  return texture
}
