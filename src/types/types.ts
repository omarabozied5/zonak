export interface WorkingHour {
  id: number;
  place_id: number;
  day: number; // 1 = Monday, 7 = Sunday (based on API data)
  open_time: string; // e.g., "08:00:00"
  close_time: string; // e.g., "17:00:00"
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
}

// New Rating interface
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

export interface RatingResponse {
  message: string;
  data: PlaceRating;
}

// New Branch interface
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

export interface BranchesResponse {
  message: string;
  data: PlaceBranch[];
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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  new_price?: number;
  description: string;
  categories?: string[];
  options?: number[];
  images?: Array<{ image_url: string }>;
}
