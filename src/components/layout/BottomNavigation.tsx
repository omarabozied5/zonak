
import React from 'react';
import { Home, ShoppingCart, Clock, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const BottomNavigation: React.FC = () => {
  const { currentPage, setCurrentPage, cart } = useAppStore();

  const navItems = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'cart', icon: ShoppingCart, label: 'السلة', badge: cart.length },
    { id: 'orders', icon: Clock, label: 'الطلبات' },
    { id: 'profile', icon: User, label: 'الملف الشخصي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2" dir="rtl">
      <div className="flex justify-around items-center">
        {navItems.map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setCurrentPage(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors relative ${
              currentPage === id ? 'text-yellow-600 bg-yellow-50' : 'text-gray-600'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            {badge && badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {badge}
              </span>
            )}
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
