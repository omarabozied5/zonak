import React, { useEffect, useMemo } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore, CartItem } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

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
    getTotalItems,
  } = cartStore;

  // Memoize cart summary calculations
  const cartSummary = useMemo(() => {
    const totalItems = getTotalItems();
    const restaurantGroups = items.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = 0;
      }
      acc[item.restaurantId] += item.quantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems,
      restaurantGroups,
      hasMultipleRestaurants: Object.keys(restaurantGroups).length > 1,
    };
  }, [items, getTotalItems]);

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
      if (items.length === 0) {
        toast.error("السلة فارغة");
        return;
      }

      if (cartSummary.hasMultipleRestaurants) {
        toast.error("لا يمكن الطلب من أكثر من مطعم في نفس الوقت");
        return;
      }

      // Navigate to checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      toast.error("حدث خطأ أثناء المتابعة للدفع");
    }
  };

  const getOptionDisplayText = (item: CartItem): string[] => {
    if (!item.selectedOptions) return [];

    const displayElements: string[] = [];

    // Handle size option
    if (item.selectedOptions.size) {
      displayElements.push(`الحجم: ${item.selectedOptions.size}`);
    }

    // Handle required options
    if (
      item.selectedOptions.requiredOptions &&
      Object.keys(item.selectedOptions.requiredOptions).length > 0
    ) {
      if (item.selectedOptions.requiredOptionNames) {
        Object.entries(item.selectedOptions.requiredOptionNames).forEach(
          ([groupName, optionName]) => {
            displayElements.push(`${groupName}: ${optionName}`);
          }
        );
      } else {
        const requiredCount = Object.keys(
          item.selectedOptions.requiredOptions
        ).length;
        displayElements.push(`الخيارات المطلوبة: ${requiredCount} خيار`);
      }
    }

    // Handle optional additions
    if (
      item.selectedOptions.optionalOptions &&
      item.selectedOptions.optionalOptions.length > 0
    ) {
      if (
        item.selectedOptions.optionalOptionNames &&
        item.selectedOptions.optionalOptionNames.length > 0
      ) {
        const optionsText = item.selectedOptions.optionalOptionNames.join("، ");
        displayElements.push(`الإضافات: ${optionsText}`);
      } else {
        displayElements.push(
          `الإضافات: ${item.selectedOptions.optionalOptions.length} إضافة`
        );
      }
    }

    // Handle notes
    if (item.selectedOptions.notes?.trim()) {
      displayElements.push(`ملاحظات: ${item.selectedOptions.notes.trim()}`);
    }

    return displayElements;
  };

  const EmptyCart = () => (
    <Card className="text-center py-8 sm:py-12 border-[#FFAA01]/20">
      <CardContent>
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#053468] mb-2">
          السلة فارغة
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          لم تقم بإضافة أي أصناف بعد، ابدأ بتصفح المطاعم المتاحة
        </p>
        <Button
          className="bg-gradient-to-r from-[#FFAA01] to-[#FFD700] hover:from-[#FF9900] hover:to-[#FFAA01] text-[#053468] font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          استكشف المطاعم
        </Button>
      </CardContent>
    </Card>
  );

  const OrderSummary = () => (
    <Card className="border-[#FFAA01]/20 lg:sticky lg:top-24 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#FFAA01]/10 to-[#FFD700]/10 rounded-t-lg">
        <CardTitle className="text-lg sm:text-xl text-[#053468] flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          ملخص الطلب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Order Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>عدد الأصناف</span>
            <span className="font-semibold">{cartSummary.totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span>المطاعم</span>
            <span className="font-semibold">
              {Object.keys(cartSummary.restaurantGroups).length}
            </span>
          </div>
        </div>

        {/* Warning for multiple restaurants */}
        {cartSummary.hasMultipleRestaurants && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-xs text-red-600 font-medium">
              ⚠️ لا يمكن الطلب من أكثر من مطعم في نفس الوقت
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-[#053468]">المجموع الكلي</span>
            <span className="text-[#FFAA01]">{totalPrice.toFixed(2)} ر.س</span>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-[#FFAA01] to-[#FFD700] hover:from-[#FF9900] hover:to-[#FFAA01] text-[#053468] font-semibold text-base sm:text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleProceedToCheckout}
          disabled={items.length === 0 || cartSummary.hasMultipleRestaurants}
        >
          متابعة للدفع
        </Button>

        <div className="bg-[#FFAA01]/10 rounded-lg p-4 text-center border border-[#FFAA01]/20">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">📍 نوع الطلب</p>
          <p className="font-semibold text-[#FFAA01] text-sm sm:text-base">
            استلام من المطعم
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFAA01]/10 to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="border-[#FFAA01]/30 hover:bg-[#FFAA01]/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#053468]">
                سلة التسوق
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                مرحباً {user.name}، راجع طلبك قبل المتابعة للدفع
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2 space-y-4">
              {items.map((item: CartItem) => {
                const optionDisplays = getOptionDisplayText(item);
                const itemTotal = item.price * item.quantity;

                return (
                  <Card
                    key={item.id}
                    className="border-[#FFAA01]/20 hover:shadow-lg transition-all duration-300 hover:border-[#FFAA01]/40"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Item Image & Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 border-2 border-[#FFAA01]/20"
                              loading="lazy"
                            />
                            <div className="absolute -top-2 -right-2 bg-[#FFAA01] text-[#053468] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-[#053468] truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-[#FFAA01] mb-1 truncate font-medium">
                              {item.restaurantName}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                              {item.price.toFixed(2)} ر.س × {item.quantity}
                            </p>

                            {/* Selected Options */}
                            {optionDisplays.length > 0 && (
                              <div className="bg-gray-50 rounded-lg p-2 text-xs sm:text-sm text-gray-600 space-y-1">
                                {optionDisplays.map(
                                  (display: string, index: number) => (
                                    <p key={index} className="truncate">
                                      • {display}
                                    </p>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls & Actions */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-[#FFAA01]/50 hover:bg-[#FFAA01]/20 hover:border-[#FFAA01]"
                              onClick={() =>
                                handleQuantityUpdate(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="min-w-[2rem] text-center font-bold text-[#053468]">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-[#FFAA01]/50 hover:bg-[#FFAA01]/20 hover:border-[#FFAA01]"
                              onClick={() =>
                                handleQuantityUpdate(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <p className="text-base sm:text-lg font-bold text-[#FFAA01] whitespace-nowrap">
                              {itemTotal.toFixed(2)} ر.س
                            </p>

                            {/* Edit Button - Only show if item has customizations */}
                            {hasCustomizations(item) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[#053468] hover:bg-[#053468]/10 border-[#053468]/30 h-8 px-3 text-xs font-medium"
                                onClick={() => handleEditItem(item)}
                                title="تعديل الخيارات"
                              >
                                تعديل
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:bg-red-50 border-red-200 h-8 w-8 p-0"
                              onClick={() => handleRemoveItem(item.id)}
                              title="حذف من السلة"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <OrderSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
