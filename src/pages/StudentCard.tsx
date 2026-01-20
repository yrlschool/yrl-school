import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Printer, Download, FileText } from "lucide-react";
import { getStudentById } from "@/lib/storage";
import { Student } from "@/types/student";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { getSchoolSettings, getDocumentHeader } from "@/lib/schoolSettings";

const StudentCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const settings = getSchoolSettings();
  const header = getDocumentHeader();

  useEffect(() => {
    if (id) {
      const foundStudent = getStudentById(id);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        toast.error("التلميذ غير موجود");
        navigate("/students");
      }
    }
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const svg = cardRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${student?.studentId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast.success("تم تحميل رمز QR");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleExportPDF = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const card = cardRef.current;
      
      const scale = 3;
      canvas.width = card.offsetWidth * scale;
      canvas.height = card.offsetHeight * scale;
      
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const html = card.outerHTML;
        const blob = new Blob([`
          <svg xmlns="http://www.w3.org/2000/svg" width="${card.offsetWidth}" height="${card.offsetHeight}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                ${html}
              </div>
            </foreignObject>
          </svg>
        `], { type: "image/svg+xml" });
        
        const url = URL.createObjectURL(blob);
        const img = new Image();
        
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL("image/png", 1.0);
          
          const link = document.createElement("a");
          link.download = `بطاقة-${student?.name}-${student?.studentId}.png`;
          link.href = pngUrl;
          link.click();
          
          URL.revokeObjectURL(url);
          toast.success("تم تصدير البطاقة بنجاح");
        };
        
        img.src = url;
      }
    } catch (error) {
      toast.info("استخدم زر الطباعة لحفظ كـ PDF");
      window.print();
    }
  };

  if (!student) return null;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={() => navigate("/students")} className="shrink-0">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">بطاقة التلميذ</h2>
            <p className="text-sm text-muted-foreground truncate">{student.name}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Button variant="outline" onClick={handleDownloadQR} className="flex-1 sm:flex-none text-sm">
            <Download className="w-4 h-4 ml-2" />
            QR
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="flex-1 sm:flex-none text-sm">
            <FileText className="w-4 h-4 ml-2" />
            صورة
          </Button>
          <Button onClick={handlePrint} className="gradient-primary flex-1 sm:flex-none text-sm">
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Card Container - Print Optimized - Black & White */}
      <div className="flex justify-center print:block" id="student-card-container">
        <div
          ref={cardRef}
          id="student-card"
          className="w-full bg-white border-[2px] border-black shadow-xl print:shadow-none overflow-hidden"
          style={{ maxWidth: "420px", aspectRatio: "1.586/1" }}
        >
          {/* Header Section - Black & White for Print */}
          <div className="bg-gray-100 print:bg-white px-3 py-1.5 border-b-2 border-black">
            <div className="text-center">
              <p className="text-[8px] sm:text-[9px] font-bold text-black leading-tight">{header.republic}</p>
              <p className="text-[8px] sm:text-[9px] font-bold text-black leading-tight">{header.ministry}</p>
              <p className="text-[7px] sm:text-[8px] font-semibold text-gray-700 print:text-black">{header.direction}</p>
              <p className="text-xs sm:text-sm font-black text-black mt-0.5">{settings.schoolName}</p>
            </div>
          </div>

          {/* Title Bar */}
          <div className="bg-gray-200 print:bg-gray-100 py-0.5 border-b-2 border-black">
            <p className="text-center text-xs sm:text-sm font-black text-black">بطاقة تعريف مدرسية</p>
          </div>

          {/* Main Content */}
          <div className="flex" style={{ height: "calc(100% - 70px)" }}>
            {/* QR Code Section */}
            <div className="w-[35%] border-l-2 border-black flex flex-col items-center justify-center p-1.5 bg-gray-50 print:bg-white">
              <div className="p-1 bg-white border-2 border-black">
                <QRCodeSVG 
                  value={student.studentId} 
                  size={60} 
                  level="H" 
                  includeMargin={false}
                  className="w-[55px] h-[55px] sm:w-[65px] sm:h-[65px]"
                />
              </div>
              <div className="mt-1 text-center">
                <p className="text-[7px] sm:text-[8px] font-bold text-gray-600 print:text-black">السنة الدراسية</p>
                <p className="text-[10px] sm:text-xs font-black text-black">{settings.schoolYear}</p>
              </div>
            </div>

            {/* Info Section */}
            <div className="w-[65%] flex flex-col justify-center p-2 space-y-1">
              <div className="flex items-center justify-between border-b border-black pb-0.5">
                <span className="font-black text-black text-xs sm:text-sm truncate max-w-[120px]">{student.name}</span>
                <span className="text-[8px] sm:text-[9px] text-gray-700 print:text-black font-semibold whitespace-nowrap">اللقب والاسم:</span>
              </div>
              <div className="flex items-center justify-between border-b border-black pb-0.5">
                <span className="font-black text-black text-xs sm:text-sm">{student.grade}</span>
                <span className="text-[8px] sm:text-[9px] text-gray-700 print:text-black font-semibold">القسم:</span>
              </div>
              <div className="flex items-center justify-between border-b border-black pb-0.5">
                <span className="font-bold text-black text-[10px] sm:text-xs font-mono">{student.studentId}</span>
                <span className="text-[8px] sm:text-[9px] text-gray-700 print:text-black font-semibold">رقم التعريف:</span>
              </div>
              {student.gender && (
                <div className="flex items-center justify-between border-b border-black pb-0.5">
                  <span className="font-bold text-black text-[10px] sm:text-xs">{student.gender}</span>
                  <span className="text-[8px] sm:text-[9px] text-gray-700 print:text-black font-semibold">الجنس:</span>
                </div>
              )}
              {student.status && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black text-[10px] sm:text-xs">{student.status}</span>
                  <span className="text-[8px] sm:text-[9px] text-gray-700 print:text-black font-semibold">الصفة:</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: 86mm 54mm;
            margin: 0;
          }
          
          html, body {
            width: 86mm;
            height: 54mm;
            margin: 0;
            padding: 0;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          #student-card-container,
          #student-card,
          #student-card * {
            visibility: visible;
          }
          
          #student-card-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            justify-content: center;
          }
          
          #student-card {
            width: 86mm !important;
            max-width: 86mm !important;
            height: 54mm !important;
            border-width: 1px !important;
            box-shadow: none !important;
            background: white !important;
          }
          
          /* Force black and white */
          #student-card * {
            color: black !important;
            background-color: white !important;
            border-color: black !important;
          }
          
          #student-card .bg-gray-100,
          #student-card .bg-gray-200,
          #student-card .bg-gray-50 {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentCard;
