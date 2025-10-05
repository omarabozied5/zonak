import React, { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import LoginModal from "./LoginModal";

const FloatingCart: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const userId = isAuthenticated && user?.id ? user.id : null;
  const { getTotalItems, totalPrice, clearCart } = useCartStore(userId);

  const totalItems = getTotalItems();

  // Hide on ItemDetails page to prevent overlap
  if (totalItems === 0 || location.pathname.startsWith("/item/")) return null;

  const handleViewCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate("/cart");
  };

  const handleClearCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowClearModal(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  const cancelClearCart = () => {
    setShowClearModal(false);
  };

  const handleLoginSuccess = () => {
    navigate("/cart");
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const displayPrice = totalPrice != null ? totalPrice.toFixed(2) : "0.00";

  return (
    <>
      <div className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto">
        <div className="w-full bg-[#FBD252] rounded-2xl shadow-md py-3 px-6 flex items-center justify-between relative">
          {/* Trash button on the left */}

          {/* Main button - clickable area */}
          <button
            onClick={handleViewCart}
            className="flex-1 flex items-center justify-between px-4"
          >
            <span className="font-semibold text-base text-white">
              {isAuthenticated ? "تنفيذ الطلب" : "تسجيل الدخول"}
            </span>
            <div className="flex flex-col items-end">
              <span className="font-semibold text-base text-white">
                {displayPrice} ر.س
              </span>
              <span className="text-xs font-bold text-white">
                {totalItems} منتجات
              </span>
            </div>
          </button>
          <button
            onClick={handleClearCart}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            aria-label="مسح السلة"
          >
            <Trash2 size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={cancelClearCart}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="إغلاق"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="text-center pt-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                إزالة الطلب
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                هل أنت متأكد من حذف جميع المنتجات من السلة؟
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={confirmClearCart}
                  className="w-full bg-[#FBD252] text-white font-semibold py-3 rounded-xl hover:bg-[#fac635] transition-colors"
                >
                  متابعة
                </button>
                <button
                  onClick={cancelClearCart}
                  className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default FloatingCart;
