'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

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

interface GuestMobileCardProps {
  guest: Guest;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onResendInvitation: (id: number) => void;
  onUpdateStatus: (id: number) => void;
  onGenerateQR: (id: number) => void;
}

const GuestMobileCard = ({
  guest,
  isSelected,
  onSelect,
  onResendInvitation,
  onUpdateStatus,
  onGenerateQR,
}: GuestMobileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDeliveryStatusColor = (status: Guest['deliveryStatus']) => {
    const statusMap = {
      delivered: 'bg-success/10 text-success',
      failed: 'bg-destructive/10 text-destructive',
      pending: 'bg-warning/10 text-warning',
      read: 'bg-primary/10 text-primary',
    };
    return statusMap[status];
  };

  const getResponseStatusColor = (status: Guest['responseStatus']) => {
    const statusMap = {
      confirmed: 'bg-success/10 text-success',
      declined: 'bg-destructive/10 text-destructive',
      'no-response': 'bg-muted text-text-secondary',
    };
    return statusMap[status];
  };

  return (
    <div className="bg-card border border-border rounded-md p-4 shadow-warm-sm">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(guest.id)}
          className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-2"
          aria-label={`Select ${guest.name}`}
        />
        <AppImage
          src={guest.avatar}
          alt={guest.avatarAlt}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-text-primary truncate">{guest.name}</h3>
              <p className="text-xs text-text-secondary truncate">{guest.email}</p>
              <p className="text-xs text-text-secondary font-mono mt-1">{guest.phone}</p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-muted rounded-md transition-smooth"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              <Icon
                name="ChevronDownIcon"
                size={20}
                className={`text-text-secondary transition-smooth ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDeliveryStatusColor(guest.deliveryStatus)}`}>
              {guest.deliveryStatus}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getResponseStatusColor(guest.responseStatus)}`}>
              {guest.responseStatus.replace('-', ' ')}
            </span>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Check-in Status:</span>
                {guest.checkInTime ? (
                  <div className="flex items-center gap-1">
                    <Icon name="CheckBadgeIcon" size={14} className="text-success" />
                    <span className="text-xs text-text-primary font-mono">{guest.checkInTime}</span>
                  </div>
                ) : (
                  <span className="text-xs text-text-secondary">Not checked in</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Plus Ones:</span>
                <span className="text-xs text-text-primary font-mono">{guest.plusOnes}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => onResendInvitation(guest.id)}
                  className="flex flex-col items-center gap-1 p-2 bg-muted rounded-md transition-smooth hover:bg-muted/80 active:scale-97"
                >
                  <Icon name="PaperAirplaneIcon" size={16} className="text-primary" />
                  <span className="text-xs text-text-primary">Resend</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(guest.id)}
                  className="flex flex-col items-center gap-1 p-2 bg-muted rounded-md transition-smooth hover:bg-muted/80 active:scale-97"
                >
                  <Icon name="PencilSquareIcon" size={16} className="text-primary" />
                  <span className="text-xs text-text-primary">Update</span>
                </button>
                <button
                  onClick={() => onGenerateQR(guest.id)}
                  className="flex flex-col items-center gap-1 p-2 bg-muted rounded-md transition-smooth hover:bg-muted/80 active:scale-97"
                >
                  <Icon name="QrCodeIcon" size={16} className="text-primary" />
                  <span className="text-xs text-text-primary">QR Code</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestMobileCard;