import { CATEGORIES, type Category, type Severity, type Status, type ThreatEvent } from '@/types/event'

type ControlMessage =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'set-throughput'; eventsPerSec: number }

type StreamOutput =
  | { type: 'batch'; events: ThreatEvent[] }
  | { type: 'status'; state: 'connected' | 'paused' }

const BATCH_INTERVAL_MS = 100

const COUNTRIES = [
  'US', 'CN', 'RU', 'IR', 'KP', 'BR', 'IN', 'DE',
  'GB', 'FR', 'NG', 'VN', 'ID', 'UA', 'PL', 'TR',
]

const ASSETS = [
  'api-gateway', 'auth-svc', 'users-db', 'payment-svc',
  'admin-portal', 'mail-relay', 'file-server', 'build-runner',
  'metrics-store', 'edge-cdn',
]

const CATEGORY_WEIGHTS: Record<Category, number> = {
  'port-scan': 25,
  'brute-force': 18,
  'recon': 15,
  'phishing': 12,
  'malware': 8,
  'anomaly': 7,
  'sqli': 5,
  'xss': 4,
  'ddos': 3,
  'data-exfil': 2,
  'privilege-escalation': 1,
}

const SEVERITY_BY_CATEGORY: Record<Category, Severity[]> = {
  'port-scan': ['info', 'low', 'medium'],
  'brute-force': ['low', 'medium', 'high'],
  'recon': ['info', 'low'],
  'phishing': ['medium', 'high'],
  'malware': ['high', 'critical'],
  'anomaly': ['low', 'medium', 'high'],
  'sqli': ['high', 'critical'],
  'xss': ['medium', 'high'],
  'ddos': ['high', 'critical'],
  'data-exfil': ['critical'],
  'privilege-escalation': ['critical'],
}

const DESCRIPTIONS: Record<Category, string> = {
  'port-scan': 'TCP SYN scan on uncommon port range',
  'brute-force': 'Repeated failed auth attempts',
  'recon': 'Service enumeration probe',
  'phishing': 'Credential harvesting attempt',
  'malware': 'Known signature match in upload',
  'anomaly': 'Unusual request pattern',
  'sqli': 'SQL injection payload detected',
  'xss': 'Reflected XSS attempt',
  'ddos': 'Volumetric flood from distributed source',
  'data-exfil': 'Unusual outbound data volume',
  'privilege-escalation': 'Attempt to escalate user role',
}

let throughput = 25
let paused = false
let counter = 0
let intervalId: number | null = null

function weightedPick<T>(items: readonly T[], weight: (item: T) => number): T {
  let total = 0
  for (const it of items) total += weight(it)
  let r = Math.random() * total
  for (const it of items) {
    r -= weight(it)
    if (r <= 0) return it
  }
  return items[items.length - 1]
}

function randomIp(): string {
  return [
    1 + Math.floor(Math.random() * 254),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    1 + Math.floor(Math.random() * 254),
  ].join('.')
}

function generateEvent(): ThreatEvent {
  const category = weightedPick(CATEGORIES, (c) => CATEGORY_WEIGHTS[c])
  const severities = SEVERITY_BY_CATEGORY[category]
  const severity = severities[Math.floor(Math.random() * severities.length)]
  const status: Status =
    severity === 'critical'
      ? Math.random() < 0.7
        ? 'mitigated'
        : 'investigating'
      : Math.random() < 0.85
        ? 'blocked'
        : 'allowed'

  counter++
  return {
    id: `evt-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    severity,
    category,
    sourceIp: randomIp(),
    sourceCountry: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
    targetAsset: ASSETS[Math.floor(Math.random() * ASSETS.length)],
    status,
    description: DESCRIPTIONS[category],
  }
}

function tick() {
  if (paused) return
  const base = (throughput * BATCH_INTERVAL_MS) / 1000
  const jitter = 0.7 + Math.random() * 0.6
  const count = Math.max(1, Math.round(base * jitter))
  const events: ThreatEvent[] = new Array(count)
  for (let i = 0; i < count; i++) events[i] = generateEvent()
  const msg: StreamOutput = { type: 'batch', events }
  self.postMessage(msg)
}

function emitStatus(state: 'connected' | 'paused') {
  const msg: StreamOutput = { type: 'status', state }
  self.postMessage(msg)
}

function start() {
  if (intervalId !== null) return
  paused = false
  intervalId = self.setInterval(tick, BATCH_INTERVAL_MS) as unknown as number
  emitStatus('connected')
}

function pause() {
  paused = true
  emitStatus('paused')
}

function resume() {
  paused = false
  emitStatus('connected')
}

function stop() {
  if (intervalId !== null) {
    self.clearInterval(intervalId)
    intervalId = null
  }
  paused = false
}

self.onmessage = (e: MessageEvent<ControlMessage>) => {
  const msg = e.data
  switch (msg.type) {
    case 'start':
      start()
      break
    case 'pause':
      pause()
      break
    case 'resume':
      resume()
      break
    case 'stop':
      stop()
      break
    case 'set-throughput':
      throughput = Math.max(1, Math.min(1000, msg.eventsPerSec))
      break
  }
}
