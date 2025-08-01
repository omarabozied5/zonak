import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <Alert className="mb-6 border-red-200 bg-red-50">
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertDescription className="text-red-800">
      {error}
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 text-red-600 hover:text-red-800"
        onClick={onRetry}
      >
        إعادة المحاولة
      </Button>
    </AlertDescription>
  </Alert>
);

export default ErrorState;
