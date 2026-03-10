'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: EventFormData) => Promise<void> | void;
  editingEvent?: EventFormData | null;
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

const CreateEventModal = ({ isOpen, onClose, onSubmit, editingEvent }: CreateEventModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    venue: '',
    description: '',
    expectedGuests: 0,
    eventType: 'wedding',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (editingEvent) {
      setFormData(editingEvent);
    } else {
      setFormData({
        name: '',
        date: '',
        venue: '',
        description: '',
        expectedGuests: 0,
        eventType: 'wedding',
      });
    }
    setError(null);
  }, [editingEvent, isOpen]);

  if (!isHydrated) {
    return null;
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'expectedGuests' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[999] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <div className="bg-card rounded-xl shadow-warm-xl w-full max-w-2xl my-8 animate-slide-up pointer-events-auto flex flex-col max-h-[calc(100vh-4rem)]">
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-heading font-semibold text-text-primary">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-md hover:bg-muted"
              aria-label="Close modal"
            >
              <Icon name="XMarkIcon" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                placeholder="e.g., Wedding - Sarah & Ahmed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-text-primary mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                />
              </div>

              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-text-primary mb-2">
                  Event Type *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                >
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="conference">Conference</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-text-primary mb-2">
                Venue *
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                placeholder="e.g., Grand Ballroom, Riyadh"
              />
            </div>

            <div>
              <label htmlFor="expectedGuests" className="block text-sm font-medium text-text-primary mb-2">
                Expected Number of Guests *
              </label>
              <input
                type="number"
                id="expectedGuests"
                name="expectedGuests"
                value={formData.expectedGuests}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                placeholder="e.g., 250"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                Event Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth resize-none"
                placeholder="Add any additional details about your event..."
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-muted text-text-primary rounded-md font-medium transition-smooth hover:bg-muted/80 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium transition-smooth hover:bg-primary/90 shadow-warm-md hover:shadow-warm-lg focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  editingEvent ? 'Update Event' : 'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateEventModal;