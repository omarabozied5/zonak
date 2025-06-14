
import React from 'react';
import { User } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { mockOrders } from '../data/mockData';

const OrdersPage: React.FC = () => {
  const { user, setShowLogin } = useAppStore();

  if (!user) {
    return (
      <div className="p-4" dir="rtl">
        <h2 className="text-xl font-bold text-gray-800 mb-6">الطلبات السابقة</h2>
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">سجل الدخول لعرض طلباتك</h3>
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
      <h2 className="text-xl font-bold text-gray-800 mb-6">الطلبات السابقة</h2>
      
      <div className="space-y-4">
        {mockOrders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{order.customerName}</h4>
                  <p className="text-sm text-gray-600">رقم الطلب: #{order.id}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">{order.total.toFixed(2)} ر.س</p>
                <p className="text-sm text-gray-600">{order.status}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>📅 {order.date}</span>
                <span>🕐 {order.time}</span>
              </div>
              <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">
                عرض الطلب
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
