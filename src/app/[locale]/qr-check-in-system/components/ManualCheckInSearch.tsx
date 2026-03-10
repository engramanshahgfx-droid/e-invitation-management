'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Guest {
  id: number;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  image: string;
  alt: string;
  status: 'pending' | 'confirmed' | 'checked-in';
  tableNumber?: string;
  invitationCode: string;
}

interface ManualCheckInSearchProps {
  onCheckIn: (guestId: number) => void;
  className?: string;
}

const ManualCheckInSearch = ({ onCheckIn, className = '' }: ManualCheckInSearchProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const mockGuests: Guest[] = [
  {
    id: 1,
    name: 'Sarah Ahmed Al-Mutairi',
    nameAr: 'سارة أحمد المطيري',
    email: 'sarah.almutairi@email.com',
    phone: '+966 50 123 4567',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_15be21417-1763300642898.png",
    alt: 'Professional Arab woman in burgundy hijab with warm smile and formal attire',
    status: 'confirmed',
    tableNumber: 'A-15',
    invitationCode: 'INV-SAR2026'
  },
  {
    id: 2,
    name: 'Mohammed Khalid Al-Dosari',
    nameAr: 'محمد خالد الدوسري',
    email: 'mohammed.dosari@email.com',
    phone: '+966 55 234 5678',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1de59f661-1763295911995.png",
    alt: 'Confident Arab businessman in charcoal suit with professional demeanor',
    status: 'pending',
    tableNumber: 'B-8',
    invitationCode: 'INV-MOH2026'
  },
  {
    id: 3,
    name: 'Noura Hassan Al-Qahtani',
    nameAr: 'نورة حسن القحطاني',
    email: 'noura.qahtani@email.com',
    phone: '+966 50 345 6789',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_16a279741-1763297983672.png",
    alt: 'Elegant Arab woman in navy hijab with professional appearance',
    status: 'confirmed',
    tableNumber: 'VIP-2',
    invitationCode: 'INV-NOU2026'
  }];


  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = mockGuests.filter((guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.nameAr.includes(searchQuery) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery) ||
      guest.invitationCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isHydrated]);

  const handleCheckIn = (guest: Guest) => {
    if (guest.status === 'checked-in') return;
    setSelectedGuest(guest);
    onCheckIn(guest.id);
  };

  const getStatusBadge = (status: Guest['status']) => {
    const badges = {
      pending: { label: 'Pending', color: 'bg-warning/10 text-warning' },
      confirmed: { label: 'Confirmed', color: 'bg-success/10 text-success' },
      'checked-in': { label: 'Checked In', color: 'bg-primary/10 text-primary' }
    };
    return badges[status];
  };

  if (!isHydrated) {
    return (
      <div className={`bg-card rounded-lg shadow-warm-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>);

  }

  return (
    <div className={`bg-card rounded-lg shadow-warm-md ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-md">
            <Icon name="MagnifyingGlassIcon" size={24} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-text-primary">Manual Check-in</h2>
            <p className="text-sm text-text-secondary">Search and check in guests manually</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="MagnifyingGlassIcon" size={20} className="text-text-secondary" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or invitation code..."
            className="w-full pl-12 pr-4 py-3 bg-muted border border-input rounded-md text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-3 focus:ring-ring" />
          
          {isSearching &&
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        </div>

        {searchQuery.trim() && searchResults.length === 0 && !isSearching &&
        <div className="mt-4 p-8 text-center">
            <Icon name="UserIcon" size={48} className="text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No guests found matching your search</p>
          </div>
        }

        {searchResults.length > 0 &&
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
            {searchResults.map((guest) => {
            const badge = getStatusBadge(guest.status);
            return (
              <div
                key={guest.id}
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-smooth">
                
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <AppImage
                      src={guest.image}
                      alt={guest.alt}
                      className="w-full h-full object-cover" />
                    
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary">{guest.name}</h3>
                          <p className="text-xs text-text-secondary">{guest.nameAr}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${badge.color} font-medium whitespace-nowrap`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                        <span className="flex items-center gap-1">
                          <Icon name="EnvelopeIcon" size={14} />
                          {guest.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="PhoneIcon" size={14} />
                          {guest.phone}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-secondary">Code: {guest.invitationCode}</span>
                        {guest.tableNumber &&
                      <span className="text-xs px-2 py-1 rounded-full bg-card text-text-primary">
                            Table {guest.tableNumber}
                          </span>
                      }
                      </div>
                    </div>

                    <button
                    onClick={() => handleCheckIn(guest)}
                    disabled={guest.status === 'checked-in'}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-smooth hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                    
                      {guest.status === 'checked-in' ? 'Checked In' : 'Check In'}
                    </button>
                  </div>
                </div>);

          })}
          </div>
        }

        {selectedGuest &&
        <div className="mt-4 p-4 bg-success/10 border-2 border-success rounded-lg animate-slide-up">
            <div className="flex items-center gap-3">
              <Icon name="CheckCircleIcon" size={24} className="text-success" />
              <div>
                <p className="font-semibold text-success">Check-in Successful</p>
                <p className="text-sm text-text-secondary">{selectedGuest.name} has been checked in</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>);

};

export default ManualCheckInSearch;