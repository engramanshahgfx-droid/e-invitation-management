'use client';

import Icon from '@/components/ui/AppIcon';

interface BulkActionsBarProps {
  selectedCount: number;
  onSendWhatsApp: () => void;
  onUpdateStatus: () => void;
  onExportExcel: () => void;
  onGenerateQRCodes: () => void;
  onDeselectAll: () => void;
}

const BulkActionsBar = ({
  selectedCount,
  onSendWhatsApp,
  onUpdateStatus,
  onExportExcel,
  onGenerateQRCodes,
  onDeselectAll,
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground shadow-warm-xl z-100 animate-slide-up">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon name="CheckCircleIcon" size={24} />
            <span className="text-sm font-medium">
              {selectedCount} guest{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onSendWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-md transition-smooth hover:bg-success/90 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97"
            >
              <Icon name="ChatBubbleLeftRightIcon" size={16} />
              <span className="text-sm font-medium">Send WhatsApp</span>
            </button>
            <button
              onClick={onUpdateStatus}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md transition-smooth hover:bg-secondary/90 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97"
            >
              <Icon name="PencilSquareIcon" size={16} />
              <span className="text-sm font-medium">Update Status</span>
            </button>
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md transition-smooth hover:bg-accent/90 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97"
            >
              <Icon name="DocumentArrowDownIcon" size={16} />
              <span className="text-sm font-medium">Export Excel</span>
            </button>
            <button
              onClick={onGenerateQRCodes}
              className="flex items-center gap-2 px-4 py-2 bg-primary-foreground text-primary rounded-md transition-smooth hover:bg-primary-foreground/90 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97"
            >
              <Icon name="QrCodeIcon" size={16} />
              <span className="text-sm font-medium">Generate QR Codes</span>
            </button>
            <button
              onClick={onDeselectAll}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md transition-smooth hover:bg-destructive/90 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97"
            >
              <Icon name="XMarkIcon" size={16} />
              <span className="text-sm font-medium">Deselect All</span>
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onSendWhatsApp}
              className="p-2 bg-success text-success-foreground rounded-md transition-smooth hover:bg-success/90 active:scale-97"
              aria-label="Send WhatsApp"
            >
              <Icon name="ChatBubbleLeftRightIcon" size={20} />
            </button>
            <button
              onClick={onExportExcel}
              className="p-2 bg-accent text-accent-foreground rounded-md transition-smooth hover:bg-accent/90 active:scale-97"
              aria-label="Export Excel"
            >
              <Icon name="DocumentArrowDownIcon" size={20} />
            </button>
            <button
              onClick={onDeselectAll}
              className="p-2 bg-destructive text-destructive-foreground rounded-md transition-smooth hover:bg-destructive/90 active:scale-97"
              aria-label="Deselect All"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;