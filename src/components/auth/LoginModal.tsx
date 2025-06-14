
import React from 'react';
import { useAppStore } from '../../store/useAppStore';

const LoginModal: React.FC = () => {
  const {
    showLogin,
    setShowLogin,
    showOtp,
    setShowOtp,
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    userName,
    setUserName,
    setUser,
    setCurrentPage
  } = useAppStore();

  const handleLogin = () => {
    if (phoneNumber.length >= 10) {
      setShowOtp(true);
    }
  };

  const handleOtpVerification = () => {
    if (otp.length === 4) {
      setUser({
        name: userName || 'مستخدم جديد',
        phone: phoneNumber,
        token: 'mock_token_' + Date.now()
      });
      setShowLogin(false);
      setShowOtp(false);
      setCurrentPage('home');
    }
  };

  if (!showLogin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md" dir="rtl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {showOtp ? 'تأكيد رمز التحقق' : 'تسجيل الدخول'}
        </h3>
        
        {!showOtp ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="أدخل اسمك"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                إرسال رمز التحقق
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              تم إرسال رمز التحقق إلى {phoneNumber}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رمز التحقق</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="أدخل رمز التحقق"
                maxLength={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-center text-lg tracking-widest"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleOtpVerification}
                className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                تأكيد
              </button>
              <button
                onClick={() => setShowOtp(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                رجوع
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
