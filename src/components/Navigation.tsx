import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Clock, Home, ShoppingCart, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import LoginModal from "./LoginModal";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  // Get current user ID and use it for cart store
  const userId = user?.id || null;
  const cartStore = useCartStore(userId);

  const navItems = [
    { name: "الطلبات الحالية", path: "/current-orders", icon: Clock },
  ];

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const handleAuthAction = (closeMenu = false) => {
    setShowLoginModal(true);
    if (closeMenu) setIsMobileMenuOpen(false);
  };

  // Get cart items count properly
  const cartItemsCount = cartStore.getTotalItems();

  const NavLink = ({ item, onClick = () => {}, className = "" }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center space-x-2 space-x-reverse px-3 md:px-4 py-2 md:py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "text-[#FFAA01] bg-[#FFAA01]/10 shadow-sm"
            : "text-gray-700 hover:text-[#FFAA01] hover:bg-[#FFAA01]/5"
        } ${className}`}
      >
        <Icon className="h-4 w-4 md:h-4 md:w-4" />
        <span>{item.name}</span>
      </Link>
    );
  };

  const CartLink = ({ onClick = () => {}, className = "" }) => {
    const isActive = location.pathname === "/cart";

    return (
      <Link
        to="/cart"
        onClick={onClick}
        className={`relative flex items-center space-x-2 space-x-reverse px-3 md:px-4 py-2 md:py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "text-[#FFAA01] bg-[#FFAA01]/10 shadow-sm"
            : "text-gray-700 hover:text-[#FFAA01] hover:bg-[#FFAA01]/5"
        } ${className}`}
      >
        <div className="relative">
          <ShoppingCart className="h-4 w-4 md:h-4 md:w-4" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#FFAA01] text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold shadow-sm">
              {cartItemsCount}
            </span>
          )}
        </div>
        <span className="hidden md:inline">السلة</span>
      </Link>
    );
  };

  const MobileIconButton = ({ to, isActive, children, className = "" }) => (
    <Link
      to={to}
      className={`relative p-2 rounded-lg transition-all duration-200 ${
        isActive
          ? "text-[#FFAA01] bg-[#FFAA01]/10"
          : "text-gray-700 hover:text-[#FFAA01] hover:bg-[#FFAA01]/5"
      } ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo - Now acts as Home button */}
            <div className="flex items-center flex-shrink-0">
              <Link
                to="/"
                className="flex items-center space-x-2 space-x-reverse"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center">
                  <img
                    src="/zonak.png"
                    alt="Zonak Icon"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-[#FFAA01]">
                    <img
                      src="/public/logo.png"
                      width="40"
                      height="auto"
                      alt="Logo"
                      className="md:w-[50px]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = document.createElement("span");
                        fallback.textContent = "زونك";
                        fallback.className =
                          "text-lg md:text-xl font-bold text-[#FFAA01]";
                        e.currentTarget.parentNode?.appendChild(fallback);
                      }}
                    />
                  </h1>
                  <p className="text-xs font-bold text-gray-500 hidden sm:block">
                    أفضل المأكولات العربية
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 space-x-reverse">
              <NavLink item={{ name: "الرئيسية", path: "/", icon: Home }} />
              {navItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
              <CartLink />
            </div>

            {/* Mobile Navigation Icons + Menu Button */}
            <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
              {/* Mobile Current Orders & Cart Icons - Always visible */}
              <div className="flex items-center space-x-2 space-x-reverse md:hidden">
                <MobileIconButton
                  to="/current-orders"
                  isActive={location.pathname === "/current-orders"}
                >
                  <Clock className="h-5 w-5" />
                </MobileIconButton>

                <MobileIconButton
                  to="/cart"
                  isActive={location.pathname === "/cart"}
                  className="relative"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#FFAA01] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm">
                        {cartItemsCount}
                      </span>
                    )}
                  </div>
                </MobileIconButton>
              </div>

              {/* Desktop User Actions */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-2 lg:space-x-3 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 rounded-xl px-2 lg:px-3 py-2">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#FFAA01] rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-24 lg:max-w-none truncate">
                      مرحباً {user?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-1 space-x-reverse border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm px-2 lg:px-3"
                  >
                    <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden lg:inline">خروج</span>
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAuthAction()}
                    className="border-[#FFAA01] text-[#FFAA01] hover:bg-[#FFAA01] hover:text-white text-sm px-3"
                  >
                    تسجيل الدخول
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#FFAA01] to-yellow-500 text-white hover:from-[#FFAA01]/90 hover:to-yellow-500/90 shadow-lg text-sm px-3"
                    onClick={() => handleAuthAction()}
                  >
                    إنشاء حساب
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Only contains Auth functionality */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="px-3 pt-2 pb-3">
              {/* Mobile Auth Section */}
              <div className="pt-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 space-x-reverse px-4 py-3 bg-gray-50 rounded-xl mb-2">
                      <div className="w-8 h-8 bg-[#FFAA01] rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        مرحباً {user?.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 space-x-reverse border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAuthAction(true)}
                      className="w-full border-[#FFAA01] text-[#FFAA01] hover:bg-[#FFAA01] hover:text-white"
                    >
                      تسجيل الدخول
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-[#FFAA01] to-yellow-500 text-white hover:from-[#FFAA01]/90 hover:to-yellow-500/90 shadow-lg"
                      onClick={() => handleAuthAction(true)}
                    >
                      إنشاء حساب
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Navigation;
