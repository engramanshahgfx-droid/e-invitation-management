'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface HeaderProps {
  className?: string;
}

const Header = ({ className = '' }: HeaderProps) => {
  const pathname = usePathname();
  const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('Wedding - Sarah & Ahmed');

  const navigationTabs = [
    {
      label: 'Events',
      labelAr: 'الفعاليات',
      path: '/event-management-dashboard',
      icon: 'CalendarIcon',
      tooltip: 'Manage your events and templates',
    },
    {
      label: 'Guests',
      labelAr: 'الضيوف',
      path: '/guest-list-management',
      icon: 'UsersIcon',
      tooltip: 'Manage guest lists and communications',
    },
    {
      label: 'Check-in',
      labelAr: 'تسجيل الحضور',
      path: '/qr-check-in-system',
      icon: 'QrCodeIcon',
      tooltip: 'Real-time attendance tracking',
    },
  ];

  const events = [
    { id: 1, name: 'Wedding - Sarah & Ahmed', date: '2026-03-15', status: 'active' },
    { id: 2, name: 'Corporate Gala 2026', date: '2026-04-20', status: 'planning' },
    { id: 3, name: 'Birthday - Mohammed', date: '2026-05-10', status: 'planning' },
  ];

  const handleEventSelect = (eventName: string) => {
    setSelectedEvent(eventName);
    setIsEventSelectorOpen(false);
  };

  return (
    <header className={`bg-card shadow-warm-md fixed top-0 left-0 right-0 z-100 ${className}`}>
      <div className="flex items-center justify-between h-20 px-8">
        <div className="flex items-center gap-8">
          <Link href="/event-management-dashboard" className="flex items-center gap-3 transition-smooth hover:opacity-80">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="var(--color-primary)" />
              <path
                d="M20 10L12 16V28C12 28.5304 12.2107 29.0391 12.5858 29.4142C12.9609 29.7893 13.4696 30 14 30H26C26.5304 30 27.0391 29.7893 27.4142 29.4142C27.7893 29.0391 28 28.5304 28 28V16L20 10Z"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 30V20H24V30"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-heading font-semibold text-primary">InviteFlow</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsEventSelectorOpen(!isEventSelectorOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md transition-smooth hover:bg-muted/80 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
              aria-label="Select event"
              aria-expanded={isEventSelectorOpen}
            >
              <Icon name="CalendarIcon" size={20} className="text-primary" />
              <span className="text-sm font-medium text-text-primary max-w-[200px] truncate">{selectedEvent}</span>
              <Icon
                name="ChevronDownIcon"
                size={16}
                className={`text-text-secondary transition-smooth ${isEventSelectorOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isEventSelectorOpen && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setIsEventSelectorOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full left-0 mt-2 w-80 bg-popover rounded-md shadow-warm-lg z-200 overflow-hidden animate-slide-in">
                  <div className="p-2">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventSelect(event.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-smooth hover:bg-muted ${
                          selectedEvent === event.name ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-text-primary">{event.name}</span>
                          <span className="text-xs text-text-secondary">{event.date}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            event.status === 'active' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
                          }`}
                        >
                          {event.status}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border p-2">
                    <Link
                      href="/event-management-dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-muted rounded-md transition-smooth"
                      onClick={() => setIsEventSelectorOpen(false)}
                    >
                      <Icon name="PlusIcon" size={16} />
                      <span>Create New Event</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navigationTabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-smooth hover:bg-muted ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-text-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
                title={tab.tooltip}
              >
                <Icon name={tab.icon as any} size={20} />
                <span className="font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;