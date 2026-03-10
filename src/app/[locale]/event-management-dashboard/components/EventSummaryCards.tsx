import Icon from '@/components/ui/AppIcon';

interface SummaryCard {
  label: string;
  labelAr: string;
  value: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'accent';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface EventSummaryCardsProps {
  cards: SummaryCard[];
}

const EventSummaryCards = ({ cards }: EventSummaryCardsProps) => {
  const getColorClasses = (color: SummaryCard['color']) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      accent: 'bg-accent/10 text-accent',
    };
    return colorMap[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-card rounded-lg p-6 shadow-warm-md hover:shadow-warm-lg transition-smooth border border-border"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
              <Icon name={card.icon as any} size={24} />
            </div>
            {card.trend && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  card.trend.isPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                <Icon
                  name={card.trend.isPositive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'}
                  size={16}
                />
                <span>{card.trend.value}%</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text-secondary font-caption">{card.label}</p>
            <p className="text-3xl font-bold text-text-primary font-mono">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventSummaryCards;