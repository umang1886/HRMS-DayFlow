import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  User,
  Users,
  ClipboardCheck,
  DollarSign,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { profile, role, signOut } = useAuth();
  const location = useLocation();

  const employeeMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Attendance', path: '/attendance' },
    { icon: FileText, label: 'Leave Management', path: '/leaves' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: User, label: 'My Profile', path: '/profile' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Employees', path: '/admin/employees' },
    { icon: Calendar, label: 'Attendance', path: '/admin/attendance' },
    { icon: ClipboardCheck, label: 'Leave Approval', path: '/admin/leaves' },
    { icon: DollarSign, label: 'Payroll', path: '/admin/payroll' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : employeeMenuItems;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        'h-screen gradient-sidebar flex flex-col transition-all duration-300 shadow-sidebar relative',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-md">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-sidebar-foreground">Dayflow</h1>
              <p className="text-xs text-sidebar-foreground/70">HRMS</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className={cn(
        'p-4 border-b border-sidebar-border',
        collapsed ? 'flex justify-center' : ''
      )}>
        <div className={cn('flex items-center gap-3', collapsed && 'flex-col')}>
          <Avatar className="h-10 w-10 border-2 border-sidebar-primary">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
              {profile?.full_name ? getInitials(profile.full_name) : 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">
                {role || 'Employee'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium animate-fade-in">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            'w-full text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10',
            collapsed ? 'px-2 justify-center' : 'justify-start'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
        </Button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary text-primary-foreground rounded-full shadow-md flex items-center justify-center hover:bg-accent transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
