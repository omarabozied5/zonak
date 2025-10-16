import React from "react";
import { X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface OfferQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  offerTitle: string;
}

const OfferQRModal: React.FC<OfferQRModalProps> = ({
  isOpen,
  onClose,
  qrCode,
  offerTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">رمز الاستخدام</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <QRCodeCanvas value={qrCode} size={220} level="H" includeMargin />
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              اعرض هذا الرمز للكاشير للاستفادة من العرض
            </p>
            <p className="font-bold text-[#FFAA01]">{offerTitle}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#FFAA01] text-white font-bold py-3 rounded-xl hover:bg-[#FF9901] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OfferQRModal;
