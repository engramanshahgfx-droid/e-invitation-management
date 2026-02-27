'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterState {
  deliveryStatus: string;
  responseStatus: string;
  checkInStatus: string;
  searchQuery: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  guestCounts: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    confirmed: number;
    declined: number;
    noResponse: number;
    checkedIn: number;
  };
}

const FilterPanel = ({ filters, onFilterChange, guestCounts }: FilterPanelProps) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      deliveryStatus: 'all',
      responseStatus: 'all',
      checkInStatus: 'all',
      searchQuery: '',
    });
  };

  const FilterContent = () => (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="search" className="text-sm font-medium text-text-primary">
          Search Guests
        </label>
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            id="search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-md text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="deliveryStatus" className="text-sm font-medium text-text-primary">
          Delivery Status
        </label>
        <select
          id="deliveryStatus"
          value={filters.deliveryStatus}
          onChange={(e) => handleFilterChange('deliveryStatus', e.target.value)}
          className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All ({guestCounts.total})</option>
          <option value="delivered">Delivered ({guestCounts.delivered})</option>
          <option value="failed">Failed ({guestCounts.failed})</option>
          <option value="pending">Pending ({guestCounts.pending})</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="responseStatus" className="text-sm font-medium text-text-primary">
          Response Status
        </label>
        <select
          id="responseStatus"
          value={filters.responseStatus}
          onChange={(e) => handleFilterChange('responseStatus', e.target.value)}
          className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All ({guestCounts.total})</option>
          <option value="confirmed">Confirmed ({guestCounts.confirmed})</option>
          <option value="declined">Declined ({guestCounts.declined})</option>
          <option value="no-response">No Response ({guestCounts.noResponse})</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="checkInStatus" className="text-sm font-medium text-text-primary">
          Check-in Status
        </label>
        <select
          id="checkInStatus"
          value={filters.checkInStatus}
          onChange={(e) => handleFilterChange('checkInStatus', e.target.value)}
          className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All ({guestCounts.total})</option>
          <option value="checked-in">Checked In ({guestCounts.checkedIn})</option>
          <option value="not-checked-in">Not Checked In ({guestCounts.total - guestCounts.checkedIn})</option>
        </select>
      </div>

      <button
        onClick={handleClearFilters}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-text-primary rounded-md transition-smooth hover:bg-muted/80 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
      >
        <Icon name="XMarkIcon" size={16} />
        <span className="text-sm font-medium">Clear Filters</span>
      </button>
    </>
  );

  return (
    <>
      <div className="hidden lg:grid grid-cols-4 gap-4 mb-6">
        <FilterContent />
      </div>

      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-md transition-smooth hover:bg-muted"
          aria-expanded={isMobileFilterOpen}
          aria-label="Toggle filters"
        >
          <div className="flex items-center gap-2">
            <Icon name="FunnelIcon" size={20} className="text-primary" />
            <span className="text-sm font-medium text-text-primary">Filters & Search</span>
          </div>
          <Icon
            name="ChevronDownIcon"
            size={16}
            className={`text-text-secondary transition-smooth ${isMobileFilterOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isMobileFilterOpen && (
          <div className="mt-3 p-4 bg-card border border-border rounded-md space-y-4 animate-slide-up">
            <FilterContent />
          </div>
        )}
      </div>
    </>
  );
};

export default FilterPanel;