import React, { useMemo, memo } from "react";
import { CartItem } from "../../types/types";

interface CartItemOptionsProps {
  item: CartItem;
  className?: string;
}

const CartItemOptions: React.FC<CartItemOptionsProps> = ({
  item,
  className = "",
}) => {
  const optionDisplays = useMemo(() => {
    if (!item.selectedOptions) return [];

    const displays: string[] = [];

    if (item.selectedOptions.size) {
      const sizeName =
        typeof item.selectedOptions.size === "object"
          ? item.selectedOptions.size.name
          : item.selectedOptions.size;
      displays.push(`الحجم: ${sizeName}`);
    }

    if (
      item.selectedOptions.requiredOptions &&
      Object.keys(item.selectedOptions.requiredOptions).length > 0
    ) {
      if (item.selectedOptions.requiredOptionNames) {
        Object.entries(item.selectedOptions.requiredOptionNames).forEach(
          ([groupName, optionName]) => {
            displays.push(`${groupName}: ${optionName}`);
          }
        );
      } else {
        const requiredCount = Object.keys(
          item.selectedOptions.requiredOptions
        ).length;
        displays.push(`الخيارات المطلوبة: ${requiredCount} خيار`);
      }
    }

    if (
      item.selectedOptions.optionalOptions &&
      item.selectedOptions.optionalOptions.length > 0
    ) {
      if (
        item.selectedOptions.optionalOptionNames &&
        item.selectedOptions.optionalOptionNames.length > 0
      ) {
        const optionsText = item.selectedOptions.optionalOptionNames.join("، ");
        displays.push(`الإضافات: ${optionsText}`);
      } else {
        displays.push(
          `الإضافات: ${item.selectedOptions.optionalOptions.length} إضافة`
        );
      }
    }

    if (item.selectedOptions.notes?.trim()) {
      displays.push(`ملاحظات: ${item.selectedOptions.notes.trim()}`);
    }

    return displays;
  }, [item.selectedOptions]);

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

export default memo(CartItemOptions);
