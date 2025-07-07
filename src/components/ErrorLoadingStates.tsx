import React from "react";
import { Loader2, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

interface LoadingStateProps {}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onBack,
}) => (
  <div className="flex items-center justify-center min-h-[60vh] px-4">
    <Card className="max-w-md w-full shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            خطأ في تحميل المطعم
          </h3>
          <p className="text-sm sm:text-base text-gray-600">{error}</p>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <Button
            onClick={onRetry}
            className="w-full bg-[#FFAA01] hover:bg-[#FF9500] text-white"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            إعادة المحاولة
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full border-[#FFAA01] text-[#FFAA01] hover:bg-[#FFAA01] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const LoadingState: React.FC<LoadingStateProps> = () => (
  <div className="flex items-center justify-center min-h-[60vh] px-4">
    <div className="text-center space-y-4 sm:space-y-6">
      <div className="relative">
        <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-[#FFAA01] mx-auto" />
        <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-[#FFD700]/20 mx-auto animate-pulse"></div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <p className="text-lg sm:text-xl font-semibold text-gray-800">
          جاري تحميل المطعم...
        </p>
        <p className="text-sm sm:text-base text-gray-500">
          يرجى الانتظار قليلاً
        </p>
        <div className="max-w-md mx-auto space-y-2 sm:space-y-3 mt-6 sm:mt-8">
          <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
);
