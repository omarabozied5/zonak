export interface WorkingHour {
  id: number;
  place_id: number;
  day: number; // 1 = Monday, 7 = Sunday
  open_time: string;
  close_time: string;
  is_closed: string; // "0" or "1"
  updatetime: string;
  insertdate: string;
  second_open_time: string | null;
  second_close_time: string | null;
  is_24h: boolean;
  is_second_period: number;
  is_closed_now: boolean;
  is_closed_bool: boolean;
}

export interface DeliveryInfo {
  id: number;
  base_price: number;
  price_for_more_km: number;
  enable_free_delivery: number;
  order_price_for_free_delivery: number;
  max_delivery_distance: number;
  merchant_id: number;
  created_at: string;
  updated_at: string;
  enable_from_admin: number;
  max_distance_admin: number;
  min_price_for_delivery: number;
  is_delivery_zonak: number;
  delivery_zonak_price: number | null;
}

export interface ValidOffer {
  id: number;
  is_offer_verified: string;
  offer_type: number;
  discount: number | null;
  place_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  main_offer_order: number;
  insertdate: string;
  main_offer: boolean;
  product_name: string;
  old_price: number | null;
  new_price: number | null;
  offer_details: string | null;
  laravel_through_key: number;
  places: number[];
  offer_image: string | null;
}

export interface PlaceCategory {
  id: number;
  parent_id: number;
  name: string;
  image: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string | null;
  is_cashback_partner: number;
  is_exclusive_partner: number;
  profile_image: string;
  have_menu: number;
  email: string;
  car_delivery: boolean;
  price_car_delivery: number;
  full_name: string;
  name?: string;
  phone?: string;
}

export interface PlaceRating {
  rate_of_place: number;
  total_rate: number;
  my_rate: number;
  rate_5: number;
  rate_4: number;
  rate_3: number;
  rate_2: number;
  rate_1: number;
}

export interface PlaceBranch {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  website: string;
  address: string;
  address_ar: string;
  phone: string;
  whatsapp: string;
  latitude: string;
  longitude: string;
  free_deliver: string;
  logo: string;
  distance: number;
  reviews_average: number;
  working_hours: WorkingHour[];
  merchant_name: string;
  category_name: string;
  enable_delivery_car: number;
  active: number;
}

export interface Restaurant {
  id: number;
  longitude: string;
  latitude: string;
  phone: string;
  website: string;
  whatsapp: string;
  user_id: number;
  address_ar: string;
  category_id: number;
  title: string;
  title_ar: string;
  enable_delivery_car: number;
  distance: number;
  is_favor: boolean;
  duration_time: number;
  have_items: number;
  cashback_delivery: number;
  is_delivery: DeliveryInfo;
  time_to_ready: string;
  cashback_branch: number;
  cashback: number;
  category_name: string;
  address: string;
  taddress: string;
  slider_images: string[];
  menu_images: string[];
  discount: number;
  merchant_name: string;
  valid_offers: ValidOffer[];
  working_hours: WorkingHour[];
  place_category: PlaceCategory;
  user: User;
}
// types/offers.ts

export interface ValidOffersItem {
  id: number;
  offer_type: number;
  discount?: number | null;
  offer_details?: string | null;
  end_date: string;
  product_name?: string | null;
  old_price?: number | null;
  new_price?: number | null;
  place_id: number;
  user_id: number;
  offer_image?: string | null;
  main_offer: boolean;
  is_offer_verified?: string;
  start_date?: string;
  main_offer_order?: number;
  insertdate?: string;
  places?: number[];
}

// Constants for offer types
export const OFFER_TYPE_PRICE = 0;
export const OFFER_TYPE_DISCOUNT = 1;
export const OFFER_TYPE_OFFER = 3;
export const OFFER_CASHBACK = 4;

export interface OfferTextContent {
  main: string;
  sub: string;
  badge: string;
}

// ===== API Response Types =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export type RatingResponse = ApiResponse<PlaceRating>;
export type BranchesResponse = ApiResponse<PlaceBranch[]>;

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}>;

// ===== Menu Item Types =====
export interface MenuItemCategory {
  id: number;
  name: string;
  image?: string;
}

export interface MenuItemImage {
  id: number;
  image_url: string;
  is_main?: boolean;
}

