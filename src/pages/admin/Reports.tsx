import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Download, Users, Calendar, FileText, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const AdminReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    averageAttendance: 0,
    totalLeaves: 0,
    totalPayroll: 0,
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  const fetchReportData = async () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    // Fetch employees count
    const { count: employeeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'employee')
      .eq('is_active', true);

    // Fetch attendance data
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status, date')
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'));

    if (attendance) {
      const statusCounts = attendance.reduce((acc: Record<string, number>, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});

      setAttendanceData([
        { name: 'Present', value: statusCounts['present'] || 0, color: '#22c55e' },
        { name: 'Absent', value: statusCounts['absent'] || 0, color: '#ef4444' },
        { name: 'Half Day', value: statusCounts['half_day'] || 0, color: '#f59e0b' },
        { name: 'Leave', value: statusCounts['leave'] || 0, color: '#0ea5e9' },
      ]);
    }

    // Fetch leave data
    const { data: leaves } = await supabase
      .from('leaves')
      .select('leave_type, status');

    if (leaves) {
      const typeCounts = leaves.reduce((acc: Record<string, number>, l) => {
        acc[l.leave_type] = (acc[l.leave_type] || 0) + 1;
        return acc;
      }, {});

      setLeaveData([
        { name: 'Paid', value: typeCounts['paid'] || 0 },
        { name: 'Sick', value: typeCounts['sick'] || 0 },
        { name: 'Unpaid', value: typeCounts['unpaid'] || 0 },
      ]);
    }

    // Fetch payroll data for last 6 months
    const { data: payroll } = await supabase
      .from('payroll')
      .select('month, year, net_salary')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(100);

    if (payroll) {
      const monthlyPayroll: Record<string, number> = {};
      payroll.forEach((p) => {
        const key = `${p.year}-${String(p.month).padStart(2, '0')}`;
        monthlyPayroll[key] = (monthlyPayroll[key] || 0) + Number(p.net_salary);
      });

      const chartData = Object.entries(monthlyPayroll)
        .slice(0, 6)
        .reverse()
        .map(([key, value]) => ({
          month: format(new Date(key + '-01'), 'MMM yy'),
          amount: value,
        }));

      setPayrollData(chartData);
    }

    // Calculate stats
    const presentCount = attendance?.filter((a) => a.status === 'present' || a.status === 'half_day').length || 0;
    const totalDays = attendance?.length || 1;
    const avgAttendance = Math.round((presentCount / totalDays) * 100);

    const totalPayrollAmount = payroll?.reduce((sum, p) => sum + Number(p.net_salary), 0) || 0;

    setStats({
      totalEmployees: employeeCount || 0,
      averageAttendance: avgAttendance,
      totalLeaves: leaves?.length || 0,
      totalPayroll: totalPayrollAmount,
    });
  };

  const handleExport = (type: string) => {
    let data: string[][] = [];
    let filename = '';

    if (type === 'attendance') {
      data = [
        ['Status', 'Count'],
        ...attendanceData.map((a) => [a.name, a.value.toString()]),
      ];
      filename = `attendance_report_${selectedMonth}.csv`;
    } else if (type === 'leaves') {
      data = [
        ['Leave Type', 'Count'],
        ...leaveData.map((l) => [l.name, l.value.toString()]),
      ];
      filename = 'leaves_report.csv';
    } else if (type === 'payroll') {
      data = [
        ['Month', 'Total Amount'],
        ...payrollData.map((p) => [p.month, p.amount.toString()]),
      ];
      filename = 'payroll_report.csv';
    }

    const csv = data.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Company-wide reports and insights</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLeaves}</p>
                <p className="text-sm text-muted-foreground">Total Leaves</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{(stats.totalPayroll / 100000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Report */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Attendance Analytics
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleExport('attendance')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Report */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Leave Analytics
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExport('leaves')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveData}>
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

        {/* Payroll Report */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Payroll Trend
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExport('payroll')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(142, 71%, 45%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142, 71%, 45%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReportsPage;
