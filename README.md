# Food Ordering App 🍽️

A modern, responsive food ordering application built with React, TypeScript, and Tailwind CSS. This app allows users to browse restaurants, view menus, add items to cart, and place orders with a seamless user experience.

## 🌟 Features

### Core Features

- **Restaurant Browse**: View featured restaurants with ratings, distance, and availability status
- **Advanced Search**: Search restaurants by name, category, or cuisine type
- **Restaurant Details**: Comprehensive restaurant information including ratings, branches, and image galleries
- **Menu Navigation**: Browse restaurant menus with categories and item details
- **Shopping Cart**: Add items to cart with quantity management
- **Order Management**: Place orders with customer information and order tracking
- **User Authentication**: Login/signup functionality with user profiles

### UI/UX Features

- **Responsive Design**: Mobile-first design that works on all devices
- **Arabic Support**: Full RTL (Right-to-Left) support for Arabic content
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Interactive Elements**: Hover effects, loading states, and micro-interactions
- **Error Handling**: Comprehensive error states with retry functionality

### Advanced Features

- **Real-time Updates**: Live restaurant status and order tracking
- **Geolocation**: Distance calculation and location-based services
- **Image Galleries**: Restaurant image sliders and item photos
- **Rating System**: Restaurant and item ratings with detailed breakdowns
- **Coupon System**: Discount codes and promotional offers
- **Order History**: Track current and past orders

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Data fetching and caching

### UI Components

- **Shadcn/UI** - High-quality, accessible UI components
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications
- **Recharts** - Data visualization (if needed)

### Development Tools

- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
src/
├── components/                    # Reusable UI components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── MenuCard/                 # Menu item card components
│   ├── ErrorLoadingStates.tsx    # Error and loading state components
│   ├── FloatingCart.tsx          # Floating cart widget
│   ├── HeroSection.tsx           # Homepage hero section with search
│   ├── ImageSlider.tsx           # Image gallery slider
│   ├── LoginModal.tsx            # Authentication modal dialog
│   ├── Menu.tsx                  # Restaurant menu display
│   ├── MenuCard.tsx              # Individual menu item card
│   ├── MostOrderedItemCard.tsx   # Popular item card component
│   ├── MostOrderedItems.tsx      # Popular items section
│   ├── MostOrderedItemSlider.tsx # Popular items carousel
│   ├── Navigation.tsx            # Main navigation bar
│   ├── RestaurantCard.tsx        # Restaurant listing card
│   ├── RestaurantGallery.tsx     # Restaurant image gallery
│   ├── RestaurantHeader.tsx      # Restaurant page header
│   ├── RestaurantInfoCards.tsx   # Restaurant information cards
│   ├── RestaurantStatus.tsx      # Restaurant status indicator
│   ├── ResturantInfo.tsx         # Restaurant details component
│   └── WorkingHoursDisplay.tsx   # Business hours display
├── pages/                        # Page components
│   ├── Home.tsx                  # Homepage with restaurant listings
│   ├── RestaurantDetails.tsx     # Restaurant details page
│   ├── Cart.tsx                  # Shopping cart page
│   ├── Checkout.tsx              # Order checkout page
│   ├── Profile.tsx               # User profile page
│   └── CurrentOrders.tsx         # Order tracking page
├── hooks/                        # Custom React hooks
│   ├── useSearch.tsx             # Search functionality
│   ├── useCartStore.tsx          # Cart state management
│   └── useOrderStore.tsx         # Order management
├── services/                     # API services and utilities
│   └── apiService.ts             # API calls and data fetching
├── stores/                       # State management (Zustand)
│   ├── useCartStore.ts           # Shopping cart state
│   └── useAuthStore.ts           # Authentication state
├── types/                        # TypeScript type definitions
│   └── types.ts                  # Application interfaces and types
├── lib/                          # Utility functions and helpers
├── App.css                       # Global application styles
├── App.tsx                       # Main application component
├── index.css                     # Global CSS and Tailwind imports
├── main.tsx                      # Application entry point
└── vite-env.d.ts                 # Vite environment type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd food-ordering-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_API_BASE_URL=your_api_base_url
   VITE_APP_NAME=Food Ordering App
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

