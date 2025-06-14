
import React from 'react';
import { User, Clock, LogOut, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const ProfilePage: React.FC = () => {
  const { user, setUser, setShowLogin, setCurrentPage, clearCart } = useAppStore();

  const handleLogout = () => {
    setUser(null);
    clearCart();
    setCurrentPage('home');
  };

  if (!user) {
    return (
      <div className="p-4" dir="rtl">
        <h2 className="text-xl font-bold text-gray-800 mb-6">الملف الشخصي</h2>
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">سجل الدخول للوصول لملفك الشخصي</h3>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">الملف الشخصي</h2>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
            <p className="text-gray-600">{user.phone}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({...user, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
            <input
              type="text"
              value={user.phone}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => setCurrentPage('orders')}
          className="w-full bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>الطلبات السابقة</span>
          </div>
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
