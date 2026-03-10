'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface HeaderProps {
  className?: string;
}

const Header = ({ className = '' }: HeaderProps) => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('Wedding - Sarah & Ahmed');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single() as any;
        setUser({ ...currentUser, profile: userProfile });
      }
    } catch (error) {
      console.warn('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/auth/login`);
  };

  const getInitials = () => {
    const name = user?.profile?.full_name || user?.email || 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const events = [
    { id: 1, name: 'Wedding - Sarah & Ahmed', date: '2026-03-15', status: 'active' },
    { id: 2, name: 'Corporate Gala 2026', date: '2026-04-20', status: 'planning' },
    { id: 3, name: 'Birthday - Mohammed', date: '2026-05-10', status: 'planning' },
  ];

  const handleEventSelect = (eventName: string) => {
    setSelectedEvent(eventName);
    setIsEventSelectorOpen(false);
  };

  const localizedPath = (path: string) => `/${locale}${path}`;

  return (
    <header className={`bg-card shadow-warm-md fixed top-0 left-0 right-0 z-100 ${className}`}>
      <div className="flex items-center justify-between h-16 md:h-20 px-3 sm:px-4 md:px-8">
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
          <Link href={localizedPath('/event-management-dashboard')} className="flex items-center gap-2 md:gap-3 transition-smooth hover:opacity-80">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
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
            <span className="hidden sm:inline text-lg md:text-xl font-heading font-semibold text-primary">InviteFlow</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsEventSelectorOpen(!isEventSelectorOpen)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 bg-muted rounded-md transition-smooth hover:bg-muted/80 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
              aria-label="Select event"
              aria-expanded={isEventSelectorOpen}
            >
              <Icon name="CalendarIcon" size={18} className="text-primary sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-xs sm:text-sm font-medium text-text-primary max-w-[100px] sm:max-w-[150px] md:max-w-[200px] truncate">{selectedEvent}</span>
              <Icon
                name="ChevronDownIcon"
                size={14}
                className={`text-text-secondary transition-smooth sm:w-4 sm:h-4 ${isEventSelectorOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isEventSelectorOpen && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setIsEventSelectorOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-popover rounded-md shadow-warm-lg z-200 overflow-hidden animate-slide-in">
                  <div className="p-2">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventSelect(event.name)}
                        className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-md transition-smooth hover:bg-muted ${
                          selectedEvent === event.name ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-xs sm:text-sm font-medium text-text-primary">{event.name}</span>
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
                      href={localizedPath('/event-management-dashboard')}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-primary hover:bg-muted rounded-md transition-smooth"
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
            const href = localizedPath(tab.path);
            const isActive = pathname === href;
            return (
              <Link
                key={tab.path}
                href={href}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-md transition-smooth hover:bg-muted ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-text-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
                title={tab.tooltip}
              >
                <Icon name={tab.icon as any} size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden md:inline font-medium text-sm">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Dropdown */}
        {!loading && user && (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2 md:px-3 py-2 rounded-md hover:bg-muted transition-smooth focus:outline-none"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                {getInitials()}
              </div>
            </button>

            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setIsProfileMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full right-0 mt-2 w-56 sm:w-64 bg-popover rounded-md shadow-warm-lg z-200 overflow-hidden">
                  <div className="p-3 sm:p-4 border-b border-border">
                    <p className="text-xs sm:text-sm font-semibold text-text-primary">
                      {user?.profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">{user?.email}</p>
                    {user?.profile && (
                      <>
                        <p className="text-xs text-text-secondary mt-2">
                          Plan: <span className="font-medium capitalize">{user.profile.plan_type || 'Free'}</span>
                        </p>
                        <p className="text-xs text-text-secondary">
                          Status: <span className="font-medium capitalize">{user.profile.subscription_status}</span>
                        </p>
                      </>
                    )}
                  </div>
                  <div className="p-2">
                    <Link
                      href={localizedPath('/event-management-dashboard')}
                      className="flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-text-primary hover:bg-muted rounded-md transition-smooth"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Icon name="SettingsIcon" size={16} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-md transition-smooth"
                    >
                      <Icon name="LogOutIcon" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;