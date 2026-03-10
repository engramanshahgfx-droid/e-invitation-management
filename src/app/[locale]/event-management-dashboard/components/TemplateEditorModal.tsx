'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { templateService, defaultTemplate, type TemplateData } from '@/lib/templateService';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: TemplateData) => void;
  eventId?: string;
  eventData?: {
    name: string;
    date: string;
    time?: string;
    venue: string;
  };
}

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  type: NotificationType;
  message: string;
}

const TemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  eventId,
  eventData 
}: TemplateEditorModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [template, setTemplate] = useState<TemplateData>(() => ({
    ...defaultTemplate,
    eventDetails: {
      date: eventData?.date || defaultTemplate.eventDetails.date,
      time: eventData?.time || defaultTemplate.eventDetails.time,
      venue: eventData?.venue || defaultTemplate.eventDetails.venue,
    },
  }));

  // Load existing template when modal opens
  const loadTemplate = useCallback(async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const existingTemplate = await templateService.getTemplate(eventId);
      if (existingTemplate) {
        setTemplate({
          language: existingTemplate.language,
          headerImage: existingTemplate.headerImage,
          title: existingTemplate.title,
          titleAr: existingTemplate.titleAr,
          message: existingTemplate.message,
          messageAr: existingTemplate.messageAr,
          eventDetails: {
            date: eventData?.date || existingTemplate.eventDetails.date,
            time: eventData?.time || existingTemplate.eventDetails.time,
            venue: eventData?.venue || existingTemplate.eventDetails.venue,
          },
          footerText: existingTemplate.footerText,
          footerTextAr: existingTemplate.footerTextAr,
        });
      } else if (eventData) {
        // No existing template, use defaults with event data
        setTemplate(prev => ({
          ...prev,
          eventDetails: {
            date: eventData.date || prev.eventDetails.date,
            time: eventData.time || prev.eventDetails.time,
            venue: eventData.venue || prev.eventDetails.venue,
          },
        }));
      }
    } catch (error) {
      console.error('Error loading template:', error);
      showNotification('error', 'Failed to load existing template');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, eventData]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isOpen && isHydrated) {
      loadTemplate();
      setHasUnsavedChanges(false);
    }
  }, [isOpen, isHydrated, loadTemplate]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
  };

  if (!isHydrated) {
    return null;
  }

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setHasUnsavedChanges(true);
    
    if (field.startsWith('eventDetails.')) {
      const detailField = field.split('.')[1];
      setTemplate((prev) => ({
        ...prev,
        eventDetails: {
          ...prev.eventDetails,
          [detailField]: value,
        },
      }));
    } else {
      setTemplate((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!template.title.trim()) {
        showNotification('error', 'Invitation title is required');
        setIsSaving(false);
        return;
      }

      if (!template.message.trim()) {
        showNotification('error', 'Invitation message is required');
        setIsSaving(false);
        return;
      }

      // Save to database/localStorage
      if (eventId) {
        const result = await templateService.saveTemplate(eventId, template);
        
        if (!result.success) {
          showNotification('error', result.error || 'Failed to save template');
          setIsSaving(false);
          return;
        }
      }

      // Call parent onSave
      onSave(template);
      
      showNotification('success', 'Template saved successfully!');
      setHasUnsavedChanges(false);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving template:', error);
      showNotification('error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    onClose();
  };

  const handleResetToDefault = () => {
    const confirmReset = window.confirm('Are you sure you want to reset to default template?');
    if (confirmReset) {
      setTemplate({
        ...defaultTemplate,
        eventDetails: {
          date: eventData?.date || defaultTemplate.eventDetails.date,
          time: eventData?.time || defaultTemplate.eventDetails.time,
          venue: eventData?.venue || defaultTemplate.eventDetails.venue,
        },
      });
      setHasUnsavedChanges(true);
      showNotification('info', 'Template reset to default');
    }
  };

  // Preview content based on selected language
  const previewContent = template.language === 'ar' ? {
    title: template.titleAr || 'أنت مدعو!',
    message: template.messageAr || 'يسعدنا دعوتك للاحتفال بهذه المناسبة الخاصة معنا. حضورك سيعني لنا الكثير.',
    dateLabel: 'التاريخ',
    timeLabel: 'الوقت',
    venueLabel: 'المكان',
    footerText: template.footerTextAr || 'يرجى تأكيد حضورك عن طريق مسح رمز QR أدناه.',
  } : {
    title: template.title,
    message: template.message,
    dateLabel: 'Date',
    timeLabel: 'Time',
    venueLabel: 'Venue',
    footerText: template.footerText,
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not set';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[300] animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-warm-xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="PaintBrushIcon" size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-text-primary">
                  Invitation Template Editor
                </h2>
                {eventData?.name && (
                  <p className="text-sm text-text-secondary">{eventData.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">
                  Unsaved changes
                </span>
              )}
              <button
                onClick={handleClose}
                className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-md hover:bg-muted"
                aria-label="Close modal"
              >
                <Icon name="XMarkIcon" size={24} />
              </button>
            </div>
          </div>

          {/* Notification Banner */}
          {notification && (
            <div
              className={`px-6 py-3 flex items-center gap-2 ${
                notification.type === 'success'
                  ? 'bg-success/10 text-success'
                  : notification.type === 'error'
                  ? 'bg-error/10 text-error'
                  : 'bg-info/10 text-info'
              }`}
            >
              <Icon
                name={
                  notification.type === 'success'
                    ? 'CheckCircleIcon'
                    : notification.type === 'error'
                    ? 'ExclamationCircleIcon'
                    : 'InformationCircleIcon'
                }
                size={20}
              />
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <p className="text-text-secondary">Loading template...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(90vh-120px)]">
              {/* Editor Panel */}
              <div className="p-6 overflow-y-auto border-r border-border">
                <div className="space-y-6">
                  {/* Language Selector */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Language / اللغة
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleChange('language', 'en')}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-smooth ${
                          template.language === 'en'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-text-primary hover:bg-muted/80'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => handleChange('language', 'ar')}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-smooth ${
                          template.language === 'ar'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-text-primary hover:bg-muted/80'
                        }`}
                      >
                        العربية
                      </button>
                    </div>
                  </div>

                  {/* Header Image URL */}
                  <div>
                    <label htmlFor="headerImage" className="block text-sm font-medium text-text-primary mb-2">
                      Header Image URL
                    </label>
                    <input
                      type="url"
                      id="headerImage"
                      value={template.headerImage}
                      onChange={(e) => handleChange('headerImage', e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="mt-1 text-xs text-text-secondary">
                      Recommended: 1200x600 pixels, JPG or PNG format
                    </p>
                  </div>

                  {/* Invitation Title (English) */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
                      Invitation Title (English)
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={template.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                      placeholder="You're Invited!"
                    />
                  </div>

                  {/* Invitation Title (Arabic) */}
                  <div>
                    <label htmlFor="titleAr" className="block text-sm font-medium text-text-primary mb-2">
                      Invitation Title (Arabic) / عنوان الدعوة
                    </label>
                    <input
                      type="text"
                      id="titleAr"
                      value={template.titleAr || ''}
                      onChange={(e) => handleChange('titleAr', e.target.value)}
                      dir="rtl"
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                      placeholder="أنت مدعو!"
                    />
                  </div>

                  {/* Invitation Message (English) */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                      Invitation Message (English)
                    </label>
                    <textarea
                      id="message"
                      value={template.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth resize-none"
                      placeholder="Enter your invitation message..."
                    />
                  </div>

                  {/* Invitation Message (Arabic) */}
                  <div>
                    <label htmlFor="messageAr" className="block text-sm font-medium text-text-primary mb-2">
                      Invitation Message (Arabic) / رسالة الدعوة
                    </label>
                    <textarea
                      id="messageAr"
                      value={template.messageAr || ''}
                      onChange={(e) => handleChange('messageAr', e.target.value)}
                      dir="rtl"
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth resize-none"
                      placeholder="أدخل رسالة الدعوة هنا..."
                    />
                  </div>

                  {/* Event Details */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Event Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-text-primary mb-2">
                          Event Date
                        </label>
                        <input
                          type="date"
                          id="eventDate"
                          value={template.eventDetails.date}
                          onChange={(e) => handleChange('eventDetails.date', e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                        />
                      </div>
                      <div>
                        <label htmlFor="eventTime" className="block text-sm font-medium text-text-primary mb-2">
                          Event Time
                        </label>
                        <input
                          type="time"
                          id="eventTime"
                          value={template.eventDetails.time}
                          onChange={(e) => handleChange('eventDetails.time', e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                        />
                      </div>
                      <div>
                        <label htmlFor="eventVenue" className="block text-sm font-medium text-text-primary mb-2">
                          Venue
                        </label>
                        <input
                          type="text"
                          id="eventVenue"
                          value={template.eventDetails.venue}
                          onChange={(e) => handleChange('eventDetails.venue', e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth"
                          placeholder="Venue name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Text (English) */}
                  <div>
                    <label htmlFor="footerText" className="block text-sm font-medium text-text-primary mb-2">
                      Footer Text (English)
                    </label>
                    <textarea
                      id="footerText"
                      value={template.footerText}
                      onChange={(e) => handleChange('footerText', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth resize-none"
                      placeholder="Footer message..."
                    />
                  </div>

                  {/* Footer Text (Arabic) */}
                  <div>
                    <label htmlFor="footerTextAr" className="block text-sm font-medium text-text-primary mb-2">
                      Footer Text (Arabic) / نص التذييل
                    </label>
                    <textarea
                      id="footerTextAr"
                      value={template.footerTextAr || ''}
                      onChange={(e) => handleChange('footerTextAr', e.target.value)}
                      dir="rtl"
                      rows={2}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 transition-smooth resize-none"
                      placeholder="نص التذييل هنا..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <button
                      onClick={handleResetToDefault}
                      className="px-4 py-2 text-text-secondary hover:text-text-primary transition-smooth rounded-md hover:bg-muted"
                      title="Reset to default template"
                    >
                      <Icon name="ArrowPathIcon" size={20} />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 bg-muted text-text-primary rounded-md font-medium transition-smooth hover:bg-muted/80 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium transition-smooth hover:bg-primary/90 shadow-warm-md hover:shadow-warm-lg focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="CheckIcon" size={20} />
                          <span>Save Template</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="p-6 bg-muted overflow-y-auto">
                <div className="sticky top-0 mb-4 bg-muted pb-2">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Live Preview</h3>
                  <p className="text-sm text-text-secondary">WhatsApp Message Format</p>
                </div>

                <div
                  className="bg-card rounded-lg shadow-warm-md overflow-hidden max-w-md mx-auto"
                  dir={template.language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {/* Header Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {template.headerImage ? (
                      <AppImage
                        src={template.headerImage}
                        alt="Invitation header image"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="PhotoIcon" size={48} className="text-text-secondary" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h2 className="text-2xl font-heading font-bold text-primary text-center">
                      {previewContent.title}
                    </h2>

                    <p className="text-text-primary leading-relaxed text-center">
                      {previewContent.message}
                    </p>

                    {/* Event Info Card */}
                    <div className="bg-primary/10 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="CalendarIcon" size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">{previewContent.dateLabel}</p>
                          <p className="text-sm font-medium text-text-primary">
                            {formatDate(template.eventDetails.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="ClockIcon" size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">{previewContent.timeLabel}</p>
                          <p className="text-sm font-medium text-text-primary">
                            {formatTime(template.eventDetails.time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="MapPinIcon" size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">{previewContent.venueLabel}</p>
                          <p className="text-sm font-medium text-text-primary">
                            {template.eventDetails.venue || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="flex justify-center py-4">
                      <div className="w-32 h-32 bg-white rounded-lg flex flex-col items-center justify-center border-2 border-border">
                        <Icon name="QrCodeIcon" size={64} className="text-primary" />
                        <span className="text-xs text-text-secondary mt-1">RSVP Code</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-text-secondary text-center">
                      {previewContent.footerText}
                    </p>
                  </div>
                </div>

                {/* Preview Tips */}
                <div className="mt-6 p-4 bg-info/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="LightBulbIcon" size={20} className="text-info flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-info">
                      <p className="font-medium mb-1">Preview Tips:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>This preview shows how your invitation will appear in WhatsApp</li>
                        <li>Toggle between English and Arabic to see both versions</li>
                        <li>QR codes will be unique for each guest</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TemplateEditorModal;
