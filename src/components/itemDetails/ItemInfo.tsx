import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItemCategory } from "../../types/types";

interface ItemInfoProps {
  name: string;
  description: string;
  categories?: MenuItemCategory[];
  price: number;
  newPrice?: number | string;
  hasOffer: boolean;
}

const ItemInfo: React.FC<ItemInfoProps> = ({
  name,
  description,
  categories,
  price,
  newPrice,
  hasOffer,
}) => {
  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#053468] mb-3">
          {name}
        </h1>
        <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
          {description}
        </p>

        {categories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
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
            {hasOffer ? newPrice : price} ر.س
          </div>
          {hasOffer && (
            <div className="text-base sm:text-lg text-gray-400 line-through">
              {price} ر.س
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemInfo;
