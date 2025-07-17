export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  selectedOptions?: {
    size?: string;
    requiredOptions?: Record<string, any>;
    requiredOptionNames?: Record<string, string>;
    optionalOptions?: string[];
    optionalOptionNames?: string[];
    notes?: string;
  };
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  restaurantGroups: Record<string, number>;
  restaurantCount: number;
  hasMultipleRestaurants: boolean;
  isEmpty: boolean;
}

export interface CartValidation {
  canProceedToCheckout: boolean;
  validationErrors: string[];
  isCheckoutDisabled: boolean;
}
