'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  Map,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold mb-3">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You do not have permission to access the admin panel.
          </p>
          <button
            onClick={() => router.push('/officer')}
            className="w-full px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90"
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
    { label: 'User Management', href: '/admin/user-management', icon: Users },
    { label: 'Analysis', href: '/admin/analysis', icon: BarChart3 },
    { label: 'Performance', href: '/admin/performance', icon: TrendingUp },
    { label: 'Training', href: '/admin/training', icon: Award },
    { label: 'Map', href: '/admin/map', icon: Map },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 md:w-64 w-52 bg-primary text-white flex flex-col shadow-xl
        transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>


        <div className="px-4 py-6 md:py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-semibold text-base leading-none">MS Safety</p>
              <p className="text-[10px] text-gray-300">HSE System</p>
            </div>

          </div>
        </div>


        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-2.5 px-3 md:my-2 py-3  rounded-xl  text-sm font-medium transition-all
                ${isActive(item.href)
                  ? 'bg-white/20 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
            >
              <item.icon className={` w-4  h-4 flex-shrink-0 ${isActive(item.href) ? 'text-white' : 'text-gray-400'}`} />
              <span className="text-[13px]">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">


          <button
            onClick={() => { logout(); router.push('/'); }}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl 
                       text-sm font-medium text-red-200 hover:bg-white/10 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="bg-white border-b  p-5 sm:p-4 lg:p-3 flex items-center justify-between shadow-sm">

          {/* Left Section */}
          <div className="flex items-center gap-3">

            {/* Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg hover:bg-gray-100 transition"
            >
              <Menu size={22} />
            </button>

            {/* Brand */}
            <div className="leading-tight">

              <p className="md:text-md text-xs text-primary">
                Health & Safety Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3  rounded-xl hover:bg-gray-50 transition" title={`${user.name} (${user.email})`}>

              <div
                className="md:w-8 md:h-8 w-6 h-6  rounded-full bg-blue-600 
                   flex items-center justify-center 
                   text-white font-semibold shadow-sm"
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-[10px] font-semibold text-gray-800">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Reduced Padding on Mobile */}
        <main className="flex-1 overflow-y-auto">
          <div className=" p-3 sm:p-4 lg:p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}