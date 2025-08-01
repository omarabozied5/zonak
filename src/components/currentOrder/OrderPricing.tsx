import React from "react";
import { Order } from "../../hooks/useOrderStore";

interface OrderPricingProps {
  order: Order;
}

const OrderPricing: React.FC<OrderPricingProps> = ({ order }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-[#053468]/20">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#053468]">المجموع الفرعي</span>
          <span className="font-medium">{order.cart_price.toFixed(2)} ر.س</span>
        </div>
        {order.delivery_cost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#053468]">رسوم التوصيل</span>
            <span className="font-medium">
              {order.delivery_cost.toFixed(2)} ر.س
            </span>
          </div>
        )}
        {order.car_delivery_cost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#053468]">رسوم توصيل السيارة</span>
            <span className="font-medium">
              {order.car_delivery_cost.toFixed(2)} ر.س
            </span>
          </div>
        )}
        {order.total_vat && order.total_vat > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#053468]">ضريبة القيمة المضافة</span>
            <span className="font-medium">
              {order.total_vat.toFixed(2)} ر.س
            </span>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>الخصم</span>
            <span className="font-medium">
              -{order.discount.toFixed(2)} ر.س
            </span>
          </div>
        )}
        {order.zonak_discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>خصم زونك</span>
            <span className="font-medium">
              -{order.zonak_discount.toFixed(2)} ر.س
            </span>
          </div>
        )}
        {order.discount_from_coupons > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>خصم الكوبونات</span>
            <span className="font-medium">
              -{order.discount_from_coupons.toFixed(2)} ر.س
            </span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t border-[#053468]/20">
          <span className="text-[#053468]">المجموع الكلي</span>
          <span className="text-[#FFAA01]">
            {order.total_price.toFixed(2)} ر.س
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderPricing;
