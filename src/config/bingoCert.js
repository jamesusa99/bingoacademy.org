/** Bingo Academy — certificate issuing (current production policy) */

export const BINGO_ACADEMY_NAME = 'Bingo Academy'
export const BINGO_ACADEMY_NAME_EN = 'Bingo Academy'

export const CERT_ISSUER = {
  name: BINGO_ACADEMY_NAME,
  nameEn: BINGO_ACADEMY_NAME_EN,
  tagline: 'Certificates issued by Bingo Academy — verify online or by QR code',
  verifyHint: 'Enter certificate number and full name, or scan the QR code on the certificate',
  footer: 'Bingo Academy · Certification & competition pathways',
}

export const CERT_ISSUING_CENTRES = [
  {
    name: BINGO_ACADEMY_NAME,
    nameEn: BINGO_ACADEMY_NAME_EN,
    region: 'Nationwide',
    type: 'Issuing organisation',
    desc: 'Learner capability certificates, competition prep credentials, and milestone learning credentials are printed and numbered by Bingo Academy.',
  },
]

export const CERT_PORTAL = {
  bannerTitle: 'Bingo Academy · Certification Center',
  verifyIssuingOrg: 'Issuing organisation',
  issuingNoticeTitle: 'Certificate issuance',
  issuingNoticeBody:
    'Learner capability certificates, milestone learning credentials, and competition prep credentials are issued and numbered by Bingo Academy. Verify on the official site or by QR code. Future co-branded stamps from partner schools or associations will be announced separately.',
  issuingCentresLabel: 'Issuing organisations',
}
