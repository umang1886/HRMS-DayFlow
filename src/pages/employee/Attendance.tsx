import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSunday, isToday, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday';
  working_hours: number;
}

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [user, currentMonth]);

  const fetchAttendance = async () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user?.id)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching attendance:', error);
      return;
    }

    const attendanceMap = new Map<string, AttendanceRecord>();
    data?.forEach((record) => {
      attendanceMap.set(record.date, record as AttendanceRecord);
    });
    setAttendance(attendanceMap);

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayAttendance = attendanceMap.get(today);
    setTodayRecord(todayAttendance || null);
    setIsCheckedIn(!!todayAttendance?.check_in && !todayAttendance?.check_out);
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);

    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        user_id: user.id,
        date: today,
        check_in: now,
        status: 'present',
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error('Failed to check in');
      console.error(error);
      return;
    }

    setTodayRecord(data as AttendanceRecord);
    setIsCheckedIn(true);
    toast.success('Checked in successfully!');
    fetchAttendance();
  };

  const handleCheckOut = async () => {
    if (!user || !todayRecord) return;
    setLoading(true);

    const now = new Date();
    const checkInTime = new Date(todayRecord.check_in!);
    const workingHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const status = workingHours < 4 ? 'half_day' : 'present';

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out: now.toISOString(),
        working_hours: Math.round(workingHours * 100) / 100,
        status,
      })
      .eq('id', todayRecord.id)
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error('Failed to check out');
      console.error(error);
      return;
    }

    setTodayRecord(data as AttendanceRecord);
    setIsCheckedIn(false);
    toast.success(`Checked out! Worked ${workingHours.toFixed(1)} hours`);
    fetchAttendance();
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getStatusClass = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = attendance.get(dateStr);

    if (isSunday(date)) return 'calendar-day-sunday';
    if (record) {
      switch (record.status) {
        case 'present':
          return 'calendar-day-present';
        case 'absent':
          return 'calendar-day-absent';
        case 'half_day':
          return 'calendar-day-half-day';
        case 'leave':
          return 'calendar-day-leave';
        case 'holiday':
          return 'calendar-day-holiday';
        default:
          return '';
      }
    }
    if (isBefore(date, new Date()) && !isToday(date) && !isSunday(date)) {
      return 'calendar-day-absent';
    }
    return '';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Track your daily attendance</p>
      </div>

      {/* Check-in/Check-out Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-lg font-medium text-foreground">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
              {todayRecord?.check_in && (
                <p className="text-sm text-muted-foreground mt-1">
                  Checked in at {format(new Date(todayRecord.check_in), 'hh:mm a')}
                  {todayRecord.check_out && (
                    <> • Checked out at {format(new Date(todayRecord.check_out), 'hh:mm a')}</>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {!todayRecord?.check_in ? (
                <Button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="gradient-primary"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              ) : !todayRecord?.check_out ? (
                <Button
                  onClick={handleCheckOut}
                  disabled={loading}
                  variant="destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {todayRecord.working_hours?.toFixed(1)} hours worked
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Monthly Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              >
                Previous
              </Button>
              <span className="text-sm font-medium px-3">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month start */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day" />
            ))}

            {/* Days of the month */}
            {days.map((date) => (
              <div
                key={date.toISOString()}
                className={cn(
                  'calendar-day cursor-pointer',
                  getStatusClass(date),
                  isToday(date) && 'ring-2 ring-primary ring-offset-2'
                )}
                title={format(date, 'MMMM d, yyyy')}
              >
                {format(date, 'd')}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span className="text-sm text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive" />
              <span className="text-sm text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning" />
              <span className="text-sm text-muted-foreground">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-info" />
              <span className="text-sm text-muted-foreground">Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted" />
              <span className="text-sm text-muted-foreground">Sunday/Holiday</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
