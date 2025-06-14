
import React from 'react';
import { Home, ShoppingCart, User, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const Header: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    selectedRestaurant, 
    cart, 
    user, 
    setShowLogin 
  } = useAppStore();

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'الرئيسية';
      case 'restaurant': return selectedRestaurant?.name || 'المطعم';
      case 'cart': return 'سلة التسوق';
      case 'orders': return 'الطلبات السابقة';
      case 'profile': return 'الملف الشخصي';
      default: return 'الرئيسية';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 px-6 py-4 sticky top-0 z-40" dir="rtl">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Left Section - Page Title & Back Button */}
        <div className="flex items-center gap-4">
          {currentPage !== 'home' && (
            <button 
              onClick={() => setCurrentPage('home')}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <ArrowRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
          <h1 className="text-2xl font-black text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
        </div>
        
        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Home Button */}
          {currentPage !== 'home' && (
            <button 
              onClick={() => setCurrentPage('home')}
              className="p-3 hover:bg-orange-50 rounded-2xl transition-all duration-200 hover:scale-105 group"
            >
              <Home className="w-6 h-6 text-gray-600 group-hover:text-orange-600" />
            </button>
          )}
          
          {/* Cart Button */}
          {cart.length > 0 && currentPage !== 'cart' && (
            <button 
              onClick={() => setCurrentPage('cart')}
              className="relative p-3 hover:bg-orange-50 rounded-2xl transition-all duration-200 hover:scale-105 group"
            >
              <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-orange-600" />
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
                {cart.length}
              </div>
            </button>
          )}
          
          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-2 border border-gray-200">
              <button 
                onClick={() => setCurrentPage('profile')}
                className="p-2 hover:bg-white rounded-xl transition-all duration-200 hover:scale-105"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
