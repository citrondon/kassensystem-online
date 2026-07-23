import { useState, useRef, useEffect } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";
import { useI18n } from "../i18n/I18nContext";
import { ScanBarcode, ScanLine } from "lucide-react";

interface Props {
  onScan: (barcode: string) => void;
}

export default function Scanner({ onScan }: Props) {
  const [active, setActive] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const lastScanRef = useRef<string | null>(null);
  const cooldownRef = useRef<number | null>(null);
  const { t } = useI18n();

  // Cleanup cooldown on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) window.clearTimeout(cooldownRef.current);
    };
  }, []);

  const handleUpdate = (_err: unknown, result?: { getText: () => string }) => {
    if (!result) return;
    const text = result.getText();
    // Skip duplicate scans within 2 seconds
    if (text === lastScanRef.current && cooldownRef.current) return;
    lastScanRef.current = text;
    setLastScan(text);
    onScan(text);
    if (cooldownRef.current) window.clearTimeout(cooldownRef.current);
    cooldownRef.current = window.setTimeout(() => {
      lastScanRef.current = null;
      cooldownRef.current = null;
    }, 2000);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setActive((v) => !v)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          active
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
        }`}
      >
        {active ? <ScanLine className="h-4 w-4" /> : <ScanBarcode className="h-4 w-4" />}
        {active ? t("stopScanner") : t("startScanner")}
      </button>

      {active && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <BarcodeScanner
            width={320}
            height={240}
            onUpdate={handleUpdate}
          />
        </div>
      )}

      {lastScan && (
        <p className="text-xs text-slate-500">
          {t("lastScan")}: <span className="font-mono font-semibold text-slate-700">{lastScan}</span>
        </p>
      )}
    </div>
  );
}
