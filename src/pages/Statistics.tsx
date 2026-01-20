import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, CheckCircle, XCircle, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStudents, getAttendanceRecords } from "@/lib/storage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from "date-fns";
import { ar } from "date-fns/locale";

const Statistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttendance: 0,
    averageAttendance: 0,
    todayAttendance: 0,
    todayAbsence: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    const students = getStudents();
    const attendance = getAttendanceRecords();
    const today = new Date().toISOString().split("T")[0];
    
    const todayRecords = attendance.filter(r => r.date === today);
    const todayAttendance = todayRecords.length;
    const todayAbsence = students.length - todayAttendance;

    // Calculate average attendance rate
    const uniqueDates = [...new Set(attendance.map(r => r.date))];
    const avgAttendance = uniqueDates.length > 0 
      ? Math.round((attendance.length / (uniqueDates.length * students.length)) * 100)
      : 0;

    setStats({
      totalStudents: students.length,
      totalAttendance: attendance.length,
      averageAttendance: avgAttendance || 0,
      todayAttendance,
      todayAbsence: todayAbsence > 0 ? todayAbsence : 0,
    });

    // Weekly data
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 }); // Saturday
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 6 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const weekly = weekDays.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayAttendance = attendance.filter(r => r.date === dateStr).length;
      const dayAbsence = students.length - dayAttendance;
      return {
        day: format(day, "EEEE", { locale: ar }),
        shortDay: format(day, "EEE", { locale: ar }),
        حضور: dayAttendance,
        غياب: dayAbsence > 0 ? dayAbsence : 0,
      };
    });
    setWeeklyData(weekly);

    // Grade distribution
    const gradeGroups: Record<string, { present: number; total: number }> = {};
    students.forEach(student => {
      if (!gradeGroups[student.grade]) {
        gradeGroups[student.grade] = { present: 0, total: 0 };
      }
      gradeGroups[student.grade].total++;
    });
    
    todayRecords.forEach(record => {
      const student = students.find(s => s.studentId === record.studentId);
      if (student && gradeGroups[student.grade]) {
        gradeGroups[student.grade].present++;
      }
    });

    const grades = Object.entries(gradeGroups).map(([grade, data]) => ({
      name: grade,
      حضور: data.present,
      غياب: data.total - data.present,
      total: data.total,
    }));
    setGradeData(grades);

    // Daily trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const trend = last7Days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayAttendance = attendance.filter(r => r.date === dateStr).length;
      const rate = students.length > 0 ? Math.round((dayAttendance / students.length) * 100) : 0;
      return {
        date: format(day, "dd/MM"),
        نسبة: rate,
      };
    });
    setDailyTrend(trend);
  };

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  const pieData = [
    { name: 'حضور', value: stats.todayAttendance, color: '#10b981' },
    { name: 'غياب', value: stats.todayAbsence, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate("/")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">الإحصائيات</h2>
          <p className="text-sm text-muted-foreground">تحليل بيانات الحضور والغياب</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">حضور اليوم</p>
                <p className="text-2xl font-bold">{stats.todayAttendance}</p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">غياب اليوم</p>
                <p className="text-2xl font-bold">{stats.todayAbsence}</p>
              </div>
              <XCircle className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">إجمالي التلاميذ</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">معدل الحضور</p>
                <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              توزيع اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                لا توجد بيانات لليوم
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              نسبة الحضور (آخر 7 أيام)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'نسبة الحضور']} />
                <Line 
                  type="monotone" 
                  dataKey="نسبة" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              إحصائيات الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="shortDay" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="حضور" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="غياب" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        {gradeData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                توزيع الحضور حسب الأقسام (اليوم)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gradeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={12} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="حضور" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="غياب" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Statistics;
