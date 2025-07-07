import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MenuItem } from "@/hooks/useMenuItems";
import MenuCardImage from "./MenuCardImage";
import MenuCardBadges from "./MenuCardBadges";
import MenuCardPreview from "./MenuCardPreview";
import MenuCardActions from "./MenuCardActions";

interface MenuCardListProps {
  item: MenuItem;
  onAddToCart: () => void;
  mainImage: string;
  hasOptions: boolean;
}

const MenuCardList = ({
  item,
  onAddToCart,
  mainImage,
  hasOptions,
}: MenuCardListProps) => {
  return (
    <Card
      className="
      group overflow-hidden 
      bg-white/90 backdrop-blur-sm
      border border-gray-200/60 hover:border-[#FFAA01]/50
      shadow-lg hover:shadow-2xl 
      transition-all duration-500 ease-out
      hover:scale-[1.02] hover:-translate-y-1
      rounded-2xl
      relative
      before:absolute before:inset-0 before:rounded-2xl
      before:bg-gradient-to-r before:from-[#FFAA01]/3 before:to-[#053468]/3
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
    "
    >
      <CardContent className="p-0 relative z-10">
        <div className="flex items-start space-x-5 space-x-reverse">
          {/* Item Info */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-3">
                <h3
                  className="
                  font-bold text-xl lg:text-2xl text-[#053468] 
                  line-clamp-2 
                  group-hover:text-[#FFAA01] transition-colors duration-300
                  leading-tight
                "
                >
                  {item.name}
                </h3>
                <p
                  className="
                  text-gray-600 text-sm lg:text-base 
                  line-clamp-3 leading-relaxed
                  group-hover:text-gray-700 transition-colors duration-300
                "
                >
                  {item.description}
                </p>
              </div>

              <div className="ml-4">
                <MenuCardBadges
                  categories={[]}
                  isCombo={item.is_combo === 1}
                  hasOptions={hasOptions}
                  layout="vertical"
                />
              </div>
            </div>

            {/* Categories */}
            {item.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {item.categories.map((category) => (
                  <span
                    key={category.id}
                    className="
                      text-xs font-medium
                      border border-[#FFAA01]/30 bg-gradient-to-r from-[#FFAA01]/5 to-[#FFAA01]/10
                      text-[#FFAA01] 
                      px-3 py-1.5 rounded-full
                      transition-all duration-200
                      hover:bg-[#FFAA01]/20 hover:scale-105
                      backdrop-blur-sm cursor-default
                    "
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {/* Preview Section */}
            <div className="mb-5">
              <MenuCardPreview
                subitems={item.subitems}
                options={item.options}
              />
            </div>

            {/* Actions Section */}
            <div className="pt-4 border-t border-gray-100">
              <MenuCardActions
                price={item.price}
                minutes={item.minutes}
                hasOptions={hasOptions}
                isAvailable={item.is_available === 1}
                onAddToCart={onAddToCart}
                size="lg"
              />
            </div>

            {/* Unavailable Message */}
            {item.is_available === 0 && (
              <div
                className="
                mt-4 p-3 
                bg-gradient-to-r from-red-50 to-red-100
                border border-red-200 rounded-lg
                flex items-center gap-2
              "
              >
                <span className="text-red-500 text-lg">⚠️</span>
                <p className="text-red-600 text-sm font-medium">
                  غير متوفر حالياً - سيتم إضافته قريباً
                </p>
              </div>
            )}
          </div>

          {/* Item Image */}
          <div className="relative">
            <MenuCardImage
              src={mainImage}
              alt={item.name}
              isCombo={false}
              isAvailable={item.is_available === 1}
              className="
                w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 
                flex-shrink-0 rounded-2xl
                shadow-md group-hover:shadow-lg
                transition-shadow duration-300
              "
            />

            {/* Decorative corner */}
            <div
              className="
              absolute -top-2 -right-2 
              w-6 h-6 
              bg-gradient-to-br from-[#FFAA01] to-[#FF8A00]
              rounded-full opacity-0 group-hover:opacity-100
              transition-all duration-500 ease-out
              transform scale-0 group-hover:scale-100
            "
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCardList;
