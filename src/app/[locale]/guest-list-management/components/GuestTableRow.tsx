'use client'

import Icon from '@/components/ui/AppIcon'
import AppImage from '@/components/ui/AppImage'

interface Guest {
  id: string | number
  name: string
  phone: string
  email: string
  invitationStatus: 'sent' | 'pending' | 'failed'
  deliveryStatus: 'delivered' | 'failed' | 'pending' | 'read'
  responseStatus: 'confirmed' | 'declined' | 'no-response'
  checkInTime: string | null
  qrCode: string
  avatar: string
  avatarAlt: string
  plusOnes: number
}

interface GuestTableRowProps {
  guest: Guest
  isSelected: boolean
  onSelect: (id: string | number) => void
  onUpdate: (guest: Guest) => void
  onDelete: (id: string | number) => void
}

const GuestTableRow = ({ guest, isSelected, onSelect, onUpdate, onDelete }: GuestTableRowProps) => {
  const getDeliveryStatusColor = (status: Guest['deliveryStatus']) => {
    const statusMap = {
      delivered: 'bg-success/10 text-success',
      failed: 'bg-destructive/10 text-destructive',
      pending: 'bg-warning/10 text-warning',
      read: 'bg-primary/10 text-primary',
    }
    return statusMap[status]
  }

  const getResponseStatusColor = (status: Guest['responseStatus']) => {
    const statusMap = {
      confirmed: 'bg-success/10 text-success',
      declined: 'bg-destructive/10 text-destructive',
      'no-response': 'bg-muted text-text-secondary',
    }
    return statusMap[status]
  }

  const getDeliveryStatusIcon = (status: Guest['deliveryStatus']) => {
    const iconMap = {
      delivered: 'CheckCircleIcon',
      failed: 'XCircleIcon',
      pending: 'ClockIcon',
      read: 'CheckBadgeIcon',
    }
    return iconMap[status]
  }

  return (
    <tr className="hover:bg-muted/50 transition-smooth border-b border-border">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(guest.id)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-2"
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
        <span className="font-mono text-sm text-text-primary">{guest.phone}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon
            name={getDeliveryStatusIcon(guest.deliveryStatus) as any}
            size={16}
            className={getDeliveryStatusColor(guest.deliveryStatus).split(' ')[1]}
          />
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getDeliveryStatusColor(guest.deliveryStatus)}`}
          >
            {guest.deliveryStatus}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getResponseStatusColor(guest.responseStatus)}`}>
          {guest.responseStatus.replace('-', ' ')}
        </span>
      </td>
      <td className="px-6 py-4">
        {guest.checkInTime ? (
          <div className="flex items-center gap-2">
            <Icon name="CheckBadgeIcon" size={16} className="text-success" />
            <span className="font-mono text-sm text-text-primary">{guest.checkInTime}</span>
          </div>
        ) : (
          <span className="text-sm text-text-secondary">Not checked in</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="font-mono text-sm text-text-primary">{guest.plusOnes}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate(guest)}
            className="text-red flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-blue-700"
            aria-label="Update guest"
          >
            <Icon name="PencilSquareIcon" size={16} />
            Update
          </button>
          <button
            onClick={() => onDelete(guest.id)}
            className="text-red flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-red-700"
            aria-label="Delete guest"
          >
            <Icon name="TrashIcon" size={16} />
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default GuestTableRow
