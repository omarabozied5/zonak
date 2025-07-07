import React from "react";
import { Plus, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuCardActionsProps {
  price: number;
  minutes?: number;
  hasOptions: boolean;
  isAvailable: boolean;
  onAddToCart: () => void;
  size?: "sm" | "lg";
}

const MenuCardActions = ({
  price,
  minutes,
  hasOptions,
  isAvailable,
  onAddToCart,
  size = "lg",
}: MenuCardActionsProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div
        className={`flex items-center ${
          size === "sm" ? "space-x-2" : "space-x-3"
        } space-x-reverse`}
      >
        <span
          className={`${
            size === "sm" ? "text-xl" : "text-2xl"
          } font-bold text-gradient bg-gradient-to-r from-[#FFAA01] to-[#FF8A00] bg-clip-text text-transparent`}
        >
          {price} ر.س
        </span>
        {minutes && (
          <div
            className={`flex items-center space-x-1 space-x-reverse text-gray-500 transition-all duration-200 ${
              size === "sm"
                ? "hover:text-gray-700"
                : "bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200"
            }`}
          >
            <Clock
              className={`${
                size === "sm" ? "h-3 w-3" : "h-4 w-4"
              } text-[#FFAA01]`}
            />
            <span
              className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium`}
            >
              {minutes} دقيقة
            </span>
          </div>
        )}
      </div>

      <Button
        onClick={onAddToCart}
        disabled={!isAvailable}
        className={`
          relative overflow-hidden
          bg-gradient-to-r from-[#FFAA01] to-[#FF8A00] 
          hover:from-[#FF8A00] hover:to-[#FFAA01]
          text-white font-semibold
          transition-all duration-300 ease-out
          shadow-lg hover:shadow-xl
          transform hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3"}
          rounded-xl
          before:absolute before:inset-0 before:bg-white before:opacity-0 
          hover:before:opacity-20 before:transition-opacity before:duration-300
        `}
        size={size}
      >
        <div className="relative z-10 flex items-center">
          {hasOptions ? (
            <>
              <Settings
                className={`${
                  size === "sm" ? "h-4 w-4 ml-1" : "h-5 w-5 ml-2"
                } transition-transform duration-200 group-hover:rotate-12`}
              />
              {size === "sm" ? "خيارات" : "تخصيص وإضافة"}
            </>
          ) : (
            <>
              <Plus
                className={`${
                  size === "sm" ? "h-4 w-4 ml-1" : "h-5 w-5 ml-2"
                } transition-transform duration-200 group-hover:rotate-90`}
              />
              {size === "sm" ? "إضافة" : "إضافة للسلة"}
            </>
          )}
        </div>
      </Button>
    </div>
  );
};

export default MenuCardActions;
