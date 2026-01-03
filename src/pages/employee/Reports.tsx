import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Download, Calendar, FileText, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const ReportsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [payrollData, setPayrollData] = useState<any[]>([]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user, selectedMonth]);

  const fetchReportData = async () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    // Fetch attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user?.id)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    setAttendanceData(attendance || []);

    // Fetch leaves
    const { data: leaves } = await supabase
      .from('leaves')
      .select('*')
      .eq('user_id', user?.id);

    setLeaveData(leaves || []);

    // Fetch payroll
    const { data: payroll } = await supabase
      .from('payroll')
      .select('*')
      .eq('user_id', user?.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(6);

    setPayrollData(payroll || []);
  };

  const attendanceStats = {
    present: attendanceData.filter((a) => a.status === 'present').length,
    absent: attendanceData.filter((a) => a.status === 'absent').length,
    halfDay: attendanceData.filter((a) => a.status === 'half_day').length,
    leave: attendanceData.filter((a) => a.status === 'leave').length,
  };

  const chartData = [
    { name: 'Present', value: attendanceStats.present, fill: 'hsl(142, 71%, 45%)' },
    { name: 'Absent', value: attendanceStats.absent, fill: 'hsl(0, 84%, 60%)' },
    { name: 'Half Day', value: attendanceStats.halfDay, fill: 'hsl(38, 92%, 50%)' },
    { name: 'Leave', value: attendanceStats.leave, fill: 'hsl(199, 89%, 48%)' },
  ];

  const handleExport = (type: string) => {
    let data: string[][] = [];
    let filename = '';

    if (type === 'attendance') {
      data = [
        ['Date', 'Check In', 'Check Out', 'Status', 'Working Hours'],
        ...attendanceData.map((a) => [
          a.date,
          a.check_in ? format(new Date(a.check_in), 'HH:mm') : '-',
          a.check_out ? format(new Date(a.check_out), 'HH:mm') : '-',
          a.status,
          a.working_hours?.toString() || '0',
        ]),
      ];
      filename = `attendance_${selectedMonth}.csv`;
    } else if (type === 'leaves') {
      data = [
        ['Type', 'From', 'To', 'Reason', 'Status'],
        ...leaveData.map((l) => [
          l.leave_type,
          l.from_date,
          l.to_date,
          l.reason,
          l.status,
        ]),
      ];
      filename = 'leaves_report.csv';
    } else if (type === 'salary') {
      data = [
        ['Month', 'Year', 'Basic', 'Deductions', 'Bonuses', 'Net Salary', 'Status'],
        ...payrollData.map((p) => [
          p.month.toString(),
          p.year.toString(),
          p.basic_salary.toString(),
          p.deductions.toString(),
          p.bonuses.toString(),
          p.net_salary.toString(),
          p.status,
        ]),
      ];
      filename = 'salary_report.csv';
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
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">View and download your reports</p>
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

      {/* Attendance Report */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Attendance Report
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleExport('attendance')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">{attendanceStats.present}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <p className="text-2xl font-bold text-destructive">{attendanceStats.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <p className="text-2xl font-bold text-warning">{attendanceStats.halfDay}</p>
              <p className="text-sm text-muted-foreground">Half Day</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-info/10">
              <p className="text-2xl font-bold text-info">{attendanceStats.leave}</p>
              <p className="text-sm text-muted-foreground">Leave</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Report */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Leave Report
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleExport('leaves')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {leaveData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveData.slice(0, 5).map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="capitalize">{leave.leave_type}</TableCell>
                      <TableCell>{format(new Date(leave.from_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.to_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell className="capitalize">{leave.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No leave data available</p>
          )}
        </CardContent>
      </Card>

      {/* Salary Report */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Salary Report
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleExport('salary')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {payrollData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Bonuses</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        {format(new Date(payroll.year, payroll.month - 1), 'MMMM yyyy')}
                      </TableCell>
                      <TableCell>₹{payroll.basic_salary.toLocaleString()}</TableCell>
                      <TableCell className="text-destructive">
                        -₹{payroll.deductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-success">
                        +₹{payroll.bonuses.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{payroll.net_salary.toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">{payroll.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No salary data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
