'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  ShieldAlert,
  Plus,
  Clock,
  CheckCircle,
} from 'lucide-react';

import Button from '@/components/Button';
import SummaryCards from '@/components/SummaryCards';
import Table from '@/components/Table';           // Reuse your existing Table
import {
  getDashboardStats,
  getRecentReports,
  getRecentActivity,        // ← We'll assume you can add this
} from '@/lib/localStorage';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dashboardStats = getDashboardStats();
    const recent = getRecentReports(6);
    const activity = getRecentActivity?.(5) || [];   // Optional

    setStats(dashboardStats);
    setRecentReports(recent);
    setRecentActivity(activity);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-screen-2xl mx-auto">

      {/* Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between ,d:gap-3 gap-2">
        <div>
          <h1 className="text-md sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
            Enterprise Safety Dashboard
          </h1>

          <p className="text-[10px] sm:text-sm lg:text-base text-gray-500 truncate">
            Real-time safety performance & risk intelligence
          </p>
        </div>

        <div className=" flex-wrap gap-[3px] md:gap-2 hidden md:flex" >

          <Link href="/admin/reports/new" className="pointer-events-none">
            <Button
              disabled
              className="flex items-center gap-2 opacity-50 cursor-not-allowed"
            >
              <Plus size={18} /> New Report
            </Button>
          </Link>

          <Link href="/admin/risk-assessment/new" className="pointer-events-none">
            <Button
              disabled
              variant="outline"
              className="flex items-center gap-2 opacity-50 cursor-not-allowed"
            >
              <ShieldAlert size={18} /> Risk Assessment
            </Button>
          </Link>

          <Link href="/admin/trainings/new" className="pointer-events-none">
            <Button
              disabled
              variant="outline"
              className="flex items-center gap-2 opacity-50 cursor-not-allowed"
            >
              <Award size={18} /> Add Training
            </Button>
          </Link>

        </div>
      </div>

      {/* KPI Cards - Combined */}
      <SummaryCards
        columns={4}
        cards={[
          {
            icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
            label: 'Total Reports',
            value: stats.totalReports || 0,
            color: 'text-blue-600',
            trend: '+12%',
          },
          {
            icon: <ShieldAlert className="w-6 h-6 text-red-600" />,
            label: 'Incidents',
            value: stats.incidents || 0,
            color: 'text-red-600',
          },
          {
            icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
            label: 'Near Misses',
            value: stats.nearMisses || 0,
            color: 'text-amber-600',
          },
          {
            icon: <Award className="w-6 h-6 text-emerald-600" />,
            label: 'Trainings Completed',
            value: stats.totalTrainings || 0,
            color: 'text-emerald-600',
          },
        ]}
      />
      <div className="-mt-4">
        <h2 className="text-sm sm:text-md lg:text-lg font-bold py-3 text-gray-500 truncate">
          Key Performance Indicators
        </h2>

        <SummaryCards
          columns={3}
          cards={[
            {
              icon: <Clock className="w-5 h-5 text-red-600" />,
              label: 'Open Cases',
              value: stats.openReports || 0,
              color: 'text-red-600',
            },
            {
              icon: <ShieldAlert className="w-5 h-5 text-orange-600" />,
              label: 'High / Critical Risk',
              value: stats.highRiskAssessments || 0,
              color: 'text-orange-600',
            },
            {
              icon: <Users className="w-5 h-5 text-purple-600" />,
              label: 'Active Employees',
              value: stats.activeUsers || 0,
              color: 'text-purple-600',
            },
          ]}
        />
      </div>
      {/* Safety Performance Score - Full Width on Mobile, Right Side on Large */}
      <div className="bg-white border border-gray-200 rounded-md md:rounded-xl md:p-4 p-2 flex flex-col justify-start items-start text-center shadow-sm">
        <div className="flex w-full  justify-between">
          <div className="flex flex-col items-start">
            <p className="text-sm text-gray-500 font-medium">Safety Performance Score</p>
            <p className="text-emerald-600 font-semibold mt-1 text-lg">Excellent</p>
          </div>

          <p className="lg:text-2xl md:text-lg text-md font-bold text-emerald-600 mt-3">
            {stats.safetyScore || 87}%
          </p>
        </div>


        <div className="w-full bg-gray-200 h-2 md:h-2 rounded-full mt-1 md:mt-2   overflow-hidden">
          <div
            className="bg-emerald-600 h-2 md:h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.safetyScore || 87}%` }}
          />
        </div>
      </div>

      {/* Action Required + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Action Required */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-3 md:p-6">
          <h2 className=" text-md md:text-lg font-semibold mb-4 flex items-center gap-2">
            🚨 Action Required
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
              <div>
                <p className="font-medium">High Risk Assessments Pending</p>
                <p className="text-sm text-gray-600">{stats.highRiskAssessments || 0} items need attention</p>
              </div>
              <Button variant="danger" size="sm">Review Now</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <div>
                <p className="font-medium">Overdue Trainings</p>
                <p className="text-sm text-gray-600">3 trainings due this week</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-3 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4 text-sm grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-emerald-600 mt-0.5">
                    <CheckCircle size={18} />
                  </div>
                  <div className="flex-1">
                    <p>{item.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white border border-gray-200 rounded-2xl p-0 ">
        <div className="flex justify-between items-center mb-5 p-2">
          <h2 className="text-lg font-semibold">Recent Reports</h2>
          <Link href="/admin/reports">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {recentReports.length > 0 ? (
          <Table
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'description', label: 'Description' },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status' },
              { key: 'date', label: 'Date' },
            ]}
            data={recentReports}
            actions={[{ id: 'view', label: 'View', icon: null }]}
            onActionClick={(action, row) => {
              window.location.href = `/admin/reports/${row.id}`;
            }}
            maxHeight="380px"
            itemsPerPage={5}
          />
        ) : (
          <p className="text-center py-12 text-gray-500">No reports yet</p>
        )}
      </div>
    </div>
  );
}