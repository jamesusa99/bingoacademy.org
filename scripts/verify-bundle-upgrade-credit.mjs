import { computeUpgradeDueCents } from '../server/lib/bundleUpgradeCredit.mjs'

const cases = [
  { name: 'modules then full track', list: 299000, credit: 21700, due: 277300 },
  { name: 'credits equal list', list: 299000, credit: 299000, due: 0 },
  { name: 'credits exceed list', list: 299000, credit: 400000, due: 0 },
  { name: 'no credits', list: 299000, credit: 0, due: 299000 },
  { name: 'remainder below Stripe minimum', list: 299000, credit: 298960, due: 0 },
  { name: 'negative credit ignored', list: 9900, credit: -500, due: 9900 },
]

let failed = 0
for (const row of cases) {
  const result = computeUpgradeDueCents(row.list, row.credit, 'usd')
  const ok = result.amountCents === row.due
  if (!ok) {
    failed += 1
    console.error(`FAIL ${row.name}: expected due ${row.due}, got ${result.amountCents}`, result)
  } else {
    console.log(`ok ${row.name}: due ${result.amountCents} (credit ${result.creditCents})`)
  }
}

if (failed) {
  process.exit(1)
}

console.log(`verify-bundle-upgrade-credit: ${cases.length} cases passed`)
