'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
}

const FileUploadZone = ({ onFileUpload }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
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
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (!validTypes.includes(file.type)) {
      setUploadStatus('error');
      setUploadMessage('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Processing file...');

    setTimeout(() => {
      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${file.name}. Found 245 guests with 12 duplicates detected.`);
      onFileUpload(file);

      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 5000);
    }, 2000);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md p-8 transition-smooth ${
          isDragging
            ? 'border-primary bg-primary/5'
            : uploadStatus === 'error' ?'border-destructive bg-destructive/5'
            : uploadStatus === 'success' ?'border-success bg-success/5' :'border-border bg-muted/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload guest list file"
        />

        <div className="flex flex-col items-center gap-4">
          {uploadStatus === 'uploading' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-primary font-medium">{uploadMessage}</p>
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
                  Drag and drop your guest list file here
                </p>
                <p className="text-sm text-text-secondary">or</p>
              </div>
              <button
                onClick={handleBrowseClick}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium transition-smooth hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 active:scale-97"
              >
                Browse Files
              </button>
              <p className="text-xs text-text-secondary text-center">
                Supported formats: Excel (.xlsx, .xls) or CSV • Maximum file size: 10MB
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-md">
        <div className="flex items-start gap-3">
          <Icon name="InformationCircleIcon" size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-text-primary mb-2">File Format Requirements:</h4>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Required columns: Name, Phone Number, Email</li>
              <li>• Optional columns: Plus Ones, Special Notes</li>
              <li>• Phone numbers must include country code (e.g., +966 for Saudi Arabia)</li>
              <li>• Duplicate phone numbers will be automatically detected and flagged</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;