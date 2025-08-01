import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Order } from "../../hooks/useOrderStore";
import OrderHeader from "./OrderHeader";
import OrderStatus from "./OrderStatus";
import CustomerInfo from "./CustomerInfo";
import OrderSummary from "./OrderSummary";
import OrderItems from "./OrderItems";
import OrderPricing from "./OrderPricing";
import OrderActions from "./OrderActions";

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-[#FFAA01]/20 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <OrderHeader order={order} />

        <Button
          variant="ghost"
          className="w-full mt-4 flex items-center justify-center gap-2 text-[#053468] hover:bg-[#053468]/10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>تفاصيل الطلب</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        <OrderStatus order={order} />

        {isExpanded && (
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <CustomerInfo order={order} />
              <OrderSummary order={order} />
            </div>

            <OrderItems order={order} />
            <OrderPricing order={order} />
          </div>
        )}

        <OrderActions order={order} />
      </CardContent>
    </Card>
  );
};

export default OrderCard;
