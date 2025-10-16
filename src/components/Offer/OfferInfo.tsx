import React from "react";
import { Clock } from "lucide-react";

interface OfferInfoProps {
  title: string;
  description: string;
  endDate: string;
  terms: string | null;
  activeBranches: number[] | null;
}

const OfferInfo: React.FC<OfferInfoProps> = ({
  title,
  description,
  endDate,
  terms,
  activeBranches,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white     relative z-10 pt-4 px-6 pb-32" dir="rtl">
      {/* Title */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">{title}</h1>

      {/* Rating and Distance */}
      {/* <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐⭐</span>
          <span className="text-gray-500 text-sm">0</span>
        </div>
        <span className="text-gray-500 text-sm">2</span>
        <div className="bg-gray-100 px-3 py-1 rounded-lg">
          <span className="text-gray-700 text-sm">حليم كافيه 4.2 كم</span>
        </div>
      </div> */}

      {/* Open Status */}
      {/* <div className="flex items-center gap-2 mb-6">
        <Clock size={18} className="text-green-500" />
        <span className="text-green-600 font-bold">مفتوح</span>
        <span className="text-gray-500">. يُغلق 24 ساعه</span>
      </div> */}

      {/* Terms & Conditions Section */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-xl mb-4">
          الشروط والأحكام
        </h3>

        {/* Valid Until */}
        <div className="mb-4">
          <p className="text-gray-600 text-base">
            • العرض ساري حتى {formatDate(endDate)}
          </p>
        </div>

        {/* Terms List */}
        {terms && (
          <div className="space-y-2">
            {terms
              .split("\n")
              .filter((t) => t.trim())
              .map((term, index) => (
                <p key={index} className="text-gray-600 text-base">
                  • {term}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferInfo;
