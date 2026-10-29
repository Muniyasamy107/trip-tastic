#!/usr/bin/env node
/**
 * One-command launcher for the Trip Tastic site.
 *
 *   node scripts/launch.mjs            # dev server on the first free port from 3000
 *   node scripts/launch.mjs --port 5180
 *
 * It picks a free port before Vite starts (so a stray server from another project can
 * never block you), boots Vite, waits for the real "Local:" URL in the output and then
 * opens your default browser on exactly that URL — no guessing, no port errors.
 */
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { platform } from 'node:os'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
process.chdir(root)

if (!existsSync(path.join(root, 'node_modules'))) {
  console.log('\n  node_modules kaanom — npm install run pandren (first time mattum)…\n')
  const install = spawnSync(platform() === 'win32' ? 'npm.cmd' : 'npm', ['install'], {
    stdio: 'inherit',
    shell: platform() === 'win32',
  })
  if (install.status !== 0) {
    console.error('\n  [X] npm install fail aachu. Node 20+ install aagirukkaa check pannunga.\n')
    process.exit(1)
  }
}

const args = process.argv.slice(2)
const portArg = args.indexOf('--port')
const preferred = Number(portArg !== -1 ? args[portArg + 1] : process.env.PORT || 3000)

const FREE = (port) =>
  new Promise((resolve) => {
    const probe = createServer()
    probe.once('error', () => resolve(false))
    probe.once('listening', () => probe.close(() => resolve(true)))
    probe.listen(port, '0.0.0.0')
  })

async function pickPort(start, tries = 20) {
  for (let port = start; port < start + tries; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (await FREE(port)) return port
  }
  return 0 // hand over to Vite's own auto-pick
}

function openBrowser(url) {
  const cmd =
    platform() === 'win32'
      ? ['cmd', ['/c', 'start', '', url]]
      : platform() === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]]
  try {
    const opener = spawn(cmd[0], cmd[1], { stdio: 'ignore', detached: true })
    // A missing opener (headless Linux, locked-down Windows) must never take the server down.
    opener.on('error', () => {
      console.log(`  (Browser auto-open skip — ${url} manually open pannunga.)`)
    })
    opener.unref()
  } catch {
    /* browser open is a nicety — never fatal */
  }
}

const port = (await pickPort(preferred)) || preferred
const npx = platform() === 'win32' ? 'npx.cmd' : 'npx'

console.log(`\n  Trip Tastic — starting the dev server on port ${port} …\n`)

const child = spawn(npx, ['vite', '--host', '0.0.0.0', '--port', String(port)], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: platform() === 'win32',
  env: { ...process.env, FORCE_COLOR: '1' },
})

let opened = false
const stripAnsi = (s) => s.replace(/\u001b\[[0-9;]*m/g, '')
const watch = (buf) => {
  const text = buf.toString()
  process.stdout.write(text)
  const match = stripAnsi(text).match(/https?:\/\/(?:localhost|[\d.]+):(\d+)\//)
  if (!opened && match) {
    opened = true
    const url = `http://localhost:${match[1]}/`
    setTimeout(() => openBrowser(url), 600)
    console.log(`\n  Website ready → ${url}`)
    console.log('  Stop panna: Ctrl + C\n')
  }
}

child.stdout.on('data', watch)
child.stderr.on('data', (buf) => process.stderr.write(buf))
child.on('close', (code) => process.exit(code ?? 0))

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}
