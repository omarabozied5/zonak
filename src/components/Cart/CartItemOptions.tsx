import React from "react";
import { CartItem } from "../../types/types";

interface CartItemOptionsProps {
  item: CartItem;
  className?: string;
}

const CartItemOptions: React.FC<CartItemOptionsProps> = ({
  item,
  className = "",
}) => {
  const getOptionDisplayText = (item: CartItem): string[] => {
    if (!item.selectedOptions) return [];

    const displayElements: string[] = [];

    // Handle size option
    if (item.selectedOptions.size) {
      const sizeName = typeof item.selectedOptions.size === 'object' 
        ? item.selectedOptions.size.name 
        : item.selectedOptions.size;
      displayElements.push(`الحجم: ${sizeName}`);
    }

    // Handle required options - use names if available, otherwise show count
    if (item.selectedOptions.requiredOptions && 
        Object.keys(item.selectedOptions.requiredOptions).length > 0) {
      
      if (item.selectedOptions.requiredOptionNames) {
        // Show group name and option name
        Object.entries(item.selectedOptions.requiredOptionNames).forEach(
          ([groupName, optionName]) => {
            displayElements.push(`${groupName}: ${optionName}`);
          }
        );
      } else {
        // Fallback to showing count of required options
        const requiredCount = Object.keys(item.selectedOptions.requiredOptions).length;
        displayElements.push(`الخيارات المطلوبة: ${requiredCount} خيار`);
      }
    }

    // Handle optional additions - use names if available
    if (item.selectedOptions.optionalOptions && 
        item.selectedOptions.optionalOptions.length > 0) {
      
      if (item.selectedOptions.optionalOptionNames && 
          item.selectedOptions.optionalOptionNames.length > 0) {
        const optionsText = item.selectedOptions.optionalOptionNames.join("، ");
        displayElements.push(`الإضافات: ${optionsText}`);
      } else {
        // Fallback to showing count
        displayElements.push(
          `الإضافات: ${item.selectedOptions.optionalOptions.length} إضافة`
        );
      }
    }

    // Handle notes
    if (item.selectedOptions.notes?.trim()) {
      displayElements.push(`ملاحظات: ${item.selectedOptions.notes.trim()}`);
    }

    return displayElements;
  };

  const optionDisplays = getOptionDisplayText(item);

  if (optionDisplays.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-gray-50 rounded-lg p-2 text-xs sm:text-sm text-gray-600 space-y-1 ${className}`}
    >
      {optionDisplays.map((display: string, index: number) => (
        <p key={index} className="truncate" title={display}>
          • {display}
        </p>
      ))}
    </div>
  );
};

export default CartItemOptions;