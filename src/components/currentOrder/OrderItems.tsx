import React from "react";
import { Order } from "../../hooks/useOrderStore";

interface OrderItemsProps {
  order: Order;
}

const OrderItems: React.FC<OrderItemsProps> = ({ order }) => {
  return (
    <div>
      <h4 className="font-semibold text-[#053468] mb-4">الأصناف المطلوبة</h4>
      <div className="space-y-3">
        {order.orderitems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 rounded-lg p-3 gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="bg-[#FFAA01]/20 text-[#FFAA01] rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {item.quantity}
              </span>
              <div className="min-w-0">
                <span className="text-gray-900 font-medium block">
                  {item.item_name}
                </span>
                <p className="text-sm text-gray-600">
                  {order.place.merchant_name}
                </p>
                {item.options && item.options.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    مع إضافات ({item.options.length})
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItems;
