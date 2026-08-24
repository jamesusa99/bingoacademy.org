import { commissionCentsFromSale } from '../server/lib/channels.mjs'

const cases = [
  { sale: 299000, bps: 0, expect: 0 },
  { sale: 299000, bps: 1500, expect: 44850 },
  { sale: 21700, bps: 1000, expect: 2170 },
  { sale: 100, bps: 3333, expect: 33 },
]

let failed = 0
for (const row of cases) {
  const got = commissionCentsFromSale(row.sale, row.bps)
  if (got !== row.expect) {
    failed += 1
    console.error(`FAIL sale=${row.sale} bps=${row.bps}: expected ${row.expect}, got ${got}`)
  } else {
    console.log(`ok sale=${row.sale} @ ${row.bps}bps → ${got}`)
  }
}

if (failed) process.exit(1)
console.log(`verify-channel-commission: ${cases.length} cases passed`)
