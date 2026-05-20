'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import PageTransition from '@/components/PageTransition';
import {
  LayoutDashboard, FileText, AlertTriangle,
  BarChart3, TrendingUp, LogOut, Menu, X, ShieldAlert,
  ClipboardCheck, GraduationCap, Wrench, Bell, ChevronRight,
  UserCircle, FileBadge,
} from 'lucide-react';

const menuItems = [
  { label: 'My Dashboard',        href: '/officer',                    icon: LayoutDashboard },
  { label: 'My Reports',          href: '/officer/reports',            icon: FileText        },
  { label: 'Risk Assessments',    href: '/officer/risk-assessments',   icon: AlertTriangle   },
  { label: 'My Permits',          href: '/officer/permits',            icon: FileBadge       },
  { label: 'My Inspections',      href: '/officer/inspections',        icon: ClipboardCheck  },
  { label: 'My Trainings',        href: '/officer/training',           icon: GraduationCap   },
  { label: 'Corrective Actions',  href: '/officer/corrective-actions', icon: Wrench          },
  { label: 'My Performance',      href: '/officer/performance',        icon: TrendingUp      },
  { label: 'Analysis',            href: '/officer/analysis',           icon: BarChart3       },
];

export default function OfficerLayout({ children }) {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || (user.role !== 'OFFICER' && user.role !== 'SUPERVISOR')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert size={26} className="text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Access Denied</h1>
          <p className="text-sm text-gray-500">You do not have permission to access the officer panel.</p>
          <button
            onClick={() => router.push('/admin')}
            className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition"
          >
            Switch to Admin View
          </button>
        </div>
      </div>
    );
  }

  const isActive = (href) =>
    href === '/officer'
      ? pathname === '/officer'
      : pathname === href || pathname.startsWith(href + '/');

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const activeItem = menuItems.find((item) => isActive(item.href));

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60
        bg-gradient-to-b from-emerald-950 via-emerald-950 to-emerald-900
        text-white flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-xl shadow-inner">
              🛡️
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm text-white tracking-wide">MS Safety</p>
              <p className="text-[10px] text-emerald-400 tracking-wider uppercase">Officer Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-emerald-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600 select-none">
            My Workspace
          </p>
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150
                  ${active
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-emerald-300 hover:bg-white/8 hover:text-emerald-100'
                  }
                `}
              >
                <item.icon
                  size={15}
                  className={`flex-shrink-0 transition-colors ${active ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-300'}`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[9px] text-emerald-700 font-mono tracking-widest">v2.1.0</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>
        </div>

        {/* User + Logout */}
        <div className="px-3 pb-4 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/6 border border-white/8">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-emerald-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-red-300/80 hover:bg-red-500/15 hover:text-red-200 transition border border-transparent hover:border-red-500/20"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-0 flex items-center justify-between shadow-sm flex-shrink-0 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
            >
              <Menu size={18} className="text-gray-600" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <span className="text-gray-400 font-medium">Officer</span>
              {activeItem && (
                <>
                  <ChevronRight size={13} className="text-gray-300" />
                  <span className="text-gray-800 font-semibold">{activeItem.label}</span>
                </>
              )}
            </div>
            <p className="sm:hidden text-sm font-semibold text-gray-800">
              {activeItem?.label ?? 'Officer Portal'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 tracking-wide">LIVE</span>
            </div>

            <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-700">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-white" />
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1" />

            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl cursor-default">
              <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-semibold text-gray-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-none">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

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