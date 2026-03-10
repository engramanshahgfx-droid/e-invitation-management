'use client';

import { useState, useEffect } from 'react';
import GuestTableRow from './GuestTableRow';
import GuestMobileCard from './GuestMobileCard';
import FilterPanel from './FilterPanel';
import BulkActionsBar from './BulkActionsBar';
import FileUploadZone from './FileUploadZone';
import AddGuestForm from './AddGuestForm';
import Icon from '@/components/ui/AppIcon';
import { getCurrentUser, getCurrentSession } from '@/lib/auth';

interface Event {
  id: string;
  name: string;
  date: string;
}

interface Guest {
  id: string | number;
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
  const [selectedGuests, setSelectedGuests] = useState<(string | number)[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: keyof Guest;direction: 'asc' | 'desc';} | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    deliveryStatus: 'all',
    responseStatus: 'all',
    checkInStatus: 'all',
    searchQuery: ''
  });
  
  // New state for file upload
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showAddGuestForm, setShowAddGuestForm] = useState(false);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);
  const [guestToUpdate, setGuestToUpdate] = useState<Guest | null>(null);

  // Fetch guests for the selected event
  const fetchGuests = async (eventId: string) => {
    if (!eventId || !token) return;

    setIsLoadingGuests(true);
    try {
      const response = await fetch(`/api/guests/list?eventId=${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedGuests = data.guests || [];
        
        // Map to the Guest interface with default avatar
        const mappedGuests: Guest[] = fetchedGuests.map((g: any) => ({
          id: g.id,
          name: g.name,
          phone: g.phone,
          email: g.email,
          invitationStatus: g.invitationStatus,
          deliveryStatus: g.deliveryStatus,
          responseStatus: g.responseStatus,
          checkInTime: g.checkInTime,
          qrCode: g.qrCode,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(g.name)}&background=4F46E5&color=fff&size=128`,
          avatarAlt: `Avatar for ${g.name}`,
          plusOnes: g.plusOnes || 0,
        }));

        setGuests(mappedGuests);
        setFilteredGuests(mappedGuests);
      } else {
        console.error('Failed to fetch guests');
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setIsLoadingGuests(false);
    }
  };

  // Fetch events on mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const user = await getCurrentUser();
        if (!user?.id) {
          setUploadError('User not authenticated');
          setIsHydrated(true);
          return;
        }

        setUserId(user.id);

        const session = await getCurrentSession();
        if (!session?.access_token) {
          setUploadError('No session token found');
          setIsHydrated(true);
          return;
        }

        setToken(session.access_token);

        // Fetch user's events
        setIsLoadingEvents(true);
        const response = await fetch('/api/events/list', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const eventsList = await response.json();
          setEvents(eventsList || []);
          
          // Auto-select first event if available
          if (eventsList && eventsList.length > 0) {
            setSelectedEventId(String(eventsList[0].id));
          }
        }
      } catch (err) {
        console.error('Error initializing component:', err);
        setUploadError('Failed to load events');
      } finally {
        setIsLoadingEvents(false);
        setIsHydrated(true);
      }
    };

    initializeComponent();
  }, []);

  // Fetch guests when event is selected
  useEffect(() => {
    if (selectedEventId && token) {
      fetchGuests(selectedEventId);
    } else {
      setGuests([]);
      setFilteredGuests([]);
    }
  }, [selectedEventId, token]);

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

  const handleSelectGuest = (id: string | number) => {
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

  const handleUpdateGuest = (guest: Guest) => {
    setGuestToUpdate(guest);
  };

  const handleDeleteGuest = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this guest?')) {
      return;
    }

    if (!token) {
      setUploadError('User not authenticated');
      return;
    }

    try {
      const response = await fetch(`/api/guests/delete?guestId=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete guest');
      }

      setUploadSuccess('Guest deleted successfully');
      
      // Refresh guests list
      if (selectedEventId) {
        await fetchGuests(selectedEventId);
      }
    } catch (err) {
      console.error('Error deleting guest:', err);
      setUploadError(`Failed to delete guest: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
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

  const handleFileUpload = async (file: File, replace: boolean = false) => {
    if (!selectedEventId) {
      setUploadError('Please select an event first');
      return;
    }

    if (!token) {
      setUploadError('User not authenticated');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      setDuplicates([]);

      console.log('Uploading file:', file.name, 'for event:', selectedEventId);

      const formData = new FormData();
      formData.append('file', file);

      const url = replace 
        ? `/api/guests/upload?eventId=${selectedEventId}&replace=true`
        : `/api/guests/upload?eventId=${selectedEventId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate detection
        if (response.status === 409 && data.duplicates) {
          setDuplicates(data.duplicates);
          setPendingFile(file);
          setUploadError(data.message || 'Duplicate guests detected. Would you like to replace the entire guest list?');
          return;
        }
        throw new Error(data.error || 'Failed to upload file');
      }

      console.log('Upload successful:', data);
      setUploadSuccess(`Successfully imported ${data.guestsCount} guests!`);
      setPendingFile(null);
      setDuplicates([]);

      // Refresh guests list
      await fetchGuests(selectedEventId);
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceGuests = async () => {
    if (pendingFile) {
      await handleFileUpload(pendingFile, true);
    }
  };

  const handleClearAllGuests = async () => {
    if (!selectedEventId) {
      setUploadError('Please select an event first');
      return;
    }

    if (!token) {
      setUploadError('User not authenticated');
      return;
    }

    if (!confirm('Are you sure you want to delete all guests from this event? This cannot be undone.')) {
      return;
    }

    try {
      setIsClearing(true);
      setUploadError(null);
      setUploadSuccess(null);

      const response = await fetch(`/api/guests/delete-all?eventId=${selectedEventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete guests');
      }

      setUploadSuccess('All guests have been deleted successfully');
      setDuplicates([]);
      setPendingFile(null);
      
      // Refresh guests list (should be empty now)
      await fetchGuests(selectedEventId);
    } catch (err) {
      console.error('Error deleting guests:', err);
      setUploadError(`Failed to clear guests: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleGuestAdded = async () => {
    setUploadSuccess('Guest added successfully!');
    // Refresh guest list
    if (selectedEventId) {
      await fetchGuests(selectedEventId);
    }
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
      {/* Event Selector and Upload Status */}
      <div className="mb-6 space-y-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <label className="block text-sm font-medium text-text-primary mb-3">
            Select Event for Guest Upload
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setUploadError(null);
              setUploadSuccess(null);
            }}
            disabled={isLoadingEvents || isUploading}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50">
            <option value="">-- Select an event --</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name} ({event.date})
              </option>
            ))}
          </select>
          {isLoadingEvents && (
            <p className="mt-2 text-sm text-text-secondary">Loading events...</p>
          )}
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">{uploadError}</p>
            {duplicates.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold">Duplicate phone numbers:</p>
                <div className="grid grid-cols-2 gap-2">
                  {duplicates.map((phone, idx) => (
                    <span key={idx} className="text-xs bg-red-100 px-2 py-1 rounded">
                      {phone}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleReplaceGuests}
                    disabled={isUploading}
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                    Replace All Guests
                  </button>
                  <p className="text-xs text-red-600 flex items-center">
                    This will delete all existing guests and import the new list.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">{uploadSuccess}</p>
          </div>
        )}
      </div>

      {/* Guest Management Options - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CSV Upload Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
              <Icon name="DocumentArrowUpIcon" className="w-5 h-5 text-primary" ariaLabel="Upload" />
              Bulk Import from CSV
            </h3>
            <p className="text-sm text-text-secondary">
              Upload a CSV file to add multiple guests at once
            </p>
          </div>
          <FileUploadZone 
            onFileUpload={handleFileUpload} 
            isLoading={isUploading}
            disabled={!selectedEventId || isUploading}
          />
        </div>

        {/* Manual Guest Entry Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
              <Icon name="UserPlusIcon" className="w-5 h-5 text-primary" ariaLabel="Add" />
              Add Guest Manually
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Enter guest details one by one
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Icon name="UserPlusIcon" size={32} className="text-primary" ariaLabel="Add Guest" />
            </div>
            <p className="text-sm text-text-secondary mb-4 text-center">
              Click below to add a single guest
            </p>
            <button
              onClick={() => setShowAddGuestForm(true)}
              disabled={!selectedEventId || isUploading}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
              <Icon name="UserPlusIcon" className="w-5 h-5" ariaLabel="Add" />
              Add Guest
            </button>
            {!selectedEventId && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded mt-4 text-center">
                Please select an event first
              </p>
            )}
          </div>
        </div>
      </div>

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
                onUpdate={handleUpdateGuest}
                onDelete={handleDeleteGuest} />

              )}
            </tbody>
          </table>

          {isLoadingGuests ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-primary font-medium">Loading guests...</p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Icon name="UserGroupIcon" size={48} className="text-text-secondary mb-4" />
              <p className="text-text-primary font-medium mb-1">No guests found</p>
              <p className="text-sm text-text-secondary">
                {guests.length === 0 
                  ? 'Add your first guest using CSV upload or manual entry above' 
                  : 'Try adjusting your filters or search query'
                }
              </p>
            </div>
          ) : null}
        </div>

        <div className="lg:hidden space-y-3 p-4">
          {isLoadingGuests ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-primary font-medium">Loading guests...</p>
            </div>
          ) : (
            <>
              {filteredGuests.map((guest) =>
              <GuestMobileCard
                key={guest.id}
                guest={guest}
                isSelected={selectedGuests.includes(guest.id)}
                onSelect={handleSelectGuest}
                onUpdate={handleUpdateGuest}
                onDelete={handleDeleteGuest} />

              )}

              {filteredGuests.length === 0 &&
              <div className="flex flex-col items-center justify-center py-16">
                  <Icon name="UserGroupIcon" size={48} className="text-text-secondary mb-4" />
                  <p className="text-text-primary font-medium mb-1">No guests found</p>
                  <p className="text-sm text-text-secondary text-center">
                    {guests.length === 0 
                      ? 'Add your first guest using CSV upload or manual entry above' 
                      : 'Try adjusting your filters or search query'
                    }
                  </p>
                </div>
              }
            </>
          )}
        </div>
      </div>

      <BulkActionsBar
        selectedCount={selectedGuests.length}
        onSendWhatsApp={handleBulkSendWhatsApp}
        onUpdateStatus={handleBulkUpdateStatus}
        onExportExcel={handleBulkExportExcel}
        onGenerateQRCodes={handleBulkGenerateQRCodes}
        onDeselectAll={handleDeselectAll} />

      {/* Add/Update Guest Form Modal */}
      {(showAddGuestForm || guestToUpdate) && token && (
        <AddGuestForm
          eventId={selectedEventId}
          token={token}
          onSuccess={handleGuestAdded}
          onClose={() => {
            setShowAddGuestForm(false);
            setGuestToUpdate(null);
          }}
          guestToUpdate={guestToUpdate}
        />
      )}
      
    </div>);

};

export default GuestListInteractive;