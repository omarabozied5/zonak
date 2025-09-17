import React from "react";

// Order interface (simplified for this component)
interface Order {
  cart_price: number;
  delivery_cost: number;
  car_delivery_cost: number;
  total_vat: number | null;
  discount: number;
  zonak_discount: number;
  discount_from_coupons: number;
  total_price: number; // This is what the backend calculated
}

interface OrderPricingProps {
  order: Order;
}

const OrderPricing: React.FC<OrderPricingProps> = ({ order }) => {
  // Calculate the correct total based on all components
  const calculateCorrectTotal = (): number => {
    let total = order.cart_price;

    // Add costs
    total += order.delivery_cost || 0;
    total += order.car_delivery_cost || 0;
    total += order.total_vat || 0;

    // Subtract discounts
    total -= order.discount || 0;
    total -= order.zonak_discount || 0;
    total -= order.discount_from_coupons || 0;

    return Math.max(0, total); // Ensure it's never negative
  };

  const calculatedTotal = calculateCorrectTotal();

  // Use the backend total_price but show our calculation in console for debugging
  // console.log("Order Pricing Debug:", {
  //   backendTotal: order.total_price,
  //   calculatedTotal,
  //   cartPrice: order.cart_price,
  //   discounts: {
  //     regular: order.discount,
  //     zonak: order.zonak_discount,
  //     coupons: order.discount_from_coupons,
  //     total:
  //       (order.discount || 0) +
  //       (order.zonak_discount || 0) +
  //       (order.discount_from_coupons || 0),
  //   },
  // });

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
            {calculatedTotal.toFixed(2)} ر.س
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderPricing;
