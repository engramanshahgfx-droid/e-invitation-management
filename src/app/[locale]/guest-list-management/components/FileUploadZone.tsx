'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const FileUploadZone = ({ onFileUpload, isLoading = false, disabled = false }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled || isLoading) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled || isLoading) return;
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Only accept CSV files
    if (!file.type.includes('text') && file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setUploadMessage('Please upload a CSV file. If you have an Excel file, export it as CSV first.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Processing file...');
    onFileUpload(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md p-8 transition-smooth ${
          disabled
            ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
            : isDragging
            ? 'border-primary bg-primary/5'
            : isLoading || uploadStatus === 'uploading'
            ? 'border-primary bg-primary/5'
            : uploadStatus === 'error' ?'border-destructive bg-destructive/5'
            : uploadStatus === 'success' ?'border-success bg-success/5' :'border-border bg-muted/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload guest list CSV file"
          disabled={disabled || isLoading}
        />

        <div className="flex flex-col items-center gap-4">
          {isLoading || uploadStatus === 'uploading' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-primary font-medium">{isLoading ? 'Uploading...' : uploadMessage}</p>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="CheckCircleIcon" size={32} className="text-success" />
              </div>
              <p className="text-sm text-text-primary font-medium text-center">{uploadMessage}</p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <Icon name="XCircleIcon" size={32} className="text-destructive" />
              </div>
              <p className="text-sm text-destructive font-medium text-center">{uploadMessage}</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="CloudArrowUpIcon" size={32} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-text-primary mb-1">
                  {disabled ? 'Select an event to upload guests' : 'Drag and drop your CSV file here'}
                </p>
                <p className="text-sm text-text-secondary">or</p>
              </div>
              <button
                onClick={handleBrowseClick}
                disabled={disabled || isLoading}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium transition-smooth hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {disabled ? 'Select Event First' : 'Browse Files'}
              </button>
              <p className="text-xs text-text-secondary text-center">
                Supported format: CSV only • Maximum file size: 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;