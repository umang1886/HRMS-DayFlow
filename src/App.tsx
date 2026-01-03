import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Auth from "./pages/Auth";
import DashboardLayout from "./components/layout/DashboardLayout";
import EmployeeDashboard from "./pages/employee/Dashboard";
import AttendancePage from "./pages/employee/Attendance";
import LeavesPage from "./pages/employee/Leaves";
import ReportsPage from "./pages/employee/Reports";
import ProfilePage from "./pages/employee/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import EmployeesPage from "./pages/admin/Employees";
import AdminAttendancePage from "./pages/admin/Attendance";
import AdminLeavesPage from "./pages/admin/Leaves";
import PayrollPage from "./pages/admin/Payroll";
import AdminReportsPage from "./pages/admin/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RoleRedirect = () => {
  const { role, loading } = useAuth();
  
  if (loading) return null;
  
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<RoleRedirect />} />
            
            {/* Employee Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeavesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeesPage />} />
              <Route path="/admin/attendance" element={<AdminAttendancePage />} />
              <Route path="/admin/leaves" element={<AdminLeavesPage />} />
              <Route path="/admin/payroll" element={<PayrollPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
