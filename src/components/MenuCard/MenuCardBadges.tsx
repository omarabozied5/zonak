import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Settings2 } from "lucide-react";

interface MenuCardBadgesProps {
  categories: Array<{ id: number; name: string }>;
  isCombo: boolean;
  hasOptions: boolean;
  maxCategories?: number;
  layout?: "horizontal" | "vertical";
}

const MenuCardBadges = ({
  categories,
  isCombo,
  hasOptions,
  maxCategories = 2,
  layout = "horizontal",
}: MenuCardBadgesProps) => {
  return (
    <div
      className={`flex ${
        layout === "vertical" ? "flex-col" : "flex-row items-center"
      } gap-2`}
    >
      {/* Category Badges */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, maxCategories).map((category) => (
            <Badge
              key={category.id}
              variant="outline"
              className="
                text-xs font-medium
                border-[#FFAA01]/40 bg-gradient-to-r from-[#FFAA01]/10 to-[#FFAA01]/20
                text-[#FFAA01] hover:bg-[#FFAA01]/30
                transition-all duration-200 ease-in-out
                backdrop-blur-sm
                hover:scale-105 cursor-default
              "
            >
              {category.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {isCombo && (
          <Badge
            className="
            bg-gradient-to-r from-[#FFAA01] to-[#FF8A00] 
            text-white text-xs font-semibold
            shadow-md hover:shadow-lg
            transition-all duration-200
            hover:scale-105 cursor-default
            flex items-center gap-1
          "
          >
            <Star className="h-3 w-3" />
            كومبو
          </Badge>
        )}
        {hasOptions && (
          <Badge
            variant="outline"
            className="
              text-xs font-medium
              border-[#053468]/40 bg-gradient-to-r from-[#053468]/10 to-[#053468]/20
              text-[#053468] hover:bg-[#053468]/30
              transition-all duration-200 ease-in-out
              backdrop-blur-sm
              hover:scale-105 cursor-default
              flex items-center gap-1
            "
          >
            <Settings2 className="h-3 w-3" />
            خيارات متاحة
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MenuCardBadges;
