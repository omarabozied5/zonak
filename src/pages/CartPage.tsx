
import React from 'react';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import CartItem from '../components/cart/CartItem';

const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    calculateTotal,
    clearCart,
    setCurrentPage,
    user,
    setShowLogin
  } = useAppStore();

  const handleCheckout = () => {
    if (user) {
      alert('تم تأكيد الطلب بنجاح! سيتم إشعارك عند جاهزية الطلب.');
      clearCart();
      setCurrentPage('home');
    } else {
      setShowLogin(true);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingCart className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-4">السلة فارغة</h3>
          <p className="text-gray-600 mb-8 text-lg font-medium leading-relaxed">
            أضف بعض العناصر اللذيذة لتبدأ طلبك
          </p>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            تصفح المطاعم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-32" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-2">سلة التسوق</h2>
          <p className="text-gray-600 font-medium">{cart.length} عنصر في السلة</p>
        </div>
        
        {/* Cart Items */}
        <div className="space-y-4">
          {cart.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-orange-500" />
            ملخص الطلب
          </h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-700">المجموع الفرعي:</span>
              <span className="font-bold text-gray-900">{calculateTotal().toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-700">رسوم الخدمة:</span>
              <span className="font-bold text-gray-900">مجاناً</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-2xl">
                <span className="font-black text-gray-900">المجموع الكلي:</span>
                <span className="font-black text-orange-600">{calculateTotal().toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {user ? 'تأكيد الطلب' : 'سجل الدخول للمتابعة'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
