import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Upload, CheckCircle, AlertCircle, FileKey, Lock, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  getSchoolSettings, 
  importActivationFile, 
  isActivated,
  isLicenseExpired,
  getDaysUntilExpiry,
  hasActivationData,
  SchoolSettings,
  defaultSettings
} from "@/lib/schoolSettings";

const Settings = () => {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
  const [activated, setActivated] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [expired, setExpired] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const loadedSettings = getSchoolSettings();
    setSettings(loadedSettings);
    setActivated(isActivated());
    setHasData(hasActivationData());
    setExpired(isLicenseExpired());
    setDaysLeft(getDaysUntilExpiry());
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json') && !file.name.endsWith('.yrl')) {
      toast.error("يرجى رفع ملف بتنسيق .json أو .yrl");
      return;
    }

    try {
      const content = await file.text();
      const newSettings = importActivationFile(content);
      setSettings(newSettings);
      setActivated(isActivated());
      setHasData(hasActivationData());
      setExpired(isLicenseExpired());
      setDaysLeft(getDaysUntilExpiry());
      
      if (isLicenseExpired()) {
        toast.error("ملف التفعيل منتهي الصلاحية!");
      } else {
        toast.success("تم تفعيل التطبيق بنجاح!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطأ في قراءة الملف");
    }

    // Reset input
    event.target.value = "";
  };

  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusCard = () => {
    if (expired) {
      return (
        <Card className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-400">الترخيص منتهي الصلاحية</p>
              <p className="text-sm text-red-600 dark:text-red-500">
                انتهت صلاحية الترخيص في {settings.expiryDate && formatExpiryDate(settings.expiryDate)}
              </p>
              <p className="text-xs text-red-500 mt-1">تواصل مع المطور لتجديد الترخيص</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activated) {
      const isExpiringSoon = daysLeft !== null && daysLeft <= 30;
      return (
        <Card className={isExpiringSoon 
          ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" 
          : "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
        }>
          <CardContent className="flex items-center gap-4 py-4">
            {isExpiringSoon ? (
              <Clock className="w-8 h-8 text-amber-600" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${isExpiringSoon ? 'text-amber-800 dark:text-amber-400' : 'text-green-800 dark:text-green-400'}`}>
                التطبيق مفعّل
              </p>
              <p className={`text-sm ${isExpiringSoon ? 'text-amber-600 dark:text-amber-500' : 'text-green-600 dark:text-green-500'}`}>
                {settings.schoolName} - {settings.wilaya}
              </p>
              {daysLeft !== null && (
                <p className={`text-xs mt-1 ${isExpiringSoon ? 'text-amber-500' : 'text-green-500'}`}>
                  {isExpiringSoon 
                    ? `⚠️ متبقي ${daysLeft} يوم على انتهاء الصلاحية`
                    : `✓ صالح حتى ${settings.expiryDate && formatExpiryDate(settings.expiryDate)}`
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="flex items-center gap-4 py-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-400">التطبيق غير مفعّل</p>
            <p className="text-sm text-amber-600 dark:text-amber-500">تواصل مع المطور للحصول على ملف التفعيل</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            تفعيل التطبيق وإعدادات المؤسسة
          </p>
        </div>
      </motion.div>

      {/* Activation Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {getStatusCard()}
      </motion.div>

      {/* Activation File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileKey className="w-5 h-5" />
              ملف التفعيل
            </CardTitle>
            <CardDescription>
              {expired 
                ? "قم برفع ملف تفعيل جديد لتجديد الترخيص"
                : "قم برفع ملف التفعيل الذي حصلت عليه من المطور"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".json,.yrl"
                onChange={handleFileUpload}
                className="hidden"
                id="activation-file"
              />
              <label htmlFor="activation-file" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium text-foreground">
                  {expired ? "رفع ملف تفعيل جديد" : "اضغط لرفع ملف التفعيل"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">يدعم ملفات .yrl و .json</p>
              </label>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Settings (Read Only) */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={expired ? "opacity-75" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5" />
                بيانات المؤسسة
              </CardTitle>
              <CardDescription>
                البيانات المسجلة في ملف التفعيل
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-semibold text-foreground">{settings.schoolName}</span>
                  <span className="text-sm text-muted-foreground">اسم المؤسسة</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-semibold text-foreground">{settings.wilaya}</span>
                  <span className="text-sm text-muted-foreground">الولاية</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-semibold text-foreground">{settings.commune}</span>
                  <span className="text-sm text-muted-foreground">البلدية</span>
                </div>
                {settings.directionName && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="font-semibold text-foreground">{settings.directionName}</span>
                    <span className="text-sm text-muted-foreground">مديرية التربية</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-semibold text-foreground">{settings.schoolYear}</span>
                  <span className="text-sm text-muted-foreground">السنة الدراسية</span>
                </div>
                {settings.expiryDate && (
                  <div className="flex justify-between items-center py-2">
                    <span className={`font-semibold ${expired ? 'text-red-600' : 'text-foreground'}`}>
                      {formatExpiryDate(settings.expiryDate)}
                    </span>
                    <span className="text-sm text-muted-foreground">تاريخ انتهاء الصلاحية</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contact Developer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-muted/30">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              {expired 
                ? "لتجديد الترخيص، تواصل مع المطور"
                : "للحصول على ملف التفعيل، تواصل مع المطور"
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              حاج جيلاني يونس
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;
