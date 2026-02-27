import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import StatusIndicatorBar from '@/components/common/StatusIndicatorBar';
import QuickActionToolbar from '@/components/common/QuickActionToolbar';
import EventManagementInteractive from './components/EventManagementInteractive';

export const metadata: Metadata = {
  title: 'Event Management Dashboard - InviteFlow',
  description: 'Create, configure, and oversee multiple events efficiently with comprehensive event administration tools, guest list management, and invitation template customization.',
};

export default function EventManagementDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StatusIndicatorBar className="mt-20" />
      
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
  );
}