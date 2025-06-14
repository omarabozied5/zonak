
import React from 'react';
import { ShoppingCart } from 'lucide-react';
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
      <div className="p-4 pb-24" dir="rtl">
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">السلة فارغة</h3>
          <p className="text-gray-500 mb-4">أضف بعض العناصر لتبدأ طلبك</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            تصفح المطاعم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">سلة التسوق</h2>
      
      <div className="space-y-4 mb-6">
        {cart.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
          />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>المجموع الكلي:</span>
          <span className="text-yellow-600">{calculateTotal().toFixed(2)} ر.س</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        className="w-full bg-yellow-400 text-black py-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
      >
        {user ? 'تأكيد الطلب' : 'سجل الدخول للمتابعة'}
      </button>
    </div>
  );
};

export default CartPage;
