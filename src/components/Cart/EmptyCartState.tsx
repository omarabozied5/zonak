import React from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyCartStateProps {
  onExploreRestaurants: () => void;
}

const EmptyCartState: React.FC<EmptyCartStateProps> = ({
  onExploreRestaurants,
}) => {
  return (
    <Card className="text-center py-8 sm:py-12 border-[#FFAA01]/20">
      <CardContent>
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#053468] mb-2">
          السلة فارغة
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          لم تقم بإضافة أي أصناف بعد، ابدأ بتصفح المطاعم المتاحة
        </p>
        <Button
          className="bg-gradient-to-r from-[#FFAA01] to-[#FFD700] hover:from-[#FF9900] hover:to-[#FFAA01] text-[#053468] font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={onExploreRestaurants}
          aria-label="استكشاف المطاعم المتاحة"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          استكشف المطاعم
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyCartState;
