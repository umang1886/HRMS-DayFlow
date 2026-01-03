import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeaveRecord {
  id: string;
  leave_type: 'paid' | 'sick' | 'unpaid';
  from_date: string;
  to_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment: string | null;
  created_at: string;
}

const LeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState<'paid' | 'sick' | 'unpaid'>('paid');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    const { data, error } = await supabase
      .from('leaves')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leaves:', error);
      return;
    }

    setLeaves(data as LeaveRecord[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate || !reason.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error('From date cannot be after To date');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('leaves').insert({
      user_id: user?.id,
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      reason: reason.trim(),
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to submit leave request');
      console.error(error);
      return;
    }

    toast.success('Leave request submitted successfully!');
    setShowForm(false);
    setLeaveType('paid');
    setFromDate('');
    setToDate('');
    setReason('');
    fetchLeaves();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="status-approved">Approved</Badge>;
      case 'rejected':
        return <Badge className="status-rejected">Rejected</Badge>;
      default:
        return <Badge className="status-pending">Pending</Badge>;
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'paid':
        return <Badge variant="outline" className="border-success text-success">Paid Leave</Badge>;
      case 'sick':
        return <Badge variant="outline" className="border-warning text-warning">Sick Leave</Badge>;
      default:
        return <Badge variant="outline" className="border-info text-info">Unpaid Leave</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Apply and track your leave requests</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <Card className="shadow-card animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Apply for Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={leaveType} onValueChange={(v) => setLeaveType(v as 'paid' | 'sick' | 'unpaid')}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      <SelectItem value="paid">Paid Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-date">From Date</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-date">To Date</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    min={fromDate || format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for your leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="gradient-primary">
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leave History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Leave History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaves.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{getLeaveTypeBadge(leave.leave_type)}</TableCell>
                      <TableCell>{format(new Date(leave.from_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.to_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {leave.admin_comment || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No leave requests yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeavesPage;
