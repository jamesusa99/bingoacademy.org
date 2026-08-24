/**
 * Profile Language + Country / region pickers.
 * Languages: English names A–Z (conventional for an English form).
 * Countries: ISO 3166-1 + common regions, sorted by English short name.
 */

function displayName(type, of, locales = ['en']) {
  try {
    return new Intl.DisplayNames(locales, { type }).of(of) || ''
  } catch {
    return ''
  }
}

/** BCP-47 tags for widely used languages. `zh` kept as Simplified so existing profiles still match. */
export const PROFILE_LANGUAGE_TAGS = [
  'af',
  'am',
  'ar',
  'az',
  'be',
  'bg',
  'bn',
  'bs',
  'ca',
  'cs',
  'cy',
  'da',
  'de',
  'el',
  'en',
  'es',
  'et',
  'eu',
  'fa',
  'fi',
  'fil',
  'fr',
  'ga',
  'gl',
  'gu',
  'he',
  'hi',
  'hr',
  'hu',
  'hy',
  'id',
  'is',
  'it',
  'ja',
  'ka',
  'kk',
  'km',
  'kn',
  'ko',
  'ky',
  'lo',
  'lt',
  'lv',
  'mk',
  'ml',
  'mn',
  'mr',
  'ms',
  'my',
  'ne',
  'nl',
  'no',
  'pa',
  'pl',
  'pt',
  'pt-BR',
  'ro',
  'ru',
  'si',
  'sk',
  'sl',
  'sq',
  'sr',
  'sv',
  'sw',
  'ta',
  'te',
  'th',
  'tr',
  'uk',
  'ur',
  'uz',
  'vi',
  'zh',
  'zh-Hant',
  'zu',
]

const LANGUAGE_LABEL_OVERRIDES = {
  bn: 'Bengali',
  zh: 'Chinese, Simplified',
  'zh-Hant': 'Chinese, Traditional',
  fil: 'Filipino',
  no: 'Norwegian',
  'pt-BR': 'Portuguese (Brazil)',
}

function languageLabelEnglish(tag) {
  return LANGUAGE_LABEL_OVERRIDES[tag] || displayName('language', tag, ['en']) || tag
}

export const PROFILE_LANGUAGES = PROFILE_LANGUAGE_TAGS.map((value) => {
  const english = languageLabelEnglish(value)
  const native = displayName('language', value, [value])
  const label = native && native.toLowerCase() !== english.toLowerCase() ? `${english} (${native})` : english
  return { value, label, sortKey: english }
}).sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'en', { sensitivity: 'base' }))

/**
 * UN members, observers, and common country/region entries (SARs, Kosovo, inhabited territories).
 * Uninhabited ISO codes (AQ, BV, GS, HM, IO, TF, UM) are omitted.
 */
export const PROFILE_COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ',
  'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET',
  'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GT', 'GU', 'GW', 'GY',
  'HK', 'HN', 'HR', 'HT', 'HU',
  'ID', 'IE', 'IL', 'IM', 'IN', 'IQ', 'IR', 'IS', 'IT',
  'JE', 'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
  'OM',
  'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
  'QA',
  'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
  'TC', 'TD', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'US', 'UY', 'UZ',
  'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU',
  'WF', 'WS',
  'XK',
  'YE', 'YT',
  'ZA', 'ZM', 'ZW',
]

const REGION_LABEL_OVERRIDES = {
  XK: 'Kosovo',
}

function countryLabel(code) {
  return REGION_LABEL_OVERRIDES[code] || displayName('region', code, ['en']) || code
}

export const PROFILE_COUNTRIES = PROFILE_COUNTRY_CODES.map((code) => ({
  value: code,
  label: countryLabel(code),
}))
  .filter((row) => row.label)
  .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }))

export function coerceProfileLocale(raw) {
  const value = String(raw || '').trim()
  if (!value) return 'en'
  if (PROFILE_LANGUAGES.some((row) => row.value === value)) return value
  const lower = value.toLowerCase()
  if (lower.startsWith('zh-hant') || lower.startsWith('zh-tw') || lower.startsWith('zh-hk') || lower.startsWith('zh-mo')) {
    return 'zh-Hant'
  }
  if (lower.startsWith('zh')) return 'zh'
  if (lower.startsWith('pt-br')) return 'pt-BR'
  const base = value.split(/[-_]/)[0]
  if (PROFILE_LANGUAGES.some((row) => row.value === base)) return base
  return value
}

export function coerceProfileCountry(raw) {
  const value = String(raw || '').trim()
  if (!value) return ''
  const upper = value.toUpperCase()
  if (PROFILE_COUNTRIES.some((row) => row.value === upper)) return upper
  const byLabel = PROFILE_COUNTRIES.find((row) => row.label.toLowerCase() === value.toLowerCase())
  return byLabel?.value || value
}

export function optionsWithCurrent(options, current) {
  if (!current || options.some((row) => row.value === current)) return options
  return [{ value: current, label: current }, ...options]
}
