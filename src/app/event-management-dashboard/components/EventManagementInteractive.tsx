'use client';

import { useState, useEffect } from 'react';
import EventSummaryCards from './EventSummaryCards';
import EventTableRow from './EventTableRow';
import EventTableMobileCard from './EventTableMobileCard';
import CreateEventModal from './CreateEventModal';
import TemplateEditorModal from './TemplateEditorModal';
import Icon from '@/components/ui/AppIcon';

interface Event {
  id: number;
  name: string;
  date: string;
  venue: string;
  guestCount: number;
  invitationsSent: number;
  confirmed: number;
  declined: number;
  noResponse: number;
  checkedIn: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft';
}

interface EventFormData {
  id?: number;
  name: string;
  date: string;
  venue: string;
  description: string;
  expectedGuests: number;
  eventType: string;
}

interface TemplateData {
  language: 'en' | 'ar';
  headerImage: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  eventDetails: {
    date: string;
    time: string;
    venue: string;
  };
  footerText: string;
  footerTextAr?: string;
}

const EventManagementInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      name: 'Wedding - Sarah & Ahmed',
      date: '2026-03-15',
      venue: 'Grand Ballroom, Riyadh',
      guestCount: 250,
      invitationsSent: 245,
      confirmed: 187,
      declined: 32,
      noResponse: 26,
      checkedIn: 142,
      status: 'upcoming',
    },
    {
      id: 2,
      name: 'Corporate Gala 2026',
      date: '2026-04-20',
      venue: 'Convention Center, Jeddah',
      guestCount: 500,
      invitationsSent: 480,
      confirmed: 356,
      declined: 78,
      noResponse: 46,
      checkedIn: 0,
      status: 'upcoming',
    },
    {
      id: 3,
      name: 'Birthday - Mohammed',
      date: '2026-05-10',
      venue: 'Private Villa, Dammam',
      guestCount: 120,
      invitationsSent: 115,
      confirmed: 89,
      declined: 15,
      noResponse: 11,
      checkedIn: 0,
      status: 'draft',
    },
    {
      id: 4,
      name: 'Tech Conference 2026',
      date: '2026-06-05',
      venue: 'Innovation Hub, Riyadh',
      guestCount: 800,
      invitationsSent: 750,
      confirmed: 542,
      declined: 123,
      noResponse: 85,
      checkedIn: 0,
      status: 'upcoming',
    },
    {
      id: 5,
      name: 'Charity Fundraiser',
      date: '2026-02-20',
      venue: 'Royal Hall, Riyadh',
      guestCount: 300,
      invitationsSent: 295,
      confirmed: 234,
      declined: 41,
      noResponse: 20,
      checkedIn: 287,
      status: 'completed',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Event>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventFormData | null>(null);
  const [templateEventId, setTemplateEventId] = useState<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Total Events',
      labelAr: 'إجمالي الفعاليات',
      value: events.length,
      icon: 'CalendarDaysIcon',
      color: 'primary' as const,
      trend: { value: 12, isPositive: true },
    },
    {
      label: 'Upcoming Events',
      labelAr: 'الفعاليات القادمة',
      value: events.filter(e => e.status === 'upcoming').length,
      icon: 'ClockIcon',
      color: 'success' as const,
    },
    {
      label: 'Total Guests',
      labelAr: 'إجمالي الضيوف',
      value: events.reduce((sum, e) => sum + e.guestCount, 0),
      icon: 'UserGroupIcon',
      color: 'accent' as const,
      trend: { value: 8, isPositive: true },
    },
    {
      label: 'Avg Attendance',
      labelAr: 'متوسط الحضور',
      value: Math.round(
        events.reduce((sum, e) => {
          const rate = e.invitationsSent > 0 ? (e.checkedIn / e.invitationsSent) * 100 : 0;
          return sum + rate;
        }, 0) / events.length
      ),
      icon: 'ChartBarIcon',
      color: 'warning' as const,
    },
  ];

  const handleSort = (field: keyof Event) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectEvent = (eventId: number) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === filteredAndSortedEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredAndSortedEvents.map(e => e.id));
    }
  };

  const handleCreateEvent = (eventData: EventFormData) => {
    if (eventData.id) {
      setEvents(prev =>
        prev.map(e =>
          e.id === eventData.id
            ? {
                ...e,
                name: eventData.name,
                date: eventData.date,
                venue: eventData.venue,
                guestCount: eventData.expectedGuests,
              }
            : e
        )
      );
    } else {
      const newEvent: Event = {
        id: Math.max(...events.map(e => e.id)) + 1,
        name: eventData.name,
        date: eventData.date,
        venue: eventData.venue,
        guestCount: eventData.expectedGuests,
        invitationsSent: 0,
        confirmed: 0,
        declined: 0,
        noResponse: 0,
        checkedIn: 0,
        status: 'draft',
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent({
      id: event.id,
      name: event.name,
      date: event.date,
      venue: event.venue,
      description: '',
      expectedGuests: event.guestCount,
      eventType: 'wedding',
    });
    setIsCreateModalOpen(true);
  };

  const handleDuplicateEvent = (event: Event) => {
    const newEvent: Event = {
      ...event,
      id: Math.max(...events.map(e => e.id)) + 1,
      name: `${event.name} (Copy)`,
      status: 'draft',
      invitationsSent: 0,
      confirmed: 0,
      declined: 0,
      noResponse: 0,
      checkedIn: 0,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleViewAnalytics = (event: Event) => {
    console.log('Viewing analytics for:', event.name);
  };

  const handleArchiveEvent = (event: Event) => {
    setEvents(prev => prev.filter(e => e.id !== event.id));
  };

  const handleSaveTemplate = (template: TemplateData) => {
    console.log('Template saved:', template);
    // Template is automatically saved by the TemplateEditorModal using the templateService
  };

  const handleOpenTemplateEditor = (eventId?: number) => {
    // Use provided eventId, or first upcoming event, or first event
    const targetEventId = eventId || 
      events.find(e => e.status === 'upcoming')?.id || 
      events[0]?.id;
    
    if (targetEventId) {
      setTemplateEventId(targetEventId);
      setIsTemplateModalOpen(true);
    }
  };

  // Get the event data for template editing
  const templateEvent = templateEventId ? events.find(e => e.id === templateEventId) : null;

  const filteredAndSortedEvents = events
    .filter(event =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <EventSummaryCards cards={summaryCards} />

      <div className="bg-card rounded-lg shadow-warm-md border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Icon
                  name="MagnifyingGlassIcon"
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by name or venue..."
                  className="w-full pl-12 pr-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleOpenTemplateEditor()}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium transition-smooth hover:bg-secondary/90 shadow-warm-sm hover:shadow-warm-md focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97"
              >
                <Icon name="PaintBrushIcon" size={20} />
                <span className="hidden sm:inline">Edit Template</span>
              </button>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium transition-smooth hover:bg-primary/90 shadow-warm-md hover:shadow-warm-lg focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97"
              >
                <Icon name="PlusIcon" size={20} />
                <span>Create Event</span>
              </button>
            </div>
          </div>

          {selectedEvents.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-primary/10 rounded-md">
              <span className="text-sm text-primary font-medium">
                {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedEvents([])}
                className="ml-auto text-sm text-primary hover:underline"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEvents.length === filteredAndSortedEvents.length && filteredAndSortedEvents.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-2"
                    aria-label="Select all events"
                  />
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary transition-smooth"
                  >
                    Event Name
                    <Icon
                      name={sortField === 'name' && sortDirection === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                      size={16}
                      className={sortField === 'name' ? 'text-primary' : 'text-text-secondary'}
                    />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary transition-smooth"
                  >
                    Date
                    <Icon
                      name={sortField === 'date' && sortDirection === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                      size={16}
                      className={sortField === 'date' ? 'text-primary' : 'text-text-secondary'}
                    />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary transition-smooth"
                  >
                    Status
                    <Icon
                      name={sortField === 'status' && sortDirection === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                      size={16}
                      className={sortField === 'status' ? 'text-primary' : 'text-text-secondary'}
                    />
                  </button>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">Guests</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">Invitations</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">Attendance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEvents.map(event => (
                <EventTableRow
                  key={event.id}
                  event={event}
                  isSelected={selectedEvents.includes(event.id)}
                  onSelect={() => handleSelectEvent(event.id)}
                  onEdit={() => handleEditEvent(event)}
                  onDuplicate={() => handleDuplicateEvent(event)}
                  onViewAnalytics={() => handleViewAnalytics(event)}
                  onArchive={() => handleArchiveEvent(event)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 space-y-4">
          {filteredAndSortedEvents.map(event => (
            <EventTableMobileCard
              key={event.id}
              event={event}
              isSelected={selectedEvents.includes(event.id)}
              onSelect={() => handleSelectEvent(event.id)}
              onEdit={() => handleEditEvent(event)}
              onDuplicate={() => handleDuplicateEvent(event)}
              onViewAnalytics={() => handleViewAnalytics(event)}
              onArchive={() => handleArchiveEvent(event)}
            />
          ))}
        </div>

        {filteredAndSortedEvents.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="CalendarDaysIcon" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No events found matching your search.</p>
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleCreateEvent}
        editingEvent={editingEvent}
      />

      <TemplateEditorModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setTemplateEventId(null);
        }}
        onSave={handleSaveTemplate}
        eventId={templateEventId ? String(templateEventId) : undefined}
        eventData={templateEvent ? {
          name: templateEvent.name,
          date: templateEvent.date,
          venue: templateEvent.venue,
        } : undefined}
      />
    </div>
  );
};

export default EventManagementInteractive;