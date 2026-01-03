import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Search, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday';
  working_hours: number;
  profile?: {
    full_name: string;
    email: string;
    employee_id: string;
    avatar_url: string | null;
  };
}

const AdminAttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const fetchAttendance = async () => {
    const { data: attendanceData, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', dateFilter)
      .order('check_in', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      return;
    }

    // Fetch profiles for each attendance record
    const userIds = [...new Set(attendanceData?.map(a => a.user_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, employee_id, avatar_url')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    const recordsWithProfiles = attendanceData?.map(a => ({
      ...a,
      profile: profileMap.get(a.user_id),
    })) || [];

    setAttendance(recordsWithProfiles as AttendanceRecord[]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-success text-success-foreground">Present</Badge>;
      case 'absent':
        return <Badge className="bg-destructive text-destructive-foreground">Absent</Badge>;
      case 'half_day':
        return <Badge className="bg-warning text-warning-foreground">Half Day</Badge>;
      case 'leave':
        return <Badge className="bg-info text-info-foreground">Leave</Badge>;
      case 'holiday':
        return <Badge variant="secondary">Holiday</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch =
      record.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.profile?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">View and manage employee attendance</p>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-48"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-card">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Attendance for {format(new Date(dateFilter), 'MMMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={record.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {record.profile?.full_name ? getInitials(record.profile.full_name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.profile?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{record.profile?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.profile?.employee_id}</TableCell>
                      <TableCell>
                        {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '-'}
                      </TableCell>
                      <TableCell>{record.working_hours?.toFixed(1) || '0'} hrs</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No attendance records found for this date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendancePage;
