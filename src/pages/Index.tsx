
import React from 'react';
import Header from '../components/layout/Header';
import BottomNavigation from '../components/layout/BottomNavigation';
import LoginModal from '../components/auth/LoginModal';
import HomePage from './HomePage';
import RestaurantPage from './RestaurantPage';
import CartPage from './CartPage';
import OrdersPage from './OrdersPage';
import ProfilePage from './ProfilePage';
import { useAppStore } from '../store/useAppStore';

const Index: React.FC = () => {
  const { currentPage } = useAppStore();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'restaurant':
        return <RestaurantPage />;
      case 'cart':
        return <CartPage />;
      case 'orders':
        return <OrdersPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pb-20">
        {renderCurrentPage()}
      </main>
      
      <BottomNavigation />
      <LoginModal />
    </div>
  );
};

export default Index;
