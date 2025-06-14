
import { Restaurant, MenuItem, Order } from '../store/useAppStore';

export const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "مطعم البرجر الشهير",
    logo: "🍔",
    rating: 4.5,
    deliveryTime: "30-45 دقيقة",
    category: "برجر وسندويش"
  },
  {
    id: 2,
    name: "عصائر المانجو الطازجة",
    logo: "🥭",
    rating: 4.8,
    deliveryTime: "15-20 دقيقة",
    category: "عصائر ومشروبات"
  },
  {
    id: 3,
    name: "مطعم الدجاج المشوي",
    logo: "🍗",
    rating: 4.3,
    deliveryTime: "25-35 دقيقة",
    category: "دجاج مشوي"
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "وجبة برجر",
    description: "برجر - عصير مانجو - بطاطس مقلية",
    price: 210.00,
    image: "🍔",
    category: "الكل",
    restaurantId: 1
  },
  {
    id: 2,
    name: "برجر",
    description: "ساندويش برجر من أجود أنواع اللحم البقري",
    price: 150.00,
    image: "🍔",
    category: "الكل",
    restaurantId: 1
  },
  {
    id: 3,
    name: "عصير مانجو",
    description: "عصير مانجو بمذاق رائع",
    price: 50.00,
    image: "🥭",
    category: "عصائر",
    restaurantId: 1
  },
  {
    id: 4,
    name: "بطاطس مقلية",
    description: "بطاطس مقلية من ذات جودة عالية",
    price: 570.00,
    image: "🍟",
    category: "مقبلات",
    restaurantId: 1
  },
  {
    id: 5,
    name: "عصير موز",
    description: "عصير موز طازج",
    price: 30.00,
    image: "🍌",
    category: "عصائر",
    restaurantId: 1
  }
];

export const mockOrders: Order[] = [
  {
    id: 576,
    total: 420.00,
    status: "مستلم",
    date: "2025-01-20",
    time: "14:30",
    customerName: "حليم كاظم"
  },
  {
    id: 527,
    total: 59.00,
    status: "تم التوصيل",
    date: "2025-01-21",
    time: "16:45",
    customerName: "بروست زوجدا"
  },
  {
    id: 526,
    total: 40.00,
    status: "تم الاستلام",
    date: "2025-01-21",
    time: "18:20",
    customerName: "حليم كاظم"
  },
  {
    id: 525,
    total: 1520.00,
    status: "تم الاستلام",
    date: "2025-01-21",
    time: "19:45",
    customerName: "حليم كاظم"
  }
];

export const categories = ["الكل", "مقبلات", "عصائر", "مشروبات ساخنة", "دجاج"];
