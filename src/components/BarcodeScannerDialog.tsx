import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerDialog({ open, onClose, onScan }: Props) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    setError(null);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 120 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          const cleaned = decodedText.replace(/\D/g, "");
          if (cleaned.length >= 8) {
            onScan(cleaned);
            stopScanner();
            onClose();
          }
        },
        () => {
          // ignore scan failures (no code in frame)
        }
      );
    } catch (err: any) {
      setScanning(false);
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
        setError(t("barcode.errorPermission"));
      } else if (err?.name === "NotFoundError") {
        setError(t("barcode.errorNoCamera"));
      } else {
        setError(t("barcode.errorStart"));
      }
    }
  }, [onScan, onClose, stopScanner, t]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(startScanner, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [open, startScanner, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5 text-primary" />
            {t("barcode.dialogTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          <div
            id="barcode-reader"
            ref={containerRef}
            className="w-full rounded-lg overflow-hidden bg-muted aspect-[3/2]"
          />

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            {t("barcode.dialogHint")}
          </p>

          <div className="flex gap-2">
            {error && (
              <Button
                variant="outline"
                className="flex-1 rounded-lg"
                size="sm"
                onClick={startScanner}
              >
                {t("barcode.retry")}
              </Button>
            )}
            <Button
              variant="ghost"
              className="flex-1 rounded-lg"
              size="sm"
              onClick={() => {
                stopScanner();
                onClose();
              }}
            >
              <X className="h-4 w-4 mr-1" /> {t("common.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
