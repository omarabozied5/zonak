import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const LoadingState: React.FC = () => (
  <Card className="text-center py-8 sm:py-12">
    <CardContent className="px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-white animate-spin" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        جاري تحميل الطلبات...
      </h2>
      <p className="text-gray-600 text-sm sm:text-base">يرجى الانتظار قليلاً</p>
    </CardContent>
  </Card>
);

export default LoadingState;
