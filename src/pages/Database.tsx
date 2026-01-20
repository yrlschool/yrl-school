import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, Database as DatabaseIcon, AlertCircle, FileSpreadsheet, Share2 } from "lucide-react";
import { exportDatabase, importDatabase, clearAllData, getStudents, getAttendanceRecords, importStudentsFromExcel } from "@/lib/storage";
import { DatabaseExportSchema, parseAndValidateJSON } from "@/lib/validation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Database = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير قاعدة البيانات بنجاح");
    } catch (error) {
      toast.error("فشل تصدير قاعدة البيانات");
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      const data = exportDatabase();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const file = new File([blob], `attendance-backup-${new Date().toISOString().split("T")[0]}.json`, {
        type: "application/json",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "نسخة احتياطية - قاعدة البيانات",
          text: "قاعدة بيانات الحضور",
        });
        toast.success("تم مشاركة الملف بنجاح");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(jsonString);
        toast.success("تم نسخ البيانات إلى الحافظة");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("فشل مشاركة الملف");
        console.error(error);
      }
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = parseAndValidateJSON(content, DatabaseExportSchema);
        
        importDatabase(data);
        toast.success("تم استيراد قاعدة البيانات بنجاح");
        window.location.reload();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "فشل استيراد البيانات - تأكد من صحة الملف");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    clearAllData();
    toast.success("تم حذف جميع البيانات");
    window.location.reload();
  };

  const handleImportExcel = () => {
    excelInputRef.current?.click();
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const students = jsonData.map((row: any) => ({
          name: row["الاسم"] || row["name"] || row["Name"],
          studentId: String(row["الرقم التعريفي"] || row["studentId"] || row["StudentID"] || row["ID"]),
          grade: row["الصف"] || row["grade"] || row["Grade"],
          gender: row["الجنس"] || row["gender"] || row["Gender"] || "",
          status: row["الصفة"] || row["status"] || row["Status"] || "",
        }));

        const importedCount = importStudentsFromExcel(students);
        
        if (importedCount > 0) {
          toast.success(`تم استيراد ${importedCount} تلميذ بنجاح`);
          window.location.reload();
        } else {
          toast.info("جميع التلاميذ موجودون مسبقاً");
        }
      } catch (error) {
        toast.error("فشل استيراد ملف Excel - تأكد من صحة البيانات");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const students = getStudents();
  const records = getAttendanceRecords();
  
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter(record => record.date === today);
  const presentStudentIds = new Set(todayRecords.map(record => record.studentId));
  const absentCount = students.length - presentStudentIds.size;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <DatabaseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-foreground">إدارة قاعدة البيانات</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">نقل البيانات وإدارة النسخ الاحتياطية</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6"
      >
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <DatabaseIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{students.length}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">تلميذ مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <DatabaseIcon className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{records.length}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">سجل حضور</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{absentCount}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">غائب اليوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <DatabaseIcon className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{((students.length + records.length) * 0.5).toFixed(1)} KB</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">حجم البيانات</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Import/Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-lg">تصدير واستيراد البيانات</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Export Section */}
              <div className="p-4 sm:p-6 border-2 border-primary/20 rounded-xl space-y-3 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base">تصدير ومشاركة</h4>
                    <p className="text-xs text-muted-foreground">احفظ أو شارك البيانات</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleExport} className="gradient-primary h-10 text-xs sm:text-sm">
                    <Download className="w-4 h-4 ml-1.5" />
                    تصدير
                  </Button>
                  <Button onClick={handleShare} variant="outline" className="h-10 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                    <Share2 className="w-4 h-4 ml-1.5" />
                    مشاركة
                  </Button>
                </div>
              </div>

              {/* Import Section */}
              <div className="p-4 sm:p-6 border-2 border-success/20 rounded-xl space-y-3 hover:border-success/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base">استيراد البيانات</h4>
                    <p className="text-xs text-muted-foreground">استعد نسخة احتياطية</p>
                  </div>
                </div>
                <Button onClick={handleImport} variant="outline" className="w-full h-10 text-xs sm:text-sm hover:bg-success/10 hover:text-success hover:border-success/30">
                  <Upload className="w-4 h-4 ml-1.5" />
                  استيراد قاعدة البيانات
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Excel Import */}
              <div className="p-4 sm:p-6 border-2 border-accent/20 rounded-xl space-y-3 hover:border-accent/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base">استيراد من Excel</h4>
                    <p className="text-xs text-muted-foreground">أضف تلاميذ من ملف Excel</p>
                  </div>
                </div>
                <Button onClick={handleImportExcel} variant="outline" className="w-full h-10 text-xs sm:text-sm hover:bg-accent/10 hover:text-accent hover:border-accent/30">
                  <FileSpreadsheet className="w-4 h-4 ml-1.5" />
                  استيراد من Excel
                </Button>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelFileChange}
                  className="hidden"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  الأعمدة: الاسم، الرقم التعريفي، الصف، الجنس، الصفة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-destructive/50">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-destructive flex items-center gap-2 text-sm sm:text-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              المنطقة الخطرة
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              احذر! حذف جميع البيانات سيؤدي إلى فقدان جميع معلومات التلاميذ وسجلات الحضور بشكل نهائي.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto h-10">
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف جميع البيانات
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف جميع بيانات التلاميذ وسجلات الحضور نهائياً. هذا الإجراء لا يمكن التراجع عنه!
                    <br />
                    <br />
                    تأكد من تصدير نسخة احتياطية قبل المتابعة.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-2 sm:gap-0">
                  <AlertDialogCancel className="flex-1 sm:flex-none">إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="flex-1 sm:flex-none bg-destructive hover:bg-destructive/90">
                    نعم، احذف كل شيء
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-sm sm:text-base">نصائح هامة:</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>• احتفظ بنسخ احتياطية دورية من البيانات في مكان آمن</li>
                  <li>• يمكنك نقل ملف JSON إلى أي جهاز آخر واستيراده</li>
                  <li>• البيانات محفوظة محلياً في المتصفح فقط</li>
                  <li>• مسح بيانات المتصفح سيؤدي إلى فقدان البيانات</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Database;