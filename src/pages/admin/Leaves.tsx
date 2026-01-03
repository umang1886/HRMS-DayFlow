import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ClipboardCheck, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: 'paid' | 'sick' | 'unpaid';
  from_date: string;
  to_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment: string | null;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
    employee_id: string;
    avatar_url: string | null;
  };
}

const AdminLeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const { data: leavesData, error } = await supabase
      .from('leaves')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leaves:', error);
      return;
    }

    const userIds = [...new Set(leavesData?.map(l => l.user_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, employee_id, avatar_url')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    const leavesWithProfiles = leavesData?.map(l => ({
      ...l,
      profile: profileMap.get(l.user_id),
    })) || [];

    setLeaves(leavesWithProfiles as LeaveRequest[]);
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
        return <Badge variant="outline" className="border-success text-success">Paid</Badge>;
      case 'sick':
        return <Badge variant="outline" className="border-warning text-warning">Sick</Badge>;
      default:
        return <Badge variant="outline" className="border-info text-info">Unpaid</Badge>;
    }
  };

  const handleAction = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setAdminComment('');
    setIsDialogOpen(true);
  };

  const sendToWebhook = async (leave: LeaveRequest, status: string, comment: string) => {
    try {
      const payload = {
        employee_id: leave.profile?.employee_id,
        name: leave.profile?.full_name,
        email: leave.profile?.email,
        leave_type: leave.leave_type,
        from_date: leave.from_date,
        to_date: leave.to_date,
        status: status,
        admin_comment: comment,
      };

      await fetch('https://ansh336.app.n8n.cloud/webhook/3794fde4-b67c-46fe-9e64-cf1c5e82b2ce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Webhook error:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedLeave || !user) return;
    setLoading(true);

    const { error } = await supabase
      .from('leaves')
      .update({
        status: 'approved',
        admin_comment: adminComment.trim() || null,
        approved_by: user.id,
      })
      .eq('id', selectedLeave.id);

    if (error) {
      toast.error('Failed to approve leave');
      console.error(error);
      setLoading(false);
      return;
    }

    // Mark attendance as leave for the leave period
    const fromDate = new Date(selectedLeave.from_date);
    const toDate = new Date(selectedLeave.to_date);
    const dates: string[] = [];
    
    for (let d = fromDate; d <= toDate; d.setDate(d.getDate() + 1)) {
      dates.push(format(new Date(d), 'yyyy-MM-dd'));
    }

    for (const date of dates) {
      await supabase
        .from('attendance')
        .upsert({
          user_id: selectedLeave.user_id,
          date: date,
          status: 'leave',
        }, { onConflict: 'user_id,date' });
    }

    await sendToWebhook(selectedLeave, 'approved', adminComment);

    toast.success('Leave approved successfully!');
    setLoading(false);
    setIsDialogOpen(false);
    fetchLeaves();
  };

  const handleReject = async () => {
    if (!selectedLeave || !user) return;
    setLoading(true);

    const { error } = await supabase
      .from('leaves')
      .update({
        status: 'rejected',
        admin_comment: adminComment.trim() || null,
        approved_by: user.id,
      })
      .eq('id', selectedLeave.id);

    if (error) {
      toast.error('Failed to reject leave');
      console.error(error);
      setLoading(false);
      return;
    }

    await sendToWebhook(selectedLeave, 'rejected', adminComment);

    toast.success('Leave rejected');
    setLoading(false);
    setIsDialogOpen(false);
    fetchLeaves();
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const processedLeaves = leaves.filter((l) => l.status !== 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leave Approval</h1>
        <p className="text-muted-foreground mt-1">Review and manage leave requests</p>
      </div>

      {/* Pending Leaves */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-warning" />
            Pending Requests ({pendingLeaves.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={leave.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {leave.profile?.full_name ? getInitials(leave.profile.full_name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{leave.profile?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{leave.profile?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getLeaveTypeBadge(leave.leave_type)}</TableCell>
                      <TableCell>{format(new Date(leave.from_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.to_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(leave)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No pending leave requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Leaves */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Processed Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processedLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedLeaves.slice(0, 10).map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={leave.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {leave.profile?.full_name ? getInitials(leave.profile.full_name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{leave.profile?.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getLeaveTypeBadge(leave.leave_type)}</TableCell>
                      <TableCell>{format(new Date(leave.from_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.to_date), 'MMM dd, yyyy')}</TableCell>
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
            <p className="text-center text-muted-foreground py-8">No processed requests yet</p>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedLeave.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedLeave.profile?.full_name ? getInitials(selectedLeave.profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">{selectedLeave.profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedLeave.profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Leave Type</p>
                  <p className="font-medium capitalize">{selectedLeave.leave_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {format(new Date(selectedLeave.from_date), 'MMM dd')} - {format(new Date(selectedLeave.to_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-1">Reason</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedLeave.reason}</p>
              </div>

              <div className="space-y-2">
                <Label>Admin Comment (optional)</Label>
                <Textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Add a comment for the employee..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeavesPage;
