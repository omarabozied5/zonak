import React from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityControlsProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  className?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

const QuantityControls: React.FC<QuantityControlsProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  disabled = false,
  className = "",
  minQuantity = 1,
  maxQuantity = 99,
}) => {
  const isDecreaseDisabled = disabled || quantity <= minQuantity;
  const isIncreaseDisabled = disabled || quantity >= maxQuantity;

  return (
    <div
      className={`flex items-center gap-2 bg-gray-50 rounded-lg p-1 ${className}`}
    >
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 border-[#FFAA01]/50 hover:bg-[#FFAA01]/20 hover:border-[#FFAA01] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onDecrease}
        disabled={isDecreaseDisabled}
        aria-label="تقليل الكمية"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <span
        className="min-w-[2rem] text-center font-bold text-[#053468]"
        aria-label={`الكمية: ${quantity}`}
      >
        {quantity}
      </span>

      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 border-[#FFAA01]/50 hover:bg-[#FFAA01]/20 hover:border-[#FFAA01] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onIncrease}
        disabled={isIncreaseDisabled}
        aria-label="زيادة الكمية"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuantityControls;