export interface MenuItemOption {
  id: number;
  name: string;
  name_ar?: string;
  price: number;
  is_required: boolean;
  category: string;
  max_selection?: number;
  min_selection?: number;
}

export interface MenuItemSubitem {
  id: number;
  name: string;
  name_ar?: string;
  price: number;
  quantity: number;
}

export interface MenuItem {
  id: number;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  new_price?: number | null;
  is_combo: boolean;
  minutes: number;
  categories: MenuItemCategory | MenuItemCategory[];
  images: MenuItemImage[];
  subitems: MenuItemSubitem[];
  options: MenuItemOption[];
  is_available: boolean;
  has_offer: boolean;
  categoryId: number; // Computed field
}

export interface MenuResponse
  extends ApiResponse<{
    items: MenuItem[];
    categories: MenuItemCategory[];
  }> {}

// ===== Processed Data Types =====
export interface ProcessedPreparedOrder {
  id: number;
  merchantName: string;
  userId: number;
  isBusy: boolean;
  enableDelivery: boolean;
  profileImage: string;
  distance?: number;
  rating?: number;
  address?: string;
  workingHours?: WorkingHour[];
  isExclusivePartner?: boolean;
}

export interface RatingBreakdown {
  stars: number;
  count: number;
  percentage: number;
}

export interface ProcessedRatingData {
  averageRating: number;
  totalRatings: number;
  myRating: number;
  breakdown: RatingBreakdown[];
}

export interface ProcessedBranch {
  id: number;
  title: string;
  titleAr: string;
  address: string;
  addressAr: string;
  phone: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating: number;
  merchantName: string;
  categoryName: string;
  workingHours: WorkingHour[];
  enableDelivery: boolean;
  isActive: boolean;
  logo: string;
}

// ===== Cart Types =====
export interface CartItemModifier {
  id: number;
  name: string;
  name_ar?: string;
  price: number;
  category: string;
  isRequired: boolean;
  maxSelection?: number;
  minSelection?: number;
}
export interface SelectedOptionDetails {
  id: number;
  price: number;
  type_option_id: number;
  name: string;
}
export interface CartItemOptions {
  size?: {
    id: number;
    name: string;
    price: number;
  };
  requiredOptions?: Record<string, number>;
  requiredOptionNames?: Record<string, string>;
  requiredOptionsDetails?: Record<string, SelectedOptionDetails>; // NEW
  optionalOptions?: number[];
  optionalOptionNames?: string[];
  optionalOptionsDetails?: SelectedOptionDetails[]; // NEW
  modifiers?: CartItemModifier[];
  specialInstructions?: string;
  notes?: string;
}

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  image: string;
  images?: string[];
  category: string;
  categoryId: number;
  restaurantId: string;
  restaurantName: string;
  restaurantName_ar?: string;
  placeId: string;
  branchId?: number;
  isAvailable: boolean;
  preparationTime?: number;
  calories?: number;
  nutritionalInfo?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  allergens?: string[];
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  selectedOptions?: CartItemOptions;
  totalPrice: number;
  totalPriceWithModifiers: number;
  addedAt: Date;
  lastModified?: Date;
  isCustomizable: boolean;
  hasRequiredOptions: boolean;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  sku?: string;
  barcode?: string;
  taxRate?: number;
  taxAmount?: number;
  isGift?: boolean;
  giftMessage?: string;
  deliveryNotes?: string;
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

// ===== Order Types =====
export interface BackendOptionItem {
  option_id: number;
  price_option: number;
  quantity_option: number;
  subitem_id: number;
  type_option_id: number;
}
export interface BackendOrderItem {
  id: number;
  options: BackendOptionItem[];
  price: number;
  is_winner: boolean;
  quantity: number;
  note: string | null;
  category_id: number;
  price_with_option: number;
}

export interface BackendOrderPayload {
  cart_price: number;
  discount: number;
  is_zonak_account_used: boolean;
  items_id: BackendOrderItem[];
  merchant_id: number;
  place_id: number;
  total_price: number;
  zonak_discount: number;
  type: number; // 0 for pickup, 1 for delivery
  cashback_value: number;
  is_new: boolean;
  is_delivery: number; // 0 for pickup, 1 for delivery
  cashback_from_coupons: number;
  discount_from_coupons: number;
  max_coupoun_discount: number;
  is_delivery_zonak: number;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  order_id?: string | number;
}

