import { useState, useCallback } from "react";
import { toast } from "sonner";

export const usePaymentMethod = () => {
  const [paymentType, setPaymentType] = useState<number>(1); // Default to cash on delivery

  return {
    paymentType,
    setPaymentType,
  };
};

export const useFormValidation = () => {
  const validateForm = useCallback(
    (user: any, items: any[], total: number, paymentType: number): boolean => {
      const fullName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : "";

      // Check if user has a valid name (first_name is required, last_name is optional)
      if (!user?.first_name || !user?.phone) {
        toast.error("معلومات المستخدم غير مكتملة");
        console.error("User validation failed:", {
          user: user,
          first_name: user?.first_name,
          last_name: user?.last_name,
          phone: user?.phone,
          fullName: fullName,
        });
        return false;
      }

      if (items.length === 0) {
        toast.error("السلة فارغة");
        return false;
      }

      if (total <= 0) {
        toast.error("إجمالي الطلب غير صحيح");
        return false;
      }

      // Validate payment type
      if (paymentType !== 0 && paymentType !== 1) {
        toast.error("يرجى اختيار طريقة الدفع");
        return false;
      }

      // console.log("✅ Form validation passed:", {
      //   userName: fullName,
      //   phone: user.phone,
      //   itemsCount: items.length,
      //   total: total,
      //   paymentType: paymentType === 1 ? "Cash on Delivery" : "Pay Online",
      // });

      return true;
    },
    []
  );

  return { validateForm };
};
