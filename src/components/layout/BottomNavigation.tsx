
import React from 'react';
import { Home, ShoppingCart, Clock, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const BottomNavigation: React.FC = () => {
  const { currentPage, setCurrentPage, cart } = useAppStore();

  const navItems = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'cart', icon: ShoppingCart, label: 'السلة', badge: cart.length },
    { id: 'orders', icon: Clock, label: 'الطلبات' },
    { id: 'profile', icon: User, label: 'الحساب' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 z-40" dir="rtl">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setCurrentPage(id)}
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 relative ${
              currentPage === id 
                ? 'text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg scale-105' 
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${currentPage === id ? 'drop-shadow-sm' : ''}`} />
            {badge && badge > 0 && (
              <div className={`absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold ${
                currentPage === id 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-500 text-white animate-pulse'
              }`}>
                {badge}
              </div>
            )}
            <span className={`text-xs font-semibold ${currentPage === id ? 'drop-shadow-sm' : ''}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
