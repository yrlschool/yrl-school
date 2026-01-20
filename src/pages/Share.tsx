import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { 
  Upload, Download, Database, Copy, Check, FileJson, 
  Smartphone, Monitor, ArrowLeft, Hash, Keyboard, 
  Wifi, WifiOff, RefreshCw, QrCode, Zap, Clock
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { exportDatabase, importDatabase } from "@/lib/storage";
import { DatabaseExportSchema, parseAndValidateJSON } from "@/lib/validation";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "select" | "export" | "import" | "sync";
type ExportMethod = "qr" | "code" | "file" | "websync";
type ImportMethod = "qr" | "code" | "file" | "websync";

// Generate sync code for P2P transfer
const generateSyncCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Store data temporarily with code
const codeStorage: Record<string, { data: string; timestamp: number }> = {};

// Clean expired codes (older than 10 minutes)
const cleanExpiredCodes = () => {
  const now = Date.now();
  Object.keys(codeStorage).forEach(code => {
    if (now - codeStorage[code].timestamp > 10 * 60 * 1000) {
      delete codeStorage[code];
    }
  });
};

const Share = () => {
  const [mode, setMode] = useState<Mode>("select");
  const [exportMethod, setExportMethod] = useState<ExportMethod | null>(null);
  const [importMethod, setImportMethod] = useState<ImportMethod | null>(null);
  const [exportedData, setExportedData] = useState<string>("");
  const [shortCode, setShortCode] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [syncCode, setSyncCode] = useState<string>("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    cleanExpiredCodes();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isWaiting && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsWaiting(false);
      toast({
        title: "انتهت الصلاحية",
        description: "انتهت صلاحية الرمز، يرجى إنشاء رمز جديد",
        variant: "destructive",
      });
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isWaiting, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExport = () => {
    const data = exportDatabase();
    const jsonString = JSON.stringify(data);
    const compressed = btoa(encodeURIComponent(jsonString));
    setExportedData(compressed);
    
    // Generate short code
    const code = generateSyncCode();
    setShortCode(code.replace('-', ''));
    setSyncCode(code);
    codeStorage[code.replace('-', '')] = { data: compressed, timestamp: Date.now() };
    
    setMode("export");
  };

  const handleWebSync = () => {
    const data = exportDatabase();
    const jsonString = JSON.stringify(data);
    const compressed = btoa(encodeURIComponent(jsonString));
    
    const code = generateSyncCode();
    setSyncCode(code);
    codeStorage[code.replace('-', '')] = { data: compressed, timestamp: Date.now() };
    
    setIsWaiting(true);
    setCountdown(600);
    setExportMethod('websync');
  };

  const handleCopyData = async () => {
    try {
      const data = exportDatabase();
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "تم النسخ",
        description: "تم نسخ البيانات إلى الحافظة",
      });
    } catch {
      toast({
        title: "خطأ",
        description: "فشل في نسخ البيانات",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الرمز",
      });
    } catch {
      toast({
        title: "خطأ",
        description: "فشل في نسخ الرمز",
        variant: "destructive",
      });
    }
  };

  const handleDownloadJson = () => {
    const data = exportDatabase();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "تم التحميل",
      description: "تم تحميل ملف النسخة الاحتياطية",
    });
  };

  const handleQRScan = (result: string) => {
    try {
      const decoded = decodeURIComponent(atob(result));
      const data = parseAndValidateJSON(decoded, DatabaseExportSchema);
      
      importDatabase(data);
      setShowQRScanner(false);
      setMode("select");
      setImportMethod(null);
      
      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${data.students?.length || 0} تلميذ و ${data.attendance?.length || 0} سجل حضور`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في قراءة البيانات من رمز QR",
        variant: "destructive",
      });
    }
  };

  const handleCodeImport = () => {
    const code = inputCode.toUpperCase().replace('-', '').trim();
    const stored = codeStorage[code];
    
    if (!stored) {
      toast({
        title: "خطأ",
        description: "الرمز غير صحيح أو منتهي الصلاحية",
        variant: "destructive",
      });
      return;
    }

    // Check if expired
    if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
      delete codeStorage[code];
      toast({
        title: "خطأ",
        description: "انتهت صلاحية الرمز",
        variant: "destructive",
      });
      return;
    }

    try {
      const decoded = decodeURIComponent(atob(stored.data));
      const data = parseAndValidateJSON(decoded, DatabaseExportSchema);
      
      importDatabase(data);
      delete codeStorage[code]; // Remove after use
      setMode("select");
      setImportMethod(null);
      setInputCode("");
      
      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${data.students?.length || 0} تلميذ و ${data.attendance?.length || 0} سجل حضور`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في استيراد البيانات",
        variant: "destructive",
      });
    }
  };

  const handlePasteImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = parseAndValidateJSON(text, DatabaseExportSchema);
      
      importDatabase(data);
      setMode("select");
      setImportMethod(null);
      
      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${data.students?.length || 0} تلميذ و ${data.attendance?.length || 0} سجل حضور`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في قراءة البيانات من الحافظة",
        variant: "destructive",
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = parseAndValidateJSON(content, DatabaseExportSchema);
        
        importDatabase(data);
        setMode("select");
        setImportMethod(null);
        
        toast({
          title: "تم الاستيراد بنجاح",
          description: `تم استيراد ${data.students?.length || 0} تلميذ و ${data.attendance?.length || 0} سجل حضور`,
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: error instanceof Error ? error.message : "الملف غير صالح",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const resetState = () => {
    setMode("select");
    setExportMethod(null);
    setImportMethod(null);
    setShowQRScanner(false);
    setInputCode("");
    setIsWaiting(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Select Mode
  if (mode === "select") {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">مشاركة البيانات</h2>
          <p className="text-sm text-muted-foreground">نقل قاعدة البيانات بين الأجهزة</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Export Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:scale-[1.02] bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden group"
              onClick={handleExport}
            >
              <CardHeader className="text-center pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">تصدير البيانات</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  أرسل البيانات لجهاز آخر
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium">
                  <Monitor className="w-4 h-4" />
                  <span>من هذا الجهاز</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Import Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-accent/50 hover:scale-[1.02] bg-gradient-to-br from-card via-card to-accent/5 overflow-hidden group"
              onClick={() => setMode("import")}
            >
              <CardHeader className="text-center pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mx-auto w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">استيراد البيانات</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  استقبل البيانات من جهاز آخر
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-accent font-medium">
                  <Smartphone className="w-4 h-4" />
                  <span>إلى هذا الجهاز</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
            onClick={handleDownloadJson}
          >
            <FileJson className="w-6 h-6 text-primary" />
            <span className="text-xs">نسخة احتياطية</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2 hover:bg-success/5 hover:border-success/30"
            onClick={handleCopyData}
          >
            <Copy className="w-6 h-6 text-success" />
            <span className="text-xs">نسخ البيانات</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2 hover:bg-accent/5 hover:border-accent/30"
            onClick={handlePasteImport}
          >
            <Keyboard className="w-6 h-6 text-accent" />
            <span className="text-xs">لصق من الحافظة</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2 hover:bg-warning/5 hover:border-warning/30 relative overflow-hidden"
            onClick={handleWebSync}
          >
            <Zap className="w-6 h-6 text-warning" />
            <span className="text-xs">مزامنة سريعة</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-dashed">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">طريقة النقل الذكية</h3>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">من الهاتف للكمبيوتر:</strong> اضغط تصدير ← رمز قصير، ثم أدخل الرمز في الكمبيوتر
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong className="text-foreground">من الكمبيوتر للهاتف:</strong> اضغط تصدير ← QR، ثم امسح من الهاتف
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Export Mode
  if (mode === "export") {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button variant="ghost" size="icon" onClick={resetState} className="hover:bg-primary/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">تصدير البيانات</h2>
            <p className="text-sm text-muted-foreground">اختر طريقة الإرسال</p>
          </div>
        </motion.div>

        <div className="grid gap-3">
          {/* QR Code Method - For PC to Phone */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card 
              className={`cursor-pointer transition-all ${exportMethod === 'qr' ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'hover:border-primary/30'}`} 
              onClick={() => setExportMethod(exportMethod === 'qr' ? null : 'qr')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">رمز QR</h3>
                    <p className="text-xs text-muted-foreground">امسح من الهاتف</p>
                  </div>
                  <span className="text-xs gradient-primary text-white px-3 py-1.5 rounded-full font-medium">كمبيوتر ← هاتف</span>
                </div>
                <AnimatePresence>
                  {exportMethod === 'qr' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t overflow-hidden"
                    >
                      <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-2xl shadow-inner border-2 border-muted">
                          <QRCodeSVG value={exportedData} size={200} level="L" />
                        </div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        امسح هذا الرمز من تطبيق الهاتف
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Short Code Method - For Phone to PC */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card 
              className={`cursor-pointer transition-all ${exportMethod === 'code' ? 'border-accent shadow-lg ring-2 ring-accent/20' : 'hover:border-accent/30'}`} 
              onClick={() => setExportMethod(exportMethod === 'code' ? null : 'code')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-md">
                    <Hash className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">رمز قصير</h3>
                    <p className="text-xs text-muted-foreground">أدخله في الكمبيوتر</p>
                  </div>
                  <span className="text-xs gradient-accent text-white px-3 py-1.5 rounded-full font-medium">هاتف ← كمبيوتر</span>
                </div>
                <AnimatePresence>
                  {exportMethod === 'code' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t overflow-hidden"
                    >
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">أدخل هذا الرمز في الكمبيوتر:</p>
                        <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-5 mb-4 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-primary/10" />
                          <p className="text-4xl font-mono font-black tracking-[0.4em] text-foreground relative">{syncCode}</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" onClick={() => handleCopyCode(syncCode)} className="gap-2">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            نسخ الرمز
                          </Button>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>صالح لمدة 10 دقائق</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* WebSync Method */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card 
              className={`cursor-pointer transition-all ${exportMethod === 'websync' ? 'border-warning shadow-lg ring-2 ring-warning/20' : 'hover:border-warning/30'}`} 
              onClick={() => {
                if (exportMethod !== 'websync') {
                  handleWebSync();
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center shadow-md">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">مزامنة سريعة</h3>
                    <p className="text-xs text-muted-foreground">نقل فوري بين الأجهزة</p>
                  </div>
                  <span className="text-xs gradient-warning text-white px-3 py-1.5 rounded-full font-medium">
                    <Wifi className="w-3 h-3 inline ml-1" />
                    محلي
                  </span>
                </div>
                <AnimatePresence>
                  {exportMethod === 'websync' && isWaiting && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t overflow-hidden"
                    >
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-3">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshCw className="w-6 h-6 text-warning" />
                          </motion.div>
                          <span className="text-lg font-bold text-foreground">في انتظار الجهاز الآخر...</span>
                        </div>
                        <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-5 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-warning/10 via-transparent to-warning/10" />
                          <p className="text-3xl font-mono font-black tracking-[0.3em] text-foreground relative">{syncCode}</p>
                        </div>
                        <Button variant="outline" onClick={() => handleCopyCode(syncCode)} className="gap-2">
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          نسخ الرمز
                        </Button>
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-warning" />
                          <span className="font-mono font-bold text-warning">{formatTime(countdown)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* File Method */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card 
              className={`cursor-pointer transition-all ${exportMethod === 'file' ? 'border-success shadow-lg ring-2 ring-success/20' : 'hover:border-success/30'}`} 
              onClick={() => setExportMethod(exportMethod === 'file' ? null : 'file')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center shadow-md">
                    <FileJson className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">ملف JSON</h3>
                    <p className="text-xs text-muted-foreground">للنسخ الاحتياطي</p>
                  </div>
                </div>
                <AnimatePresence>
                  {exportMethod === 'file' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t space-y-2 overflow-hidden"
                    >
                      <Button onClick={handleDownloadJson} className="w-full gradient-success border-0 hover:opacity-90">
                        <FileJson className="w-4 h-4 ml-2" />
                        تحميل ملف JSON
                      </Button>
                      <Button onClick={handleCopyData} variant="outline" className="w-full">
                        {copied ? <Check className="w-4 h-4 ml-2" /> : <Copy className="w-4 h-4 ml-2" />}
                        نسخ البيانات للحافظة
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Import Mode
  if (mode === "import") {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button variant="ghost" size="icon" onClick={resetState} className="hover:bg-accent/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">استيراد البيانات</h2>
            <p className="text-sm text-muted-foreground">اختر طريقة الاستقبال</p>
          </div>
        </motion.div>

        {showQRScanner ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  مسح رمز QR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border-4 border-primary/20">
                  <Scanner
                    onScan={(result) => {
                      if (result?.[0]?.rawValue) {
                        handleQRScan(result[0].rawValue);
                      }
                    }}
                    onError={(error) => console.error(error)}
                  />
                </div>
                <Button variant="outline" onClick={() => setShowQRScanner(false)} className="w-full mt-4">
                  إلغاء
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            {/* QR Scan Method */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card 
                className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-md"
                onClick={() => setShowQRScanner(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">مسح رمز QR</h3>
                      <p className="text-xs text-muted-foreground">من شاشة الكمبيوتر</p>
                    </div>
                    <span className="text-xs gradient-primary text-white px-3 py-1.5 rounded-full font-medium">كمبيوتر ← هاتف</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Code Input Method */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card 
                className={`cursor-pointer transition-all ${importMethod === 'code' ? 'border-accent shadow-lg ring-2 ring-accent/20' : 'hover:border-accent/30'}`}
                onClick={() => setImportMethod(importMethod === 'code' ? null : 'code')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-md">
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">إدخال الرمز</h3>
                      <p className="text-xs text-muted-foreground">من الهاتف</p>
                    </div>
                    <span className="text-xs gradient-accent text-white px-3 py-1.5 rounded-full font-medium">هاتف ← كمبيوتر</span>
                  </div>
                  <AnimatePresence>
                    {importMethod === 'code' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-4">
                          <Input
                            placeholder="أدخل الرمز هنا (مثال: ABCD-1234)"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            className="text-center text-2xl font-mono tracking-widest h-14 border-2"
                            maxLength={9}
                          />
                          <Button onClick={handleCodeImport} className="w-full gradient-accent border-0 hover:opacity-90" disabled={inputCode.length < 6}>
                            <Download className="w-4 h-4 ml-2" />
                            استيراد البيانات
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Paste from Clipboard */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card 
                className="cursor-pointer transition-all hover:border-warning/30 hover:shadow-md"
                onClick={handlePasteImport}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center shadow-md">
                      <Keyboard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">لصق من الحافظة</h3>
                      <p className="text-xs text-muted-foreground">إذا نسخت البيانات مسبقاً</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* File Upload Method */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card 
                className={`cursor-pointer transition-all ${importMethod === 'file' ? 'border-success shadow-lg ring-2 ring-success/20' : 'hover:border-success/30'}`}
                onClick={() => setImportMethod(importMethod === 'file' ? null : 'file')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center shadow-md">
                      <FileJson className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">ملف JSON</h3>
                      <p className="text-xs text-muted-foreground">من نسخة احتياطية</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {importMethod === 'file' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="block">
                          <div className="border-2 border-dashed border-success/30 rounded-xl p-6 text-center cursor-pointer hover:bg-success/5 transition-colors">
                            <Upload className="w-8 h-8 mx-auto text-success mb-2" />
                            <p className="text-sm text-muted-foreground">اضغط لاختيار الملف</p>
                            <p className="text-xs text-muted-foreground mt-1">JSON فقط</p>
                          </div>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileImport}
                            className="hidden"
                          />
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Share;
