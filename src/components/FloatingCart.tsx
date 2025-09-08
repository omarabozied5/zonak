import React, { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from "./LoginModal";

const FloatingCart: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const userId = isAuthenticated && user?.id ? user.id : null;
  const { getTotalItems, totalPrice } = useCartStore(userId);

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
        <button
          onClick={handleViewCart}
          className="w-full bg-[#FBD252] rounded-2xl shadow-md py-3 px-6 flex items-center justify-between"
        >
          <span className="font-semibold text-base text-white">
            {isAuthenticated ? "تنفيذ الطلب" : "تسجيل الدخول"}
          </span>
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
