'use client';

import { useState, useEffect } from 'react';
import GuestTableRow from './GuestTableRow';
import GuestMobileCard from './GuestMobileCard';
import FilterPanel from './FilterPanel';
import BulkActionsBar from './BulkActionsBar';
import FileUploadZone from './FileUploadZone';
import Icon from '@/components/ui/AppIcon';

interface Guest {
  id: number;
  name: string;
  phone: string;
  email: string;
  invitationStatus: 'sent' | 'pending' | 'failed';
  deliveryStatus: 'delivered' | 'failed' | 'pending' | 'read';
  responseStatus: 'confirmed' | 'declined' | 'no-response';
  checkInTime: string | null;
  qrCode: string;
  avatar: string;
  avatarAlt: string;
  plusOnes: number;
}

interface FilterState {
  deliveryStatus: string;
  responseStatus: string;
  checkInStatus: string;
  searchQuery: string;
}

const GuestListInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: keyof Guest;direction: 'asc' | 'desc';} | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    deliveryStatus: 'all',
    responseStatus: 'all',
    checkInStatus: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    setIsHydrated(true);

    const mockGuests: Guest[] = [
    {
      id: 1,
      name: 'Ahmed Al-Rashid',
      phone: '+966 50 123 4567',
      email: 'ahmed.rashid@email.com',
      invitationStatus: 'sent',
      deliveryStatus: 'delivered',
      responseStatus: 'confirmed',
      checkInTime: '2026-02-22 14:30',
      qrCode: 'QR-001-AHMED',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c7263203-1763291891265.png",
      avatarAlt: 'Professional headshot of Middle Eastern man with short black hair in navy suit',
      plusOnes: 2
    },
    {
      id: 2,
      name: 'Fatima Al-Zahrani',
      phone: '+966 55 234 5678',
      email: 'fatima.zahrani@email.com',
      invitationStatus: 'sent',
      deliveryStatus: 'read',
      responseStatus: 'confirmed',
      checkInTime: null,
      qrCode: 'QR-002-FATIMA',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b7a79e0a-1763295172587.png",
      avatarAlt: 'Professional portrait of Middle Eastern woman with hijab in elegant attire',
      plusOnes: 1
    },
    {
      id: 3,
      name: 'Mohammed Al-Qahtani',
      phone: '+966 50 345 6789',
      email: 'mohammed.qahtani@email.com',
      invitationStatus: 'sent',
      deliveryStatus: 'delivered',
      responseStatus: 'no-response',
      checkInTime: null,
      qrCode: 'QR-003-MOHAMMED',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1161a7ebd-1763294739154.png",
      avatarAlt: 'Professional headshot of Middle Eastern man with beard in traditional thobe',
      plusOnes: 3
    },
    {
      id: 4,
      name: 'Sarah Al-Mutairi',
      phone: '+966 55 456 7890',
      email: 'sarah.mutairi@email.com',
      invitationStatus: 'sent',
      deliveryStatus: 'failed',
      responseStatus: 'no-response',
      checkInTime: null,
      qrCode: 'QR-004-SARAH',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_12bed7637-1763301543386.png",
      avatarAlt: 'Professional portrait of Middle Eastern woman with long dark hair in business attire',
      plusOnes: 0
    },
    {
      id: 5,
      name: 'Abdullah Al-Harbi',
      phone: '+966 50 567 8901',
      email: 'abdullah.harbi@email.com',
      invitationStatus: 'sent',
      deliveryStatus: 'delivered',
      responseStatus: 'declined',
      checkInTime: null,
      qrCode: 'QR-005-ABDULLAH',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_144300f64-1763292526703.png",
      avatarAlt: 'Professional headshot of Middle Eastern man with glasses in formal suit',
      plusOnes: 1
    },
    {
      id: 6,
      name: 'Noura Al-Dosari',
      phone: '+966 55 678 9012',
      email: 'noura.dosari@email.com',
      invitationStatus: 'sent',
      deliveryStatus: 'pending',
      responseStatus: 'no-response',
      checkInTime: null,
      qrCode: 'QR-006-NOURA',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1999c59fd-1763299494112.png",
      avatarAlt: 'Professional portrait of Middle Eastern woman with hijab in modern office setting',
      plusOnes: 2
    },
    {
      id: 7,
      name: 'Khalid Al-Shammari',
      phone: '+966 50 789 0123',
      email: 'khalid.shammari@email.com',
      invitationStatus: 'sent',
      deliveryStatus: 'delivered',
      responseStatus: 'confirmed',
      checkInTime: '2026-02-22 15:15',
      qrCode: 'QR-007-KHALID',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1111b11c8-1763292703367.png",
      avatarAlt: 'Professional headshot of Middle Eastern man with short hair in business casual attire',
      plusOnes: 1
    },
    {
      id: 8,
      name: 'Aisha Al-Ghamdi',
      phone: '+966 55 890 1234',
      email: 'aisha.ghamdi@email.com',
      invitationStatus: 'sent',
      deliveryStatus: 'read',
      responseStatus: 'confirmed',
      checkInTime: '2026-02-22 14:45',
      qrCode: 'QR-008-AISHA',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1beaf769e-1763297163087.png",
      avatarAlt: 'Professional portrait of Middle Eastern woman with elegant makeup in formal dress',
      plusOnes: 0
    }];


    setGuests(mockGuests);
    setFilteredGuests(mockGuests);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    let filtered = [...guests];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (guest) =>
        guest.name.toLowerCase().includes(query) ||
        guest.phone.toLowerCase().includes(query) ||
        guest.email.toLowerCase().includes(query)
      );
    }

    if (filters.deliveryStatus !== 'all') {
      filtered = filtered.filter((guest) => guest.deliveryStatus === filters.deliveryStatus);
    }

    if (filters.responseStatus !== 'all') {
      filtered = filtered.filter((guest) => guest.responseStatus === filters.responseStatus);
    }

    if (filters.checkInStatus !== 'all') {
      if (filters.checkInStatus === 'checked-in') {
        filtered = filtered.filter((guest) => guest.checkInTime !== null);
      } else {
        filtered = filtered.filter((guest) => guest.checkInTime === null);
      }
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredGuests(filtered);
  }, [filters, guests, sortConfig, isHydrated]);

  const handleSort = (key: keyof Guest) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleSelectGuest = (id: number) => {
    setSelectedGuests((current) =>
    current.includes(id) ? current.filter((guestId) => guestId !== id) : [...current, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map((guest) => guest.id));
    }
  };

  const handleResendInvitation = (id: number) => {
    console.log('Resending invitation to guest:', id);
  };

  const handleUpdateStatus = (id: number) => {
    console.log('Updating status for guest:', id);
  };

  const handleGenerateQR = (id: number) => {
    console.log('Generating QR code for guest:', id);
  };

  const handleBulkSendWhatsApp = () => {
    console.log('Sending WhatsApp to selected guests:', selectedGuests);
  };

  const handleBulkUpdateStatus = () => {
    console.log('Updating status for selected guests:', selectedGuests);
  };

  const handleBulkExportExcel = () => {
    console.log('Exporting selected guests to Excel:', selectedGuests);
  };

  const handleBulkGenerateQRCodes = () => {
    console.log('Generating QR codes for selected guests:', selectedGuests);
  };

  const handleDeselectAll = () => {
    setSelectedGuests([]);
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
  };

  const guestCounts = {
    total: guests.length,
    delivered: guests.filter((g) => g.deliveryStatus === 'delivered').length,
    failed: guests.filter((g) => g.deliveryStatus === 'failed').length,
    pending: guests.filter((g) => g.deliveryStatus === 'pending').length,
    confirmed: guests.filter((g) => g.responseStatus === 'confirmed').length,
    declined: guests.filter((g) => g.responseStatus === 'declined').length,
    noResponse: guests.filter((g) => g.responseStatus === 'no-response').length,
    checkedIn: guests.filter((g) => g.checkInTime !== null).length
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>);

  }

  return (
    <div className="pb-24">
      <FileUploadZone onFileUpload={handleFileUpload} />

      <FilterPanel filters={filters} onFilterChange={setFilters} guestCounts={guestCounts} />

      <div className="bg-card border border-border rounded-md shadow-warm-md overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-2"
                    aria-label="Select all guests" />
                  
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-smooth">
                    
                    Guest Name
                    <Icon
                      name="ChevronUpDownIcon"
                      size={16}
                      className={sortConfig?.key === 'name' ? 'text-primary' : 'text-text-secondary'} />
                    
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('phone')}
                    className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-smooth">
                    
                    Phone Number
                    <Icon
                      name="ChevronUpDownIcon"
                      size={16}
                      className={sortConfig?.key === 'phone' ? 'text-primary' : 'text-text-secondary'} />
                    
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('deliveryStatus')}
                    className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-smooth">
                    
                    Delivery Status
                    <Icon
                      name="ChevronUpDownIcon"
                      size={16}
                      className={sortConfig?.key === 'deliveryStatus' ? 'text-primary' : 'text-text-secondary'} />
                    
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('responseStatus')}
                    className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-smooth">
                    
                    Response Status
                    <Icon
                      name="ChevronUpDownIcon"
                      size={16}
                      className={sortConfig?.key === 'responseStatus' ? 'text-primary' : 'text-text-secondary'} />
                    
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('checkInTime')}
                    className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-smooth">
                    
                    Check-in Time
                    <Icon
                      name="ChevronUpDownIcon"
                      size={16}
                      className={sortConfig?.key === 'checkInTime' ? 'text-primary' : 'text-text-secondary'} />
                    
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-medium text-text-primary">Plus Ones</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-medium text-text-primary">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) =>
              <GuestTableRow
                key={guest.id}
                guest={guest}
                isSelected={selectedGuests.includes(guest.id)}
                onSelect={handleSelectGuest}
                onResendInvitation={handleResendInvitation}
                onUpdateStatus={handleUpdateStatus}
                onGenerateQR={handleGenerateQR} />

              )}
            </tbody>
          </table>

          {filteredGuests.length === 0 &&
          <div className="flex flex-col items-center justify-center py-16">
              <Icon name="UserGroupIcon" size={48} className="text-text-secondary mb-4" />
              <p className="text-text-primary font-medium mb-1">No guests found</p>
              <p className="text-sm text-text-secondary">Try adjusting your filters or search query</p>
            </div>
          }
        </div>

        <div className="lg:hidden space-y-3 p-4">
          {filteredGuests.map((guest) =>
          <GuestMobileCard
            key={guest.id}
            guest={guest}
            isSelected={selectedGuests.includes(guest.id)}
            onSelect={handleSelectGuest}
            onResendInvitation={handleResendInvitation}
            onUpdateStatus={handleUpdateStatus}
            onGenerateQR={handleGenerateQR} />

          )}

          {filteredGuests.length === 0 &&
          <div className="flex flex-col items-center justify-center py-16">
              <Icon name="UserGroupIcon" size={48} className="text-text-secondary mb-4" />
              <p className="text-text-primary font-medium mb-1">No guests found</p>
              <p className="text-sm text-text-secondary text-center">Try adjusting your filters or search query</p>
            </div>
          }
        </div>
      </div>

      <BulkActionsBar
        selectedCount={selectedGuests.length}
        onSendWhatsApp={handleBulkSendWhatsApp}
        onUpdateStatus={handleBulkUpdateStatus}
        onExportExcel={handleBulkExportExcel}
        onGenerateQRCodes={handleBulkGenerateQRCodes}
        onDeselectAll={handleDeselectAll} />
      
    </div>);

};

export default GuestListInteractive;