## 📱 Pages Overview

### Home Page (`/`)

- Featured restaurants grid
- Search functionality
- Restaurant filters and categories
- Quick stats and promotional content

### Restaurant Details (`/restaurant/:id`)

- Restaurant information and ratings
- Image gallery slider
- Branch locations
- Most ordered items
- Full menu with categories

### Cart Page (`/cart`)

- Shopping cart items
- Quantity management
- Price calculations
- Checkout navigation

### Checkout Page (`/checkout`)

- Customer information form
- Coupon/discount system
- Order summary
- Payment method selection
- Order placement

### Profile Page (`/profile`)

- User account information
- Order history
- Favorite restaurants
- Account settings

### Current Orders (`/current-orders`)

- Active order tracking
- Order status updates
- Order details

## 🔧 Key Components

### Core Navigation & Layout

- **Navigation.tsx** - Responsive navigation bar with authentication and cart
- **HeroSection.tsx** - Homepage hero with search and category filtering
- **FloatingCart.tsx** - Persistent cart widget with quick preview

### Restaurant Components

- **RestaurantCard.tsx** - Restaurant listing card with ratings and status
- **RestaurantHeader.tsx** - Restaurant page header with key information
- **ResturantInfo.tsx** - Comprehensive restaurant details display
- **RestaurantInfoCards.tsx** - Restaurant information in card format
- **RestaurantStatus.tsx** - Live restaurant status indicator
- **RestaurantGallery.tsx** - Restaurant image gallery with lightbox
- **WorkingHoursDisplay.tsx** - Business hours with current status

### Menu & Items

- **Menu.tsx** - Main menu display with categories and filtering
- **MenuCard.tsx** - Individual menu item card with add-to-cart
- **MenuCard/** - Specialized menu card components and variants
- **MostOrderedItems.tsx** - Popular items section
- **MostOrderedItemCard.tsx** - Popular item card component
- **MostOrderedItemSlider.tsx** - Carousel for popular items

### UI & Interaction

- **ImageSlider.tsx** - Image carousel with navigation and indicators
- **LoginModal.tsx** - Authentication modal with form validation
- **ErrorLoadingStates.tsx** - Reusable error and loading components
- **ui/** - Base UI components from shadcn/ui library

## 🎨 Design System

### Colors

- **Primary**: `#FFAA01` (Orange/Yellow)
- **Secondary**: `#053468` (Dark Blue)
- **Background**: Gradient from beige to white
- **Text**: Various shades of gray

### Typography

- Arabic font support
- Responsive font sizes
- Consistent hierarchy

### Spacing

- Mobile-first responsive design
- Consistent spacing scale
- Flexible grid system

## 🔐 Authentication

The app includes a complete authentication system with:

- User registration and login
- Protected routes
- User profile management
- Session persistence

## 🛒 Cart Management

Advanced cart functionality includes:

- Add/remove items
- Quantity adjustment
- Price calculations
- Restaurant-specific carts
- Persistent cart state

## 📦 Order System

Comprehensive order management:

- Order creation and validation
- Customer information collection
- Payment method selection
- Order tracking and history
- Status updates

## 🌐 API Integration

The app integrates with a backend API for:

- Restaurant data fetching
- Menu item retrieval
- User authentication
- Order processing
- Rating and review system

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Optimized images and assets

## 🔍 Search Functionality

Advanced search features:

- Restaurant name search
- Category filtering
- Real-time search results
- Search history
- Autocomplete suggestions

## 🎯 Performance Optimization

- Lazy loading components
- Image optimization
- Efficient state management
- Caching strategies
- Bundle optimization

## 🧪 Testing

To run tests:

```bash
npm run test
# or
yarn test
```

## 📈 Future Enhancements

- [ ] Push notifications
- [ ] Real-time chat support
- [ ] Advanced filtering options
- [ ] Loyalty program integration
- [ ] Social media sharing
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- Thanks to all contributors
- UI/UX inspiration from modern food delivery apps
- Icons by Lucide React
- UI components by Shadcn/UI

---

**Happy Coding! 🚀**
