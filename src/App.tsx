// Updated App.tsx - Simplified approach
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RestaurantDetails from "./pages/RestaurantDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ItemDetails from "./pages/ItemDetails";
import CurrentOrders from "./pages/CurrentOrders";
import FailedPaymentRedirect from "./components/PaymentFailureHandler";

const queryClient = new QueryClient();

// Simple payment callback components
const PaymentSuccess = () => {
  React.useEffect(() => {
    console.log("✅ Payment success - redirecting to orders");
    window.location.replace("/current-orders?payment=success");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-green-700">تم الدفع بنجاح! جاري التوجيه...</p>
      </div>
    </div>
  );
};

const PaymentFailed = () => {
  return (
    <>
      <FailedPaymentRedirect
        redirectDelay={3000}
        onRedirect={() => console.log("Redirecting from failed payment")}
      />
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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/item/:itemId" element={<ItemDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/current-orders" element={<CurrentOrders />} />

            {/* Payment callback routes */}
            <Route
              path="/payment/success/:token"
              element={<PaymentSuccess />}
            />
            <Route path="/payment/failed/:token" element={<PaymentFailed />} />
            <Route path="/failed/payment/:token" element={<PaymentFailed />} />
            <Route
              path="/success/payment/:token"
              element={<PaymentSuccess />}
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
