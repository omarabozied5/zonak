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
    <div className="space-y-8">
      {optionGroups.map((group) => (
        <div key={group.id} className="space-y-4">
          {/* Group Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">{group.title}</h3>
            <Badge
              variant={group.type === "pick" ? "default" : "secondary"}
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                group.type === "pick"
                  ? "bg-gray-100 text-grey-200 border border-black-200"
                  : "bg-gray-100 text-grey-200 border border-gre  y-200"
              }`}
            >
              {group.type === "pick" ? "إجباري" : "اختياري"}
            </Badge>
          </div>

          {/* Selection Indicator */}
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {group.type === "pick" ? "اختر 1 فقط" : "اختر"}
            </span>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {group.type === "pick" ? (
              <RadioGroup
                value={selectedOptions[group.id]?.toString() || ""}
                onValueChange={(value) =>
                  handleRequiredOptionChange(group.id, parseInt(value))
                }
                className="space-y-3"
              >
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#FBD252] transition-colors"
                  >
                    {/* Price on left */}
                    <span className="text-sm text-gray-600 font-medium">
                      {option.price > 0
                        ? `+ ${option.price.toFixed(2)} ر.س`
                        : "0.00 ر.س"}
                    </span>

                    {/* Option name and radio on right */}
                    <div className="flex items-center gap-3">
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="cursor-pointer text-gray-900 font-medium text-right"
                      >
                        {option.name}
                      </Label>
                      <RadioGroupItem
                        value={option.id.toString()}
                        id={`option-${option.id}`}
                        className="border-2 border-gray-300 text-[#FBD252] data-[state=checked]:border-[#FBD252] data-[state=checked]:bg-[#FBD252]"
                      />
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#FBD252] transition-colors"
                  >
                    {/* Option name and checkbox on right */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`optional-${option.id}`}
                        checked={selectedOptional.includes(option.id)}
                        onCheckedChange={(checked) =>
                          handleOptionalOptionChange(
                            option.id,
                            checked as boolean
                          )
                        }
                        className="border-2 border-gray-300 data-[state=checked]:bg-[#FBD252] data-[state=checked]:border-[#FBD252] data-[state=checked]:text-white h-5 w-5"
                      />
                      <Label
                        htmlFor={`optional-${option.id}`}
                        className="cursor-pointer text-gray-900 font-medium text-right"
                      >
                        {option.name}
                      </Label>
                    </div>
                    {/* Price on left */}
                    <span className="text-sm text-gray-600 font-medium">
                      {option.price > 0
                        ? `+ ${option.price.toFixed(2)} ر.س`
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
