// Updated App.tsx - Enhanced with comprehensive payment handling
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import RestaurantDetails from "./pages/RestaurantDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ItemDetails from "./pages/ItemDetails";
import CurrentOrders from "./pages/CurrentOrders";
import PaymentStatusHandler from "./components/PaymentStatusHandler";
import { usePaymentStore } from "./stores/usePaymentStore";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";

const queryClient = new QueryClient();

// Payment Status Pages - These handle the backend redirects
const PaymentSuccess = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-green-50"
      dir="rtl"
    >
      <div className="text-center p-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-4">
          تم الدفع بنجاح!
        </h1>
        <p className="text-green-700 mb-6">
          شكرا على إتمام الدفع، سيتم تجهيز طلبكم في أسرع وقت
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-green-600 text-sm">
          جاري التوجيه إلى صفحة الطلبات...
        </p>
      </div>
    </div>
  );
};

const PaymentFailed = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-red-50"
      dir="rtl"
    >
      <div className="text-center p-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-800 mb-4">
          فشلت عملية الدفع
        </h1>
        <p className="text-red-700 mb-6">
          لم تتم عملية الدفع بنجاح، يرجى المحاولة مرة أخرى
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-red-600 text-sm">
          جاري إعادة التوجيه لصفحة الدفع...
        </p>
      </div>
    </div>
  );
};

// Global Payment Handler Component
const GlobalPaymentHandler = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const cartStore = useCartStore(user?.id);
  const {
    paymentStatus,
    checkoutData,
    isPaymentInProgress,
    clearPaymentState,
  } = usePaymentStore();

  // Listen for postMessage from payment pages
  useEffect(() => {
    const handlePaymentMessage = (event: MessageEvent) => {
      // Validate origin if needed
      // if (event.origin !== 'https://dev-backend.zonak.net') return;

      if (event.data?.type === "payment_status") {
        const { status, paymentId, orderId } = event.data;

        console.log("Received payment status message:", {
          status,
          paymentId,
          orderId,
        });

        if (status === "success") {
          // Clear cart and redirect to orders
          cartStore.clearCart();
          clearPaymentState();
          window.location.href = "/current-orders?payment=success";
        } else if (status === "failed") {
          // Keep cart and redirect to checkout
          window.location.href = "/checkout?payment_failed=true";
        }
      }
    };

    window.addEventListener("message", handlePaymentMessage);

    return () => {
      window.removeEventListener("message", handlePaymentMessage);
    };
  }, [cartStore, clearPaymentState]);

  // Show payment status indicator for active payments
  const showPaymentIndicator =
    isPaymentInProgress() && !location.pathname.includes("/checkout");

  if (showPaymentIndicator) {
    return (
      <div className="fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="text-sm">معالجة الدفع...</span>
        </div>
      </div>
    );
  }

  return null;
};

// Main App Router
const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/item/:itemId" element={<ItemDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/current-orders" element={<CurrentOrders />} />

        {/* Payment callback routes - These handle backend redirects */}
        <Route path="/success/payment/:token" element={<PaymentSuccess />} />
        <Route path="/failed/payment/:token" element={<PaymentFailed />} />
        <Route path="/failure/payment/:token" element={<PaymentFailed />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Payment Status Handler */}
      <PaymentStatusHandler
        onPaymentSuccess={(paymentId, orderId) => {
          console.log("Payment Success Callback:", { paymentId, orderId });
        }}
        onPaymentFailed={(reason) => {
          console.log("Payment Failed Callback:", { reason });
        }}
        autoRedirectDelay={3000}
      />

      {/* Global Payment Status Indicator */}
      <GlobalPaymentHandler />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner
          position="bottom-right"
          dir="rtl"
          toastOptions={{
            style: { textAlign: "right", direction: "rtl" },
            className:
              "sm:min-w-[300px] min-w-[280px] max-w-[350px] sm:max-w-[400px]",
          }}
          className="sm:right-4 right-2 sm:bottom-4 bottom-2"
        />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
