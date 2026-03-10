'use client'

import Icon from '@/components/ui/AppIcon'
import AppImage from '@/components/ui/AppImage'
import { useEffect, useState } from 'react'

interface CheckInRecord {
  id: number
  guestName: string
  guestNameAr: string
  checkInTime: string
  image: string
  alt: string
  status: 'success' | 'vip' | 'late'
  notes?: string
  tableNumber?: string
}

interface RecentCheckInsFeedProps {
  className?: string
}

const RecentCheckInsFeed = ({ className = '' }: RecentCheckInsFeedProps) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([
    {
      id: 1,
      guestName: 'Ahmed Mohammed Al-Rashid',
      guestNameAr: 'أحمد محمد الراشد',
      checkInTime: '10:45 AM',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c6bcc831-1763295074920.png',
      alt: 'Professional Arab businessman in white thobe and red ghutra smiling confidently',
      status: 'success',
      tableNumber: 'A-12',
    },
    {
      id: 2,
      guestName: 'Fatima Hassan Al-Zahrani',
      guestNameAr: 'فاطمة حسن الزهراني',
      checkInTime: '10:42 AM',
      image: 'https://images.unsplash.com/photo-1693488640512-43893ab8ea26',
      alt: 'Elegant Arab woman in black abaya with gold embroidery and matching hijab',
      status: 'vip',
      notes: 'VIP Guest - Special seating',
      tableNumber: 'VIP-3',
    },
    {
      id: 3,
      guestName: 'Omar Abdullah Al-Mansouri',
      guestNameAr: 'عمر عبدالله المنصوري',
      checkInTime: '10:38 AM',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1fec87729-1763295737673.png',
      alt: 'Young Arab professional man with trimmed beard in navy business suit',
      status: 'success',
      tableNumber: 'B-7',
    },
    {
      id: 4,
      guestName: 'Layla Ibrahim Al-Qasimi',
      guestNameAr: 'ليلى إبراهيم القاسمي',
      checkInTime: '10:35 AM',
      image: 'https://images.unsplash.com/photo-1648659496783-2bfa124e11aa',
      alt: 'Sophisticated Arab woman in burgundy hijab and formal attire with warm smile',
      status: 'late',
      notes: 'Arrived 15 minutes late',
      tableNumber: 'C-4',
    },
    {
      id: 5,
      guestName: 'Khalid Saeed Al-Harbi',
      guestNameAr: 'خالد سعيد الحربي',
      checkInTime: '10:32 AM',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1de59f661-1763295911995.png',
      alt: 'Confident Arab businessman in charcoal suit with professional demeanor',
      status: 'success',
      tableNumber: 'A-8',
    },
  ])

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const getStatusBadge = (status: CheckInRecord['status']) => {
    const badges = {
      success: { label: 'Checked In', color: 'bg-success/10 text-success', icon: 'CheckCircleIcon' },
      vip: { label: 'VIP', color: 'bg-accent/10 text-accent', icon: 'StarIcon' },
      late: { label: 'Late Arrival', color: 'bg-warning/10 text-warning', icon: 'ClockIcon' },
    }
    return badges[status]
  }

  if (!isHydrated) {
    return (
      <div className={`rounded-lg bg-card p-6 shadow-warm-md ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg bg-card shadow-warm-md ${className}`}>
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-md p-2">
              <Icon name="ClockIcon" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary">Recent Check-ins</h2>
              <p className="text-sm text-text-secondary">Latest guest arrivals</p>
            </div>
          </div>
          <button className="text-sm font-medium text-primary hover:underline" aria-label="View all check-ins">
            View All
          </button>
        </div>
      </div>

      <div className="max-h-[600px] divide-y divide-border overflow-y-auto">
        {checkIns.map((checkIn) => {
          const badge = getStatusBadge(checkIn.status)
          return (
            <div key={checkIn.id} className="hover:bg-muted/30 transition-smooth p-4">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="h-12 w-12 overflow-hidden rounded-full">
                    <AppImage src={checkIn.image} alt={checkIn.alt} className="h-full w-full object-cover" />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${badge.color} flex items-center justify-center`}
                  >
                    <Icon name={badge.icon as any} size={12} />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="truncate text-sm font-semibold text-text-primary">{checkIn.guestName}</h3>
                      <p className="text-xs text-text-secondary">{checkIn.guestNameAr}</p>
                    </div>
                    <span className="whitespace-nowrap font-mono text-xs text-text-secondary">
                      {checkIn.checkInTime}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs ${badge.color} font-medium`}>{badge.label}</span>
                    {checkIn.tableNumber && (
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-text-primary">
                        Table {checkIn.tableNumber}
                      </span>
                    )}
                  </div>

                  {checkIn.notes && <p className="mt-2 text-xs italic text-text-secondary">{checkIn.notes}</p>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-muted/30 border-t border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Total check-ins today</span>
          <span className="font-mono font-semibold text-text-primary">142 guests</span>
        </div>
      </div>
    </div>
  )
}

export default RecentCheckInsFeed
