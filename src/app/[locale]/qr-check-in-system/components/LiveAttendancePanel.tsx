'use client'

import Icon from '@/components/ui/AppIcon'
import { useEffect, useState } from 'react'

interface AttendanceMetric {
  label: string
  value: number
  total: number
  icon: string
  color: 'primary' | 'success' | 'warning' | 'accent'
}

interface LiveAttendancePanelProps {
  className?: string
}

const LiveAttendancePanel = ({ className = '' }: LiveAttendancePanelProps) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const [metrics, setMetrics] = useState<AttendanceMetric[]>([
    {
      label: 'Checked In',
      value: 142,
      total: 245,
      icon: 'UserGroupIcon',
      color: 'success',
    },
    {
      label: 'Pending Arrivals',
      value: 103,
      total: 245,
      icon: 'ClockIcon',
      color: 'warning',
    },
    {
      label: 'Capacity Status',
      value: 142,
      total: 300,
      icon: 'ChartBarIcon',
      color: 'primary',
    },
    {
      label: 'VIP Guests',
      value: 28,
      total: 35,
      icon: 'StarIcon',
      color: 'accent',
    },
  ])

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: Math.min(metric.value + Math.floor(Math.random() * 2), metric.total),
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isHydrated])

  const getColorClasses = (color: AttendanceMetric['color']) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      accent: 'bg-accent/10 text-accent',
    }
    return colorMap[color]
  }

  const getProgressColor = (color: AttendanceMetric['color']) => {
    const colorMap = {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      accent: 'bg-accent',
    }
    return colorMap[color]
  }

  const calculatePercentage = (value: number, total: number) => {
    return Math.round((value / total) * 100)
  }

  if (!isHydrated) {
    return (
      <div className={`rounded-lg bg-card p-6 shadow-warm-md ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg bg-card shadow-warm-md ${className}`}>
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 rounded-md p-2">
              <Icon name="ChartBarIcon" size={24} className="text-success" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary">Live Attendance</h2>
              <p className="text-sm text-text-secondary">Real-time check-in metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse-subtle rounded-full bg-success" />
            <span className="font-caption text-xs text-text-secondary">Live</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {metrics.map((metric, index) => {
          const percentage = calculatePercentage(metric.value, metric.total)
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-md p-2 ${getColorClasses(metric.color)}`}>
                    <Icon name={metric.icon as any} size={20} />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-semibold text-text-primary">{metric.value}</span>
                  <span className="text-sm text-text-secondary">/ {metric.total}</span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`absolute left-0 top-0 h-full ${getProgressColor(metric.color)} transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{percentage}% Complete</span>
                {metric.value === metric.total && (
                  <span className="text-xs font-medium text-success">✓ Full Capacity</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-muted/30 border-t border-border p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="font-mono text-2xl font-semibold text-text-primary">58%</p>
            <p className="mt-1 text-xs text-text-secondary">Overall Attendance</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-2xl font-semibold text-text-primary">12 min</p>
            <p className="mt-1 text-xs text-text-secondary">Avg Check-in Time</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveAttendancePanel
