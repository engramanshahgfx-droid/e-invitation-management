import Icon from '@/components/ui/AppIcon'

interface SummaryCard {
  label: string
  labelAr: string
  value: number
  icon: string
  color: 'primary' | 'success' | 'warning' | 'accent'
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface EventSummaryCardsProps {
  cards: SummaryCard[]
}

const EventSummaryCards = ({ cards }: EventSummaryCardsProps) => {
  const getColorClasses = (color: SummaryCard['color']) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      accent: 'bg-accent/10 text-accent',
    }
    return colorMap[color]
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="transition-smooth rounded-lg border border-border bg-card p-6 shadow-warm-md hover:shadow-warm-lg"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className={`rounded-lg p-3 ${getColorClasses(card.color)}`}>
              <Icon name={card.icon as any} size={24} />
            </div>
            {card.trend && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  card.trend.isPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                <Icon name={card.trend.isPositive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} size={16} />
                <span>{card.trend.value}%</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-caption text-sm text-text-secondary">{card.label}</p>
            <p className="font-mono text-3xl font-bold text-text-primary">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default EventSummaryCards
