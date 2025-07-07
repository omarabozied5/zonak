import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Truck,
  CheckCircle,
  Coffee,
  ChevronDown,
  ChevronUp,
  User,
  CreditCard,
  Package,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrderStore, Order } from "../hooks/useOrderStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  preparing: {
    label: "قيد التحضير",
    icon: Coffee,
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    description: "يتم تحضير طلبك الآن",
  },
  ready: {
    label: "جاهز للاستلام",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border border-green-200",
    description: "طلبك جاهز للاستلام",
  },
  out_for_delivery: {
    label: "في الطريق إليك",
    icon: Truck,
    color: "text-white border border-[#053468]",
    bgColor: "#053468",
    description: "طلبك في الطريق إليك",
  },
} as const;

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = STATUS_CONFIG[order.status] || {
    label: order.status,
    icon: Clock,
    color: "bg-gray-100 text-gray-800 border border-gray-200",
    description: "",
  };
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="border-[#FFAA01]/20 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center gap-2 mb-3">
              <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFAA01] flex-shrink-0" />
              <span className="truncate">طلب رقم: {order.id}</span>
            </CardTitle>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  {formatDate(order.createdAt)}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{order.orderType === "pickup" ? "استلام" : "توصيل"}</span>
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span>{totalItems} صنف</span>
              </span>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
            <Badge
              className={statusInfo.color}
              style={
                statusInfo.bgColor
                  ? { backgroundColor: statusInfo.bgColor }
                  : {}
              }
            >
              {statusInfo.label}
            </Badge>
            <p className="text-lg sm:text-xl font-bold text-[#FFAA01]">
              {order.total.toFixed(2)} ر.س
            </p>
          </div>
        </div>

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
        {/* Order Status */}
        <div className="bg-[#FFAA01]/10 rounded-lg p-3 sm:p-4 mb-4">
          <p className="text-[#FFAA01] font-medium text-center text-sm sm:text-base">
            {statusInfo.description}
          </p>
          {order.status === "preparing" && order.estimatedTime && (
            <p className="text-xs sm:text-sm text-gray-600 text-center mt-1">
              الوقت المتوقع للاستلام: {order.estimatedTime}
            </p>
          )}
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-top-2 duration-300">
            {/* Customer & Order Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-[#053468]">
                <h4 className="font-semibold text-[#053468] mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>معلومات العميل</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-medium">
                      {order.customerInfo.name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="font-medium">
                      {order.customerInfo.phone}
                    </span>
                  </div>
                  {order.customerInfo.address && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-gray-600">العنوان:</span>
                      <span className="font-medium break-words">
                        {order.customerInfo.address}
                      </span>
                    </div>
                  )}
                  {order.customerInfo.notes && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="text-gray-600 text-xs">ملاحظات:</span>
                      <p className="font-medium text-sm mt-1 break-words">
                        {order.customerInfo.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-[#FFAA01]">
                <h4 className="font-semibold text-[#053468] mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 flex-shrink-0 text-[#FFAA01]" />
                  <span>تفاصيل الطلب</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600">نوع الطلب:</span>
                    <span className="font-medium">
                      {order.orderType === "pickup"
                        ? "استلام من المطعم"
                        : "توصيل للمنزل"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600">طريقة الدفع:</span>
                    <span className="font-medium">
                      {order.paymentMethod === "cash"
                        ? "نقداً"
                        : "بطاقة ائتمانية"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600">عدد الأصناف:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-[#053468] mb-4">
                الأصناف المطلوبة
              </h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
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
                          {item.name}
                        </span>
                        <p className="text-sm text-gray-600">
                          {item.restaurantName}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-600 font-medium text-right sm:text-left">
                      {(item.price * item.quantity).toFixed(2)} ر.س
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-[#053468]/20">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#053468]">المجموع الفرعي</span>
                  <span className="font-medium">
                    {order.totalPrice.toFixed(2)} ر.س
                  </span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#053468]">رسوم التوصيل</span>
                    <span className="font-medium">
                      {order.deliveryFee.toFixed(2)} ر.س
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#053468]">ضريبة القيمة المضافة</span>
                  <span className="font-medium">
                    {order.tax.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t border-[#053468]/20">
                  <span className="text-[#053468]">المجموع الكلي</span>
                  <span className="text-[#FFAA01]">
                    {order.total.toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center mt-6">
          {order.status === "preparing" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 text-center w-full">
              <p className="text-yellow-800 font-medium text-sm sm:text-base">
                يرجى الانتظار حتى يصبح طلبك جاهزاً للاستلام
              </p>
            </div>
          )}
          {order.status === "ready" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center w-full">
              <p className="text-green-800 font-medium text-sm sm:text-base">
                {order.orderType === "pickup"
                  ? "طلبك جاهز للاستلام من المطعم"
                  : "طلبك جاهز للتوصيل"}
              </p>
            </div>
          )}
          {order.status === "out_for_delivery" && (
            <div
              className="border rounded-lg p-3 sm:p-4 text-center w-full"
              style={{ backgroundColor: "#053468", borderColor: "#053468" }}
            >
              <p className="text-white font-medium text-sm sm:text-base">
                طلبك في الطريق إليك الآن
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => (
  <Card className="text-center py-8 sm:py-12">
    <CardContent className="px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        لا توجد طلبات حالية
      </h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        ليس لديك أي طلبات قيد التنفيذ حالياً
      </p>
      <Button
        className="bg-gradient-to-r from-[#FFAA01] to-[#053468] text-white hover:from-[#FFAA01]/90 hover:to-[#053468]/90"
        onClick={onNavigate}
      >
        استكشف المطاعم
      </Button>
    </CardContent>
  </Card>
);

const CurrentOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const orderStore = useOrderStore(user?.id || null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // Get active orders from the store
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const orders = orderStore.getActiveOrders();
      setActiveOrders(orders);
    } else {
      setActiveOrders([]);
    }
  }, [isAuthenticated, user?.id, orderStore]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Set up real-time updates for order status (optional)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const interval = setInterval(() => {
      const orders = orderStore.getActiveOrders();
      setActiveOrders(orders);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, orderStore]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFAA01]/10 to-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#053468] mb-2">
            الطلبات الحالية
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            تابع حالة طلباتك الجارية
          </p>
        </div>

        {activeOrders.length === 0 ? (
          <EmptyState onNavigate={() => navigate("/")} />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentOrders;
