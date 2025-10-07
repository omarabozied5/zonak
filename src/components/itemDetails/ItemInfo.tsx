import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MenuItemCategory } from "../../types/types";

interface ItemInfoProps {
  name: string;
  description: string;
  categories?: MenuItemCategory[];
  price: number;
  newPrice?: number | string;
  hasOffer: boolean;
  onClose?: () => void;
}

const ItemInfo: React.FC<ItemInfoProps> = ({
  name,
  description,
  categories,
  price,
  newPrice,
  hasOffer,
  onClose,
}) => {
  return (
    <div className="bg-white rounded-lg">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 text-center">
            {name}
          </h1>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Description */}
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed text-center">
          {description}
        </p>

        {/* Nutritional Info (if available in description) */}
        {description && description.includes("Carbs") && (
          <div className="text-[10px] sm:text-xs text-gray-500 text-center">
            {description.split(" - ").slice(-1)[0]}
          </div>
        )}

        {/* Categories */}
        {categories?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="border-gray-200 bg-gray-50 text-gray-600 text-[10px] sm:text-xs"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemInfo;
