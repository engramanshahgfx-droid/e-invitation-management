'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  guestCount?: number;
  invitationsSent?: number;
  confirmed?: number;
  declined?: number;
  noResponse?: number;
  checkedIn?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft';
  description?: string;
  event_type?: string;
  expected_guests?: number;
}

interface EventTableMobileCardProps {
  event: Event;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onViewAnalytics: () => void;
  onArchive: () => void;
}

const EventTableMobileCard = ({
  event,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onViewAnalytics,
  onArchive,
}: EventTableMobileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: Event['status']) => {
    const statusMap = {
      upcoming: 'bg-primary/10 text-primary',
      ongoing: 'bg-success/10 text-success',
      completed: 'bg-muted text-text-secondary',
      draft: 'bg-warning/10 text-warning',
    };
    return statusMap[status];
  };

  const getStatusLabel = (status: Event['status']) => {
    const labelMap = {
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      completed: 'Completed',
      draft: 'Draft',
    };
    return labelMap[status];
  };

  const attendanceRate = event.invitationsSent > 0 
    ? Math.round((event.checkedIn / event.invitationsSent) * 100) 
    : 0;

  return (
    <div className={`bg-card rounded-lg border border-border shadow-warm-sm ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-2"
              aria-label={`Select ${event.name}`}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary mb-1">{event.name}</h3>
              <p className="text-sm text-text-secondary mb-2">{event.venue}</p>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="CalendarIcon" size={16} className="text-text-secondary" />
                <span className="text-sm text-text-primary">{event.date}</span>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {getStatusLabel(event.status)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-text-secondary hover:text-text-primary transition-smooth"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <Icon
              name="ChevronDownIcon"
              size={20}
              className={`transition-smooth ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <p className="text-xs text-text-secondary mb-1">Guests</p>
            <p className="text-lg font-semibold text-text-primary font-mono">{event.guestCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-secondary mb-1">Sent</p>
            <p className="text-lg font-semibold text-text-primary font-mono">{event.invitationsSent}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-secondary mb-1">Checked In</p>
            <p className="text-lg font-semibold text-text-primary font-mono">{event.checkedIn}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-3 border-t border-border space-y-3 animate-slide-up">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-text-secondary mb-1">Confirmed</p>
                <p className="text-base font-semibold text-success font-mono">{event.confirmed}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary mb-1">Declined</p>
                <p className="text-base font-semibold text-destructive font-mono">{event.declined}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary mb-1">No Response</p>
                <p className="text-base font-semibold text-warning font-mono">{event.noResponse}</p>
              </div>
            </div>
            <div className="text-center p-3 bg-muted rounded-md">
              <p className="text-xs text-text-secondary mb-1">Attendance Rate</p>
              <p className="text-xl font-bold text-primary font-mono">{attendanceRate}%</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md transition-smooth hover:bg-primary/90 active:scale-97"
            aria-label={`Edit ${event.name}`}
          >
            <Icon name="PencilIcon" size={18} />
            <span className="text-sm font-medium">Edit</span>
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 bg-secondary text-secondary-foreground rounded-md transition-smooth hover:bg-secondary/90 active:scale-97"
            aria-label={`Duplicate ${event.name}`}
            title="Duplicate"
          >
            <Icon name="DocumentDuplicateIcon" size={18} />
          </button>
          <button
            onClick={onViewAnalytics}
            className="p-2 bg-accent text-accent-foreground rounded-md transition-smooth hover:bg-accent/90 active:scale-97"
            aria-label={`View analytics for ${event.name}`}
            title="Analytics"
          >
            <Icon name="ChartBarIcon" size={18} />
          </button>
          <button
            onClick={onArchive}
            className="p-2 bg-destructive text-destructive-foreground rounded-md transition-smooth hover:bg-destructive/90 active:scale-97"
            aria-label={`Archive ${event.name}`}
            title="Archive"
          >
            <Icon name="ArchiveBoxIcon" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventTableMobileCard;