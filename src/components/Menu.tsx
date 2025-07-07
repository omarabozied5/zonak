import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MenuCard from "./MenuCard";
import { useMenuItems } from "@/hooks/useMenuItems";
import { Card, CardContent } from "@/components/ui/card";

interface MenuProps {
  restaurantId: string;
  restaurantName: string;
}

const Menu = ({ restaurantId, restaurantName }: MenuProps) => {
  const { menuItems, loading, error } = useMenuItems(restaurantId);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const categories = useMemo(() => {
    const categorySet = new Set<string>(["الكل"]);
    menuItems.forEach((item) => {
      item.categories?.forEach((cat) => categorySet.add(cat.name));
    });
    return Array.from(categorySet);
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let items = menuItems;

    if (selectedCategory !== "الكل") {
      items = items.filter((item) =>
        item.categories?.some((cat) => cat.name === selectedCategory)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  const LoadingState = () => (
    <Card className="border-blue-200">
      <CardContent className="flex items-center justify-center py-12 sm:py-16">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#053468] mx-auto" />
            <div className="absolute inset-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-blue-200 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-base sm:text-lg font-semibold text-gray-800">
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

  const ErrorState = () => (
    <Card className="border-red-200">
      <CardContent className="text-center py-8 sm:py-12 px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-xl sm:text-2xl">⚠️</span>
        </div>
        <p className="text-red-600 text-base sm:text-lg font-semibold mb-2">
          خطأ في تحميل القائمة
        </p>
        <p className="text-gray-600 text-sm sm:text-base">{error}</p>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ isFiltered }: { isFiltered: boolean }) => (
    <Card className="border-blue-200">
      <CardContent className="text-center py-8 sm:py-12 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl sm:text-3xl">
            {isFiltered ? "🔍" : "🍽️"}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
          {isFiltered ? "لا توجد نتائج" : "لا توجد عناصر في القائمة"}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          {isFiltered
            ? searchQuery
              ? `لم نجد أي أصناف تحتوي على "${searchQuery}"`
              : "لا توجد عناصر في هذه الفئة"
            : "هذا المطعم لم يضف أي أصناف بعد"}
        </p>
      </CardContent>
    </Card>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (menuItems.length === 0) return <EmptyState isFiltered={false} />;

  return (
    <section className="space-y-4 sm:space-y-6 px-2 sm:px-0" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-right">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#053468] mb-1 sm:mb-2">
            قائمة الطعام
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            اختر من مجموعة متنوعة من الأطباق الشهية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={`h-8 w-8 sm:h-9 sm:w-9 p-0 ${
              viewMode === "list"
                ? "bg-[#053468] hover:bg-[#042952] text-white"
                : "border-blue-200 hover:bg-blue-50"
            }`}
          >
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`h-8 w-8 sm:h-9 sm:w-9 p-0 ${
              viewMode === "grid"
                ? "bg-[#053468] hover:bg-[#042952] text-white"
                : "border-blue-200 hover:bg-blue-50"
            }`}
          >
            <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-blue-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                placeholder="ابحث في القائمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-blue-300 focus:border-[#053468] text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
              {filteredItems.length} من {menuItems.length} صنف
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories & Content */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
        dir="rtl"
      >
        <Card className="border-blue-200 mb-4 sm:mb-6">
          <CardContent className="p-2 sm:p-4">
            <TabsList className="w-full justify-start bg-blue-50 p-1 h-auto">
              <ScrollArea className="w-full" dir="rtl">
                <div className="flex gap-1 sm:gap-2 px-1">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="whitespace-nowrap px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-[#053468] data-[state=active]:text-white transition-all duration-200 hover:bg-blue-100"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </div>
              </ScrollArea>
            </TabsList>
          </CardContent>
        </Card>

        {filteredItems.length === 0 ? (
          <EmptyState isFiltered={true} />
        ) : (
          <div
            className={`grid gap-3 sm:gap-4 lg:gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                restaurantName={restaurantName}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </Tabs>
    </section>
  );
};

export default Menu;
