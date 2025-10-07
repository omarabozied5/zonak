import React from "react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface OptionGroup {
  id: number;
  title: string;
  type: string;
  options: {
    id: number;
    name: string;
    price: number;
  }[];
}

interface OptionGroupsProps {
  optionGroups?: OptionGroup[];
  selectedOptions: Record<number, number>;
  selectedOptional: number[];
  handleRequiredOptionChange: (groupId: number, optionId: number) => void;
  handleOptionalOptionChange: (optionId: number, checked: boolean) => void;
}

const OptionGroups: React.FC<OptionGroupsProps> = ({
  optionGroups,
  selectedOptions,
  selectedOptional,
  handleRequiredOptionChange,
  handleOptionalOptionChange,
}) => {
  if (!optionGroups || optionGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {optionGroups.map((group) => (
        <div key={group.id} className="space-y-2 sm:space-y-3">
          {/* Group Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              {group.title}
            </h3>
            <Badge
              variant={group.type === "pick" ? "default" : "secondary"}
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium bg-gray-50 text-gray-300 border border-gray-100"
            >
              {group.type === "pick" ? "إجباري" : "اختياري"}
            </Badge>
          </div>

          {/* Selection Indicator */}
          <div className="text-right">
            <span className="text-[10px] sm:text-xs text-gray-500">
              {group.type === "pick" ? "خيار 1 فقط" : "اختر"}
            </span>
          </div>

          {/* Options List */}
          <div className="space-y-1.5 sm:space-y-2">
            {group.type === "pick" ? (
              <RadioGroup
                value={selectedOptions[group.id]?.toString() || ""}
                onValueChange={(value) =>
                  handleRequiredOptionChange(group.id, parseInt(value))
                }
                className="space-y-1.5 sm:space-y-2"
              >
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:border-gray-400 transition-colors bg-white"
                  >
                    {/* Price on right for RTL */}
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                      {option.price > 0
                        ? `${option.price.toFixed(2)} ر.س +`
                        : "0.00 ر.س"}
                    </span>

                    {/* Option name and radio on left for RTL */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="cursor-pointer text-gray-900 font-medium text-right text-xs sm:text-sm"
                      >
                        {option.name}
                      </Label>
                      <RadioGroupItem
                        value={option.id.toString()}
                        id={`option-${option.id}`}
                        className="border-2 border-gray-300 text-yellow-400 data-[state=checked]:border-yellow-400 data-[state=checked]:bg-yellow-400 h-4 w-4 sm:h-5 sm:w-5"
                      />
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:border-yellow-400 transition-colors bg-white"
                  >
                    {/* Option name and checkbox on left for RTL */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Checkbox
                        id={`optional-${option.id}`}
                        checked={selectedOptional.includes(option.id)}
                        onCheckedChange={(checked) =>
                          handleOptionalOptionChange(
                            option.id,
                            checked as boolean
                          )
                        }
                        className="border-2 border-gray-300 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400 data-[state=checked]:text-white h-4 w-4 sm:h-5 sm:w-5"
                      />
                      <Label
                        htmlFor={`optional-${option.id}`}
                        className="cursor-pointer text-gray-900 font-medium text-right text-xs sm:text-sm"
                      >
                        {option.name}
                      </Label>
                    </div>
                    {/* Price on right for RTL */}
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                      {option.price > 0
                        ? `${option.price.toFixed(2)} ر.س +`
                        : "0.00 ر.س"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OptionGroups;
