import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const EmployeeDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [attendanceData, setAttendanceData] = useState<{ date: string; hours: number }[]>([]);
  const [leaveStats, setLeaveStats] = useState({
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [monthlyAttendance, setMonthlyAttendance] = useState(0);
  const [monthlyLeaves, setMonthlyLeaves] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Fetch attendance data
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user?.id)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'));

    if (attendance) {
      const chartData = attendance.map((a) => ({
        date: format(new Date(a.date), 'MMM dd'),
        hours: Number(a.working_hours) || 0,
      }));
      setAttendanceData(chartData);
      setMonthlyAttendance(attendance.filter((a) => a.status === 'present' || a.status === 'half_day').length);
    }

    // Fetch leave stats
    const { data: leaves } = await supabase
      .from('leaves')
      .select('*')
      .eq('user_id', user?.id);

    if (leaves) {
      const approved = leaves.filter((l) => l.status === 'approved').length;
      const rejected = leaves.filter((l) => l.status === 'rejected').length;
      const pending = leaves.filter((l) => l.status === 'pending').length;
      
      setLeaveStats({ approved, rejected, pending });
      
      const monthlyLeaveCount = leaves.filter((l) => {
        const fromDate = new Date(l.from_date);
        return fromDate >= monthStart && fromDate <= monthEnd;
      }).length;
      setMonthlyLeaves(monthlyLeaveCount);
    }
  };

  const leaveChartData = [
    { name: 'Approved', value: leaveStats.approved, color: 'hsl(142, 71%, 45%)' },
    { name: 'Rejected', value: leaveStats.rejected, color: 'hsl(0, 84%, 60%)' },
    { name: 'Pending', value: leaveStats.pending, color: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Employee'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your overview for {format(new Date(), 'MMMM yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Attendance"
          value={monthlyAttendance}
          subtitle="days present"
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Leave Days"
          value={monthlyLeaves}
          subtitle="this month"
          icon={FileText}
          variant="info"
        />
        <StatCard
          title="Salary"
          value={`₹${(profile?.salary || 0).toLocaleString()}`}
          subtitle="monthly"
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Pending Leaves"
          value={leaveStats.pending}
          subtitle="awaiting approval"
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Working Hours Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(226, 71%, 40%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(226, 71%, 40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
                  <XAxis dataKey="date" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                  <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(220, 13%, 87%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(226, 71%, 40%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leave Stats Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Leave Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {leaveStats.approved + leaveStats.rejected + leaveStats.pending > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leaveChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leaveChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: '1px solid hsl(220, 13%, 87%)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No leave data available</p>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {leaveChartData.map((item) => (
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
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{leaveStats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved Leaves</p>
            </div>
          </div>
        </Card>

        <Card className="shadow-card p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{leaveStats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected Leaves</p>
            </div>
          </div>
        </Card>

        <Card className="shadow-card p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{leaveStats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Leaves</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
