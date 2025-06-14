
import React from 'react';
import { Home, ShoppingCart, User, ArrowRight, Clock } from 'lucide-react';
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

  const navItems = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'cart', icon: ShoppingCart, label: 'السلة', badge: cart.length },
    { id: 'orders', icon: Clock, label: 'الطلبات' },
    { id: 'profile', icon: User, label: 'الحساب' },
  ];

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
        
        {/* Center Section - Navigation Items */}
        <div className="flex items-center gap-2">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 relative ${
                currentPage === id 
                  ? 'text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg' 
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${currentPage === id ? 'drop-shadow-sm' : ''}`} />
              {badge && badge > 0 && (
                <div className={`absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold ${
                  currentPage === id 
                    ? 'bg-white text-red-500' 
                    : 'bg-red-500 text-white animate-pulse'
                }`}>
                  {badge}
                </div>
              )}
              <span className={`text-sm font-semibold hidden md:block ${currentPage === id ? 'drop-shadow-sm' : ''}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
        
        {/* Right Section - User Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-2 border border-gray-200">
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
