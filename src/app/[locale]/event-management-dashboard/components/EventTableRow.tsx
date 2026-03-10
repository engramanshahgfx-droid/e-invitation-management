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

interface EventTableRowProps {
  event: Event;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onViewAnalytics: () => void;
  onArchive: () => void;
}

const EventTableRow = ({
  event,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onViewAnalytics,
  onArchive,
}: EventTableRowProps) => {
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
    <tr className={`border-b border-border hover:bg-muted/50 transition-smooth ${isSelected ? 'bg-primary/5' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-2"
          aria-label={`Select ${event.name}`}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{event.name}</span>
          <span className="text-sm text-text-secondary">{event.venue}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-text-primary">{event.date}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
          {getStatusLabel(event.status)}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-text-primary font-mono">{event.guestCount}</td>
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-text-primary font-mono">{event.invitationsSent}</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-success">{event.confirmed}</span>
            <span className="text-destructive">{event.declined}</span>
            <span className="text-warning">{event.noResponse}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-text-primary font-mono">{event.checkedIn}</span>
          <span className="text-xs text-text-secondary">{attendanceRate}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-primary hover:bg-primary/10 rounded-md transition-smooth"
            aria-label={`Edit ${event.name}`}
            title="Edit Event"
          >
            <Icon name="PencilIcon" size={18} />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-secondary hover:bg-secondary/10 rounded-md transition-smooth"
            aria-label={`Duplicate ${event.name}`}
            title="Duplicate Event"
          >
            <Icon name="DocumentDuplicateIcon" size={18} />
          </button>
          <button
            onClick={onViewAnalytics}
            className="p-2 text-accent hover:bg-accent/10 rounded-md transition-smooth"
            aria-label={`View analytics for ${event.name}`}
            title="View Analytics"
          >
            <Icon name="ChartBarIcon" size={18} />
          </button>
          <button
            onClick={onArchive}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-smooth"
            aria-label={`Archive ${event.name}`}
            title="Archive Event"
          >
            <Icon name="ArchiveBoxIcon" size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default EventTableRow;