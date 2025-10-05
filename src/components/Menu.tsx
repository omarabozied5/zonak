"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MenuCard from "./MenuCard";
import { useMenuItems } from "@/hooks/useMenuItems";
import type { Restaurant } from "@/types/types";
import SearchBar from "./SearchBar";

interface MenuProps {
  userId: string | number;
  restaurantName: string;
  placeId?: string | number;
  merchantId?: string | number;
  categoryId: number;
  restaurant?: Restaurant;
}

const Menu = ({
  userId,
  restaurantName,
  placeId,
  merchantId,
  categoryId,
  restaurant,
}: MenuProps) => {
  const { menuItems, loading, error } = useMenuItems(userId, placeId);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const resolvedIds = useMemo(() => {
    let finalPlaceId = placeId;
    let finalMerchantId = merchantId;

    if (restaurant) {
      finalPlaceId = restaurant.id?.toString() || placeId;
      finalMerchantId =
        restaurant.user_id?.toString() || merchantId || userId?.toString();
    }

    const validPlaceId = finalPlaceId?.toString()?.trim() || "";
    const validMerchantId = finalMerchantId?.toString()?.trim() || "";

    return {
      placeId: validPlaceId,
      merchantId: validMerchantId || validPlaceId,
      restaurantName: restaurantName || restaurant?.merchant_name || "مطعم",
    };
  }, [placeId, merchantId, userId, restaurant, restaurantName]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>(["الكل"]);
    menuItems.forEach((item) => {
      if (Array.isArray(item.categories)) {
        item.categories.forEach((cat) => categorySet.add(cat.name));
      } else if (
        item.categories &&
        typeof item.categories === "object" &&
        "name" in item.categories
      ) {
        categorySet.add(item.categories.name);
      }
    });
    return Array.from(categorySet);
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let items = menuItems;

    if (selectedCategory !== "الكل") {
      items = items.filter((item) => {
        if (Array.isArray(item.categories)) {
          return item.categories.some((cat) => cat.name === selectedCategory);
        } else if (
          item.categories &&
          typeof item.categories === "object" &&
          "name" in item.categories
        ) {
          return item.categories.name === selectedCategory;
        }
        return false;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  const LoadingState = () => (
    <Card className="border border-gray-100 shadow-sm rounded-2xl">
      <CardContent className="flex items-center justify-center py-12 sm:py-16">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#F7BD01] mx-auto" />
            <div className="absolute inset-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-gray-200 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              جاري تحميل القائمة...
            </p>
            <p className="text-sm sm:text-base text-gray-500">
              يرجى الانتظار قليلاً
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ErrorState = ({
    error,
    placeId,
  }: {
    error: string;
    placeId?: string;
  }) => (
    <Card className="border border-red-200 shadow-sm rounded-2xl">
      <CardContent className="text-center py-10 px-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl sm:text-3xl">⚠️</span>
        </div>
        <h3 className="text-red-600 text-base sm:text-lg font-semibold mb-2">
          حدث خطأ في تحميل القائمة
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">{error}</p>
        {!placeId && (
          <p className="text-amber-600 text-sm mt-3 font-medium">
            ⚠️ تحذير: معرف المكان (placeId) غير متوفر
          </p>
        )}
      </CardContent>
    </Card>
  );

  const EmptyState = ({
    isFiltered,
    searchQuery,
  }: {
    isFiltered: boolean;
    searchQuery?: string;
  }) => (
    <Card className="border border-gray-100 shadow-sm rounded-2xl">
      <CardContent className="text-center py-10 px-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-xl sm:text-2xl">
            {isFiltered ? "🔍" : "🍽️"}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {isFiltered ? "لا توجد نتائج" : "لا توجد عناصر في القائمة"}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          {isFiltered
            ? searchQuery
              ? `لم نجد أي أصناف تحتوي على "${searchQuery}"`
              : "لا توجد عناصر في هذه الفئة"
            : "هذا المطعم لم يضع أي أصناف بعد"}
        </p>
      </CardContent>
    </Card>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={""} />;
  if (menuItems.length === 0) return <EmptyState isFiltered={false} />;

  return (
    <section
      className="space-y-6 px-2 sm:px-4 max-w-4xl mx-auto pb-32"
      dir="rtl"
    >
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
        dir="rtl"
      >
        {/* Categories Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="overflow-x-auto scrollbar-hide" dir="rtl">
            <div className="flex gap-6 px-4 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative pb-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#F7BD01] after:rounded-full"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500 mb-4 text-right">
          {filteredItems.length} من {menuItems.length} صنف
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState isFiltered={true} />
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                restaurant={restaurant}
                restaurantName={resolvedIds.restaurantName}
                placeId={resolvedIds.placeId}
                merchantId={resolvedIds.merchantId}
                categoryId={item.categoryId || categoryId}
              />
            ))}
          </div>
        )}
      </Tabs>
    </section>
  );
};

export default Menu;
