import React, { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import LoginModal from "./LoginModal";

const FloatingCart: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Use the correct user ID based on authentication status
  const userId = isAuthenticated && user?.id ? user.id : null;
  const { getTotalItems, totalPrice, clearCart } = useCartStore(userId);

  const totalItems = getTotalItems();

  // Don't render if cart is empty
  if (totalItems === 0) {
    return null;
  }

  const handleViewCart = () => {
    if (!isAuthenticated) {
      // Open login modal instead of navigating
      setShowLoginModal(true);
      return;
    }

    console.log("FloatingCart: Navigating to cart");
    navigate("/cart");
  };

  const handleClearCart = () => {
    if (userId) {
      clearCart();
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, navigate to cart
    navigate("/cart");
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      {/* Spacer div to prevent content from being hidden behind floating cart */}
      <div className="h-16 md:h-20" />

      <div className="fixed bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 z-50">
        <Card className="bg-[#FFAA01] text-white shadow-2xl border-[#FFAA01] transition-all duration-300 hover:shadow-3xl">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="font-semibold text-sm md:text-base whitespace-nowrap">
                  {totalItems} {totalItems === 1 ? "صنف" : "أصناف"}
                </span>
                <span className="mx-1 md:mx-2 text-sm md:text-base">•</span>
                <span className="font-bold text-sm md:text-base truncate">
                  {totalPrice.toFixed(2)} ر.س
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="secondary"
                  className="bg-white text-[#053468] hover:bg-gray-100 hover:text-[#053468] font-semibold text-sm md:text-base px-3 md:px-4 py-2 transition-colors duration-200"
                  onClick={handleViewCart}
                >
                  {isAuthenticated ? "عرض السلة" : "تسجيل الدخول"}
                </Button>
                {/* Delete button - only show if authenticated */}
                {isAuthenticated && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-red-500 text-white hover:bg-red-600 hover:text-white p-2 transition-colors duration-200"
                    onClick={handleClearCart}
                    title="حذف جميع المنتجات"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default FloatingCart;
