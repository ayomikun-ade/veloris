import { z } from 'zod'

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

export const SeveritySchema = z.enum(SEVERITIES)
export const CategorySchema = z.enum(CATEGORIES)
export const StatusSchema = z.enum(STATUSES)

export const ThreatEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.number().int().positive(),
  severity: SeveritySchema,
  category: CategorySchema,
  sourceIp: z.string().min(1),
  sourceCountry: z.string().length(2),
  targetAsset: z.string().min(1),
  status: StatusSchema,
  description: z.string(),
})

export type ThreatEvent = z.infer<typeof ThreatEventSchema>

export const StreamBatchSchema = z.object({
  type: z.literal('batch'),
  events: z.array(ThreatEventSchema),
})

export const StreamStatusSchema = z.object({
  type: z.literal('status'),
  state: z.enum(['connected', 'paused']),
})

export const StreamMessageSchema = z.discriminatedUnion('type', [
  StreamBatchSchema,
  StreamStatusSchema,
])

export type StreamMessage = z.infer<typeof StreamMessageSchema>
