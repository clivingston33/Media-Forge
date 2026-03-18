export type HealthCheckStatus = 'ready' | 'degraded' | 'missing'
export type SystemHealthStatus = 'ok' | 'degraded'

export interface HealthCheck {
  key: string
  label: string
  status: HealthCheckStatus
  detail: string
  location?: string | null
}

export interface FeatureHealth {
  key: string
  label: string
  status: HealthCheckStatus
  detail: string
}

export interface SystemHealth {
  status: SystemHealthStatus
  checked_at: string
  output_folder: string
  checks: HealthCheck[]
  features: FeatureHealth[]
}
