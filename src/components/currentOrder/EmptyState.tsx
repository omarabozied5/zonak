import React from "react";
import { Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Empty State Component
interface EmptyStateProps {
  onNavigate: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onNavigate }) => (
  <Card className="text-center py-8 sm:py-12 bg-white rounded-[20px] border-0 shadow-sm">
    <CardContent className="px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-[#111719] mb-2 font-['Bahij_TheSansArabic']">
        لا توجد طلبات حالية
      </h2>
      <p className="text-[#6f7274] mb-6 text-sm sm:text-base font-['Bahij_TheSansArabic']">
        ليس لديك أي طلبات قيد التنفيذ حالياً
      </p>
      <Button
        className="bg-gradient-to-r from-[#FFAA01] to-[#053468] text-white hover:from-[#FFAA01]/90 hover:to-[#053468]/90 font-['Bahij_TheSansArabic']"
        onClick={onNavigate}
      >
        استكشف المطاعم
      </Button>
    </CardContent>
  </Card>
);

// Loading State Component
const LoadingState: React.FC = () => (
  <Card className="text-center py-8 sm:py-12 bg-white rounded-[20px] border-0 shadow-sm">
    <CardContent className="px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-white animate-spin" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-[#111719] mb-2 font-['Bahij_TheSansArabic']">
        جاري تحميل الطلبات...
      </h2>
      <p className="text-[#6f7274] text-sm sm:text-base font-['Bahij_TheSansArabic']">
        يرجى الانتظار قليلاً
      </p>
    </CardContent>
  </Card>
);

// Loading Skeleton for order cards
const OrderCardSkeleton: React.FC = () => (
  <Card className="w-full bg-white rounded-[20px] border-0 shadow-sm overflow-hidden">
    <CardContent className="p-[35px]">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded" />
        </div>

        {/* Items skeleton */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-8" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-200 rounded w-8" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-36" />
            <div className="h-3 bg-gray-200 rounded w-8" />
          </div>
        </div>

        {/* Progress slider skeleton */}
        <div className="flex justify-between items-center mb-4 px-[14px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-7 h-7 bg-gray-200 rounded-full" />
          ))}
        </div>

        {/* Labels skeleton */}
        <div className="flex justify-between mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-2 bg-gray-200 rounded w-12" />
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 mb-4" />

        {/* Bottom row skeleton */}
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export { EmptyState, LoadingState, OrderCardSkeleton };