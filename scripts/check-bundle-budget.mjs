/**
 * Post-build JavaScript budget check.
 * Pair with field data (CrUX, Search Console, RUM) — Lighthouse alone is not enough.
 */
import fs from 'node:fs'
import path from 'node:path'

const DIST_ASSETS = path.resolve('dist/assets')

/** gzip is what users transfer; raw size is a proxy when gzip is unavailable */
const BUDGETS_KB = {
  // Marketing entry + shared shell — target for Home / courses hub first visit
  marketingEntryMax: 420,
  // Heavy chunks must stay out of the entry graph (checked separately)
  vendorTfMax: 2500,
  vendorMatterMax: 400,
  vendorCodemirrorMax: 500,
  vendorHlsMax: 550,
  adminMax: 1800,
  explorationLabsMax: 1200,
  codeLabMax: 900,
}

function kb(bytes) {
  return Math.round(bytes / 1024)
}

function listJsAssets() {
  if (!fs.existsSync(DIST_ASSETS)) {
    console.error('[bundle-budget] dist/assets not found — run vite build first')
    process.exit(1)
  }
  return fs
    .readdirSync(DIST_ASSETS)
    .filter((f) => f.endsWith('.js'))
    .map((f) => {
      const full = path.join(DIST_ASSETS, f)
      const stat = fs.statSync(full)
      return { name: f, bytes: stat.size, kb: kb(stat.size) }
    })
    .sort((a, b) => b.bytes - a.bytes)
}

function chunkGroup(name) {
  if (name.startsWith('index-')) return 'marketingEntry'
  if (name.startsWith('vendor-tf')) return 'vendorTf'
  if (name.startsWith('vendor-matter')) return 'vendorMatter'
  if (name.startsWith('vendor-codemirror')) return 'vendorCodemirror'
  if (name.startsWith('vendor-hls')) return 'vendorHls'
  if (name.startsWith('admin')) return 'admin'
  if (name.startsWith('exploration-labs')) return 'explorationLabs'
  if (name.startsWith('code-lab')) return 'codeLab'
  return null
}

function main() {
  const assets = listJsAssets()
  const failures = []
  const seen = new Set()

  console.log('[bundle-budget] Top JS chunks (raw KB):')
  for (const asset of assets.slice(0, 15)) {
    console.log(`  ${asset.kb} KB  ${asset.name}`)
  }

  for (const asset of assets) {
    const group = chunkGroup(asset.name)
    if (!group || seen.has(group)) continue
    seen.add(group)
    const maxKb = BUDGETS_KB[`${group}Max`]
    if (maxKb && asset.kb > maxKb) {
      failures.push(`${group}: ${asset.kb} KB > ${maxKb} KB (${asset.name})`)
    }
  }

  const entry = assets.find((a) => a.name.startsWith('index-'))
  if (entry && entry.kb > BUDGETS_KB.marketingEntryMax) {
    failures.push(
      `marketingEntry: ${entry.kb} KB > ${BUDGETS_KB.marketingEntryMax} KB (${entry.name})`
    )
  }

  const indexHtml = path.resolve('dist/index.html')
  if (fs.existsSync(indexHtml)) {
    const html = fs.readFileSync(indexHtml, 'utf8')
    const heavyPreload = html.match(
      /modulepreload[^>]+(?:vendor-tf|exploration-labs|admin|code-lab|vendor-codemirror|vendor-hls)/g
    )
    if (heavyPreload?.length) {
      failures.push(`index.html modulepreloads heavy chunks (${heavyPreload.length})`)
    }
  }

  if (failures.length) {
    console.error('\n[bundle-budget] FAILED:')
    for (const f of failures) console.error(`  - ${f}`)
    console.error('\nReview with CrUX / Search Console / RUM before changing budgets.')
    process.exit(1)
  }

  console.log('\n[bundle-budget] OK')
  if (entry) {
    console.log(`  marketing entry: ${entry.kb} KB (budget ${BUDGETS_KB.marketingEntryMax} KB)`)
  }
  console.log('  Reminder: validate LCP/INP with field data, not Lighthouse alone.')
}

main()
