import React from "react";
import Navigation from "@/components/Navigation";

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#FFAA01] mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
