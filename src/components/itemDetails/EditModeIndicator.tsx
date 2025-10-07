import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EditModeIndicatorProps {
  isEditMode: boolean;
}

const EditModeIndicator: React.FC<EditModeIndicatorProps> = ({
  isEditMode,
}) => {
  if (!isEditMode) {
    return null;
  }

  return (
    <div className="mb-3 sm:mb-4 md:mb-6">
      <Card className="border-[#FFAA01]/30 bg-[#FFAA01]/5">
        <CardContent className="p-2.5 sm:p-3 md:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FFAA01] rounded-full"></div>
            <span className="text-[#053468] font-medium text-xs sm:text-sm md:text-base">
              وضع التعديل - يمكنك تغيير خيارات العنصر
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditModeIndicator;
