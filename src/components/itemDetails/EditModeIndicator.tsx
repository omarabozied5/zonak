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
    <div className="mb-4 sm:mb-6">
      <Card className="border-[#FFAA01]/30 bg-[#FFAA01]/5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#FFAA01] rounded-full"></div>
            <span className="text-[#053468] font-medium text-sm sm:text-base">
              وضع التعديل - يمكنك تغيير خيارات العنصر
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditModeIndicator;
