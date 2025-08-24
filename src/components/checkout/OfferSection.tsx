import React from "react";
import { Info } from "lucide-react";

const OffersSection: React.FC = () => {
  return (
    <div className="mb-6">
      {/* Section Title */}
      <div className="flex justify-end mb-4">
        <h2 className="text-sm font-bold text-foreground">العروض</h2>
      </div>

      {/* Offers Carousel */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {/* Active Offer Card */}
        <div className="min-w-[220px] relative">
          <div className="bg-checkout-primary/5 border-2 border-checkout-primary rounded-lg p-4 relative overflow-hidden">
            {/* Ticket perforations */}
            <div className="absolute top-[-8px] right-[50px] w-4 h-4 bg-checkout-primary/20 border-2 border-checkout-primary rounded-full"></div>
            <div className="absolute bottom-[-8px] right-[50px] w-4 h-4 bg-checkout-primary/20 border-2 border-checkout-primary rounded-full"></div>
            <div className="absolute top-[20px] bottom-[20px] right-[58px] w-0 border-r-2 border-dashed border-checkout-primary"></div>

            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-checkout-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground leading-tight">
                  إشتري قهوة اليوم واحصل على
                  <br />
                  تشيز كيك بنصف السعر
                </div>
              </div>
              <div className="text-center text-xs text-foreground leading-tight">
                إشتري
                <br />
                و
                <br />
                احصل
              </div>
            </div>
          </div>
        </div>

        {/* Inactive Offer Card */}
        <div className="min-w-[220px] relative">
          <div className="bg-checkout-muted/60 rounded-lg p-4 relative overflow-hidden">
            {/* Ticket perforations - grayed out */}
            <div className="absolute top-[-8px] right-[50px] w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute bottom-[-8px] right-[50px] w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute top-[20px] bottom-[20px] right-[58px] w-0 border-r-2 border-dashed border-gray-300"></div>

            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground leading-tight">
                  إشتري قهوة اليوم واحصل على
                  <br />
                  تشيز كيك بنصف السعر
                </div>
              </div>
              <div className="text-center text-xs text-foreground leading-tight">
                إشتري
                <br />
                و
                <br />
                احصل
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersSection;
