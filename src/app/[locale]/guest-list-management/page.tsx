import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import StatusIndicatorBar from '@/components/common/StatusIndicatorBar';
import QuickActionToolbar from '@/components/common/QuickActionToolbar';
import UserAuthGuard from '@/components/UserAuthGuard';
import GuestListInteractive from './components/GuestListInteractive';

export const metadata: Metadata = {
  title: 'Guest List Management - InviteFlow',
  description: 'Comprehensive guest administration with real-time status tracking, WhatsApp delivery management, and bulk operations for event coordination.',
};

export default function GuestListManagementPage() {
  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <StatusIndicatorBar className="mt-20" />
        
        <main className="px-8 py-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-semibold text-text-primary mb-2">
                  Guest List Management
                </h1>
                <p className="text-text-secondary">
                  Manage invitations, track responses, and coordinate guest communications
                </p>
              </div>
              <QuickActionToolbar />
            </div>

            <GuestListInteractive />
          </div>
        </main>
      </div>
    </UserAuthGuard>
  );
}