// components/ItemDetails/utils.ts
import { OptionGroup } from "./types";

export const calculateTotalPrice = (
  basePrice: number,
  selectedOptions: Record<number, number>,
  selectedOptional: number[],
  optionGroups: OptionGroup[] = [],
  quantity: number
): number => {
  let total = basePrice;

  // Add required option prices
  Object.values(selectedOptions).forEach((optionId) => {
    const option = optionGroups
      .flatMap((group) => group.options)
      .find((opt) => opt.id === optionId);
    if (option) total += option.price;
  });

  // Add optional option prices
  selectedOptional.forEach((optionId) => {
    const option = optionGroups
      .flatMap((group) => group.options)
      .find((opt) => opt.id === optionId);
    if (option) total += option.price;
  });

  return total * quantity;
};

export const canAddToCart = (
  selectedOptions: Record<number, number>,
  optionGroups: OptionGroup[] = []
): boolean => {
  const requiredGroups = optionGroups.filter((group) => group.type === "pick");
  return requiredGroups.every((group) => selectedOptions[group.id]);
};

export const getOptionNames = (
  selectedOptions: Record<number, number>,
  selectedOptional: number[],
  optionGroups: OptionGroup[] = []
) => {
  const requiredOptionNames: Record<string, string> = {};
  const optionalOptionNames: string[] = [];

  // Get required option names
  Object.entries(selectedOptions).forEach(([groupId, optionId]) => {
    const group = optionGroups.find((g) => g.id === parseInt(groupId));
    const option = group?.options.find((opt) => opt.id === optionId);
    if (group && option) {
      requiredOptionNames[group.title] = option.name;
    }
  });

  // Get optional option names
  selectedOptional.forEach((optionId) => {
    const option = optionGroups
      .flatMap((group) => group.options)
      .find((opt) => opt.id === optionId);
    if (option) {
      optionalOptionNames.push(option.name);
    }
  });

  return { requiredOptionNames, optionalOptionNames };
};
