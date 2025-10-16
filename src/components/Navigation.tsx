import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Clock,
  Home,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useOrderStore } from "@/hooks/useOrderStore"; // Add this import
import LoginModal from "./LoginModal";
import SearchBar from "./SearchBar";
import { toast } from "sonner";

// Add interface for search props
interface NavigationProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const Navigation = ({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "ابحث عن مطاعم",
}: NavigationProps) => {
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  // Get current user ID and use it for cart store
  const userId = user?.id || null;
  const cartStore = useCartStore(userId);

  // Add orders store using existing useOrderStore
  const orderStore = useOrderStore(userId?.toString() || null);

  const navItems = [
    {
      name: "الطلبات الحالية",
      path: "/current-orders",
      icon: Clock,
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const handleAuthAction = (closeMenu = false) => {
    setShowLoginModal(true);
    if (closeMenu) setIsMobileMenuOpen(false);
  };

  // Handle unauthorized access to protected routes
  const handleProtectedRoute = (path: string, e?: React.MouseEvent) => {
    if (!isAuthenticated) {
      if (e) e.preventDefault();
      toast.error("يجب تسجيل الدخول");
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // Get cart items count properly
  const cartItemsCount = cartStore.getTotalItems();

  // Get current orders count using existing store method
  const currentOrdersCount = orderStore.getActiveOrdersCount();

  const NavLink = ({ item, onClick = () => {}, className = "" }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    const isProtected = item.path === "/current-orders";

    const handleClick = (e: React.MouseEvent) => {
      if (isProtected && !handleProtectedRoute(item.path, e)) {
        return;
      }
      onClick();
    };

    return (
      <Link
        to={item.path}
        onClick={handleClick}
        className={`relative flex items-center space-x-2 space-x-reverse px-3 md:px-4 py-2 md:py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "text-[#FFAA01] bg-[#FFAA01]/10 shadow-sm"
            : "text-gray-700 hover:text-[#FFAA01] hover:bg-[#FFAA01]/5"
        } ${className}`}
      >
        <div className="relative inline-block">
          <Icon className="h-4 w-4 md:h-4 md:w-4" />
          {/* Add badge for current orders */}
          {item.path === "/current-orders" &&
            currentOrdersCount > 0 &&
            isAuthenticated && (
              <span
                className="absolute -top-1 -right-1 bg-white text-[#FFD14A] 
                     text-[10px] rounded-full h-4 w-4 
                     flex items-center justify-center font-bold shadow"
              >
                {currentOrdersCount}
              </span>
            )}
        </div>
        <span>{item.name}</span>
      </Link>
    );
  };

  const CartLink = ({ onClick = () => {}, className = "" }) => {
    const isActive = location.pathname === "/cart";

    const handleClick = (e: React.MouseEvent) => {
      if (!handleProtectedRoute("/cart", e)) {
        return;
      }
      onClick();
    };

    return (
      <Link
        to="/cart"
        onClick={handleClick}
        className={`relative flex items-center space-x-2 space-x-reverse px-3 md:px-4 py-2 md:py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "text-[#FFAA01] bg-[#FFAA01]/10 shadow-sm"
            : "text-gray-700 hover:text-[#FFAA01] hover:bg-[#FFAA01]/5"
        } ${className}`}
      >
        <div className="relative inline-block">
          <ShoppingCart className="h-6 w-6" />
          {cartItemsCount > 0 && isAuthenticated && (
            <span
              className="absolute -top-1 -right-1 bg-white text-[#FFD14A] 
                     text-[10px] rounded-full h-4 w-4 
                     flex items-center justify-center font-bold shadow"
            >
              {cartItemsCount}
            </span>
          )}
        </div>
        <span className="hidden md:inline">السلة</span>
      </Link>
    );
  };

  // Mobile navigation icons with custom images
  const MobileNavIcons = () => (
    <div className="flex items-center space-x-2 space-x-reverse md:hidden">
      <Link
        to="/cart"
        onClick={(e) => handleProtectedRoute("/cart", e)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          location.pathname === "/cart"
            ? "bg-[#FFAA01]/10"
            : "hover:bg-[#FFAA01]/5"
        }`}
      >
        <div className="relative">
          <img
            src="/shopping-bag.png"
            alt="Cart"
            className="w-5 h-5"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = document.createElement("div");
              fallback.innerHTML =
                '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="m2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>';
              e.currentTarget.parentNode?.appendChild(fallback);
            }}
          />
          {cartItemsCount > 0 && isAuthenticated && (
            <span className="absolute -top-1 -right-1 bg-white text-[#FBD252] text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm border border-gray-200">
              {cartItemsCount}
            </span>
          )}
        </div>
      </Link>

      <Link
        to="/current-orders"
        onClick={(e) => handleProtectedRoute("/current-orders", e)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          location.pathname === "/current-orders"
            ? "bg-[#FFAA01]/10"
            : "hover:bg-[#FFAA01]/5"
        }`}
      >
        <div className="relative">
          <img
            src="/currentOrder.png"
            alt="Current Orders"
            className="w-5 h-5"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = document.createElement("div");
              fallback.innerHTML =
                '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>';
              e.currentTarget.parentNode?.appendChild(fallback);
            }}
          />
          {/* Add badge for mobile current orders icon */}
          {currentOrdersCount > 0 && isAuthenticated && (
            <span className="absolute -top-1 -right-1 bg-white text-[#FBD252] text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm border border-gray-200">
              {currentOrdersCount}
            </span>
          )}
        </div>
      </Link>
    </div>
  );

  // Check if we're on home page
  const isHomePage = location.pathname === "/";

  return (
    <>
      <nav className="bg-[#FFD14A] shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Main navigation row */}
          <div
            className={`flex justify-between items-center ${
              isHomePage ? "h-16 md:h-16" : "h-20 md:h-20"
            }`}
          >
            {/* Back Button and Logo */}
            <div className="flex items-center flex-shrink-0 space-x-3 space-x-reverse">
              {/* Back Button - Only show when not on home page */}
              {!isHomePage && (
                <button
                  onClick={() => window.history.back()}
                  className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                  aria-label="Go back"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

              {/* Logo - Now acts as Home button */}
              <Link to="/" className="flex items-center">
                <div className="w-14 h-15 md:w-15 md:h-15 rounded-2xl flex items-center justify-center">
                  <img
                    src="/newLogo.png"
                    alt="Zonak Icon"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </Link>

              {/* City/Location indicator - Only show on home page */}
              {isHomePage && (
                <div className="hidden md:flex items-center text-gray-700 mr-4">
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-sm font-medium">المدينة المنورة</span>
                </div>
              )}
            </div>

            {/* Desktop Navigation - Only show when not on home page */}
            {!isHomePage && (
              <div className="hidden md:flex items-center space-x-4 lg:space-x-6 space-x-reverse">
                <NavLink item={{ name: "الرئيسية", path: "/", icon: Home }} />
                {navItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
                <CartLink />
              </div>
            )}

            {/* Mobile Navigation Icons + Menu Button */}
            <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
              {/* Mobile Current Orders & Cart Icons */}
              <MobileNavIcons />

              {/* Desktop User Actions */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-2 lg:space-x-3 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse bg-white/70 backdrop-blur-md border border-[#FFD14A]/40 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-[#FFAA01] to-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs text-gray-500">مرحباً</span>
                      <span className="text-sm font-semibold text-gray-800 truncate max-w-[100px] lg:max-w-[140px]">
                        {user
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : ""}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-1 space-x-reverse bg-white/80 border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm px-3 lg:px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">خروج</span>
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center">
                  <Button
                    size="sm"
                    onClick={() => handleAuthAction()}
                    className="bg-white/90 backdrop-blur-sm border border-white/50 text-[#FFAA01] hover:bg-white hover:scale-105 text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    تسجيل الدخول
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button - Show ONLY on home page */}
              {isHomePage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2 hover:bg-[#white]/20 text-[#FBD252]"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5 text-white" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar Row - Only show on home page, below the main navigation */}
          {isHomePage && (
            <div className="pb-0">
              <SearchBar
                value={searchQuery}
                onChange={onSearchChange || (() => {})}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
        </div>

        {/* Mobile Menu - Show on home page when menu is open */}
        {isMobileMenuOpen && isHomePage && (
          <div className="md:hidden border-t border-gray-100 bg-[#FFD14A]/95 backdrop-blur-md">
            <div className="px-3 pt-2 pb-3">
              <div className="pt-3">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between space-x-3 space-x-reverse px-4 py-3 bg-white/70 backdrop-blur-md border border-[#FFD14A]/40 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FFAA01] to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs text-gray-500">مرحباً</span>
                        <span className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">
                          {user
                            ? `${user.first_name} ${user.last_name}`.trim()
                            : ""}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-1 space-x-reverse bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-2 rounded-xl transition-all duration-300 shadow-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">خروج</span>
                    </Button>
                  </div>
                ) : (
                  <div className="px-4">
                    <Button
                      onClick={() => handleAuthAction(true)}
                      className="w-full bg-white/90 backdrop-blur-sm border border-white/50 text-[#FFAA01] hover:bg-white hover:scale-[1.02] rounded-xl text-sm font-semibold py-3 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      تسجيل الدخول
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
