'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface AttendanceMetric {
  label: string;
  value: number;
  total: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'accent';
}

interface LiveAttendancePanelProps {
  className?: string;
}

const LiveAttendancePanel = ({ className = '' }: LiveAttendancePanelProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [metrics, setMetrics] = useState<AttendanceMetric[]>([
    {
      label: 'Checked In',
      value: 142,
      total: 245,
      icon: 'UserGroupIcon',
      color: 'success'
    },
    {
      label: 'Pending Arrivals',
      value: 103,
      total: 245,
      icon: 'ClockIcon',
      color: 'warning'
    },
    {
      label: 'Capacity Status',
      value: 142,
      total: 300,
      icon: 'ChartBarIcon',
      color: 'primary'
    },
    {
      label: 'VIP Guests',
      value: 28,
      total: 35,
      icon: 'StarIcon',
      color: 'accent'
    }
  ]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.min(metric.value + Math.floor(Math.random() * 2), metric.total)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isHydrated]);

  const getColorClasses = (color: AttendanceMetric['color']) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      accent: 'bg-accent/10 text-accent'
    };
    return colorMap[color];
  };

  const getProgressColor = (color: AttendanceMetric['color']) => {
    const colorMap = {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      accent: 'bg-accent'
    };
    return colorMap[color];
  };

  const calculatePercentage = (value: number, total: number) => {
    return Math.round((value / total) * 100);
  };

  if (!isHydrated) {
    return (
      <div className={`bg-card rounded-lg shadow-warm-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg shadow-warm-md ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-md">
              <Icon name="ChartBarIcon" size={24} className="text-success" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-text-primary">Live Attendance</h2>
              <p className="text-sm text-text-secondary">Real-time check-in metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-subtle" />
            <span className="text-xs text-text-secondary font-caption">Live</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {metrics.map((metric, index) => {
          const percentage = calculatePercentage(metric.value, metric.total);
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${getColorClasses(metric.color)}`}>
                    <Icon name={metric.icon as any} size={20} />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-text-primary font-mono">{metric.value}</span>
                  <span className="text-sm text-text-secondary">/ {metric.total}</span>
                </div>
              </div>
              <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${getProgressColor(metric.color)} transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{percentage}% Complete</span>
                {metric.value === metric.total && (
                  <span className="text-xs text-success font-medium">✓ Full Capacity</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-border bg-muted/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-text-primary font-mono">58%</p>
            <p className="text-xs text-text-secondary mt-1">Overall Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-text-primary font-mono">12 min</p>
            <p className="text-xs text-text-secondary mt-1">Avg Check-in Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAttendancePanel;