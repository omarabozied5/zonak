import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <h3 className="text-lg font-bold text-gray-900 text-right">
        هل تود إضافة ضيف مميز؟
      </h3>
      
      {/* Label */}
      <div className="text-right">
        <label className="text-sm text-gray-500">
          اكتب
        </label>
      </div>
      
      {/* Notes Input */}
      <div className="relative">
        <Textarea
          placeholder="أي طلبات أو ملاحظات خاصة..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none border-2 border-gray-200 focus:border-[#E49B0F] focus:ring-2 focus:ring-[#E49B0F]/20 text-sm text-right min-h-[100px] rounded-xl placeholder:text-right placeholder:text-gray-400 bg-gray-50 p-4"
          rows={4}
          dir="rtl"
        />
      </div>
    </div>
  );
};

export default NotesSection;