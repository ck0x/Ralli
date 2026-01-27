import React from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <Button
            variant="secondary"
            className="p-1 h-auto rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5 pointer-events-none" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 text-gray-600">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>

      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
