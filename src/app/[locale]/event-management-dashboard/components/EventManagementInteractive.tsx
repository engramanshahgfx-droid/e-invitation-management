'use client';

import { useState, useEffect } from 'react';
import EventSummaryCards from './EventSummaryCards';
import EventTableRow from './EventTableRow';
import EventTableMobileCard from './EventTableMobileCard';
import CreateEventModal from './CreateEventModal';
import TemplateEditorModal from './TemplateEditorModal';
import Icon from '@/components/ui/AppIcon';
import { getCurrentUser, getCurrentSession } from '@/lib/auth';

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  description?: string;
  event_type?: string;
  expected_guests?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft';
  guestCount?: number;
  invitationsSent?: number;
  confirmed?: number;
  declined?: number;
  noResponse?: number;
  checkedIn?: number;
}

interface EventFormData {
  id?: string;
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

// Helper function to determine event status based on date
const getEventStatus = (eventDate: string): 'upcoming' | 'ongoing' | 'completed' | 'draft' => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const eventDateObj = new Date(eventDate);
  eventDateObj.setHours(0, 0, 0, 0);
  
  if (eventDateObj.getTime() === now.getTime()) {
    return 'ongoing';
  } else if (eventDateObj < now) {
    return 'completed';
  } else {
    return 'upcoming';
  }
};

const EventManagementInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Event>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventFormData | null>(null);
  const [templateEventId, setTemplateEventId] = useState<string | null>(null);

  // Fetch current user and events
  useEffect(() => {
    const initializeComponent = async () => {
      const timeout = setTimeout(() => {
        console.error('Initialization timeout - taking too long');
        setError('Loading is taking too long. Please refresh the page.');
        setIsHydrated(true);
        setIsLoading(false);
      }, 10000); // 10 second timeout

      try {
        console.log('Starting component initialization...');
        
        let user;
        try {
          user = await getCurrentUser();
          console.log('Current user:', user);
        } catch (err) {
          console.error('Error getting current user:', err);
          setError('Failed to get user info. Please try logging in again.');
          setIsHydrated(true);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }
        
        if (!user?.id) {
          console.error('No user ID found');
          setError('User not authenticated. Please log in again.');
          setIsHydrated(true);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }

        let session;
        try {
          session = await getCurrentSession();
          console.log('Session:', session);
        } catch (err) {
          console.error('Error getting session:', err);
          setError('Failed to get session. Please try logging in again.');
          setIsHydrated(true);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }
        
        if (!session?.access_token) {
          console.error('No access token in session');
          setError('No active session. Please log in again.');
          setIsHydrated(true);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }

        console.log('User authenticated, setting state...');
        setUserId(user.id);
        setToken(session.access_token);
        
        console.log('Fetching events...');
        await fetchEvents(user.id, session.access_token);
        
        clearTimeout(timeout);
      } catch (err) {
        console.error('Error initializing component:', err);
        setError(`Failed to initialize: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsHydrated(true);
        setIsLoading(false);
        clearTimeout(timeout);
      }
    };
    
    initializeComponent();
  }, []);

  const fetchEvents = async (uid: string, accessToken: string) => {
    try {
      setError(null);
      console.log('Fetching events for user:', uid);
      
      const response = await fetch('/api/events/list', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }
      
      const data = await response.json();
      console.log('Fetched events:', data);
      
      // Transform API data to match Event interface
      const transformedEvents = (data || []).map((e: any) => ({
        ...e,
        id: typeof e.id === 'string' ? e.id : String(e.id),
        status: getEventStatus(e.date), // Recalculate status based on event date
        guestCount: e.expected_guests ?? 0,
        invitationsSent: 0,
        confirmed: 0,
        declined: 0,
        noResponse: 0,
        checkedIn: 0,
      }));
      
      console.log('Transformed events:', transformedEvents);
      setEvents(transformedEvents);
      setError(null);
      setIsHydrated(true);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(`Failed to load events: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setEvents([]);
      setIsHydrated(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated || (isLoading && events.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-text-secondary">Loading your events...</p>
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md max-w-md text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  const handleSelectEvent = (eventId: string) => {
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
      setSelectedEvents(filteredAndSortedEvents.map(e => e.id as string));
    }
  };

  const handleCreateEvent = async (eventData: EventFormData) => {
    if (!userId || !token) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating/updating event:', eventData);
      
      if (eventData.id) {
        // Update existing event
        const response = await fetch(`/api/events/${eventData.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: eventData.name,
            date: eventData.date,
            venue: eventData.venue,
            description: eventData.description,
            eventType: eventData.eventType,
            expectedGuests: eventData.expectedGuests,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update event');
        }

        const updatedEvent = await response.json();
        console.log('Event updated:', updatedEvent);
        
        setEvents(prev =>
          prev.map(e =>
            e.id === eventData.id
              ? {
                  ...e,
                  name: updatedEvent.name,
                  date: updatedEvent.date,
                  venue: updatedEvent.venue,
                  description: updatedEvent.description,
                  event_type: updatedEvent.event_type,
                  status: getEventStatus(updatedEvent.date), // Recalculate status based on updated date
                  guestCount: updatedEvent.expected_guests,
                }
              : e
          )
        );
      } else {
        // Create new event
        const eventStatus = getEventStatus(eventData.date);
        const response = await fetch('/api/events/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            name: eventData.name,
            date: eventData.date,
            venue: eventData.venue,
            description: eventData.description,
            eventType: eventData.eventType,
            expectedGuests: eventData.expectedGuests,
            status: eventStatus,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create event');
        }

        const newEvent = await response.json();
        console.log('Event created:', newEvent);
        
        setEvents(prev => [...prev, {
          ...newEvent,
          id: String(newEvent.id),
          status: getEventStatus(newEvent.date), // Recalculate status based on date
          guestCount: newEvent.expected_guests,
          invitationsSent: 0,
          confirmed: 0,
          declined: 0,
          noResponse: 0,
          checkedIn: 0,
        }]);
        
        // Refresh events from API to ensure sync
        await fetchEvents(userId, token);
      }

      setEditingEvent(null);
      setError(null);
    } catch (err) {
      console.error('Error saving event:', err);
      setError(`Failed to save event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent({
      id: typeof event.id === 'string' ? event.id : String(event.id),
      name: event.name,
      date: event.date,
      venue: event.venue,
      description: event.description || '',
      expectedGuests: event.expected_guests || event.guestCount || 0,
      eventType: event.event_type || 'wedding',
    });
    setIsCreateModalOpen(true);
  };

  const handleDuplicateEvent = async (event: Event) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      const eventStatus = getEventStatus(event.date);
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          userId,
          name: `${event.name} (Copy)`,
          date: event.date,
          venue: event.venue,
          description: event.description,
          eventType: event.event_type || 'wedding',
          expectedGuests: event.expected_guests || event.guestCount || 100,
          status: eventStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate event');
      }

      const newEvent = await response.json();
      setEvents(prev => [...prev, {
        ...newEvent,
        id: String(newEvent.id),
        status: getEventStatus(newEvent.date), // Recalculate status based on date
        guestCount: newEvent.expected_guests,
        invitationsSent: 0,
        confirmed: 0,
        declined: 0,
        noResponse: 0,
        checkedIn: 0,
      }]);

      setError(null);
    } catch (err) {
      console.error('Error duplicating event:', err);
      setError('Failed to duplicate event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAnalytics = (event: Event) => {
    console.log('Viewing analytics for:', event.name);
  };

  const handleArchiveEvent = async (event: Event) => {
    if (!token) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Deleting event:', event.id);
      
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      console.log('Event deleted successfully');
      setEvents(prev => prev.filter(e => e.id !== event.id));
      setError(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(`Failed to delete event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = (template: TemplateData) => {
    console.log('Template saved:', template);
    // Template is automatically saved by the TemplateEditorModal using the templateService
  };

  const handleOpenTemplateEditor = (eventId?: string) => {
    // Use provided eventId, or first upcoming event, or first event
    const targetEventId = eventId || 
      events.find(e => e.status === 'upcoming')?.id || 
      events[0]?.id;
    
    if (targetEventId) {
      setTemplateEventId(String(targetEventId));
      setIsTemplateModalOpen(true);
    }
  };

  const handleSort = (field: keyof Event) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
      value: events.reduce((sum, e) => sum + (e.guestCount || e.expected_guests || 0), 0),
      icon: 'UserGroupIcon',
      color: 'accent' as const,
      trend: { value: 8, isPositive: true },
    },
    {
      label: 'Avg Attendance',
      labelAr: 'متوسط الحضور',
      value: Math.round(
        events.reduce((sum, e) => {
          const rate = (e.invitationsSent || 0) > 0 ? ((e.checkedIn || 0) / (e.invitationsSent || 1)) * 100 : 0;
          return sum + rate;
        }, 0) / (events.length || 1)
      ),
      icon: 'ChartBarIcon',
      color: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

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