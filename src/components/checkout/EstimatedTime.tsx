import React from "react";
import { Clock } from "lucide-react";

interface EstimatedTimeProps {
  estimatedTime?: string;
}

const EstimatedTime: React.FC<EstimatedTimeProps> = React.memo(
  ({ estimatedTime = "15-20 دقيقة" }) => (
    <div className="bg-[#FFAA01]/10 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-[#FFAA01]" />
        <p className="text-sm font-medium">وقت التحضير المتوقع</p>
      </div>
      <p className="text-[#FFAA01] font-bold text-sm sm:text-base">
        {estimatedTime}
      </p>
    </div>
  )
);

EstimatedTime.displayName = "EstimatedTime";

export default EstimatedTime;
