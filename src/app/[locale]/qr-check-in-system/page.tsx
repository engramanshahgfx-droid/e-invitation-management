import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import StatusIndicatorBar from '@/components/common/StatusIndicatorBar';
import QuickActionToolbar from '@/components/common/QuickActionToolbar';
import UserAuthGuard from '@/components/UserAuthGuard';
import QRCheckInInteractive from './components/QRCheckInInteractive';

export const metadata: Metadata = {
  title: 'QR Check-in System - InviteFlow',
  description: 'Real-time attendance tracking through secure QR code scanning with duplicate prevention and instant status updates for event management.',
};

export default function QRCheckInSystemPage() {
  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <StatusIndicatorBar className="mt-20" />
        
        <main className="pt-6 pb-12 px-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
                  QR Check-in System
                </h1>
                <p className="text-text-secondary">
                  Real-time attendance tracking with secure QR code scanning and manual check-in options
                </p>
              </div>
              <QuickActionToolbar />
            </div>

            <QRCheckInInteractive />
          </div>
        </main>
      </div>
    </UserAuthGuard>
  );
}