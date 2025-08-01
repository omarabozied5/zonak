// components/ItemDetails/types.ts

export interface ItemImage {
  id: number;
  image_url: string;
  is_main?: boolean;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
}

export interface Option {
  id: number;
  name: string;
  name_ar?: string;
  price: number;
}

export interface OptionGroup {
  id: number;
  title: string;
  type: "pick" | "optional";
  options: Option[];
  max_selection?: number;
  min_selection?: number;
}

export interface ItemDetailsData {
  id: number;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  new_price?: number | null;
  has_offer: boolean;
  is_combo: number;
  is_active: string;
  menu_id?: number;
  images?: ItemImage[];
  categories?: Category[];
  optionGroups?: OptionGroup[];
  minutes?: number;
}

export interface CartItemOptions {
  requiredOptions?: Record<number, number>;
  requiredOptionNames?: Record<string, string>;
  optionalOptions?: number[];
  optionalOptionNames?: string[];
  notes?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  selectedOptions?: CartItemOptions;
}
