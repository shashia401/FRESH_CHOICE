import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerConfig } from 'html5-qrcode';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Camera, X, Scan, CheckCircle, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onClose,
  isOpen
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const config: Html5QrcodeScannerConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      };

      scannerRef.current = new Html5QrcodeScanner(
        'barcode-scanner',
        config,
        false
      );

      scannerRef.current.render(
        (decodedText: string) => {
          setScanResult(decodedText);
          setIsScanning(false);
          onScanSuccess(decodedText);
          
          // Auto close after successful scan
          setTimeout(() => {
            handleClose();
          }, 2000);
        },
        (error: string) => {
          // Handle scan errors silently for better UX
          console.warn('Scan error:', error);
        }
      );

      setIsScanning(true);
      setError(null);
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.warn('Error clearing scanner:', err);
        }
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error clearing scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScanResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-lg border-2 border-emerald-200">
        <CardHeader
          title="Scan Product Barcode"
          subtitle="Position the barcode within the scanning area"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          }
        />

        <div className="space-y-4">
          {/* Scanner Status */}
          <div className="flex items-center justify-center space-x-2">
            {isScanning && (
              <>
                <div className="animate-pulse">
                  <Scan className="h-5 w-5 text-emerald-600" />
                </div>
                <Badge variant="info" size="sm">Scanning...</Badge>
              </>
            )}
            {scanResult && (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <Badge variant="success" size="sm">Scanned Successfully!</Badge>
              </>
            )}
            {error && (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <Badge variant="danger" size="sm">Scan Error</Badge>
              </>
            )}
          </div>

          {/* Scanner Container */}
          <div className="relative">
            <div
              id="barcode-scanner"
              className="rounded-xl overflow-hidden border-2 border-emerald-200 bg-gray-100"
              style={{ minHeight: '300px' }}
            />
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-emerald-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg"></div>
                  
                  {/* Scanning Line Animation */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-800">Barcode Detected</span>
              </div>
              <div className="text-sm text-emerald-700 font-mono bg-white px-3 py-2 rounded-lg border">
                {scanResult}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-gray-600 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Hold your device steady and point at the barcode</span>
            </div>
            <p className="text-xs text-gray-500">
              Supports UPC, EAN, Code 128, and QR codes
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            {scanResult && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  onScanSuccess(scanResult);
                  handleClose();
                }}
              >
                Use This Code
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};