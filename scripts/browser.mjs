import { chromium } from '@playwright/test';
import Chromium from '@sparticuz/chromium';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

// The npm-distributed headless browser also works in minimal Linux sandboxes.
// Unpack its bundled NSS libraries when the host does not provide them.
export async function launchBrowser() {
  const require = createRequire(import.meta.url);
  const packageRoot = path.resolve(path.dirname(require.resolve('@sparticuz/chromium')), '..');
  const libraryRoot = path.resolve('.cache/chromium-libs');
  const archive = path.join(packageRoot, 'bin/al2023.tar.br');
  let libraryPath = process.env.LD_LIBRARY_PATH || '';
  if (process.platform === 'linux' && fs.existsSync(archive)) {
    fs.mkdirSync(libraryRoot, { recursive: true });
    if (!fs.existsSync(path.join(libraryRoot, 'lib/libnspr4.so'))) {
      const tar = path.join(libraryRoot, 'libraries.tar');
      fs.writeFileSync(tar, zlib.brotliDecompressSync(fs.readFileSync(archive)));
      execFileSync('tar', ['xf', tar, '-C', libraryRoot]);
      fs.unlinkSync(tar);
    }
    libraryPath = `${libraryRoot}/lib:${libraryPath}`;
  }
  return chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || await Chromium.executablePath(),
    args: [...Chromium.args, '--enable-unsafe-swiftshader'],
    env: { ...process.env, LD_LIBRARY_PATH: libraryPath },
    headless: true,
  });
}
