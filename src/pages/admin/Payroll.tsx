import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Edit, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  employee_id: string;
  salary: number;
  avatar_url: string | null;
}

interface PayrollRecord {
  id: string;
  user_id: string;
  month: number;
  year: number;
  basic_salary: number;
  deductions: number;
  bonuses: number;
  net_salary: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  profile?: Employee;
}

const PayrollPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [editBasicSalary, setEditBasicSalary] = useState('');
  const [editDeductions, setEditDeductions] = useState('0');
  const [editBonuses, setEditBonuses] = useState('0');

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    // Fetch employees
    const { data: empData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .eq('is_active', true);

    setEmployees((empData as Employee[]) || []);

    // Fetch payroll records
    const { data: payrollData } = await supabase
      .from('payroll')
      .select('*')
      .eq('month', selectedMonth)
      .eq('year', selectedYear);

    setPayrollRecords((payrollData as PayrollRecord[]) || []);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditPayroll = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditBasicSalary(employee.salary?.toString() || '0');
    setEditDeductions('0');
    setEditBonuses('0');

    // Check if payroll exists for this month
    const existingPayroll = payrollRecords.find((p) => p.user_id === employee.id);
    if (existingPayroll) {
      setEditBasicSalary(existingPayroll.basic_salary.toString());
      setEditDeductions(existingPayroll.deductions.toString());
      setEditBonuses(existingPayroll.bonuses.toString());
    }

    setIsDialogOpen(true);
  };

  const handleSavePayroll = async () => {
    if (!selectedEmployee) return;
    setLoading(true);

    const basicSalary = parseFloat(editBasicSalary) || 0;
    const deductions = parseFloat(editDeductions) || 0;
    const bonuses = parseFloat(editBonuses) || 0;
    const netSalary = basicSalary - deductions + bonuses;

    const existingPayroll = payrollRecords.find((p) => p.user_id === selectedEmployee.id);

    if (existingPayroll) {
      const { error } = await supabase
        .from('payroll')
        .update({
          basic_salary: basicSalary,
          deductions,
          bonuses,
          net_salary: netSalary,
        })
        .eq('id', existingPayroll.id);

      if (error) {
        toast.error('Failed to update payroll');
        console.error(error);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from('payroll').insert({
        user_id: selectedEmployee.id,
        month: selectedMonth,
        year: selectedYear,
        basic_salary: basicSalary,
        deductions,
        bonuses,
        net_salary: netSalary,
      });

      if (error) {
        toast.error('Failed to create payroll');
        console.error(error);
        setLoading(false);
        return;
      }
    }

    toast.success('Payroll saved successfully!');
    setLoading(false);
    setIsDialogOpen(false);
    fetchData();
  };

  const handleMarkPaid = async (payroll: PayrollRecord) => {
    const { error } = await supabase
      .from('payroll')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payroll.id);

    if (error) {
      toast.error('Failed to mark as paid');
      console.error(error);
      return;
    }

    toast.success('Marked as paid!');
    fetchData();
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
        <p className="text-muted-foreground mt-1">Manage employee salaries and payments</p>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-full sm:w-40 bg-card">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-full sm:w-32 bg-card">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Payroll for {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Bonuses</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const payroll = payrollRecords.find((p) => p.user_id === employee.id);
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={employee.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(employee.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.full_name}</p>
                            <p className="text-sm text-muted-foreground">{employee.employee_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{(payroll?.basic_salary || employee.salary || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-destructive">
                        -₹{(payroll?.deductions || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-success">
                        +₹{(payroll?.bonuses || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{(payroll?.net_salary || employee.salary || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {payroll ? (
                          <Badge variant={payroll.status === 'paid' ? 'default' : 'secondary'}>
                            {payroll.status === 'paid' ? 'Paid' : 'Pending'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Generated</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPayroll(employee)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {payroll && payroll.status !== 'paid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkPaid(payroll)}
                              className="text-success hover:text-success"
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Payroll Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Edit Payroll</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedEmployee.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedEmployee.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">{selectedEmployee.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.employee_id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Basic Salary</Label>
                <Input
                  type="number"
                  value={editBasicSalary}
                  onChange={(e) => setEditBasicSalary(e.target.value)}
                  placeholder="Enter basic salary"
                />
              </div>

              <div className="space-y-2">
                <Label>Deductions</Label>
                <Input
                  type="number"
                  value={editDeductions}
                  onChange={(e) => setEditDeductions(e.target.value)}
                  placeholder="Enter deductions"
                />
              </div>

              <div className="space-y-2">
                <Label>Bonuses</Label>
                <Input
                  type="number"
                  value={editBonuses}
                  onChange={(e) => setEditBonuses(e.target.value)}
                  placeholder="Enter bonuses"
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Net Salary</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{((parseFloat(editBasicSalary) || 0) - (parseFloat(editDeductions) || 0) + (parseFloat(editBonuses) || 0)).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSavePayroll} disabled={loading} className="gradient-primary flex-1">
                  Save Payroll
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollPage;
