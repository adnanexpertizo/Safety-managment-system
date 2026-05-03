'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getReports, getRiskAssessments } from '@/lib/firebase';
import Button from '@/components/Button';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const reportsData = await getReports();
        const riskData = await getRiskAssessments();

        setReports(reportsData || []);
        setRiskAssessments(riskData || []);

        setRecentReports(
          (reportsData || [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // -----------------------------
  // BASIC STATS
  // -----------------------------
  const stats = useMemo(() => {
    return {
      totalReports: reports.length,
      incidents: reports.filter(r => r.type === 'incident').length,
      nearMisses: reports.filter(r => r.type === 'near_miss').length,
      hazards: reports.filter(r => r.type === 'hazard').length,
      riskAssessments: riskAssessments.length,
    };
  }, [reports, riskAssessments]);

  // -----------------------------
  // RISK ENGINE (FIXED + IMPROVED)
  // -----------------------------
  const riskStats = useMemo(() => {
    let low = 0, medium = 0, high = 0;

    riskAssessments.forEach(r => {
      const score = r.riskScore || 0;

      if (score >= 15) high++;
      else if (score >= 6) medium++;
      else low++;
    });

    return { low, medium, high };
  }, [riskAssessments]);

  const highRiskCount = riskStats.high;

  // -----------------------------
  // SLA / PERFORMANCE
  // -----------------------------
  const openReports = reports.filter(r => (r.status || '').toLowerCase() === 'open').length;

  const resolvedReports = reports.filter(r =>
    (r.status || '').toLowerCase() === 'resolved'
  ).length;

  const closedReports = reports.filter(r =>
    (r.status || '').toLowerCase() === 'closed'
  ).length;

  // -----------------------------
  // TREND (simple intelligence)
  // -----------------------------
  const trend = useMemo(() => {
    const now = new Date();
    const last7Days = reports.filter(r => {
      const d = new Date(r.createdAt);
      return (now - d) / (1000 * 60 * 60 * 24) <= 7;
    }).length;

    const last14Days = reports.filter(r => {
      const d = new Date(r.createdAt);
      return (now - d) / (1000 * 60 * 60 * 24) <= 14;
    }).length;

    return {
      last7Days,
      growth: last14Days ? (((last7Days / last14Days) * 100) - 100).toFixed(1) : 0,
    };
  }, [reports]);

  // -----------------------------
  // ACTION ENGINE (VERY IMPORTANT)
  // -----------------------------
  const criticalActions = useMemo(() => {
    return {
      highRiskOpen: riskAssessments.filter(
        r => (r.riskScore || 0) >= 15 && (r.status || '').toLowerCase() === 'open'
      ).length,

      overdue: reports.filter(r => {
        if (!r.dueDate) return false;
        return new Date(r.dueDate) < new Date() && r.status !== 'Closed';
      }).length,
    };
  }, [reports, riskAssessments]);

  const StatCard = ({ label, value, color }) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <p className="text-[13px] text-muted-foreground mb-2">{label}</p>
      <p className={`text-[32px] font-bold ${color}`}>{value}</p>
    </div>
  );

  if (loading) {
    return <p className="p-10 text-center">Loading dashboard...</p>;
  }

  return (
    <div>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold">Enterprise Safety Dashboard</h1>
        <p className="text-muted-foreground">
          Operational intelligence & risk monitoring system
        </p>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard label="Total Reports" value={stats.totalReports} color="text-primary" />
        <StatCard label="Incidents" value={stats.incidents} color="text-red-600" />
        <StatCard label="Near Misses" value={stats.nearMisses} color="text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Hazards" value={stats.hazards} color="text-orange-600" />
        <StatCard label="High Risk Cases" value={highRiskCount} color="text-red-600" />
        <StatCard label="Risk Assessments" value={stats.riskAssessments} color="text-primary" />
      </div>

      {/* INTELLIGENCE ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Weekly Trend</p>
          <p className="text-2xl font-bold mt-2">{trend.last7Days}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Growth: {trend.growth}%
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Open Cases</p>
          <p className="text-2xl font-bold mt-2 text-red-600">{openReports}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Resolved / Closed</p>
          <p className="text-2xl font-bold mt-2 text-green-600">
            {resolvedReports + closedReports}
          </p>
        </div>

      </div>

      {/* ACTION CENTER (VERY IMPORTANT) */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-[18px] font-bold mb-4">🚨 Action Required</h2>

        <div className="space-y-2 text-sm">

          <p>
            ⚠ High Risk Open Cases:{" "}
            <span className="font-bold text-red-600">
              {criticalActions.highRiskOpen}
            </span>
          </p>

          <p>
            ⏱ Overdue Reports:{" "}
            <span className="font-bold text-orange-600">
              {criticalActions.overdue}
            </span>
          </p>

          <p>
            📊 System Status:{" "}
            <span className="font-bold text-green-600">
              {criticalActions.highRiskOpen > 0 ? 'Attention Required' : 'Stable'}
            </span>
          </p>

        </div>
      </div>

      {/* RECENT REPORTS */}
      <div className="bg-card border border-border rounded-lg p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold">Recent Reports</h2>

          <Link href="/admin/reports">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex justify-between p-4 bg-muted rounded-md"
            >
              <div>
                <p className="font-medium">{report.title}</p>
                <p className="text-xs text-muted-foreground">
                  {report.type} • {report.status}
                </p>
              </div>

              <Link href={`/admin/reports/${report.id}`}>
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}