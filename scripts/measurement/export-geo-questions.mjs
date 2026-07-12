/**
 * Export GEO question test set as CSV for monthly citation scoring.
 * Run: node scripts/measurement/export-geo-questions.mjs > geo-questions.csv
 */
import { GEO_QUESTION_TEST_SET } from '../../src/config/measurement/geoKpis.js'

const headers = [
  'audience',
  'question_id',
  'question',
  'cited_bingo_academy',
  'citation_url',
  'accuracy_ok',
  'failure_tags',
  'engine',
  'review_date',
]

console.log(headers.join(','))

let id = 1
for (const group of Object.values(GEO_QUESTION_TEST_SET)) {
  for (const question of group.questions) {
    const row = [
      group.audience,
      id++,
      `"${question.replace(/"/g, '""')}"`,
      '',
      '',
      '',
      '',
      '',
      '',
    ]
    console.log(row.join(','))
  }
}
