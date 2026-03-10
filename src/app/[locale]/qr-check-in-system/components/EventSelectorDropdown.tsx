'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Event {
  id: number;
  name: string;
  nameAr: string;
  date: string;
  venue: string;
  totalGuests: number;
  checkedIn: number;
  status: 'active' | 'upcoming' | 'completed';
}

interface EventSelectorDropdownProps {
  onEventChange: (eventId: number) => void;
  className?: string;
}

const EventSelectorDropdown = ({ onEventChange, className = '' }: EventSelectorDropdownProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const events: Event[] = [
    {
      id: 1,
      name: 'Wedding - Sarah & Ahmed',
      nameAr: 'حفل زفاف - سارة وأحمد',
      date: '2026-03-15',
      venue: 'Grand Ballroom, Riyadh',
      totalGuests: 245,
      checkedIn: 142,
      status: 'active'
    },
    {
      id: 2,
      name: 'Corporate Gala 2026',
      nameAr: 'حفل الشركة 2026',
      date: '2026-04-20',
      venue: 'Convention Center, Jeddah',
      totalGuests: 500,
      checkedIn: 0,
      status: 'upcoming'
    },
    {
      id: 3,
      name: 'Birthday - Mohammed',
      nameAr: 'عيد ميلاد - محمد',
      date: '2026-05-10',
      venue: 'Private Villa, Dammam',
      totalGuests: 150,
      checkedIn: 0,
      status: 'upcoming'
    }
  ];

  useEffect(() => {
    setIsHydrated(true);
    setSelectedEvent(events[0]);
  }, []);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsOpen(false);
    onEventChange(event.id);
  };

  const getStatusBadge = (status: Event['status']) => {
    const badges = {
      active: { label: 'Active', color: 'bg-success/10 text-success' },
      upcoming: { label: 'Upcoming', color: 'bg-warning/10 text-warning' },
      completed: { label: 'Completed', color: 'bg-muted text-text-secondary' }
    };
    return badges[status];
  };

  if (!isHydrated || !selectedEvent) {
    return (
      <div className={`bg-card rounded-lg shadow-warm-md p-4 ${className}`}>
        <div className="animate-pulse h-12 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-card rounded-lg shadow-warm-md transition-smooth hover:shadow-warm-lg focus:outline-none focus:ring-3 focus:ring-ring"
        aria-expanded={isOpen}
        aria-label="Select event"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-md">
            <Icon name="CalendarIcon" size={24} className="text-primary" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-text-primary">{selectedEvent.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(selectedEvent.status).color} font-medium`}>
                {getStatusBadge(selectedEvent.status).label}
              </span>
            </div>
            <p className="text-sm text-text-secondary">{selectedEvent.nameAr}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Icon name="MapPinIcon" size={14} />
                {selectedEvent.venue}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="UserGroupIcon" size={14} />
                {selectedEvent.checkedIn} / {selectedEvent.totalGuests}
              </span>
            </div>
          </div>
        </div>
        <Icon
          name="ChevronDownIcon"
          size={20}
          className={`text-text-secondary transition-smooth ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-lg shadow-warm-xl z-200 overflow-hidden animate-slide-in">
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {events.map((event) => {
                const badge = getStatusBadge(event.status);
                const isSelected = selectedEvent.id === event.id;
                return (
                  <button
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    className={`w-full p-4 rounded-md transition-smooth hover:bg-muted text-left ${
                      isSelected ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">{event.name}</h4>
                        <p className="text-xs text-text-secondary">{event.nameAr}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${badge.color} font-medium whitespace-nowrap`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Icon name="CalendarIcon" size={14} />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MapPinIcon" size={14} />
                        {event.venue}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success transition-all duration-500"
                          style={{ width: `${(event.checkedIn / event.totalGuests) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary font-mono whitespace-nowrap">
                        {event.checkedIn} / {event.totalGuests}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventSelectorDropdown;