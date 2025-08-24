import React from "react";
import { ShoppingCart, ArrowLeft } from "lucide-react";

interface CartEmptyStateProps {
  onExploreRestaurants: () => void;
}

const CartEmptyState: React.FC<CartEmptyStateProps> = ({
  onExploreRestaurants,
}) => {
  return (
    <div className="px-4 py-12 text-center">
      <div className="max-w-sm mx-auto">
        {/* Empty Cart Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 text-gray-400" />
        </div>

        {/* Empty State Message */}
        <h2 className="text-xl font-bold text-gray-900 mb-3">السلة فارغة</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          لم تقم بإضافة أي عناصر إلى السلة بعد.
          <br />
          تصفح المطاعم واكتشف أشهى الأطباق!
        </p>

        {/* CTA Button */}
        <button
          onClick={onExploreRestaurants}
          className="w-full bg-[#fbd252] hover:bg-[#f9c52b] text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
        >
          <span>تصفح المطاعم</span>
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Additional Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>💡 نصيحة: يمكنك البحث عن مطعمك المفضل أو تصفح الفئات المختلفة</p>
        </div>
      </div>
    </div>
  );
};

export default CartEmptyState;
