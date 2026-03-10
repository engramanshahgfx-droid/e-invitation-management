'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import StatusIndicatorBar from '@/components/common/StatusIndicatorBar';
import QuickActionToolbar from '@/components/common/QuickActionToolbar';
import DemoBanner from '@/components/common/DemoBanner';
import UserAuthGuard from '@/components/UserAuthGuard';
import EventManagementInteractive from './components/EventManagementInteractive';
import { getCurrentUser, checkSubscriptionStatus } from '@/lib/auth';

export default function EventManagementDashboardPage() {
  const [isFree, setIsFree] = useState(false);
  const [eventLimit, setEventLimit] = useState(1);
  const [guestLimit, setGuestLimit] = useState(50);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const sub = await checkSubscriptionStatus(user.id);
          setIsFree(sub.isFree);
          setEventLimit(sub.eventLimit ?? 1);
          setGuestLimit(sub.guestLimit ?? 50);
        }
      } catch {
        // ignore
      }
    };
    checkStatus();
  }, []);

  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        {isFree && <DemoBanner eventLimit={eventLimit} guestLimit={guestLimit} className="mt-20" />}
        <StatusIndicatorBar className={isFree ? '' : 'mt-20'} />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
                  Event Management Dashboard
                </h1>
                <p className="text-text-secondary">
                  Create and manage your events, customize invitations, and track guest responses
                </p>
              </div>
              <QuickActionToolbar />
            </div>
          </div>

          <EventManagementInteractive />
        </main>
      </div>
    </UserAuthGuard>
  );
}