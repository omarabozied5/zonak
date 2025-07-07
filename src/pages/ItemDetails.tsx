import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import FloatingCart from "@/components/FloatingCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemDetails } from "@/hooks/useItemDetails";
import { toast } from "sonner";

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { itemDetails, loading, error } = useItemDetails(itemId);

  // Get current user from auth store
  const { user } = useAuthStore();
  const userId = user?.id || null;

  // Get cart store instance for current user
  const cartStore = useCartStore(userId);
  const { addItem, items, updateItem, setEditingItem } = cartStore;

  // Check if we're in edit mode
  const editItemId = searchParams.get("edit");
  const isEditMode = Boolean(editItemId);
  const editingItem = isEditMode
    ? items.find((item) => item.id === editItemId)
    : null;

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const [selectedOptional, setSelectedOptional] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize state from editing item
  useEffect(() => {
    if (isEditMode && editingItem && itemDetails) {
      setQuantity(editingItem.quantity);
      setNotes(editingItem.selectedOptions?.notes || "");

      // Restore selected options
      if (editingItem.selectedOptions?.requiredOptions) {
        setSelectedOptions(editingItem.selectedOptions.requiredOptions);
      }

      // Restore optional selections
      if (editingItem.selectedOptions?.optionalOptions) {
        setSelectedOptional(editingItem.selectedOptions.optionalOptions);
      }
    }
  }, [isEditMode, editingItem, itemDetails]);

  useEffect(() => {
    if (!loading && !itemDetails && error) {
      toast.error("هذا العنصر غير موجود");
      navigate(-1);
    }
  }, [itemDetails, loading, error, navigate]);

  // Cleanup editing state when component unmounts or navigation occurs
  useEffect(() => {
    return () => {
      if (isEditMode) {
        setEditingItem(null);
      }
    };
  }, [isEditMode, setEditingItem]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#FFAA01] mx-auto"></div>
            <p className="text-gray-600 text-lg font-medium">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !itemDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">عذراً!</h2>
              <p className="text-red-500">{error || "هذا العنصر غير موجود"}</p>
              <Button
                onClick={() => navigate(-1)}
                className="bg-[#FFAA01] hover:bg-yellow-500 text-[#053468] font-semibold"
              >
                العودة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const images = itemDetails.images || [];
  const mainImage =
    images.length > 0 ? images[currentImageIndex]?.image_url : null;

  const navigateImage = (direction: "next" | "prev") => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      direction === "next"
        ? (prev + 1) % images.length
        : (prev - 1 + images.length) % images.length
    );
  };

  const calculateTotalPrice = () => {
    let total = itemDetails.price;

    Object.values(selectedOptions).forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) total += option.price;
    });

    selectedOptional.forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) total += option.price;
    });

    return total * quantity;
  };

  const canAddToCart = () => {
    const requiredGroups =
      itemDetails.optionGroups?.filter((group) => group.type === "pick") || [];
    return requiredGroups.every((group) => selectedOptions[group.id]);
  };

  // Helper function to get option names for storage
  const getOptionNames = () => {
    const requiredOptionNames: Record<string, string> = {};
    const optionalOptionNames: string[] = [];

    // Get required option names
    Object.entries(selectedOptions).forEach(([groupId, optionId]) => {
      const group = itemDetails.optionGroups?.find(
        (g) => g.id === parseInt(groupId)
      );
      const option = group?.options.find((opt) => opt.id === optionId);
      if (group && option) {
        requiredOptionNames[group.title] = option.name;
      }
    });

    // Get optional option names
    selectedOptional.forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) {
        optionalOptionNames.push(option.name);
      }
    });

    return { requiredOptionNames, optionalOptionNames };
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) {
      toast.error("يجب اختيار جميع الخيارات المطلوبة");
      return;
    }

    const { requiredOptionNames, optionalOptionNames } = getOptionNames();

    const cleanSelectedOptions = {
      ...(Object.keys(selectedOptions).length > 0 && {
        requiredOptions: selectedOptions,
        requiredOptionNames: requiredOptionNames,
      }),
      ...(selectedOptional.length > 0 && {
        optionalOptions: selectedOptional.sort(),
        optionalOptionNames: optionalOptionNames,
      }),
      ...(notes.trim() && { notes: notes.trim() }),
    };

    const cartItem = {
      id: isEditMode ? editItemId : `${itemDetails.id}-${Date.now()}`,
      name: itemDetails.name,
      price: calculateTotalPrice() / quantity,
      quantity,
      image: mainImage || "",
      restaurantId: itemDetails.menu_id?.toString() || "unknown",
      restaurantName: editingItem?.restaurantName || "Restaurant",
      selectedOptions:
        Object.keys(cleanSelectedOptions).length > 0
          ? cleanSelectedOptions
          : undefined,
    };

    if (isEditMode) {
      updateItem(editItemId, cartItem);
      toast.success(`تم تحديث ${itemDetails.name} في السلة`);
      navigate("/cart");
    } else {
      addItem(cartItem);
      toast.success(`تم إضافة ${itemDetails.name} إلى السلة`);
      navigate(-1); // Go back to restaurant details page
    }
  };

  const handleRequiredOptionChange = (groupId: number, optionId: number) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: optionId }));
  };

  const handleOptionalOptionChange = (optionId: number, checked: boolean) => {
    setSelectedOptional((prev) =>
      checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)
    );
  };

  const isItemActive = itemDetails.is_active === "active";
  const canAddToCartFinal = isItemActive && canAddToCart();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(isEditMode ? "/cart" : -1)}
          className="mb-4 sm:mb-6 hover:bg-[#FFAA01]/10 text-[#053468] font-medium"
        >
          <ArrowRight className="h-5 w-5 ml-2" />
          {isEditMode ? "العودة للسلة" : "العودة"}
        </Button>

        {/* Edit Mode Indicator */}
        {isEditMode && (
          <div className="mb-4 sm:mb-6">
            <Card className="border-[#FFAA01]/30 bg-[#FFAA01]/5">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFAA01] rounded-full"></div>
                  <span className="text-[#053468] font-medium text-sm sm:text-base">
                    وضع التعديل - يمكنك تغيير خيارات العنصر
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] overflow-hidden">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={itemDetails.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-base sm:text-lg">
                      لا توجد صورة
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage("prev")}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => navigateImage("next")}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2">
                  {itemDetails.is_combo === 1 && (
                    <Badge className="bg-[#FFAA01] text-[#053468] font-semibold text-xs sm:text-sm">
                      كومبو
                    </Badge>
                  )}
                  {!isItemActive && (
                    <Badge variant="destructive" className="text-xs sm:text-sm">
                      غير متوفر
                    </Badge>
                  )}
                </div>

                {/* Image Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-[#FFAA01]"
                            : "bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-[#FFAA01]"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${itemDetails.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Item Info */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-bold text-[#053468] mb-3">
                  {itemDetails.name}
                </h1>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                  {itemDetails.description}
                </p>

                {itemDetails.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {itemDetails.categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className="border-[#053468]/20 bg-[#053468]/5 text-[#053468] text-xs sm:text-sm"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="text-2xl sm:text-3xl font-bold text-[#FFAA01]">
                    {itemDetails.has_offer
                      ? itemDetails.new_price
                      : itemDetails.price}{" "}
                    ر.س
                  </div>
                  {itemDetails.has_offer && (
                    <div className="text-base sm:text-lg text-gray-400 line-through">
                      {itemDetails.price} ر.س
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Options Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Option Groups */}
            {itemDetails.optionGroups?.map((group) => (
              <Card key={group.id} className="shadow-lg border-0">
                <CardHeader className="pb-3 bg-gray-50/50 rounded-t-lg">
                  <CardTitle className="text-base sm:text-lg text-[#053468] flex flex-col sm:flex-row sm:items-center gap-2">
                    <span>{group.title}</span>
                    <Badge
                      variant={
                        group.type === "pick" ? "destructive" : "secondary"
                      }
                      className="text-xs w-fit"
                    >
                      {group.type === "pick" ? "مطلوب" : "اختياري"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  {group.type === "pick" ? (
                    <RadioGroup
                      value={selectedOptions[group.id]?.toString() || ""}
                      onValueChange={(value) =>
                        handleRequiredOptionChange(group.id, parseInt(value))
                      }
                    >
                      {group.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {option.price >= 0 && (
                            <span className="text-xs sm:text-sm text-[#FFAA01] font-semibold order-1">
                              {option.price} ر.س
                            </span>
                          )}
                          <div className="flex items-center space-x-3 space-x-reverse order-2">
                            <Label
                              htmlFor={`option-${option.id}`}
                              className="cursor-pointer text-[#053468] font-medium pr-2 text-sm sm:text-base"
                            >
                              {option.name}
                            </Label>
                            <RadioGroupItem
                              value={option.id.toString()}
                              id={`option-${option.id}`}
                              className="border-[#FFAA01] text-[#053468]"
                            />
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {group.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Checkbox
                              id={`optional-${option.id}`}
                              checked={selectedOptional.includes(option.id)}
                              onCheckedChange={(checked) =>
                                handleOptionalOptionChange(
                                  option.id,
                                  checked as boolean
                                )
                              }
                              className="border-[#FFAA01] data-[state=checked]:bg-[#FFAA01] data-[state=checked]:text-[#053468]"
                            />
                            <Label
                              htmlFor={`optional-${option.id}`}
                              className="cursor-pointer text-[#053468] font-medium text-sm sm:text-base"
                            >
                              {option.name}
                            </Label>
                          </div>
                          {option.price > 0 && (
                            <span className="text-xs sm:text-sm text-[#FFAA01] font-semibold">
                              +{option.price} ر.س
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Notes */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3 bg-gray-50/50 rounded-t-lg">
                <CardTitle className="text-base sm:text-lg text-[#053468]">
                  ملاحظات خاصة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <Textarea
                  placeholder="أي طلبات أو ملاحظات خاصة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none border-gray-200 focus:border-[#FFAA01] focus:ring-[#FFAA01] text-sm sm:text-base"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Quantity and Add to Cart */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-[#FFAA01]/5 to-[#053468]/5 sticky bottom-4 sm:static">
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-semibold text-[#053468]">
                    الكمية
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 sm:h-10 sm:w-10 p-0 border-[#FFAA01] text-[#053468] hover:bg-[#FFAA01]/10 rounded-full"
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="text-lg sm:text-xl font-bold min-w-[2rem] text-center text-[#053468]">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 sm:h-10 sm:w-10 p-0 border-[#FFAA01] text-[#053468] hover:bg-[#FFAA01]/10 rounded-full"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                  <span className="text-base sm:text-lg font-semibold text-[#053468]">
                    المجموع
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-[#FFAA01]">
                    {calculateTotalPrice().toFixed(2)} ر.س
                  </span>
                </div>

                {/* Add to Cart / Update Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCartFinal}
                  className="w-full bg-[#FFAA01] hover:bg-yellow-500 text-[#053468] font-bold py-2.5 sm:py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                >
                  {isEditMode ? "تحديث العنصر" : "إضافة إلى السلة"}
                </Button>

                {/* Error Messages */}
                {!isItemActive && (
                  <p className="text-red-500 text-center text-xs sm:text-sm">
                    هذا العنصر غير متوفر حالياً
                  </p>
                )}
                {!canAddToCart() && isItemActive && (
                  <p className="text-red-500 text-center text-xs sm:text-sm">
                    يجب اختيار جميع الخيارات المطلوبة
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FloatingCart />
    </div>
  );
};

export default ItemDetails;
