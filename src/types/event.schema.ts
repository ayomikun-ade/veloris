import { z } from 'zod'
import { CATEGORIES, SEVERITIES, STATUSES, type ThreatEvent } from '@/types/event'

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

// Compile-time sanity: schema output and the manual interface stay aligned in both directions.
type _SchemaToInterface = z.infer<typeof ThreatEventSchema> extends ThreatEvent ? true : never
type _InterfaceToSchema = ThreatEvent extends z.infer<typeof ThreatEventSchema> ? true : never
const _verifyMatch: _SchemaToInterface & _InterfaceToSchema = true
void _verifyMatch
