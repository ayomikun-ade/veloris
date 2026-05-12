export const SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'] as const
export type Severity = (typeof SEVERITIES)[number]

export const CATEGORIES = [
  'port-scan',
  'brute-force',
  'recon',
  'phishing',
  'malware',
  'anomaly',
  'sqli',
  'xss',
  'ddos',
  'data-exfil',
  'privilege-escalation',
] as const
export type Category = (typeof CATEGORIES)[number]

export const STATUSES = ['blocked', 'mitigated', 'investigating', 'allowed'] as const
export type Status = (typeof STATUSES)[number]

export interface ThreatEvent {
  id: string
  timestamp: number
  severity: Severity
  category: Category
  sourceIp: string
  sourceCountry: string
  targetAsset: string
  status: Status
  description: string
}
