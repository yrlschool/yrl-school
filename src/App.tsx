import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ScanQR from "./pages/ScanQR";
import Students from "./pages/Students";
import StudentForm from "./pages/StudentForm";
import StudentCard from "./pages/StudentCard";
import AllStudentCards from "./pages/AllStudentCards";
import Attendance from "./pages/Attendance";
import Absence from "./pages/Absence";
import Database from "./pages/Database";
import Archives from "./pages/Archives";
import Share from "./pages/Share";
import Statistics from "./pages/Statistics";
import InstallApp from "./pages/InstallApp";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/SplashScreen";
import { checkAndCreateDailyArchive } from "./lib/storage";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check and create daily archive on app load
    checkAndCreateDailyArchive();
    
    // Check if splash was already shown this session
    const splashShown = sessionStorage.getItem("splashShown");
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("splashShown", "true");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scan" element={<ScanQR />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/add" element={<StudentForm />} />
              <Route path="/students/edit/:id" element={<StudentForm />} />
              <Route path="/students/card/:id" element={<StudentCard />} />
              <Route path="/students/print-all" element={<AllStudentCards />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/absence" element={<Absence />} />
              <Route path="/database" element={<Database />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/share" element={<Share />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/install" element={<InstallApp />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
