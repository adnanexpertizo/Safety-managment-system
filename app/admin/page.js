'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, TrendingUp, Users, Award, ShieldAlert } from 'lucide-react';

import Button from '@/components/Button';
import { getDashboardStats, getRecentReports } from '@/lib/localStorage';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dashboardStats = getDashboardStats();
    const recent = getRecentReports(5);

    setStats(dashboardStats);
    setRecentReports(recent);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Enterprise Safety Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Real-time safety performance & risk intelligence
        </p>
      </div>

      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />} 
          label="Total Reports" 
          value={stats.totalReports} 
          color="text-blue-600" 
        />
        <StatCard 
          icon={<ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />} 
          label="Incidents" 
          value={stats.incidents} 
          color="text-red-600" 
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6" />} 
          label="Near Misses" 
          value={stats.nearMisses} 
          color="text-amber-600" 
        />
        <StatCard 
          icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />} 
          label="Hazards" 
          value={stats.hazards} 
          color="text-orange-600" 
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          icon={<ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />} 
          label="Open Cases" 
          value={stats.openReports} 
          color="text-red-600" 
        />
        <StatCard 
          icon={<Users className="w-5 h-5 md:w-6 md:h-6" />} 
          label="High Risk" 
          value={stats.highRiskAssessments} 
          color="text-red-600" 
        />
        <StatCard 
          icon={<Award className="w-5 h-5 md:w-6 md:h-6" />} 
          label="Trainings" 
          value={stats.totalTrainings} 
          color="text-emerald-600" 
        />
      </div>

      {/* Action Center */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
          🚨 Action Required
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <p className="text-red-600 text-sm font-medium">High Risk Open Cases</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.highRiskAssessments}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <p className="text-amber-600 text-sm font-medium">Overdue Items</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">0</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <p className="text-emerald-600 text-sm font-medium">System Status</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">Stable</p>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-lg md:text-xl font-semibold">Recent Reports</h2>
          <Link href="/admin/reports">
            <Button variant="outline" size="sm">View All Reports</Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentReports.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No reports found</p>
          ) : (
            recentReports.map((report) => (
              <div 
                key={report.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-muted/50 hover:bg-muted rounded-2xl transition gap-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm md:text-base line-clamp-2">
                    {report.description?.substring(0, 90)}...
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {report.type?.toUpperCase()} • {report.location} • {report.status}
                  </p>
                </div>
                <Link href={`/admin/reports/${report.id}`} className="shrink-0">
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Improved Responsive StatCard
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-card border border-border rounded-2xl p-4 md:p-6 hover:shadow-md transition">
    <div className="flex items-center gap-2 md:gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <p className="text-xs md:text-sm text-muted-foreground font-medium">{label}</p>
    </div>
    <p className={`text-3xl md:text-4xl font-bold mt-3 ${color}`}>{value}</p>
  </div>
);