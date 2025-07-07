import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MenuItem } from "@/hooks/useMenuItems";
import MenuCardImage from "./MenuCardImage";
import MenuCardBadges from "./MenuCardBadges";
import MenuCardActions from "./MenuCardActions";

interface MenuCardGridProps {
  item: MenuItem;
  onAddToCart: () => void;
  mainImage: string;
  hasOptions: boolean;
}

const MenuCardGrid = ({
  item,
  onAddToCart,
  mainImage,
  hasOptions,
}: MenuCardGridProps) => {
  return (
    <Card
      className="
      group overflow-hidden 
      bg-white/80 backdrop-blur-sm
      border border-gray-200/50 hover:border-[#FFAA01]/40
      shadow-lg hover:shadow-2xl 
      transition-all duration-500 ease-out
      hover:scale-105 hover:-translate-y-2
      rounded-2xl
      relative
      before:absolute before:inset-0 before:rounded-2xl
      before:bg-gradient-to-br before:from-[#FFAA01]/5 before:to-[#053468]/5
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
    "
    >
      <div className="relative z-10">
        <MenuCardImage
          src={mainImage}
          alt={item.name}
          isCombo={item.is_combo === 1}
          isAvailable={item.is_available === 1}
          className="w-full h-48 rounded-t-2xl"
        />

        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <h3
              className="
              font-bold text-lg text-[#053468] 
              line-clamp-1 mb-1
              group-hover:text-[#FFAA01] transition-colors duration-300
            "
            >
              {item.name}
            </h3>
            <p
              className="
              text-gray-600 text-sm line-clamp-2 mb-2 
              leading-relaxed
              group-hover:text-gray-700 transition-colors duration-300
            "
            >
              {item.description}
            </p>
          </div>

          {/* Categories */}
          {item.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.categories.slice(0, 2).map((category) => (
                <span
                  key={category.id}
                  className="
                    text-xs font-medium
                    border border-[#FFAA01]/30 bg-gradient-to-r from-[#FFAA01]/5 to-[#FFAA01]/10
                    text-[#FFAA01] 
                    px-3 py-1.5 rounded-full
                    transition-all duration-200
                    hover:bg-[#FFAA01]/20 hover:scale-105
                    backdrop-blur-sm
                  "
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Status Badges */}
          <MenuCardBadges
            categories={[]}
            isCombo={item.is_combo === 1}
            hasOptions={hasOptions}
            layout="horizontal"
          />

          <div className="pt-3 border-t border-gray-100">
            <MenuCardActions
              price={item.price}
              minutes={item.minutes}
              hasOptions={hasOptions}
              isAvailable={item.is_available === 1}
              onAddToCart={onAddToCart}
              size="sm"
            />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default MenuCardGrid;
