// components/ItemDetails/OptionGroupsList.tsx
import React from "react";
import { OptionGroup } from "./OptionGroups";

interface Option {
  id: number;
  name: string;
  price: number;
}

interface OptionGroupData {
  id: number;
  title: string;
  type: "pick" | "optional";
  options: Option[];
}

interface OptionGroupsListProps {
  optionGroups: OptionGroupData[];
  selectedOptions: Record<number, number>;
  selectedOptional: number[];
  onRequiredChange: (groupId: number, optionId: number) => void;
  onOptionalChange: (optionId: number, checked: boolean) => void;
}

export const OptionGroupsList: React.FC<OptionGroupsListProps> = ({
  optionGroups,
  selectedOptions,
  selectedOptional,
  onRequiredChange,
  onOptionalChange,
}) => {
  if (!optionGroups || optionGroups.length === 0) {
    return null;
  }

  return (
    <>
      {optionGroups.map((group) => (
        <OptionGroup
          key={group.id}
          group={group}
          selectedValue={selectedOptions[group.id]}
          selectedOptional={selectedOptional}
          onRequiredChange={onRequiredChange}
          onOptionalChange={onOptionalChange}
        />
      ))}
    </>
  );
};
