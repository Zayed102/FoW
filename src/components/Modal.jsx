import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="font-semibold text-lg text-brandNavy">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 min-w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-4 md:px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
