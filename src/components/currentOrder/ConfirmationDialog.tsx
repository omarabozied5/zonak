import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  showCloseButton?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "إزالة الطلب",
  message = "هل تريد إزالة هذا الطلب؟ سيتم حذف جميع التعديلات",
  confirmText = "متابعة",
  cancelText = "الإلغاء",
  confirmVariant = "default",
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      dir="rtl"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        {showCloseButton && (
          <div className="flex justify-between items-center p-6 pb-0">
            <div></div>
            <button
              onClick={onCancel}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 leading-relaxed mb-6">{message}</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onConfirm}
              variant={confirmVariant}
              className="w-full h-12 text-base font-semibold rounded-xl bg-[#F5C842] hover:bg-[#F5C842]/90 text-white border-0"
            >
              {confirmText}
            </Button>
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full h-12 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
