'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import PageTransition from '@/components/PageTransition';
import {
  LayoutDashboard, FileText, AlertTriangle, Users,
  BarChart3, TrendingUp, Award, Map, LogOut, Menu, X, ShieldAlert,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'User Management', href: '/admin/user-management', icon: Users },
  { label: 'All Reports', href: '/admin/reports', icon: FileText },
  { label: 'Risk Assessments', href: '/admin/risk-assessments', icon: AlertTriangle },
  { label: 'Performance', href: '/admin/performance', icon: TrendingUp },
  { label: 'Training', href: '/admin/training', icon: Award },
  { label: 'Analysis', href: '/admin/analysis', icon: BarChart3 },
  { label: 'Map', href: '/admin/map', icon: Map },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert size={26} className="text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Access Denied</h1>
          <p className="text-sm text-gray-500">You do not have permission to access the admin panel.</p>
          <button
            onClick={() => router.push('/officer')}
            className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition"
          >
            Switch to Officer View
          </button>
        </div>
      </div>
    );
  }

  const isActive = (href) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/');

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-56 sm:w-60
        bg-gradient-to-b from-slate-900 to-slate-800
        text-white flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-lg">🛡️</div>
            <div>
              <p className="font-bold text-sm leading-none text-white">MS Safety</p>
              <p className="text-[10px] text-slate-400 mt-0.5">HSE Management</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Navigation</p>
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'
                  }
                `}
              >
                <item.icon size={16} className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="text-[13px]">{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/10 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/5">
            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-red-500/15 hover:text-red-200 transition"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-5 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-800 hidden sm:block">Health & Safety Record System</p>
              <p className="text-xs text-gray-400 hidden sm:block">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Online indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700">Live</span>
            </div>

            {/* User pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-default">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                <p className="text-[10px] text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 lg:p-6">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}