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

interface GuestTableRowProps {
  guest: Guest;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onResendInvitation: (id: number) => void;
  onUpdateStatus: (id: number) => void;
  onGenerateQR: (id: number) => void;
}

const GuestTableRow = ({
  guest,
  isSelected,
  onSelect,
  onResendInvitation,
  onUpdateStatus,
  onGenerateQR,
}: GuestTableRowProps) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

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

  const getDeliveryStatusIcon = (status: Guest['deliveryStatus']) => {
    const iconMap = {
      delivered: 'CheckCircleIcon',
      failed: 'XCircleIcon',
      pending: 'ClockIcon',
      read: 'CheckBadgeIcon',
    };
    return iconMap[status];
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(guest.id)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-2"
          aria-label={`Select ${guest.name}`}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <AppImage
            src={guest.avatar}
            alt={guest.avatarAlt}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-text-primary">{guest.name}</span>
            <span className="text-xs text-text-secondary">{guest.email}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-text-primary font-mono">{guest.phone}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon
            name={getDeliveryStatusIcon(guest.deliveryStatus) as any}
            size={16}
            className={getDeliveryStatusColor(guest.deliveryStatus).split(' ')[1]}
          />
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDeliveryStatusColor(guest.deliveryStatus)}`}>
            {guest.deliveryStatus}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getResponseStatusColor(guest.responseStatus)}`}>
          {guest.responseStatus.replace('-', ' ')}
        </span>
      </td>
      <td className="px-6 py-4">
        {guest.checkInTime ? (
          <div className="flex items-center gap-2">
            <Icon name="CheckBadgeIcon" size={16} className="text-success" />
            <span className="text-sm text-text-primary font-mono">{guest.checkInTime}</span>
          </div>
        ) : (
          <span className="text-sm text-text-secondary">Not checked in</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-text-primary font-mono">{guest.plusOnes}</span>
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="p-2 hover:bg-muted rounded-md transition-smooth"
            aria-label="Guest actions"
            aria-expanded={isActionsOpen}
          >
            <Icon name="EllipsisVerticalIcon" size={20} className="text-text-secondary" />
          </button>

          {isActionsOpen && (
            <>
              <div
                className="fixed inset-0 z-50"
                onClick={() => setIsActionsOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover rounded-md shadow-warm-lg z-200 overflow-hidden animate-slide-in">
                <div className="p-2">
                  <button
                    onClick={() => {
                      onResendInvitation(guest.id);
                      setIsActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-text-primary rounded-md transition-smooth hover:bg-muted"
                  >
                    <Icon name="PaperAirplaneIcon" size={16} />
                    <span className="text-sm">Resend Invitation</span>
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(guest.id);
                      setIsActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-text-primary rounded-md transition-smooth hover:bg-muted"
                  >
                    <Icon name="PencilSquareIcon" size={16} />
                    <span className="text-sm">Update Status</span>
                  </button>
                  <button
                    onClick={() => {
                      onGenerateQR(guest.id);
                      setIsActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-text-primary rounded-md transition-smooth hover:bg-muted"
                  >
                    <Icon name="QrCodeIcon" size={16} />
                    <span className="text-sm">Generate QR Code</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default GuestTableRow;