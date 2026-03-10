'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Guest {
  id: string | number;
  name: string;
  phone: string;
  email: string;
  plusOnes: number;
  notes?: string;
}

interface AddGuestFormProps {
  eventId: string;
  token: string;
  onSuccess: () => void;
  onClose: () => void;
  guestToUpdate?: Guest | null;
}

const AddGuestForm = ({ eventId, token, onSuccess, onClose, guestToUpdate }: AddGuestFormProps) => {
  const isUpdateMode = !!guestToUpdate;
  
  const [formData, setFormData] = useState({
    name: guestToUpdate?.name ||'',
    phone: guestToUpdate?.phone || '',
    email: guestToUpdate?.email || '',
    plusOnes: String(guestToUpdate?.plusOnes || 0),
    notes: guestToUpdate?.notes || ''
  });

  // Update form data when guestToUpdate changes
  useEffect(() => {
    if (guestToUpdate) {
      setFormData({
        name: guestToUpdate.name,
        phone: guestToUpdate.phone,
        email: guestToUpdate.email,
        plusOnes: String(guestToUpdate.plusOnes || 0),
        notes: guestToUpdate.notes || ''
      });
    }
  }, [guestToUpdate]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/[\s\-\(\)\.]/g, ''))) {
      errors.phone = 'Invalid phone format. Include country code (e.g., +966)';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Plus ones validation
    const plusOnesNum = parseInt(formData.plusOnes);
    if (isNaN(plusOnesNum) || plusOnesNum < 0) {
      errors.plusOnes = 'Must be 0 or greater';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!eventId && !isUpdateMode) {
      setError('Please select an event first');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isUpdateMode ? '/api/guests/update' : '/api/guests/create';
      const method = isUpdateMode ? 'PUT' : 'POST';
      
      const requestBody = isUpdateMode
        ? {
            guestId: guestToUpdate?.id,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            plusOnes: parseInt(formData.plusOnes) || 0,
            notes: formData.notes.trim() || null,
          }
        : {
            eventId,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            plusOnes: parseInt(formData.plusOnes) || 0,
            notes: formData.notes.trim() || null,
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${isUpdateMode ? 'update' : 'add'} guest`);
        return;
      }

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        plusOnes: '0',
        notes: ''
      });

      // Notify parent component
      onSuccess();
      onClose();

    } catch (err) {
      console.error(`Error ${isUpdateMode ? 'updating' : 'adding'} guest:`, err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-40 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-text-primary">
              {isUpdateMode ? 'Update Guest' : 'Add New Guest'}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {isUpdateMode ? 'Update guest information' : 'Manually add a single guest to your event'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <Icon 
              name="XMarkIcon" 
              className="w-6 h-6 text-gray-500"
              ariaLabel="Close"
            />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <Icon name="ExclamationCircleIcon" className="w-5 h-5 mt-0.5 flex-shrink-0" ariaLabel="Error" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Guest Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., Ahmed Al-Rashid"
              disabled={isSubmitting}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., +966 50 123 4567"
              disabled={isSubmitting}
            />
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary">
              Include country code (e.g., +966 for Saudi Arabia)
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., ahmed.rashid@email.com"
              disabled={isSubmitting}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Plus Ones Field */}
          <div>
            <label htmlFor="plusOnes" className="block text-sm font-medium text-text-primary mb-2">
              Plus Ones (Companions)
            </label>
            <input
              type="number"
              id="plusOnes"
              value={formData.plusOnes}
              onChange={(e) => handleChange('plusOnes', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                validationErrors.plusOnes ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              min="0"
              max="10"
              disabled={isSubmitting}
            />
            {validationErrors.plusOnes && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.plusOnes}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary">
              Number of additional guests accompanying this person
            </p>
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-2">
              Special Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="e.g., Dietary restrictions, seating preferences, etc."
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Icon name="ArrowPathIcon" className="w-4 h-4 animate-spin" ariaLabel="Loading" />
                  {isUpdateMode ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Icon name={isUpdateMode ? "PencilSquareIcon" : "UserPlusIcon"} className="w-4 h-4" ariaLabel={isUpdateMode ? "Update" : "Add"} />
                  {isUpdateMode ? 'Update Guest' : 'Add Guest'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGuestForm;
