import React, { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { ValidatedCoupon } from "../../lib/couponUtils";

interface CouponCardProps {
  appliedCoupon: ValidatedCoupon | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  applyCoupon: () => Promise<void>;
  removeCoupon: () => void;
  isValidating: boolean;
}

// Applied Coupon Card - matching the offer design
const AppliedCouponCard = ({ coupon, onRemove }) => {
  return (
    <div
      className="relative w-3/5 sm:w-72 h-16 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm bg-[#FBD252]/5 shadow-sm border border-yellow-400"
      dir="rtl"
      style={{ overflow: "visible" }}
    >
      {/* Top semicircle cutout */}
      <div
        className="absolute w-5 h-2.5 bg-gray-50 rounded-b-full z-10 border-b border-l border-r border-yellow-400"
        style={{
          top: "-2.5px",
          right: "48px",
        }}
      />
      {/* Bottom semicircle cutout */}
      <div
        className="absolute w-5 h-2.5 bg-gray-50 rounded-t-full z-10 border-t border-l border-r border-yellow-400"
        style={{
          bottom: "-2.5px",
          right: "48px",
        }}
      />

      {/* Dashed divider */}
      <div className="absolute right-14 top-2 bottom-2 border-r-2 border-dashed border-yellow-400" />

      {/* Content */}
      <div className="flex items-center h-full px-2">
        {/* Right section - Coupon type */}
        <div className="flex-shrink-0 w-12 sm:w-14 text-right">
          <div className="text-yellow-800 font-medium text-sm sm:text-lg leading-tight">
            خصم
            <br />
            {coupon.discount_value}
            {coupon.discount_type === "percentage" ? "%" : ""}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-2 min-w-0">
          <p className="text-yellow-800 font-medium text-xs sm:text-sm truncate">
            {coupon.code}
          </p>
          <p className="text-yellow-700 text-xs">قسيمة مطبقة</p>
        </div>

        {/* Remove button */}
        <div className="flex-shrink-0">
          <button
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Coupon Card - matching the offer design
const AddCouponCard = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative w-3/5 sm:w-72 h-16 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm bg-gray-100 shadow-sm border border-gray-200 hover:border-gray-300"
      dir="rtl"
      style={{ overflow: "visible" }}
    >
      {/* Top semicircle cutout */}
      <div
        className="absolute w-5 h-2.5 bg-gray-50 rounded-b-full z-10 border-b border-l border-r border-gray-200"
        style={{
          top: "-2.5px",
          right: "48px",
        }}
      />
      {/* Bottom semicircle cutout */}
      <div
        className="absolute w-5 h-2.5 bg-gray-50 rounded-t-full z-10 border-t border-l border-r border-gray-200"
        style={{
          bottom: "-2.5px",
          right: "48px",
        }}
      />

      {/* Dashed divider */}
      <div className="absolute right-14 top-2 bottom-2 border-r-2 border-dashed border-gray-300" />

      {/* Content */}
      <div className="flex items-center h-full px-2">
        {/* Right section - Plus icon */}
        <div className="flex-shrink-0 w-12 sm:w-14 text-right flex justify-center">
          <Plus className="w-5 h-5 text-gray-500" />
        </div>

        {/* Main content */}
        <div className="flex-1 px-2 min-w-0">
          <p className="text-gray-800 font-medium text-xs sm:text-sm truncate">
            إضافة قسيمة
          </p>
          <p className="text-gray-600 text-xs">اضغط للإضافة</p>
        </div>
      </div>
    </div>
  );
};

const CouponCard: React.FC<CouponCardProps> = ({
  appliedCoupon,
  couponCode,
  setCouponCode,
  applyCoupon,
  removeCoupon,
  isValidating,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleAddCouponClick = () => {
    setShowInput(true);
    setErrorMessage("");
  };

  const handleApplyCoupon = async () => {
    try {
      setErrorMessage("");
      await applyCoupon();
      setShowInput(false);
    } catch (error: any) {
      // Handle error and show user-friendly message
      const errorCode = error?.response?.data?.error || error?.message;

      // Map error codes to user-friendly messages
      let displayError = "الرجاء إدخال كوبون صالح";

      if (errorCode === "101" || errorCode === 101) {
        displayError = "الرجاء إدخال كوبون صالح";
      } else if (errorCode === "102" || errorCode === 102) {
        displayError = "هذا الكوبون منتهي الصلاحية";
      } else if (errorCode === "103" || errorCode === 103) {
        displayError = "لقد استخدمت هذا الكوبون من قبل";
      } else if (errorCode === "104" || errorCode === 104) {
        displayError = "الحد الأدنى للطلب غير مستوفى";
      } else if (
        typeof errorCode === "string" &&
        errorCode.includes("invalid")
      ) {
        displayError = "الرجاء إدخال كوبون صالح";
      }

      setErrorMessage(displayError);
    }
  };

  return (
    <div className="mb-6" dir="rtl">
      {/* Section Title */}
      <div className="flex items-center justify-between px-2 sm:px-4 mb-4">
        <span className="text-md sm:text-base font-bold ">القسائم</span>
      </div>

      {/* Coupons List - Horizontal Layout */}
      <div className="px-2 sm:px-4">
        <div
          className="flex gap-2 sm:gap-0 overflow-x-auto pb-2"
          style={{ paddingTop: "8px", paddingBottom: "8px" }}
        >
          <div className="flex-shrink-0 w-64 sm:w-72">
            {appliedCoupon ? (
              <AppliedCouponCard
                coupon={appliedCoupon}
                onRemove={removeCoupon}
              />
            ) : (
              <AddCouponCard onClick={handleAddCouponClick} />
            )}
          </div>
        </div>
      </div>

      {/* Coupon Input - Show when adding new coupon */}
      {showInput && !appliedCoupon && (
        <div className="px-2 sm:px-4 mt-4">
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setErrorMessage(""); // Clear error when typing
              }}
              placeholder="أدخل رمز الخصم"
              className={`flex-1 p-2 border rounded-lg text-sm focus:outline-none ${
                errorMessage
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-yellow-400"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isValidating && couponCode.trim()) {
                  handleApplyCoupon();
                }
              }}
              disabled={isValidating}
              autoFocus
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-medium hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? "جاري التحقق..." : "تطبيق"}
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setErrorMessage("");
                setCouponCode("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              إلغاء
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponCard;
