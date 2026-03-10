'use client'

import Icon from '@/components/ui/AppIcon'
import { useEffect, useRef, useState } from 'react'

interface QRScannerViewportProps {
  onScanSuccess: (code: string) => void
  isActive: boolean
}

interface ScanResult {
  code: string
  timestamp: string
  status: 'success' | 'error' | 'duplicate'
  message: string
  guestName?: string
}

const QRScannerViewport = ({ onScanSuccess, isActive }: QRScannerViewportProps) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null)
  const [showManualInput, setShowManualInput] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !isActive) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsCameraActive(true)
        }
      } catch (error) {
        console.error('Camera access denied:', error)
        setShowManualInput(true)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isHydrated, isActive])

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim())
      setManualCode('')

      const mockResult: ScanResult = {
        code: manualCode.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'success',
        message: 'Guest checked in successfully',
        guestName: 'Ahmed Mohammed Al-Rashid',
      }
      setLastScanResult(mockResult)
    }
  }

  const simulateScan = () => {
    const mockCode = `INV-${Math.random().toString(36).substring(7).toUpperCase()}`
    onScanSuccess(mockCode)

    const mockResult: ScanResult = {
      code: mockCode,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'success',
      message: 'Guest checked in successfully',
      guestName: 'Fatima Hassan Al-Zahrani',
    }
    setLastScanResult(mockResult)
  }

  const getStatusColor = (status: ScanResult['status']) => {
    const colors = {
      success: 'bg-success/10 text-success border-success',
      error: 'bg-error/10 text-error border-error',
      duplicate: 'bg-warning/10 text-warning border-warning',
    }
    return colors[status]
  }

  if (!isHydrated) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg bg-card p-8 shadow-warm-md">
        <div className="flex animate-pulse flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-card shadow-warm-md">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-md p-2">
              <Icon name="QrCodeIcon" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary">QR Code Scanner</h2>
              <p className="text-sm text-text-secondary">Scan guest invitation codes for check-in</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="transition-smooth hover:bg-muted/80 flex items-center gap-2 rounded-md bg-muted px-4 py-2 text-text-primary"
              aria-label="Toggle manual input"
            >
              <Icon name="PencilSquareIcon" size={20} />
              <span className="hidden text-sm font-medium md:inline">Manual Entry</span>
            </button>
            <button
              onClick={simulateScan}
              className="transition-smooth hover:bg-primary/90 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground"
              aria-label="Simulate scan"
            >
              <Icon name="BoltIcon" size={20} />
              <span className="hidden text-sm font-medium md:inline">Test Scan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative overflow-hidden rounded-lg bg-muted" style={{ height: '400px' }}>
          {isCameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
                aria-label="QR code scanner camera feed"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 rounded-lg border-4 border-primary shadow-warm-lg">
                  <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-accent" />
                  <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-accent" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-accent" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-accent" />
                </div>
              </div>
              <div className="bg-card/90 absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 backdrop-blur-sm">
                <p className="text-sm font-medium text-text-primary">Position QR code within frame</p>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              <Icon name="CameraIcon" size={64} className="text-text-secondary" />
              <p className="text-text-secondary">Camera initializing...</p>
              <button onClick={() => setShowManualInput(true)} className="text-sm text-primary hover:underline">
                Use manual entry instead
              </button>
            </div>
          )}
        </div>

        {showManualInput && (
          <div className="mt-4 animate-slide-up rounded-lg bg-muted p-4">
            <label htmlFor="manualCode" className="mb-2 block text-sm font-medium text-text-primary">
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
                className="flex-1 rounded-md border border-input bg-card px-4 py-2 text-text-primary focus:outline-none focus:ring-3 focus:ring-ring"
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                className="transition-smooth hover:bg-primary/90 rounded-md bg-primary px-6 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {lastScanResult && (
          <div className={`mt-4 animate-slide-up rounded-lg border-2 p-4 ${getStatusColor(lastScanResult.status)}`}>
            <div className="flex items-start gap-3">
              <Icon
                name={
                  lastScanResult.status === 'success'
                    ? 'CheckCircleIcon'
                    : lastScanResult.status === 'duplicate'
                      ? 'ExclamationTriangleIcon'
                      : 'XCircleIcon'
                }
                size={24}
                className="flex-shrink-0"
              />
              <div className="flex-1">
                <p className="mb-1 font-semibold">{lastScanResult.message}</p>
                {lastScanResult.guestName && <p className="text-sm opacity-90">Guest: {lastScanResult.guestName}</p>}
                <p className="mt-1 text-xs opacity-75">
                  Code: {lastScanResult.code} • {lastScanResult.timestamp}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRScannerViewport
