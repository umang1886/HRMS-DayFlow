import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, FileText, Clock, UserPlus, ClipboardCheck, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayAttendance: 0,
    totalLeaveRequests: 0,
    pendingLeaves: 0,
  });
  const [attendanceByStatus, setAttendanceByStatus] = useState<{ name: string; value: number; color: string }[]>([]);
  const [leavesByType, setLeavesByType] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // Fetch total employees
    const { count: employeeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'employee')
      .eq('is_active', true);

    // Fetch today's attendance
    const { count: todayAttendance } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .in('status', ['present', 'half_day']);

    // Fetch leave requests
    const { data: leaves } = await supabase
      .from('leaves')
      .select('*');

    const pendingLeaves = leaves?.filter((l) => l.status === 'pending').length || 0;

    setStats({
      totalEmployees: employeeCount || 0,
      todayAttendance: todayAttendance || 0,
      totalLeaveRequests: leaves?.length || 0,
      pendingLeaves,
    });

    // Fetch attendance stats for chart
    const { data: monthlyAttendance } = await supabase
      .from('attendance')
      .select('status')
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'));

    if (monthlyAttendance) {
      const statusCounts = monthlyAttendance.reduce((acc: Record<string, number>, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});

      setAttendanceByStatus([
        { name: 'Present', value: statusCounts['present'] || 0, color: 'hsl(142, 71%, 45%)' },
        { name: 'Absent', value: statusCounts['absent'] || 0, color: 'hsl(0, 84%, 60%)' },
        { name: 'Half Day', value: statusCounts['half_day'] || 0, color: 'hsl(38, 92%, 50%)' },
        { name: 'Leave', value: statusCounts['leave'] || 0, color: 'hsl(199, 89%, 48%)' },
      ]);
    }

    // Fetch leaves by type
    if (leaves) {
      const typeCounts = leaves.reduce((acc: Record<string, number>, l) => {
        acc[l.leave_type] = (acc[l.leave_type] || 0) + 1;
        return acc;
      }, {});

      setLeavesByType([
        { name: 'Paid', value: typeCounts['paid'] || 0 },
        { name: 'Sick', value: typeCounts['sick'] || 0 },
        { name: 'Unpaid', value: typeCounts['unpaid'] || 0 },
      ]);
    }
  };

  const quickAccessItems = [
    { icon: UserPlus, label: 'Add Employee', path: '/admin/employees', color: 'text-primary' },
    { icon: Calendar, label: 'View Attendance', path: '/admin/attendance', color: 'text-success' },
    { icon: ClipboardCheck, label: 'Approve Leaves', path: '/admin/leaves', color: 'text-warning' },
    { icon: DollarSign, label: 'Manage Payroll', path: '/admin/payroll', color: 'text-info' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {profile?.full_name?.split(' ')[0]}! Here's your HR overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle="active employees"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          subtitle="checked in"
          icon={Calendar}
          variant="success"
        />
        <StatCard
          title="Leave Requests"
          value={stats.totalLeaveRequests}
          subtitle="total requests"
          icon={FileText}
          variant="info"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingLeaves}
          subtitle="awaiting action"
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Quick Access */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickAccessItems.map((item) => (
              <Button
                key={item.path}
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 card-hover"
                onClick={() => navigate(item.path)}
              >
                <item.icon className={`w-8 h-8 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Monthly Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {attendanceByStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaves Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Leave Requests by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leavesByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(226, 71%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
