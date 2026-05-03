'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReports, getRiskAssessments } from '@/lib/firebase';
import { useUser } from '@/context/UserContext';
import Button from '@/components/Button';

export default function OfficerDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    myReports: 0,
    myAssessments: 0,
    openReports: 0,
    inProgressReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[v0] Loading officer dashboard data for user:', user?.id);
        const reports = await getReports();
        const myReports = reports.filter((r) => r.userId === user?.id);
        const openReports = myReports.filter((r) => r.status === 'Open');
        const inProgressReports = myReports.filter((r) => r.status === 'In Progress');

        const assessments = await getRiskAssessments();
        const myAssessments = assessments.filter((a) => a.userId === user?.id);

        setStats({
          myReports: myReports.length,
          myAssessments: myAssessments.length,
          openReports: openReports.length,
          inProgressReports: inProgressReports.length,
        });

        setRecentReports(
          myReports
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
              const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
              return dateB - dateA;
            })
            .slice(0, 5)
        );

        setLoading(false);
      } catch (error) {
        console.error('[v0] Error loading dashboard:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const StatCard = ({ label, value, color }) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <p className="text-[13px] text-muted-foreground mb-2">{label}</p>
      <p className={`text-[32px] font-bold ${color}`}>{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-foreground mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's your personal safety management overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard label="My Reports" value={stats.myReports} color="text-primary" />
        <StatCard label="My Assessments" value={stats.myAssessments} color="text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard label="Open Reports" value={stats.openReports} color="text-red-600" />
        <StatCard label="In Progress" value={stats.inProgressReports} color="text-yellow-600" />
      </div>

      {/* Recent Reports */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-foreground">My Recent Reports</h2>
          <Link href="/officer/reports">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">You haven't submitted any reports yet</p>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-muted rounded-md hover:bg-opacity-80 transition-colors"
              >
                <div>
                  <p className="text-[15px] font-medium text-foreground">{report.title}</p>
                  <p className="text-[13px] text-muted-foreground">
                    Type: {report.type} • Status: {report.status}
                  </p>
                </div>
                <Link href={`/officer/reports/${report.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
