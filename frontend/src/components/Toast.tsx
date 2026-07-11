import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

export interface Toast {
  type: "success" | "error";
  message: string;
}

interface Props {
  toast: Toast | null;
  onClose: () => void;
  autoDismissMs?: number;
}

export default function Toast({ toast, onClose, autoDismissMs = 3000 }: Props) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [toast, onClose, autoDismissMs]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm transition-all duration-300 ease-out">
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}
      >
        <Icon size={20} className="mt-0.5 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-black/5"
          aria-label="Schliessen"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
