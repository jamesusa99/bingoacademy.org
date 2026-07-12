#!/usr/bin/env node
/**
 * Post-build SEO prerender — writes per-route index.html into dist/
 * so crawlers and social preview bots receive correct meta + body without JS.
 */
import '../server/lib/loadEnv.mjs'
import path from 'path'
import { fileURLToPath } from 'url'
import { prerenderToDist } from '../server/lib/seo/spaHandler.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '../dist')

async function main() {
  console.log('[prerender-seo] Starting post-build SEO prerender…')
  const { written, paths } = await prerenderToDist(distPath)
  console.log(`[prerender-seo] Wrote ${written} pages:`)
  for (const p of paths) {
    console.log(`  ${p}`)
  }
}

main().catch((err) => {
  console.error('[prerender-seo] Failed:', err)
  process.exit(1)
})
