import React from "react";
import { Info, Plus, ChevronDown } from "lucide-react";

const CheckoutMobileLayout: React.FC = () => {
  return (
    <div
      className="relative w-full max-w-[393px] mx-auto bg-white"
      style={{ height: "615px" }}
    >
      {/* Background rectangles */}
      <div
        className="absolute bg-white"
        style={{
          width: "393px",
          height: "361px",
          left: "0px",
          top: "-103px",
        }}
      />

      <div
        className="absolute bg-white"
        style={{
          width: "393px",
          height: "353px",
          left: "0px",
          top: "262px",
        }}
      />

      {/* العروض Title */}
      <div
        className="absolute text-black text-center font-bold text-sm"
        style={{
          left: "329px",
          top: "14px",
        }}
      >
        العروض
      </div>

      {/* القسائم Title */}
      <div
        className="absolute text-black text-center font-bold text-sm"
        style={{
          left: "324px",
          top: "133px",
        }}
      >
        القسائم
      </div>

      {/* Active Offer Card */}
      <div
        className="absolute rounded-lg overflow-hidden"
        style={{
          width: "218px",
          height: "60px",
          left: "157px",
          top: "55px",
        }}
      >
        {/* Card background with border */}
        <div
          className="absolute rounded-lg border-2"
          style={{
            background: "rgba(251, 210, 82, 0.05)",
            borderColor: "#fbd252",
            width: "218px",
            height: "60px",
            left: "0px",
            top: "0px",
          }}
        />

        {/* إشتري و احصل text */}
        <div
          className="absolute text-black text-center text-xs leading-[10px]"
          style={{
            left: "187px",
            top: "13px",
          }}
        >
          إشتري
          <br />
          و
          <br />
          احصل
        </div>

        {/* Main offer text */}
        <div
          className="absolute text-black text-right font-bold text-xs leading-[17px]"
          style={{
            left: "45px",
            top: "13px",
          }}
        >
          إشتري قهوة اليوم واحصل على
          <br />
          تشيز كيك بنصف السعر
        </div>

        {/* Info icon */}
        <Info
          className="absolute text-[#fbd252]"
          style={{
            width: "18px",
            height: "18px",
            left: "5px",
            top: "5px",
          }}
        />

        {/* Top circle */}
        <div
          className="absolute bg-white rounded-full border-2"
          style={{
            borderColor: "#fbd252",
            width: "17.09px",
            height: "17.09px",
            left: "174px",
            top: "-11px",
          }}
        />

        {/* Dashed line */}
        <div
          className="absolute border-dashed"
          style={{
            marginTop: "-1.5px",
            borderColor: "#fbd252",
            borderWidth: "1.5px 0 0 0",
            width: "44.59px",
            height: "0px",
            left: "182.89px",
            top: "53.59px",
            transformOrigin: "0 0",
            transform: "rotate(-89.859deg) scale(1, 1)",
          }}
        />

        {/* Bottom circle */}
        <div
          className="absolute bg-white rounded-full border-2"
          style={{
            borderColor: "#fbd252",
            width: "17.09px",
            height: "17.09px",
            left: "174px",
            top: "51.91px",
          }}
        />
      </div>

      {/* Inactive Offer Card */}
      <div
        className="absolute rounded-lg overflow-hidden"
        style={{
          background: "rgba(241, 241, 241, 0.6)",
          width: "218px",
          height: "60px",
          left: "-67px",
          top: "55px",
        }}
      >
        {/* إشتري و احصل text */}
        <div
          className="absolute text-black text-center text-xs leading-[10px]"
          style={{
            left: "187px",
            top: "13px",
          }}
        >
          إشتري
          <br />
          و
          <br />
          احصل
        </div>

        {/* Main offer text */}
        <div
          className="absolute text-black text-right font-bold text-xs leading-[17px]"
          style={{
            left: "45px",
            top: "13px",
          }}
        >
          إشتري قهوة اليوم واحصل على
          <br />
          تشيز كيك بنصف السعر
        </div>

        {/* Info icon */}
        <Info
          className="absolute text-gray-400"
          style={{
            width: "18px",
            height: "18px",
            left: "3px",
            top: "4px",
          }}
        />

        {/* Top circle */}
        <div
          className="absolute bg-white rounded-full"
          style={{
            width: "17.09px",
            height: "17.09px",
            left: "174px",
            top: "-11px",
          }}
        />

        {/* Dashed line */}
        <div
          className="absolute bg-white border-dashed"
          style={{
            marginTop: "-1.5px",
            borderColor: "#757575",
            borderWidth: "1.5px 0 0 0",
            width: "45.81px",
            height: "0px",
            left: "182.89px",
            top: "52.59px",
            transformOrigin: "0 0",
            transform: "rotate(-90deg) scale(1, 1)",
          }}
        />

        {/* Bottom circle */}
        <div
          className="absolute bg-white rounded-full"
          style={{
            width: "17.09px",
            height: "17.09px",
            left: "174px",
            top: "51.91px",
          }}
        />
      </div>

      {/* Add Products Button */}
      <div
        className="absolute bg-[#eeeeee] rounded-full flex items-center justify-center gap-2"
        style={{
          padding: "9px 14px",
          left: "259px",
          top: "376px",
        }}
      >
        <span className="text-black text-xs font-bold leading-5">
          إضافة منتجات
        </span>
        <Plus className="w-2 h-2 flex-shrink-0" />
      </div>

      {/* Order Summary Title */}
      <div
        className="absolute text-black text-center font-bold text-sm"
        style={{
          left: "298px",
          top: "280px",
        }}
      >
        ملخص الطلب
      </div>

      {/* Product Name */}
      <div
        className="absolute text-black text-center text-xs"
        style={{
          left: "267px",
          top: "323px",
        }}
      >
        كاس مختص
      </div>

      {/* Product Image */}
      <div
        className="absolute rounded-full border border-white bg-gray-300 overflow-hidden"
        style={{
          width: "40px",
          height: "40px",
          left: "333px",
          top: "316px",
        }}
      >
        <div className="w-full h-full bg-gray-400" />
      </div>

      {/* Product Count */}
      <div
        className="absolute text-[#575757] text-center text-xs"
        style={{
          left: "291px",
          top: "343px",
        }}
      >
        3 منتجات
      </div>

      {/* Dropdown arrow */}
      <ChevronDown
        className="absolute text-gray-600"
        style={{
          width: "8px",
          height: "13px",
          right: "92.88%",
          left: "5.09%",
          bottom: "-160.18%",
          top: "249.88%",
          transform: "translate(0px, -8px)",
        }}
      />
    </div>
  );
};

export default CheckoutMobileLayout;
