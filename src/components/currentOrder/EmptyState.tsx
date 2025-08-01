import React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  onNavigate: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onNavigate }) => (
  <Card className="text-center py-8 sm:py-12">
    <CardContent className="px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        لا توجد طلبات حالية
      </h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        ليس لديك أي طلبات قيد التنفيذ حالياً
      </p>
      <Button
        className="bg-gradient-to-r from-[#FFAA01] to-[#053468] text-white hover:from-[#FFAA01]/90 hover:to-[#053468]/90"
        onClick={onNavigate}
      >
        استكشف المطاعم
      </Button>
    </CardContent>
  </Card>
);

export default EmptyState;
