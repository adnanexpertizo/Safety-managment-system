'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export default function OfficerLayout({ children }) {
  const { user, loginAsAdmin, logout } = useUser();
  const router = useRouter();

  if (!user || user.role !== 'OFFICER') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-[20px] font-bold text-foreground mb-6">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access the officer panel.
          </p>
          <button
            onClick={() => {
              loginAsAdmin();
              router.push('/admin');
            }}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-90 text-[15px]"
          >
            Switch to Admin
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', href: '/officer', icon: '📊' },
    { label: 'My Reports', href: '/officer/reports', icon: '📋' },
    { label: 'My Risk Assessments', href: '/officer/risk-assessments', icon: '⚠️' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border overflow-y-auto">
        <div className="p-6">
          <h1 className="text-[18px] font-bold text-foreground mb-2">Safety MS</h1>
          <p className="text-[13px] text-muted-foreground">Officer Dashboard</p>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-md text-[15px] text-foreground hover:bg-muted transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 w-64">
          <div className="mb-4">
            <p className="text-[13px] font-medium text-foreground">{user.name}</p>
            <p className="text-[12px] text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full px-3 py-2 bg-muted text-foreground rounded-md hover:bg-opacity-80 text-[13px] font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
