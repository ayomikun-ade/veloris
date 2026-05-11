const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  CN: 'China',
  RU: 'Russia',
  IR: 'Iran',
  KP: 'North Korea',
  BR: 'Brazil',
  IN: 'India',
  DE: 'Germany',
  GB: 'United Kingdom',
  FR: 'France',
  NG: 'Nigeria',
  VN: 'Vietnam',
  ID: 'Indonesia',
  UA: 'Ukraine',
  PL: 'Poland',
  TR: 'Turkey',
}

/**
 * Convert ISO 3166-1 alpha-2 code to a flag emoji using regional indicator
 * symbols. Renders via the system emoji font in modern browsers.
 */
export function countryFlag(iso2: string): string {
  if (iso2.length !== 2) return '🌐'
  const upper = iso2.toUpperCase()
  const codePoints = [...upper].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65))
  return String.fromCodePoint(...codePoints)
}

export function countryName(iso2: string): string {
  return COUNTRY_NAMES[iso2.toUpperCase()] ?? iso2.toUpperCase()
}
