import React from "react";
import { User } from "lucide-react";
import { Order } from "../../hooks/useOrderStore";
import { User as UserType } from "../../types/types";
import { useAuthStore } from "../../stores/useAuthStore";

interface CustomerInfoProps {
  user?: UserType | null;
  order: Order;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ order }) => {
  // Get user from auth store since it's not being passed properly
  const { user } = useAuthStore();

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-[#053468]">
      <h4 className="font-semibold text-[#053468] mb-3 flex items-center gap-2">
        <User className="h-4 w-4 flex-shrink-0" />
        <span>معلومات العميل</span>
      </h4>
      <div className="space-y-2 text-sm">
        {/* Display customer name */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <span className="text-gray-600">الاسم:</span>
          <span className="font-medium">
            {user
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
              : "غير محدد"}
          </span>
        </div>

        {/* Display phone number */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <span className="text-gray-600">الهاتف:</span>
          <span className="font-medium">{user?.phone || "غير محدد"}</span>
        </div>

        {/* Display address if available */}
        {order.address && (
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-600">العنوان:</span>
            <span className="font-medium break-words">{order.address}</span>
          </div>
        )}

        {/* Display notes if available */}
        {order.note && (
          <div className="mt-2 pt-2 border-t">
            <span className="text-gray-600 text-xs">ملاحظات:</span>
            <p className="font-medium text-sm mt-1 break-words">{order.note}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInfo;
