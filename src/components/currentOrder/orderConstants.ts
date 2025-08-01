import {
  Clock,
  CheckCircle,
  Coffee,
  Truck,
  User,
  AlertCircle,
} from "lucide-react";

export const STATUS_CONFIG = {
  pending: {
    label: "في الانتظار",
    icon: Clock,
    color: "bg-orange-100 text-orange-800 border border-orange-200",
    description: "طلبك في انتظار الموافقة",
  },
  confirmed: {
    label: "مؤكد",
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-800 border border-blue-200",
    description: "تم تأكيد طلبك",
  },
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
  on_the_way: {
    label: "في الطريق إليك",
    icon: Truck,
    color: "text-white border border-[#053468]",
    bgColor: "#053468",
    description: "طلبك في الطريق إليك",
  },
  waiting_customer: {
    label: "في انتظار العميل",
    icon: User,
    color: "bg-purple-100 text-purple-800 border border-purple-200",
    description: "المندوب في انتظارك",
  },
  delivered: {
    label: "تم التوصيل",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border border-green-200",
    description: "تم توصيل طلبك بنجاح",
  },
  rejected: {
    label: "مرفوض",
    icon: AlertCircle,
    color: "bg-red-100 text-red-800 border border-red-200",
    description: "تم رفض طلبك",
  },
  timeout: {
    label: "انتهت المهلة",
    icon: Clock,
    color: "bg-gray-100 text-gray-800 border border-gray-200",
    description: "انتهت مهلة معالجة الطلب",
  },
} as const;

export const PAYMENT_STATUS_MAP: Record<string, string> = {
  paid_with_wallet: "مدفوع بالمحفظة",
  paid_with_card: "مدفوع بالبطاقة",
  cash_on_delivery: "الدفع عند الاستلام",
  paid_cash: "مدفوع نقداً",
};
