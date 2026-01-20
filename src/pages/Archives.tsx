import { useState, useEffect } from "react";
import { Archive, Download, Trash2, RotateCcw, Database, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getArchives, createArchive, restoreFromArchive, deleteArchive, Archive as ArchiveType } from "@/lib/storage";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";

export default function Archives() {
  const [archives, setArchives] = useState<ArchiveType[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveType | null>(null);

  const loadArchives = () => {
    const loadedArchives = getArchives().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setArchives(loadedArchives);
  };

  useEffect(() => {
    loadArchives();
  }, []);

  const handleCreateArchive = () => {
    try {
      const archive = createArchive();
      loadArchives();
      toast.success("تم إنشاء نسخة احتياطية بنجاح");
    } catch (error) {
      toast.error("حدث خطأ في إنشاء النسخة الاحتياطية");
    }
  };

  const handleRestore = () => {
    if (!selectedArchive) return;
    
    try {
      const success = restoreFromArchive(selectedArchive.id);
      if (success) {
        toast.success("تم استرجاع البيانات بنجاح");
        setRestoreDialogOpen(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("فشل استرجاع البيانات");
      }
    } catch (error) {
      toast.error("حدث خطأ في استرجاع البيانات");
    }
  };

  const handleDelete = () => {
    if (!selectedArchive) return;
    
    try {
      deleteArchive(selectedArchive.id);
      loadArchives();
      toast.success("تم حذف النسخة الاحتياطية");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("حدث خطأ في حذف النسخة الاحتياطية");
    }
  };

  const handleDownload = (archive: ArchiveType) => {
    try {
      const dataStr = JSON.stringify(archive.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `archive-${archive.date}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("تم تنزيل النسخة الاحتياطية");
    } catch (error) {
      toast.error("حدث خطأ في التنزيل");
    }
  };

  const handleShare = async (archive: ArchiveType) => {
    try {
      const dataStr = JSON.stringify(archive.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const file = new File([blob], `archive-${archive.date}.json`, {
        type: "application/json",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `نسخة احتياطية - ${archive.date}`,
          text: "نسخة احتياطية من قاعدة بيانات الحضور",
        });
        toast.success("تم مشاركة النسخة الاحتياطية");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(dataStr);
        toast.success("تم نسخ البيانات إلى الحافظة");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("حدث خطأ في المشاركة");
      }
    }
  };

  const formatDateTime = (timestamp: string) => {
    return format(new Date(timestamp), "PPpp", { locale: ar });
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">أرشيف النسخ الاحتياطية</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              يتم إنشاء نسخة احتياطية تلقائيًا عند دخول الموقع يوميًا
            </p>
          </div>
        </div>
        <Button onClick={handleCreateArchive} className="gradient-primary w-full sm:w-auto gap-2 h-11">
          <Database className="h-4 w-4" />
          إنشاء نسخة احتياطية الآن
        </Button>
      </motion.div>

      {/* Archives List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-lg">النسخ الاحتياطية المحفوظة</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              آخر 30 نسخة احتياطية محفوظة محليًا
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4">
            {archives.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Archive className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm sm:text-base">لا توجد نسخ احتياطية محفوظة بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {archives.map((archive, index) => (
                  <motion.div
                    key={archive.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col gap-3 p-3 sm:p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                  >
                    {/* Archive Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-bold text-sm sm:text-base">{archive.date}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                          {formatDateTime(archive.timestamp)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">{archive.data.students.length} طالب</span>
                        <span className="bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full whitespace-nowrap">{archive.data.attendance.length} سجل</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(archive)}
                        className="h-10 gap-1.5 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                      >
                        <Download className="h-4 w-4" />
                        <span>تنزيل</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(archive)}
                        className="h-10 gap-1.5 text-xs sm:text-sm hover:bg-success/10 hover:text-success hover:border-success/30 transition-all"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>مشاركة</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedArchive(archive);
                          setRestoreDialogOpen(true);
                        }}
                        className="h-10 gap-1.5 text-xs sm:text-sm hover:bg-accent/20 hover:text-accent-foreground hover:border-accent/30 transition-all"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>استرجاع</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedArchive(archive);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-10 gap-1.5 text-xs sm:text-sm text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>حذف</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-muted/30 border-primary/20">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <span className="text-primary">💡</span>
              ملاحظات هامة
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <p>• يتم إنشاء نسخة احتياطية تلقائيًا عند فتح التطبيق مرة واحدة يوميًا</p>
            <p>• يتم الاحتفاظ بآخر 30 نسخة احتياطية فقط</p>
            <p>• النسخ الاحتياطية محفوظة محليًا على جهازك</p>
            <p>• يمكنك إنشاء نسخة احتياطية يدويًا في أي وقت</p>
            <p className="text-destructive font-medium">⚠️ تأكد من تنزيل نسخة احتياطية قبل مسح بيانات المتصفح</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>استرجاع النسخة الاحتياطية</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من استرجاع هذه النسخة الاحتياطية؟
              <br />
              سيتم استبدال جميع البيانات الحالية بالبيانات من تاريخ{" "}
              <strong>{selectedArchive?.date}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="flex-1 sm:flex-none">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} className="flex-1 sm:flex-none">
              استرجاع
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف النسخة الاحتياطية</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف النسخة الاحتياطية من تاريخ{" "}
              <strong>{selectedArchive?.date}</strong>؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="flex-1 sm:flex-none">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 sm:flex-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}