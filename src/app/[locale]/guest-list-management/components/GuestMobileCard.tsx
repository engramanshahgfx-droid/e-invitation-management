'use client'

import Icon from '@/components/ui/AppIcon'
import AppImage from '@/components/ui/AppImage'
import { useState } from 'react'

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

interface GuestMobileCardProps {
  guest: Guest
  isSelected: boolean
  onSelect: (id: string | number) => void
  onUpdate: (guest: Guest) => void
  onDelete: (id: string | number) => void
}

const GuestMobileCard = ({ guest, isSelected, onSelect, onUpdate, onDelete }: GuestMobileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

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

  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-warm-sm">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(guest.id)}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-2"
          aria-label={`Select ${guest.name}`}
        />
        <AppImage
          src={guest.avatar}
          alt={guest.avatarAlt}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-text-primary">{guest.name}</h3>
              <p className="truncate text-xs text-text-secondary">{guest.email}</p>
              <p className="mt-1 font-mono text-xs text-text-secondary">{guest.phone}</p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="transition-smooth rounded-md p-1 hover:bg-muted"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              <Icon
                name="ChevronDownIcon"
                size={20}
                className={`transition-smooth text-text-secondary ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getDeliveryStatusColor(guest.deliveryStatus)}`}
            >
              {guest.deliveryStatus}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getResponseStatusColor(guest.responseStatus)}`}
            >
              {guest.responseStatus.replace('-', ' ')}
            </span>
          </div>

          {isExpanded && (
            <div className="mt-4 animate-slide-up space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Check-in Status:</span>
                {guest.checkInTime ? (
                  <div className="flex items-center gap-1">
                    <Icon name="CheckBadgeIcon" size={14} className="text-success" />
                    <span className="font-mono text-xs text-text-primary">{guest.checkInTime}</span>
                  </div>
                ) : (
                  <span className="text-xs text-text-secondary">Not checked in</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Plus Ones:</span>
                <span className="font-mono text-xs text-text-primary">{guest.plusOnes}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onUpdate(guest)}
                  className="flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 transition-colors hover:bg-blue-700"
                >
                  <Icon name="PencilSquareIcon" size={16} className="text-black" />
                  <span className="text-sm font-medium text-black">Update</span>
                </button>
                <button
                  onClick={() => onDelete(guest.id)}
                  className="flex items-center justify-center gap-1 rounded-md bg-red-600 px-3 py-2 transition-colors hover:bg-red-700"
                >
                  <Icon name="TrashIcon" size={16} className="text-black" />
                  <span className="text-sm font-medium text-black">Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GuestMobileCard
