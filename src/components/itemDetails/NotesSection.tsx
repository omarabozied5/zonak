import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3 bg-gray-50/50 rounded-t-lg">
        <CardTitle className="text-base sm:text-lg text-[#053468]">
          ملاحظات خاصة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <Textarea
          placeholder="أي طلبات أو ملاحظات خاصة..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none border-gray-200 focus:border-[#FFAA01] focus:ring-[#FFAA01] text-sm sm:text-base"
          rows={3}
        />
      </CardContent>
    </Card>
  );
};

export default NotesSection;
