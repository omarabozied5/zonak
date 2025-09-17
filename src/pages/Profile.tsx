import React, { useState } from "react";
import { User, Phone, Mail, MapPin, Edit2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "أحمد محمد السالم",
    phone: "+966501234567",
    email: "ahmed.salem@email.com",
    address: "شارع الملك فهد، حي العليا، الرياض 12345",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    // console.log('Profile saved:', profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-arabic-sand/20 to-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الملف الشخصي
          </h1>
          <p className="text-gray-600">
            إدارة معلوماتك الشخصية وإعدادات الحساب
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card className="border-arabic-gold/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">المعلومات الشخصية</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-arabic-gold text-arabic-orange hover:bg-arabic-sand/30"
                >
                  <Edit2 className="h-4 w-4 ml-2" />
                  {isEditing ? "إلغاء" : "تعديل"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-right flex items-center space-x-2 space-x-reverse"
                  >
                    <User className="h-4 w-4 text-arabic-gold" />
                    <span>الاسم الكامل</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="text-right"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {profile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-right flex items-center space-x-2 space-x-reverse"
                  >
                    <Phone className="h-4 w-4 text-arabic-gold" />
                    <span>رقم الهاتف</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="text-right"
                      dir="ltr"
                    />
                  ) : (
                    <p
                      className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg"
                      dir="ltr"
                    >
                      {profile.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-right flex items-center space-x-2 space-x-reverse"
                  >
                    <Mail className="h-4 w-4 text-arabic-gold" />
                    <span>البريد الإلكتروني</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="text-right"
                      dir="ltr"
                    />
                  ) : (
                    <p
                      className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg"
                      dir="ltr"
                    >
                      {profile.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-right flex items-center space-x-2 space-x-reverse"
                  >
                    <MapPin className="h-4 w-4 text-arabic-gold" />
                    <span>العنوان</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      className="text-right"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {profile.address}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex space-x-4 space-x-reverse pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1 arabic-gradient text-white"
                    >
                      حفظ التغييرات
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-arabic-gold/20">
              <CardHeader>
                <CardTitle className="text-lg">إعدادات الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  تغيير كلمة المرور
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  إعدادات الإشعارات
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  اللغة والمنطقة
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  حذف الحساب
                </Button>
              </CardContent>
            </Card>

            <Card className="border-arabic-gold/20">
              <CardHeader>
                <CardTitle className="text-lg">الدعم والمساعدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  مركز المساعدة
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  اتصل بنا
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  الشروط والأحكام
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  سياسة الخصوصية
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
