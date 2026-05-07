'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Users,
  BarChart3,
  CheckCircle,
  TrendingUp,
  Award,
  Map,
  LogOut
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access the admin panel.
          </p>
          <button
            onClick={() => router.push('/officer')}
            className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
          >
            Switch to Officer View
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'All Reports', href: '/admin/reports', icon: FileText },
    { label: 'Risk Assessments', href: '/admin/risk-assessments', icon: AlertTriangle },
    { label: 'Corrective Actions', href: '/admin/actions', icon: CheckCircle },
    { label: 'Personnel', href: '/admin/personnel', icon: Users }, 
    { label: 'User Management', href: '/admin/user-management', icon: Users }, 
    { label: 'Analysis', href: '/admin/analysis', icon: BarChart3 },
    { label: 'Performance', href: '/admin/performance', icon: TrendingUp },
    { label: 'Training', href: '/admin/training', icon: Award },
    { label: 'Map', href: '/admin/map', icon: Map },
  ];

  return (
    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-72 bg-primary text-white flex flex-col shadow-xl">

        <div className="px-6 py-5 border-b border-white/10">
          <div className="py-6">
            <div className="text-center text-[12px]">
              <span className="text-lg ">🛡️</span>
              <span className="text-base font-semibold text-white leading-none">
                MS Safety
              </span>
            </div>
            <p className="text-[11px] text-center text-gray-300 leading-tight mt-1">
              HSE Management System
            </p>

          </div>
        </div>

        {/* ===== NAVIGATION ===== */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 transition ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ===== USER + LOGOUT (IMPROVED) ===== */}
        <div className="p-4 border-t border-white/10">

          {/* USER CARD */}
          <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-2xl mb-3">

            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
              👨‍💼
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex items-center justify-center gap-2 px-1 py-2.5 rounded-xl
              text-sm font-medium
              text-red-300 hover:text-red-400
              hover:bg-white/10 transition"
            >

              Logout
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}