import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Printer, FileText } from "lucide-react";
import { getStudents } from "@/lib/storage";
import { Student } from "@/types/student";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { getSchoolSettings, getDocumentHeader } from "@/lib/schoolSettings";

const AllStudentCards = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const settings = getSchoolSettings();
  const header = getDocumentHeader();

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportAllImages = async () => {
    toast.info("استخدم زر الطباعة واختر 'حفظ كـ PDF' من خيارات الطباعة");
    window.print();
  };

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/students")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">بطاقات جميع التلاميذ</h2>
            <p className="text-muted-foreground">لا يوجد تلاميذ لطباعة بطاقاتهم</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <Button variant="outline" size="icon" onClick={() => navigate("/students")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">بطاقات جميع التلاميذ</h2>
          <p className="text-sm text-muted-foreground">طباعة {students.length} بطاقة</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={cardsPerPage}
            onChange={(e) => setCardsPerPage(Number(e.target.value))}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value={2}>2 بطاقات/صفحة</option>
            <option value={4}>4 بطاقات/صفحة</option>
            <option value={6}>6 بطاقات/صفحة</option>
          </select>
          <Button variant="outline" onClick={handleExportAllImages}>
            <FileText className="w-4 h-4 ml-2" />
            PDF
          </Button>
          <Button onClick={handlePrint} className="gradient-primary">
            <Printer className="w-4 h-4 ml-2" />
            طباعة الكل
          </Button>
        </div>
      </div>

      <div 
        className="grid gap-4 print:gap-2" 
        id="cards-container"
        style={{
          gridTemplateColumns: cardsPerPage <= 2 ? "1fr" : "repeat(2, 1fr)"
        }}
      >
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white border-[2px] border-black shadow-lg print:shadow-none print:break-inside-avoid mx-auto overflow-hidden"
            style={{ 
              maxWidth: cardsPerPage <= 2 ? "420px" : "380px", 
              width: "100%", 
              aspectRatio: "1.586/1" 
            }}
          >
            {/* Header Section - Black & White */}
            <div className="bg-gray-100 print:bg-white px-2 py-1 border-b-2 border-black">
              <div className="text-center">
                <p className="text-[7px] sm:text-[8px] font-bold text-black leading-tight">{header.republic}</p>
                <p className="text-[7px] sm:text-[8px] font-bold text-black leading-tight">{header.ministry}</p>
                <p className="text-[6px] sm:text-[7px] font-semibold text-gray-700 print:text-black">{header.direction}</p>
                <p className="text-[10px] sm:text-xs font-black text-black">{settings.schoolName}</p>
              </div>
            </div>

            {/* Title Bar */}
            <div className="bg-gray-200 print:bg-gray-100 py-0.5 border-b-2 border-black">
              <p className="text-center text-[10px] sm:text-xs font-black text-black">بطاقة تعريف مدرسية</p>
            </div>

            {/* Main Content */}
            <div className="flex" style={{ height: "calc(100% - 60px)" }}>
              {/* QR Code Section */}
              <div className="w-[35%] border-l-2 border-black flex flex-col items-center justify-center p-1 bg-gray-50 print:bg-white">
                <div className="p-1 bg-white border-2 border-black">
                  <QRCodeSVG 
                    value={student.studentId} 
                    size={50} 
                    level="H" 
                    includeMargin={false}
                  />
                </div>
                <div className="mt-1 text-center">
                  <p className="text-[6px] sm:text-[7px] font-bold text-gray-600 print:text-black">السنة الدراسية</p>
                  <p className="text-[9px] sm:text-[10px] font-black text-black">{settings.schoolYear}</p>
                </div>
              </div>

              {/* Info Section */}
              <div className="w-[65%] flex flex-col justify-center p-1.5 space-y-0.5">
                <div className="flex items-center justify-between border-b border-black pb-0.5">
                  <span className="font-black text-black text-[10px] sm:text-xs truncate max-w-[100px]">{student.name}</span>
                  <span className="text-[7px] sm:text-[8px] text-gray-700 print:text-black font-semibold">اللقب والاسم:</span>
                </div>
                <div className="flex items-center justify-between border-b border-black pb-0.5">
                  <span className="font-black text-black text-[10px] sm:text-xs">{student.grade}</span>
                  <span className="text-[7px] sm:text-[8px] text-gray-700 print:text-black font-semibold">القسم:</span>
                </div>
                <div className="flex items-center justify-between border-b border-black pb-0.5">
                  <span className="font-bold text-black text-[9px] sm:text-[10px] font-mono">{student.studentId}</span>
                  <span className="text-[7px] sm:text-[8px] text-gray-700 print:text-black font-semibold">رقم التعريف:</span>
                </div>
                {student.gender && (
                  <div className="flex items-center justify-between border-b border-black pb-0.5">
                    <span className="font-bold text-black text-[9px] sm:text-[10px]">{student.gender}</span>
                    <span className="text-[7px] sm:text-[8px] text-gray-700 print:text-black font-semibold">الجنس:</span>
                  </div>
                )}
                {student.status && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black text-[9px] sm:text-[10px]">{student.status}</span>
                    <span className="text-[7px] sm:text-[8px] text-gray-700 print:text-black font-semibold">الصفة:</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          #cards-container, 
          #cards-container * {
            visibility: visible;
          }
          
          #cards-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 3mm;
            padding: 2mm;
          }
          
          #cards-container > div {
            max-width: 95mm !important;
            height: 60mm !important;
            border-width: 1px !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            break-inside: avoid;
            background: white !important;
          }
          
          /* Force black and white */
          #cards-container * {
            color: black !important;
            border-color: black !important;
          }
          
          #cards-container .bg-gray-100,
          #cards-container .bg-gray-200,
          #cards-container .bg-gray-50 {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AllStudentCards;
