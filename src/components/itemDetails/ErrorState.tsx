import React from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string | null;
  onGoBack: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onGoBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">عذراً!</h2>
            <p className="text-red-500">{error || "هذا العنصر غير موجود"}</p>
            <Button
              onClick={onGoBack}
              className="bg-[#FFAA01] hover:bg-yellow-500 text-[#053468] font-semibold"
            >
              العودة
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorState;
