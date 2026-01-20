import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Instagram, Code, Heart, Settings } from "lucide-react";
import { SCHOOL_NAME, APP_NAME, APP_VERSION, DEVELOPER_NAME } from "@/lib/config";
const About = () => {
  return <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">من نحن</h2>
        <p className="text-muted-foreground">معلومات عن المطور والبرنامج</p>
      </div>

      <Card className="gradient-primary text-primary-foreground overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent" />
          <CardTitle className="flex items-center justify-center gap-2 text-2xl relative z-10">
            <Code className="w-6 h-6" />
            {APP_NAME}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 relative">
          <p className="text-2xl font-bold opacity-95">
            نظام تسجيل الحضور بـ QR Code
          </p>
          <p className="text-lg opacity-90">
            {SCHOOL_NAME}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <span>صُنع بـ</span>
            <Heart className="w-4 h-4 fill-current animate-pulse" />
            <span>في الجزائر</span>
          </div>
        </CardContent>
      </Card>

      {/* كيفية تغيير اسم المدرسة */}
      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
        
        
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">المطور</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {DEVELOPER_NAME}
            </h3>
            <p className="text-muted-foreground">
              مطور برمجيات | مهتم بالتقنيات الحديثة وتطوير التطبيقات
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <a href="https://instagram.com/younesaot" target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full h-auto py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" size="lg">
                <Instagram className="w-6 h-6" />
                <div className="text-right">
                  <div className="font-bold">Instagram</div>
                  <div className="text-sm opacity-90">@younesaot</div>
                </div>
              </Button>
            </a>

            <a href="https://github.com/younesaot" target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full h-auto py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white" size="lg">
                <Github className="w-6 h-6" />
                <div className="text-right">
                  <div className="font-bold">GitHub</div>
                  <div className="text-sm opacity-90">younesaot</div>
                </div>
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مميزات البرنامج</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>تسجيل حضور وغياب التلاميذ بسرعة باستخدام رموز QR</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>إدارة شاملة لبيانات التلاميذ مع إمكانية الإضافة اليدوية</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>طباعة بطاقات احترافية للتلاميذ وتصديرها PDF</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>استيراد بيانات التلاميذ من ملفات Excel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>إحصائيات مفصلة بالرسوم البيانية</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>تصدير واستيراد قاعدة البيانات</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>يعمل بدون إنترنت كتطبيق PWA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>واجهة عربية بالكامل وسهلة الاستخدام</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            الإصدار {APP_VERSION}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            تم التطوير باستخدام React, TypeScript, Tailwind CSS
          </p>
        </CardContent>
      </Card>
    </div>;
};
export default About;