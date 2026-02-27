'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  label: string;
  labelAr: string;
  icon: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  showOnPaths?: string[];
}

interface QuickActionToolbarProps {
  className?: string;
}

const QuickActionToolbar = ({ className = '' }: QuickActionToolbarProps) => {
  const pathname = usePathname();
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  const handleExportExcel = () => {
    console.log('Exporting to Excel...');
  };

  const handleWhatsAppBulk = () => {
    console.log('Sending bulk WhatsApp messages...');
  };

  const handleGenerateReport = () => {
    console.log('Generating report...');
  };

  const handlePrintBadges = () => {
    console.log('Printing badges...');
  };

  const handleSendReminders = () => {
    console.log('Sending reminders...');
  };

  const handleExportQR = () => {
    console.log('Exporting QR codes...');
  };

  const allActions: QuickAction[] = [
    {
      label: 'Export Excel',
      labelAr: 'تصدير إكسل',
      icon: 'DocumentArrowDownIcon',
      onClick: handleExportExcel,
      variant: 'primary',
      showOnPaths: ['/event-management-dashboard', '/guest-list-management'],
    },
    {
      label: 'WhatsApp Bulk',
      labelAr: 'واتساب جماعي',
      icon: 'ChatBubbleLeftRightIcon',
      onClick: handleWhatsAppBulk,
      variant: 'success',
      showOnPaths: ['/guest-list-management'],
    },
    {
      label: 'Generate Report',
      labelAr: 'إنشاء تقرير',
      icon: 'DocumentChartBarIcon',
      onClick: handleGenerateReport,
      variant: 'secondary',
      showOnPaths: ['/event-management-dashboard', '/qr-check-in-system'],
    },
    {
      label: 'Print Badges',
      labelAr: 'طباعة الشارات',
      icon: 'PrinterIcon',
      onClick: handlePrintBadges,
      variant: 'secondary',
      showOnPaths: ['/qr-check-in-system'],
    },
    {
      label: 'Send Reminders',
      labelAr: 'إرسال تذكيرات',
      icon: 'BellAlertIcon',
      onClick: handleSendReminders,
      variant: 'warning',
      showOnPaths: ['/guest-list-management'],
    },
    {
      label: 'Export QR Codes',
      labelAr: 'تصدير رموز QR',
      icon: 'QrCodeIcon',
      onClick: handleExportQR,
      variant: 'primary',
      showOnPaths: ['/guest-list-management', '/qr-check-in-system'],
    },
  ];

  const visibleActions = allActions.filter(
    (action) => !action.showOnPaths || action.showOnPaths.includes(pathname)
  );

  const primaryActions = visibleActions.slice(0, 3);
  const overflowActions = visibleActions.slice(3);

  const getButtonClasses = (variant: QuickAction['variant'] = 'secondary') => {
    const baseClasses = 'flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-smooth focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97';
    
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm-sm hover:shadow-warm-md hover:-translate-y-0.5',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-warm-sm hover:shadow-warm-md hover:-translate-y-0.5',
      success: 'bg-success text-success-foreground hover:bg-success/90 shadow-warm-sm hover:shadow-warm-md hover:-translate-y-0.5',
      warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow-warm-sm hover:shadow-warm-md hover:-translate-y-0.5',
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      <div className="hidden md:flex items-center gap-3">
        {primaryActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={getButtonClasses(action.variant)}
            aria-label={action.label}
          >
            <Icon name={action.icon as any} size={20} />
            <span className="text-sm">{action.label}</span>
          </button>
        ))}

        {overflowActions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsOverflowOpen(!isOverflowOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-muted text-text-primary rounded-md transition-smooth hover:bg-muted/80 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
              aria-label="More actions"
              aria-expanded={isOverflowOpen}
            >
              <Icon name="EllipsisHorizontalIcon" size={20} />
              <span className="text-sm font-medium">More</span>
            </button>

            {isOverflowOpen && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setIsOverflowOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full right-0 mt-2 w-56 bg-popover rounded-md shadow-warm-lg z-200 overflow-hidden animate-slide-in">
                  <div className="p-2">
                    {overflowActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.onClick();
                          setIsOverflowOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-text-primary rounded-md transition-smooth hover:bg-muted"
                      >
                        <Icon name={action.icon as any} size={20} />
                        <span className="text-sm">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="md:hidden">
        <button
          onClick={() => setIsOverflowOpen(!isOverflowOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md transition-smooth hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
          aria-label="Quick actions"
          aria-expanded={isOverflowOpen}
        >
          <Icon name="BoltIcon" size={20} />
          <span className="text-sm font-medium">Actions</span>
        </button>

        {isOverflowOpen && (
          <>
            <div
              className="fixed inset-0 z-50"
              onClick={() => setIsOverflowOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed bottom-0 left-0 right-0 bg-popover rounded-t-xl shadow-warm-xl z-200 animate-slide-up">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary font-heading">Quick Actions</h3>
                  <button
                    onClick={() => setIsOverflowOpen(false)}
                    className="p-2 text-text-secondary hover:text-text-primary transition-smooth"
                    aria-label="Close"
                  >
                    <Icon name="XMarkIcon" size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {visibleActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        setIsOverflowOpen(false);
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-muted rounded-md transition-smooth hover:bg-muted/80 active:scale-97"
                    >
                      <Icon name={action.icon as any} size={24} className="text-primary" />
                      <span className="text-xs text-center text-text-primary font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickActionToolbar;