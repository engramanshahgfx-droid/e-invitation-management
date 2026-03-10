'use client'

import Icon from '@/components/ui/AppIcon'
import AppImage from '@/components/ui/AppImage'
import { useEffect, useState } from 'react'

interface Guest {
  id: number
  name: string
  nameAr: string
  email: string
  phone: string
  image: string
  alt: string
  status: 'pending' | 'confirmed' | 'checked-in'
  tableNumber?: string
  invitationCode: string
}

interface ManualCheckInSearchProps {
  onCheckIn: (guestId: number) => void
  className?: string
}

const ManualCheckInSearch = ({ onCheckIn, className = '' }: ManualCheckInSearchProps) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Guest[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  const mockGuests: Guest[] = [
    {
      id: 1,
      name: 'Sarah Ahmed Al-Mutairi',
      nameAr: 'سارة أحمد المطيري',
      email: 'sarah.almutairi@email.com',
      phone: '+966 50 123 4567',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15be21417-1763300642898.png',
      alt: 'Professional Arab woman in burgundy hijab with warm smile and formal attire',
      status: 'confirmed',
      tableNumber: 'A-15',
      invitationCode: 'INV-SAR2026',
    },
    {
      id: 2,
      name: 'Mohammed Khalid Al-Dosari',
      nameAr: 'محمد خالد الدوسري',
      email: 'mohammed.dosari@email.com',
      phone: '+966 55 234 5678',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1de59f661-1763295911995.png',
      alt: 'Confident Arab businessman in charcoal suit with professional demeanor',
      status: 'pending',
      tableNumber: 'B-8',
      invitationCode: 'INV-MOH2026',
    },
    {
      id: 3,
      name: 'Noura Hassan Al-Qahtani',
      nameAr: 'نورة حسن القحطاني',
      email: 'noura.qahtani@email.com',
      phone: '+966 50 345 6789',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_16a279741-1763297983672.png',
      alt: 'Elegant Arab woman in navy hijab with professional appearance',
      status: 'confirmed',
      tableNumber: 'VIP-2',
      invitationCode: 'INV-NOU2026',
    },
  ]

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      const filtered = mockGuests.filter(
        (guest) =>
          guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.nameAr.includes(searchQuery) ||
          guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.phone.includes(searchQuery) ||
          guest.invitationCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, isHydrated])

  const handleCheckIn = (guest: Guest) => {
    if (guest.status === 'checked-in') return
    setSelectedGuest(guest)
    onCheckIn(guest.id)
  }

  const getStatusBadge = (status: Guest['status']) => {
    const badges = {
      pending: { label: 'Pending', color: 'bg-warning/10 text-warning' },
      confirmed: { label: 'Confirmed', color: 'bg-success/10 text-success' },
      'checked-in': { label: 'Checked In', color: 'bg-primary/10 text-primary' },
    }
    return badges[status]
  }

  if (!isHydrated) {
    return (
      <div className={`rounded-lg bg-card p-6 shadow-warm-md ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg bg-card shadow-warm-md ${className}`}>
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/10 rounded-md p-2">
            <Icon name="MagnifyingGlassIcon" size={24} className="text-secondary" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-text-primary">Manual Check-in</h2>
            <p className="text-sm text-text-secondary">Search and check in guests manually</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Icon name="MagnifyingGlassIcon" size={20} className="text-text-secondary" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or invitation code..."
            className="w-full rounded-md border border-input bg-muted py-3 pl-12 pr-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-3 focus:ring-ring"
          />

          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
          <div className="mt-4 p-8 text-center">
            <Icon name="UserIcon" size={48} className="mx-auto mb-3 text-text-secondary" />
            <p className="text-text-secondary">No guests found matching your search</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 max-h-[400px] space-y-2 overflow-y-auto">
            {searchResults.map((guest) => {
              const badge = getStatusBadge(guest.status)
              return (
                <div key={guest.id} className="hover:bg-muted/80 transition-smooth rounded-lg bg-muted p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                      <AppImage src={guest.image} alt={guest.alt} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary">{guest.name}</h3>
                          <p className="text-xs text-text-secondary">{guest.nameAr}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${badge.color} whitespace-nowrap font-medium`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Icon name="EnvelopeIcon" size={14} />
                          {guest.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="PhoneIcon" size={14} />
                          {guest.phone}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-text-secondary">Code: {guest.invitationCode}</span>
                        {guest.tableNumber && (
                          <span className="rounded-full bg-card px-2 py-1 text-xs text-text-primary">
                            Table {guest.tableNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCheckIn(guest)}
                      disabled={guest.status === 'checked-in'}
                      className="transition-smooth hover:bg-primary/90 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {guest.status === 'checked-in' ? 'Checked In' : 'Check In'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selectedGuest && (
          <div className="bg-success/10 mt-4 animate-slide-up rounded-lg border-2 border-success p-4">
            <div className="flex items-center gap-3">
              <Icon name="CheckCircleIcon" size={24} className="text-success" />
              <div>
                <p className="font-semibold text-success">Check-in Successful</p>
                <p className="text-sm text-text-secondary">{selectedGuest.name} has been checked in</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManualCheckInSearch
