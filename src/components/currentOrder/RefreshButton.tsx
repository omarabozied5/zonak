import React from "react";
import { Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshButtonProps {
  onRefresh: () => void;
  loading: boolean;
  showIfEmpty?: boolean;
  hasOrders: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  loading,
  hasOrders,
}) => {
  if (!hasOrders || loading) return null;

  return (
    <div className="flex justify-center mt-6">
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={loading}
        className="border-[#FFAA01] text-[#FFAA01] hover:bg-[#FFAA01] hover:text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            جاري التحديث...
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 mr-2" />
            تحديث الطلبات
          </>
        )}
      </Button>
    </div>
  );
};

export default RefreshButton;
