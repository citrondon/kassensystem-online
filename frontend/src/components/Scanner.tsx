import { useState } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";
import { ScanLine, Power } from "lucide-react";

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: Props) {
  const [active, setActive] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const handleUpdate = (_err: unknown, result?: { getText: () => string }) => {
    if (result) {
      const text = result.getText();
      setLastScan(text);
      onScan(text);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanLine size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Scanner</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActive((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
          >
            <Power size={14} />
            {active ? "Stoppen" : "Starten"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Scanner schliessen"
          >
            ✕
          </button>
        </div>
      </div>

      {active && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <BarcodeScanner width={220} height={165} onUpdate={handleUpdate} />
        </div>
      )}

      {lastScan && (
        <p className="text-xs text-slate-500">
          Zuletzt gescannt: <span className="font-mono font-semibold">{lastScan}</span>
        </p>
      )}
    </div>
  );
}
