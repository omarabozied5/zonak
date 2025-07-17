import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useCartStore, CartItem as StoreCartItem } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartValidation } from "@/hooks/useCartValidation";
import { useCartSummary } from "@/hooks/useCartSummary";
import { toast } from "sonner";

// Import refactored components
import CartHeader from "@/components/Cart/CartHeader";
import CartItemComponent from "@/components/Cart/CartItem";
import OrderSummary from "@/components/Cart/OrderSummury";
import EmptyCartState from "@/components/Cart/EmptyCartState";
import { CartItem } from "@/components/Cart/types";

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // Pass user ID to cart store for proper user-specific data
  const cartStore = useCartStore(user?.id || null);
  const {
    items,
    totalPrice,
    updateQuantity,
    removeItem,
    hasCustomizations,
    setEditingItem,
  } = cartStore;

  // Convert store items to component items format
  const convertedItems: CartItem[] = items.map((item: StoreCartItem) => ({
    ...item,
    selectedOptions: item.selectedOptions
      ? {
          ...item.selectedOptions,
          optionalOptions:
            item.selectedOptions.optionalOptions?.map(String) || [],
        }
      : undefined,
  }));

  // Get cart summary and validation
  const cartSummary = useCartSummary(convertedItems);
  const cartValidation = useCartValidation(convertedItems);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لعرض السلة");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleGoBack = (): void => {
    navigate(-1);
  };

  const handleExploreRestaurants = (): void => {
    navigate("/");
  };

  const handleEditItem = (item: CartItem): void => {
    try {
      const baseItemId = item.id.split("-")[0];
      setEditingItem(item.id);
      navigate(`/item/${baseItemId}?edit=${item.id}`);
    } catch (error) {
      console.error("Error editing item:", error);
      toast.error("حدث خطأ أثناء تعديل الصنف");
    }
  };

  const handleQuantityUpdate = (itemId: string, newQuantity: number): void => {
    try {
      if (newQuantity < 0) return;

      if (newQuantity === 0) {
        handleRemoveItem(itemId);
        return;
      }

      updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("حدث خطأ أثناء تحديث الكمية");
    }
  };

  const handleRemoveItem = (itemId: string): void => {
    try {
      removeItem(itemId);
      toast.success("تم حذف الصنف من السلة");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("حدث خطأ أثناء حذف الصنف");
    }
  };

  const handleProceedToCheckout = (): void => {
    try {
      if (!cartValidation.canProceedToCheckout) {
        const firstError = cartValidation.validationErrors[0];
        toast.error(firstError);
        return;
      }

      // Navigate to checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      toast.error("حدث خطأ أثناء المتابعة للدفع");
    }
  };

  // Check if checkout should be disabled
  const isCheckoutDisabled = cartValidation.isCheckoutDisabled;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFAA01]/10 to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <CartHeader userName={user.name} onGoBack={handleGoBack} />

        {/* Cart Content */}
        {cartSummary.isEmpty ? (
          <EmptyCartState onExploreRestaurants={handleExploreRestaurants} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2 space-y-4">
              {convertedItems.map((item: CartItem) => (
                <CartItemComponent
                  key={item.id}
                  item={item}
                  onQuantityUpdate={handleQuantityUpdate}
                  onRemoveItem={handleRemoveItem}
                  onEditItem={handleEditItem}
                  hasCustomizations={hasCustomizations}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <OrderSummary
                totalItems={cartSummary.totalItems}
                totalPrice={cartSummary.totalPrice}
                restaurantCount={cartSummary.restaurantCount}
                hasMultipleRestaurants={cartSummary.hasMultipleRestaurants}
                onProceedToCheckout={handleProceedToCheckout}
                isCheckoutDisabled={isCheckoutDisabled}
                isEmpty={cartSummary.isEmpty}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
