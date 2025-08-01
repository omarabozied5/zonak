import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <>
      {optionGroups.map((group) => (
        <Card key={group.id} className="shadow-lg border-0">
          <CardHeader className="pb-3 bg-gray-50/50 rounded-t-lg">
            <CardTitle className="text-base sm:text-lg text-[#053468] flex flex-col sm:flex-row sm:items-center gap-2">
              <span>{group.title}</span>
              <Badge
                variant={group.type === "pick" ? "destructive" : "secondary"}
                className="text-xs w-fit"
              >
                {group.type === "pick" ? "مطلوب" : "اختياري"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {group.type === "pick" ? (
              <RadioGroup
                value={selectedOptions[group.id]?.toString() || ""}
                onValueChange={(value) =>
                  handleRequiredOptionChange(group.id, parseInt(value))
                }
              >
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {option.price >= 0 && (
                      <span className="text-xs sm:text-sm text-[#FFAA01] font-semibold order-1">
                        {option.price} ر.س
                      </span>
                    )}
                    <div className="flex items-center space-x-3 space-x-reverse order-2">
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="cursor-pointer text-[#053468] font-medium pr-2 text-sm sm:text-base"
                      >
                        {option.name}
                      </Label>
                      <RadioGroupItem
                        value={option.id.toString()}
                        id={`option-${option.id}`}
                        className="border-[#FFAA01] text-[#053468]"
                      />
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Checkbox
                        id={`optional-${option.id}`}
                        checked={selectedOptional.includes(option.id)}
                        onCheckedChange={(checked) =>
                          handleOptionalOptionChange(
                            option.id,
                            checked as boolean
                          )
                        }
                        className="border-[#FFAA01] data-[state=checked]:bg-[#FFAA01] data-[state=checked]:text-[#053468]"
                      />
                      <Label
                        htmlFor={`optional-${option.id}`}
                        className="cursor-pointer text-[#053468] font-medium text-sm sm:text-base"
                      >
                        {option.name}
                      </Label>
                    </div>
                    {option.price > 0 && (
                      <span className="text-xs sm:text-sm text-[#FFAA01] font-semibold">
                        +{option.price} ر.س
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default OptionGroups;
