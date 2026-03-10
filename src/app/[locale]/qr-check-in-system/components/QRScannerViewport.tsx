'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface QRScannerViewportProps {
  onScanSuccess: (code: string) => void;
  isActive: boolean;
}

interface ScanResult {
  code: string;
  timestamp: string;
  status: 'success' | 'error' | 'duplicate';
  message: string;
  guestName?: string;
}

const QRScannerViewport = ({ onScanSuccess, isActive }: QRScannerViewportProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !isActive) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (error) {
        console.error('Camera access denied:', error);
        setShowManualInput(true);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isHydrated, isActive]);

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      setManualCode('');
      
      const mockResult: ScanResult = {
        code: manualCode.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'success',
        message: 'Guest checked in successfully',
        guestName: 'Ahmed Mohammed Al-Rashid'
      };
      setLastScanResult(mockResult);
    }
  };

  const simulateScan = () => {
    const mockCode = `INV-${Math.random().toString(36).substring(7).toUpperCase()}`;
    onScanSuccess(mockCode);
    
    const mockResult: ScanResult = {
      code: mockCode,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'success',
      message: 'Guest checked in successfully',
      guestName: 'Fatima Hassan Al-Zahrani'
    };
    setLastScanResult(mockResult);
  };

  const getStatusColor = (status: ScanResult['status']) => {
    const colors = {
      success: 'bg-success/10 text-success border-success',
      error: 'bg-error/10 text-error border-error',
      duplicate: 'bg-warning/10 text-warning border-warning'
    };
    return colors[status];
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-warm-md p-8 flex items-center justify-center h-[500px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-warm-md overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Icon name="QrCodeIcon" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-text-primary">QR Code Scanner</h2>
              <p className="text-sm text-text-secondary">Scan guest invitation codes for check-in</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-text-primary rounded-md transition-smooth hover:bg-muted/80"
              aria-label="Toggle manual input"
            >
              <Icon name="PencilSquareIcon" size={20} />
              <span className="text-sm font-medium hidden md:inline">Manual Entry</span>
            </button>
            <button
              onClick={simulateScan}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md transition-smooth hover:bg-primary/90"
              aria-label="Simulate scan"
            >
              <Icon name="BoltIcon" size={20} />
              <span className="text-sm font-medium hidden md:inline">Test Scan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative bg-muted rounded-lg overflow-hidden" style={{ height: '400px' }}>
          {isCameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                aria-label="QR code scanner camera feed"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-primary rounded-lg shadow-warm-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-lg" />
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-sm text-text-primary font-medium">Position QR code within frame</p>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <Icon name="CameraIcon" size={64} className="text-text-secondary" />
              <p className="text-text-secondary">Camera initializing...</p>
              <button
                onClick={() => setShowManualInput(true)}
                className="text-primary hover:underline text-sm"
              >
                Use manual entry instead
              </button>
            </div>
          )}
        </div>

        {showManualInput && (
          <div className="mt-4 p-4 bg-muted rounded-lg animate-slide-up">
            <label htmlFor="manualCode" className="block text-sm font-medium text-text-primary mb-2">
              Enter QR Code Manually
            </label>
            <div className="flex gap-2">
              <input
                id="manualCode"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                placeholder="INV-XXXXXX"
                className="flex-1 px-4 py-2 bg-card border border-input rounded-md text-text-primary focus:outline-none focus:ring-3 focus:ring-ring"
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md transition-smooth hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {lastScanResult && (
          <div className={`mt-4 p-4 border-2 rounded-lg animate-slide-up ${getStatusColor(lastScanResult.status)}`}>
            <div className="flex items-start gap-3">
              <Icon
                name={lastScanResult.status === 'success' ? 'CheckCircleIcon' : lastScanResult.status === 'duplicate' ? 'ExclamationTriangleIcon' : 'XCircleIcon'}
                size={24}
                className="flex-shrink-0"
              />
              <div className="flex-1">
                <p className="font-semibold mb-1">{lastScanResult.message}</p>
                {lastScanResult.guestName && (
                  <p className="text-sm opacity-90">Guest: {lastScanResult.guestName}</p>
                )}
                <p className="text-xs opacity-75 mt-1">Code: {lastScanResult.code} • {lastScanResult.timestamp}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerViewport;