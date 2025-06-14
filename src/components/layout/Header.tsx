
import React from 'react';
import { Home, ShoppingCart, User } from 'lucide-react';
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
    <header className="bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center" dir="rtl">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {currentPage !== 'home' && (
          <button 
            onClick={() => setCurrentPage('home')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Home className="w-5 h-5" />
          </button>
        )}
        
        {cart.length > 0 && currentPage !== 'cart' && (
          <button 
            onClick={() => setCurrentPage('cart')}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {cart.length}
            </span>
          </button>
        )}
        
        {user ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage('profile')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <User className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">{user.name}</span>
          </div>
        ) : (
          <button 
            onClick={() => setShowLogin(true)}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            تسجيل الدخول
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
