'use client'

import Icon from '@/components/ui/AppIcon'
import { useEffect, useState } from 'react'

interface StatusMetric {
  label: string
  labelAr: string
  value: number
  icon: string
  color: 'primary' | 'success' | 'warning' | 'accent'
}

interface StatusIndicatorBarProps {
  className?: string
}

const StatusIndicatorBar = ({ className = '' }: StatusIndicatorBarProps) => {
  const [metrics, setMetrics] = useState<StatusMetric[]>([
    {
      label: 'Invitations Sent',
      labelAr: 'الدعوات المرسلة',
      value: 245,
      icon: 'PaperAirplaneIcon',
      color: 'primary',
    },
    {
      label: 'Confirmed Guests',
      labelAr: 'الضيوف المؤكدون',
      value: 187,
      icon: 'CheckCircleIcon',
      color: 'success',
    },
    {
      label: 'Pending Responses',
      labelAr: 'الردود المعلقة',
      value: 58,
      icon: 'ClockIcon',
      color: 'warning',
    },
    {
      label: 'Checked In',
      labelAr: 'تم تسجيل الحضور',
      value: 142,
      icon: 'UserGroupIcon',
      color: 'accent',
    },
  ])

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: metric.value + Math.floor(Math.random() * 3),
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getColorClasses = (color: StatusMetric['color']) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      accent: 'bg-accent/10 text-accent',
    }
    return colorMap[color]
  }

  return (
    <div className={`border-b border-border bg-card ${className}`}>
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="hidden items-center gap-8 md:flex">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`rounded-md p-2 ${getColorClasses(metric.color)}`}>
                  <Icon name={metric.icon as any} size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-xs text-text-secondary">{metric.label}</span>
                  <span className="font-mono text-lg font-semibold text-text-primary">{metric.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full md:hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="transition-smooth hover:bg-muted/80 flex w-full items-center justify-between rounded-md bg-muted px-4 py-2"
              aria-expanded={isExpanded}
              aria-label="Toggle status metrics"
            >
              <div className="flex items-center gap-3">
                <Icon name="ChartBarIcon" size={20} className="text-primary" />
                <span className="text-sm font-medium text-text-primary">Event Status</span>
              </div>
              <Icon
                name="ChevronDownIcon"
                size={16}
                className={`transition-smooth text-text-secondary ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="mt-3 grid animate-slide-up grid-cols-2 gap-3">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md bg-muted p-3">
                    <div className={`rounded-md p-2 ${getColorClasses(metric.color)}`}>
                      <Icon name={metric.icon as any} size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-caption text-xs text-text-secondary">{metric.label}</span>
                      <span className="font-mono text-base font-semibold text-text-primary">{metric.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 animate-pulse-subtle rounded-full bg-success" />
              <span className="font-caption text-xs text-text-secondary">Live Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusIndicatorBar
