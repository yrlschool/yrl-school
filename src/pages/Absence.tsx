import { useState, useEffect } from "react";
import { FileX, Download, Printer, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStudents, getAttendanceRecords } from "@/lib/storage";
import { Student } from "@/types/student";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { getDocumentHeader } from "@/lib/schoolSettings";

const Absence = () => {
  const header = getDocumentHeader();
  const [absentStudents, setAbsentStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadAbsentStudents();
  }, [selectedDate]);

  const loadAbsentStudents = () => {
    const allStudents = getStudents();
    const allAttendanceRecords = getAttendanceRecords();
    
    const attendanceForDate = allAttendanceRecords.filter(
      record => record.date === selectedDate
    );
    
    const attendedIds = new Set(attendanceForDate.map(record => record.studentId));
    const absent = allStudents.filter(student => !attendedIds.has(student.studentId));
    
    setAbsentStudents(absent);
  };

  const filteredAbsent = absentStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    const headerRows = [
      [header.republic],
      [header.ministry],
      [""],
      [header.direction, "", "", "", header.school],
      [""],
      [`سجل الغياب - ${new Date(selectedDate).toLocaleDateString("ar-DZ")}`],
      [""],
      ["الرقم", "الاسم", "الرقم التعريفي", "الصف", "الجنس", "الصفة"],
    ];
    
    const studentRows = filteredAbsent.map((student, index) => [
      index + 1,
      student.name,
      student.studentId,
      student.grade,
      student.gender || "",
      student.status || "",
    ]);
    
    const allRows = [...headerRows, ...studentRows];
    
    XLSX.utils.sheet_add_aoa(ws, allRows, { origin: "A1" });
    
    ws["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
    ];
    
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
      { s: { r: 3, c: 3 }, e: { r: 3, c: 5 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } },
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "الغياب");
    XLSX.writeFile(wb, `سجل_الغياب_${selectedDate}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <FileX className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">سجل الغياب</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              التلاميذ الغائبون ({filteredAbsent.length})
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportExcel} variant="outline" size="sm" className="flex-1 sm:flex-none h-10">
            <Download className="w-4 h-4 ml-2" />
            <span className="text-xs sm:text-sm">تصدير Excel</span>
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1 sm:flex-none h-10">
            <Printer className="w-4 h-4 ml-2" />
            <span className="text-xs sm:text-sm">طباعة</span>
          </Button>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="no-print">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <FileX className="w-4 h-4 sm:w-5 sm:h-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                  البحث
                </label>
                <Input
                  placeholder="ابحث بالاسم، الرقم التعريفي، أو الصف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                  التاريخ
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredAbsent.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <FileX className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                {searchQuery ? "لا توجد نتائج" : "لا يوجد غياب"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "حاول تغيير معايير البحث"
                  : "جميع التلاميذ حضروا في هذا اليوم"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                التلاميذ الغائبون - {new Date(selectedDate).toLocaleDateString("ar-DZ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4">
              <div className="space-y-2 sm:space-y-3">
                {filteredAbsent.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-xl hover:bg-accent/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs sm:text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">{student.name}</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                          <span>الرقم: {student.studentId}</span>
                          <span>الصف: {student.grade}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left hidden sm:block">
                      {student.gender && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          الجنس: {student.gender}
                        </p>
                      )}
                      {student.status && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          الصفة: {student.status}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: white;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Absence;
