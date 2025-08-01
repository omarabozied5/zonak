import React from "react";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User as UserType } from "../../types/types";

interface ContactInfoCardProps {
  user: UserType | null;
  notes: string;
  setNotes: (notes: string) => void;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = React.memo(
  ({ user, notes, setNotes }) => (
    <Card className="border-[#FFAA01]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-[#FFAA01]" />
          <span>معلومات الاتصال</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="display-name" className="text-sm">
              الاسم
            </Label>
            <Input
              id="display-name"
              value={user?.name || ""}
              readOnly
              className="mt-1 bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <Label htmlFor="display-phone" className="text-sm">
              رقم الهاتف
            </Label>
            <Input
              id="display-phone"
              value={user?.phone || ""}
              readOnly
              className="mt-1 bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm">
            ملاحظات إضافية
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أي ملاحظات خاصة بالطلب..."
            className="mt-1 focus:border-[#FFAA01] focus:ring-[#FFAA01]"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
);

ContactInfoCard.displayName = "ContactInfoCard";

export default ContactInfoCard;
