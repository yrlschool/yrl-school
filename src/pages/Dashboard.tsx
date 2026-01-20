import { useEffect, useState } from "react";
import { Users, CheckCircle, Calendar, TrendingUp, QrCode, Smartphone } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStudents, getTodayAttendance, getAttendanceRecords } from "@/lib/storage";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "react-router-dom";
import LicenseWarning from "@/components/LicenseWarning";
const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const students = getStudents();
    const today = getTodayAttendance();
    const allRecords = getAttendanceRecords();

    setTotalStudents(students.length);
    setTodayAttendance(today.length);
    setTotalRecords(allRecords.length);
    setRecentAttendance(allRecords.slice(-5).reverse());
  };

  const attendanceRate = totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* License Warning */}
      <LicenseWarning />

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">لوحة التحكم</h2>
        <p className="text-sm sm:text-base text-muted-foreground">نظرة عامة على نظام تسجيل الحضور</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="إجمالي التلاميذ" value={totalStudents} icon={Users} variant="primary" />
        <StatCard title="حضور اليوم" value={todayAttendance} icon={CheckCircle} variant="success" />
        <StatCard title="نسبة الحضور" value={`${attendanceRate}%`} icon={TrendingUp} />
        <StatCard title="إجمالي السجلات" value={totalRecords} icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              ثبّت التطبيق على هاتفك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              استخدم التطبيق بدون إنترنت واحصل على تجربة أفضل
            </p>
            <Link to="/install">
              <Button className="w-full gradient-primary" size="lg">
                <Smartphone className="ml-2 h-5 w-5" />
                تثبيت التطبيق
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">آخر عمليات التسجيل</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
              <div className="space-y-2">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm sm:text-base">{record.studentName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(record.timestamp), "dd MMM yyyy - hh:mm a", { locale: ar })}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد سجلات حضور بعد</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">معلومات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">امسح رمز QR</p>
                    <p className="text-xs text-muted-foreground">لتسجيل الحضور</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">إدارة التلاميذ</p>
                    <p className="text-xs text-muted-foreground">أضف وعدّل البيانات</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">تقارير مفصلة</p>
                    <p className="text-xs text-muted-foreground">سجل الحضور الكامل</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
