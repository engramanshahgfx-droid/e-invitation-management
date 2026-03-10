'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface CheckInRecord {
  id: number;
  guestName: string;
  guestNameAr: string;
  checkInTime: string;
  image: string;
  alt: string;
  status: 'success' | 'vip' | 'late';
  notes?: string;
  tableNumber?: string;
}

interface RecentCheckInsFeedProps {
  className?: string;
}

const RecentCheckInsFeed = ({ className = '' }: RecentCheckInsFeedProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([
  {
    id: 1,
    guestName: 'Ahmed Mohammed Al-Rashid',
    guestNameAr: 'أحمد محمد الراشد',
    checkInTime: '10:45 AM',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c6bcc831-1763295074920.png",
    alt: 'Professional Arab businessman in white thobe and red ghutra smiling confidently',
    status: 'success',
    tableNumber: 'A-12'
  },
  {
    id: 2,
    guestName: 'Fatima Hassan Al-Zahrani',
    guestNameAr: 'فاطمة حسن الزهراني',
    checkInTime: '10:42 AM',
    image: "https://images.unsplash.com/photo-1693488640512-43893ab8ea26",
    alt: 'Elegant Arab woman in black abaya with gold embroidery and matching hijab',
    status: 'vip',
    notes: 'VIP Guest - Special seating',
    tableNumber: 'VIP-3'
  },
  {
    id: 3,
    guestName: 'Omar Abdullah Al-Mansouri',
    guestNameAr: 'عمر عبدالله المنصوري',
    checkInTime: '10:38 AM',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1fec87729-1763295737673.png",
    alt: 'Young Arab professional man with trimmed beard in navy business suit',
    status: 'success',
    tableNumber: 'B-7'
  },
  {
    id: 4,
    guestName: 'Layla Ibrahim Al-Qasimi',
    guestNameAr: 'ليلى إبراهيم القاسمي',
    checkInTime: '10:35 AM',
    image: "https://images.unsplash.com/photo-1648659496783-2bfa124e11aa",
    alt: 'Sophisticated Arab woman in burgundy hijab and formal attire with warm smile',
    status: 'late',
    notes: 'Arrived 15 minutes late',
    tableNumber: 'C-4'
  },
  {
    id: 5,
    guestName: 'Khalid Saeed Al-Harbi',
    guestNameAr: 'خالد سعيد الحربي',
    checkInTime: '10:32 AM',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1de59f661-1763295911995.png",
    alt: 'Confident Arab businessman in charcoal suit with professional demeanor',
    status: 'success',
    tableNumber: 'A-8'
  }]
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getStatusBadge = (status: CheckInRecord['status']) => {
    const badges = {
      success: { label: 'Checked In', color: 'bg-success/10 text-success', icon: 'CheckCircleIcon' },
      vip: { label: 'VIP', color: 'bg-accent/10 text-accent', icon: 'StarIcon' },
      late: { label: 'Late Arrival', color: 'bg-warning/10 text-warning', icon: 'ClockIcon' }
    };
    return badges[status];
  };

  if (!isHydrated) {
    return (
      <div className={`bg-card rounded-lg shadow-warm-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) =>
            <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>);

  }

  return (
    <div className={`bg-card rounded-lg shadow-warm-md ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Icon name="ClockIcon" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-text-primary">Recent Check-ins</h2>
              <p className="text-sm text-text-secondary">Latest guest arrivals</p>
            </div>
          </div>
          <button
            className="text-primary hover:underline text-sm font-medium"
            aria-label="View all check-ins">
            
            View All
          </button>
        </div>
      </div>

      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {checkIns.map((checkIn) => {
          const badge = getStatusBadge(checkIn.status);
          return (
            <div key={checkIn.id} className="p-4 hover:bg-muted/30 transition-smooth">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <AppImage
                      src={checkIn.image}
                      alt={checkIn.alt}
                      className="w-full h-full object-cover" />
                    
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${badge.color} flex items-center justify-center`}>
                    <Icon name={badge.icon as any} size={12} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary truncate">{checkIn.guestName}</h3>
                      <p className="text-xs text-text-secondary">{checkIn.guestNameAr}</p>
                    </div>
                    <span className="text-xs text-text-secondary font-mono whitespace-nowrap">{checkIn.checkInTime}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${badge.color} font-medium`}>
                      {badge.label}
                    </span>
                    {checkIn.tableNumber &&
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-text-primary">
                        Table {checkIn.tableNumber}
                      </span>
                    }
                  </div>

                  {checkIn.notes &&
                  <p className="text-xs text-text-secondary mt-2 italic">{checkIn.notes}</p>
                  }
                </div>
              </div>
            </div>);

        })}
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Total check-ins today</span>
          <span className="font-semibold text-text-primary font-mono">142 guests</span>
        </div>
      </div>
    </div>);

};

export default RecentCheckInsFeed;