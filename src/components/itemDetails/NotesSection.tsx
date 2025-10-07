import React from "react";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Section Header */}
      <h3 className="text-sm sm:text-base font-bold text-gray-900 text-right">
        أضف ملاحظة
      </h3>

      {/* Notes Input */}
      <div className="relative">
        <textarea
          placeholder="سنحرص على إرسال ملاحظتك إلى المطعم. المطعم سيستلم طلبك مع ملاحظتك إذا كان ذلك ممكناً (في حال الانشغال الشديد غير مؤكد)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none border-2 border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-xs sm:text-sm text-right min-h-[70px] sm:min-h-[80px] rounded-xl placeholder:text-right placeholder:text-gray-400 bg-white p-3 sm:p-4"
          rows={3}
          dir="rtl"
        />
      </div>
    </div>
  );
};

export default NotesSection;
