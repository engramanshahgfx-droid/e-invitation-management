'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface StatusMetric {
  label: string;
  labelAr: string;
  value: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'accent';
}

interface StatusIndicatorBarProps {
  className?: string;
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
  ]);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: metric.value + Math.floor(Math.random() * 3),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getColorClasses = (color: StatusMetric['color']) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      accent: 'bg-accent/10 text-accent',
    };
    return colorMap[color];
  };

  return (
    <div className={`bg-card border-b border-border ${className}`}>
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="hidden md:flex items-center gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${getColorClasses(metric.color)}`}>
                  <Icon name={metric.icon as any} size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-secondary font-caption">{metric.label}</span>
                  <span className="text-lg font-semibold text-text-primary font-mono">{metric.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden w-full">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 bg-muted rounded-md transition-smooth hover:bg-muted/80"
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
                className={`text-text-secondary transition-smooth ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="mt-3 grid grid-cols-2 gap-3 animate-slide-up">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <div className={`p-2 rounded-md ${getColorClasses(metric.color)}`}>
                      <Icon name={metric.icon as any} size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-text-secondary font-caption">{metric.label}</span>
                      <span className="text-base font-semibold text-text-primary font-mono">{metric.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-subtle" />
              <span className="text-xs text-text-secondary font-caption">Live Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicatorBar;