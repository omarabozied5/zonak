import { CartItem } from "@/components/Cart/types";

export const useCartItemHelpers = () => {
  const hasCustomizations = (item: CartItem): boolean => {
    if (!item.selectedOptions) return false;

    const hasSize = !!item.selectedOptions.size;
    const hasRequiredOptions = !!(
      item.selectedOptions.requiredOptions &&
      Object.keys(item.selectedOptions.requiredOptions).length > 0
    );
    const hasOptionalOptions = !!(
      item.selectedOptions.optionalOptions &&
      item.selectedOptions.optionalOptions.length > 0
    );
    const hasNotes = !!item.selectedOptions.notes?.trim();

    return hasSize || hasRequiredOptions || hasOptionalOptions || hasNotes;
  };

  const getItemTotal = (item: CartItem): number => {
    return item.price * item.quantity;
  };

  const formatPrice = (price: number): string => {
    return `${price.toFixed(2)} ر.س`;
  };

  return {
    hasCustomizations,
    getItemTotal,
    formatPrice,
  };
};