// ===== Checkout Types =====
export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface OrderData {
  items: CartItem[];
  customerInfo: CustomerInfo;
  orderType: OrderType;
  paymentMethod: string;
  totalPrice: number;
  tax: number;
  deliveryFee: number;
  total: number;
}
// Add these types to your existing types.ts file

// ===== Backend Order Response Types =====
export interface BackendOrderPlace {
  id: number;
  title: string;
  merchant_name: string;
  logo: string;
  longitude: string;
  latitude: string;
  phone: string;
  reviews_average: number;
}

export interface BackendOrderItem {
  item_name: string;
  quantity: number;
  options: BackendOptionItem[]; // Can be expanded based on actual option structure
}

export interface BackendOrder {
  id: number;
  user_id: number;
  total_price: number;
  cart_price: number;
  note: string | null;
  merchant_id: number;
  place_id: number;
  status: BackendOrderStatus;
  cancelled_at: string | null;
  confirmed_at: string | null;
  max_delivery_time: string | null;
  rejected_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  rejection_type: string | null;
  discount: number;
  total_vat: number | null;
  remaining_time: number;
  zonak_discount: number;
  delivery_cost: number;
  location: string | null;
  long: string | null;
  lat: string | null;
  address: string | null;
  discount_from_coupons: number;
  cashback_from_coupons: number;
  title: string | null;
  phone: string | null;
  is_car_delivery: number | null;
  car_delivery_cost: number;
  is_zonak_account_used: number;
  remaining_amount: number;
  time_to_ready: string | null;
  firebase_uuid: string;
  created_at: string;
  type_payment: number;
  is_waiting_car: number;
  is_new: number;
  is_accepted: number;
  is_delivery: number;
  status_payment: string;
  provider: string | null;
  place: BackendOrderPlace;
  orderitems: BackendOrderItem[];
}

export type BackendOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "on_the_way"
  | "waiting_customer"
  | "delivered"
  | "rejected"
  | "timeout";

export interface BackendOrdersResponse extends ApiResponse<BackendOrder[]> {}

// ===== Transformed Order Types (for frontend use) =====
export interface TransformedOrder {
  id: number;
  status:
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  orderType: "pickup" | "delivery";
  paymentMethod: "cash" | "card" | "wallet";
  total: number;
  totalPrice: number;
  deliveryFee: number;
  tax: number;
  createdAt: string;
  estimatedTime?: string;
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    restaurantName: string;
  }>;
  restaurant: {
    id: number;
    name: string;
    logo: string;
    phone: string;
  };
}

// ===== Status Mapping =====
export const BACKEND_TO_FRONTEND_STATUS_MAP: Record<
  BackendOrderStatus,
  TransformedOrder["status"]
> = {
  pending: "preparing",
  confirmed: "preparing",
  preparing: "preparing",
  ready: "ready",
  on_the_way: "out_for_delivery",
  waiting_customer: "out_for_delivery",
  delivered: "delivered",
  rejected: "cancelled",
  timeout: "cancelled",
};

export const PAYMENT_TYPE_MAP: Record<
  number,
  TransformedOrder["paymentMethod"]
> = {
  1: "cash",
  2: "card",
  3: "wallet",
};

export const PAYMENT_STATUS_MAP: Record<string, string> = {
  paid_with_wallet: "مدفوع بالمحفظة",
  paid_with_card: "مدفوع بالبطاقة",
  cash_on_delivery: "الدفع عند الاستلام",
};
export interface Coupon {
  code: string;
  discount: number;
  type: CouponType;
}

export interface RestaurantContext {
  restaurant: Restaurant | null;
  placeId: number | null;
  merchantId: number | null;
  setRestaurant: (restaurant: Restaurant) => void;
  clearRestaurant: () => void;
}

// ===== Constants and Unions =====
export type OrderType = "pickup" | "delivery";
export type PaymentMethod = "cash" | "card" | "wallet";
export type CouponType = "percentage" | "fixed";

// ===== Utility Types =====
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== Type Aliases for Backward Compatibility =====
export type { WorkingHour as BusinessHours };
export type { PlaceBranch as Branch };
export type { ValidOffer as Offer };
