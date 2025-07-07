import React from "react";
import { Package, Plus } from "lucide-react";

interface SubItem {
  id: number;
  name: string;
}

interface Option {
  id: number;
  price: number;
}

interface MenuCardPreviewProps {
  subitems: SubItem[];
  options: Option[];
}

const MenuCardPreview = ({ subitems, options }: MenuCardPreviewProps) => {
  if (subitems.length === 0 && options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Subitems Preview */}
      {subitems.length > 0 && (
        <div
          className="
          p-4 
          bg-gradient-to-r from-[#FFAA01]/8 to-[#FFAA01]/12
          border border-[#FFAA01]/20
          rounded-xl
          transition-all duration-300 hover:bg-[#FFAA01]/15
          backdrop-blur-sm
          group/subitem
        "
        >
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-[#FFAA01]" />
            <p className="text-sm font-semibold text-[#FFAA01]">يتضمن:</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {subitems.slice(0, 3).map((subitem, index) => (
              <span
                key={subitem.id}
                className="
                  text-xs font-medium
                  bg-white/80 backdrop-blur-sm
                  px-3 py-1.5 rounded-full 
                  text-[#053468] 
                  border border-[#FFAA01]/30
                  shadow-sm
                  transition-all duration-200
                  hover:bg-white hover:scale-105 hover:shadow-md
                  cursor-default
                "
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {subitem.name}
              </span>
            ))}
            {subitems.length > 3 && (
              <span
                className="
                text-xs font-medium text-gray-500 
                px-3 py-1.5 
                bg-gray-50 rounded-full
                border border-gray-200
                flex items-center gap-1
                transition-all duration-200 hover:bg-gray-100
                cursor-default
              "
              >
                <Plus className="h-3 w-3" />
                {subitems.length - 3} المزيد
              </span>
            )}
          </div>
        </div>
      )}

      {/* Options Preview */}
      {options.length > 0 && (
        <div
          className="
          p-4 
          bg-gradient-to-r from-[#053468]/8 to-[#053468]/12
          border border-[#053468]/20
          rounded-xl
          transition-all duration-300 hover:bg-[#053468]/15
          backdrop-blur-sm
          group/option
        "
        >
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-[#053468]" />
            <p className="text-sm font-semibold text-[#053468]">
              خيارات إضافية متاحة:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {options.slice(0, 2).map((option, index) => (
              <span
                key={option.id}
                className="
                  text-xs font-semibold
                  bg-white/80 backdrop-blur-sm
                  px-3 py-1.5 rounded-full 
                  text-[#053468] 
                  border border-[#053468]/30
                  shadow-sm
                  transition-all duration-200
                  hover:bg-white hover:scale-105 hover:shadow-md
                  cursor-default
                  flex items-center gap-1
                "
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <Plus className="h-2.5 w-2.5" />
                {option.price} ر.س
              </span>
            ))}
            {options.length > 2 && (
              <span
                className="
                text-xs font-medium text-gray-500 
                px-3 py-1.5 
                bg-gray-50 rounded-full
                border border-gray-200
                flex items-center gap-1
                transition-all duration-200 hover:bg-gray-100
                cursor-default
              "
              >
                <Plus className="h-3 w-3" />
                {options.length - 2} خيار إضافي
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuCardPreview;
