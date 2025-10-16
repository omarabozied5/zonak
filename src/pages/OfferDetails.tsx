import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { LoadingState, ErrorState } from "../components/ErrorLoadingStates";
import OfferHeader from "../components/Offer/OfferHeader";
import OfferInfo from "../components/Offer/OfferInfo";
import OfferQRModal from "../components/Offer/OfferQRModal";
import { offersAPI } from "../services/offersService";

// Extended type to match the actual API response
interface OfferDetailsAPI {
  id: number;
  title: string;
  description: string;
  discount: number | null;
  offer_terms: string | null;
  end_date: string;
  offer_image: string;
  places: number[];
  offer_type: number;
  product_name?: string | null;
  old_price?: number | null;
  new_price?: number | null;
  offer_details?: string | null;
}

const OfferDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<OfferDetailsAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const loadOfferDetails = useCallback(async () => {
    if (!id) {
      setError("معرف العرض غير صحيح");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await offersAPI.getOfferDetails(id);
      setOffer(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل في تحميل تفاصيل العرض"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleClaimOffer = async () => {
    if (!id) return;

    try {
      setClaiming(true);
      const response = await offersAPI.useOffer(id);
      setQrCode(response.code);
      setShowQRModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل في إنشاء رمز QR");
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    loadOfferDetails();
  }, [loadOfferDetails]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    loadOfferDetails();
  }, [loadOfferDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC]/10 via-white to-[#FFD700]/5">
        <Navigation />
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC]/10 via-white to-[#FFD700]/5">
        <Navigation />
        <ErrorState error={error} onRetry={handleRetry} onBack={handleBack} />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC]/10 via-white to-[#FFD700]/5">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">لم يتم العثور على العرض</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC]/10 via-white to-[#FFD700]/5">
      <Navigation />

      <div className="max-w-4xl mx-auto">
        {/* Header with Image */}
        <OfferHeader
          image={offer.offer_image}
          discount={offer.discount}
          offerType={offer.offer_type}
          productName={offer.product_name}
          oldPrice={offer.old_price}
          newPrice={offer.new_price}
          onBack={handleBack}
        />

        {/* Offer Information */}
        <OfferInfo
          title={offer.title}
          description={offer.description}
          endDate={offer.end_date}
          terms={offer.offer_terms}
          activeBranches={offer.places}
        />

        {/* Claim Button - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-2xl border-t border-gray-200 z-40">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleClaimOffer}
              disabled={claiming}
              className={`w-full bg-[#FFAA01] text-white font-bold py-4 rounded-xl text-lg transition-all transform ${
                claiming
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 hover:bg-[#FF9901] shadow-lg"
              }`}
            >
              {claiming ? "جاري الإنشاء..." : "احصل"}
            </button>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrCode && (
        <OfferQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrCode={qrCode}
          offerTitle={offer.title}
        />
      )}
    </div>
  );
};

export default OfferDetails;
