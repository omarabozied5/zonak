import React, { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";

const FloatingCart: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const userId = isAuthenticated && user?.id ? user.id : null;
  const { getTotalItems, totalPrice } = useCartStore(userId);

  const totalItems = getTotalItems();

  if (totalItems === 0) return null;

  const handleViewCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate("/cart");
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
      {/* Spacer to avoid overlap with content */}
      <div className="h-20" />

      <div className="fixed bottom-3 left-3 right-3 z-50">
        <button
          onClick={handleViewCart}
          className="w-full bg-[#FBD252] rounded-2xl shadow-md py-3 px-6 flex items-center justify-between"
        >
          {/* Left side (Price + items count) */}
          <span className="font-semibold text-base text-white">
            {isAuthenticated ? "تنفيذ الطلب" : "تسجيل الدخول"}
          </span>

          {/* Right side (Action text) */}
          <div className="flex flex-col items-center">
            <span className="font-semibold text-base text-white">
              {displayPrice} ر.س
            </span>
            <span className="text-xs font-bold text-white">
              {totalItems} منتجات
            </span>
          </div>
        </button>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default FloatingCart;
