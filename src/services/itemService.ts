import axios from "axios";

const BASE_URL = "https://dev-backend.zonak.net/api";

export interface ItemOption {
  id: number;
  menu_item_id: number;
  menu_item_option_id: number;
  price: number;
  type_option_id: number;
  name: string;
  description: string;
  groupTitle: string;
  type: string;
  isRequired: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemSubitem {
  id: number;
  name: string;
  options_count: number;
  price: number;
}

export interface OptionGroup {
  id: number;
  title: string;
  type: string;
  isRequired: boolean;
  options: ItemOption[];
}

export interface ItemDetails {
  id: number;
  menu_id: number;
  name: string;
  description: string;
  price: number;
  is_active: string;
  is_combo: number;
  is_available: number;
  minutes: number;
  categories: {
    id: number;
    name: string;
    order: number;
  }[];
  subitems: ItemSubitem[];
  images: {
    id: number;
    menu_item_id: number;
    image_url: string;
  }[];
  options: ItemOption[];
  optionGroups: OptionGroup[];
  new_price: boolean;
  has_offer: boolean;
}

export const itemService = {
  fetchItemDetails: async (itemId: string): Promise<ItemDetails> => {
    try {
      // console.log("Fetching item details for itemId:", itemId);
      const response = await axios.get(`${BASE_URL}/menu/item/${itemId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // console.log("Item details response ID:", response.data, itemId);

      // Transform the API response to match the expected structure
      const apiData = response.data.data;

      // Transform options to maintain both flat structure and grouped structure
      const flattenedOptions: ItemOption[] = [];
      const optionGroups: OptionGroup[] = [];

      if (apiData.options) {
        apiData.options.forEach(
          (optionGroup: {
            id: number;
            title: string;
            type: string;
            option: {
              id: number;
              menu_id: number;
              title: string;
              price: number;
              created_at: string;
              updated_at: string;
              type_option_id: number;
            }[];
          }) => {
            const isRequired = optionGroup.type === "pick";

            const groupOptions: ItemOption[] = [];

            optionGroup.option.forEach((opt) => {
              const transformedOption: ItemOption = {
                id: opt.id,
                menu_item_id: opt.menu_id,
                menu_item_option_id: optionGroup.id,
                price: opt.price,
                type_option_id: opt.type_option_id,
                name: opt.title,
                description: optionGroup.title,
                groupTitle: optionGroup.title,
                type: optionGroup.type,
                isRequired: isRequired,
                created_at: opt.created_at,
                updated_at: opt.updated_at,
              };

              flattenedOptions.push(transformedOption);
              groupOptions.push(transformedOption);
            });

            optionGroups.push({
              id: optionGroup.id,
              title: optionGroup.title,
              type: optionGroup.type,
              isRequired: isRequired,
              options: groupOptions,
            });
          }
        );
      }

      const transformedData: ItemDetails = {
        id: apiData.id,
        menu_id: apiData.menu_id,
        name: apiData.name,
        description: apiData.description,
        price: apiData.price,
        is_active: apiData.is_active,
        is_combo: apiData.is_combo,
        is_available: apiData.is_active === "active" ? 1 : 0,
        minutes: apiData.minutes,
        categories: apiData.all_categories || [],
        subitems: apiData.subitems || [],
        images: apiData.images || [],
        options: flattenedOptions,
        optionGroups: optionGroups,
        new_price: apiData.new_price,
        has_offer: apiData.has_offer,
      };

      return transformedData;
    } catch (error) {
      console.error("Error fetching item details:", error);
      throw error;
    }
  },
};
