import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  QrCode, 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Database, 
  Archive, 
  Share2, 
  Info,
  FileX,
  Menu,
  X,
  MessageCircle,
  Settings
} from "lucide-react";
import { getSchoolSettings } from "@/lib/schoolSettings";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("مدرسة");

  useEffect(() => {
    const settings = getSchoolSettings();
    setSchoolName(settings.schoolName);
  }, [location.pathname]);
  
  const navItems = [{
    path: "/",
    icon: Home,
    label: "الرئيسية"
  }, {
    path: "/scan",
    icon: QrCode,
    label: "مسح QR"
  }, {
    path: "/students",
    icon: Users,
    label: "التلاميذ"
  }, {
    path: "/attendance",
    icon: FileText,
    label: "سجل الحضور"
  }, {
    path: "/absence",
    icon: FileX,
    label: "سجل الغياب"
  }, {
    path: "/statistics",
    icon: BarChart3,
    label: "الإحصائيات"
  }, {
    path: "/database",
    icon: Database,
    label: "قاعدة البيانات"
  }, {
    path: "/archives",
    icon: Archive,
    label: "الأرشيف"
  }, {
    path: "/share",
    icon: Share2,
    label: "مشاركة"
  }, {
    path: "/settings",
    icon: Settings,
    label: "الإعدادات"
  }, {
    path: "/contact",
    icon: MessageCircle,
    label: "تواصل معنا"
  }, {
    path: "/about",
    icon: Info,
    label: "من نحن"
  }];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* App Header */}
      <header className="border-b border-border glass shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-foreground leading-tight">{schoolName}</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">نظام تسجيل الحضور</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden p-2 rounded-lg bg-muted/50 text-foreground">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-72 bg-background border-l border-border shadow-xl">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold">{schoolName}</h2>
                  <p className="text-xs text-muted-foreground">القائمة الرئيسية</p>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden sm:flex">
        <aside className="fixed right-0 top-[65px] h-[calc(100vh-65px)] w-64 bg-background/95 backdrop-blur border-l border-border overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content with sidebar offset */}
        <main className="mr-64 flex-1 p-4 pb-20">
          {children}
        </main>
      </div>

      {/* Mobile content */}
      <main className="sm:hidden p-3 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 glass border-t border-border z-30">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
