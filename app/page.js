'use client';

import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '@/components/Button';

export default function Home() {
  const { user, loginAsAdmin, loginAsOfficer } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.push('/admin');
    } else if (user?.role === 'OFFICER') {
      router.push('/officer');
    }
  }, [user, router]);

  const handleLoginAsAdmin = () => {
    loginAsAdmin();
    router.push('/admin');
  };

  const handleLoginAsOfficer = () => {
    loginAsOfficer();
    router.push('/officer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-6">
            <span className="text-[28px]">🛡️</span>
          </div>
          <h1 className="text-[36px] md:text-[44px] font-bold text-foreground mb-4 text-balance">
            Safety Management System
          </h1>
          <p className="text-[16px] text-muted-foreground max-w-lg mx-auto leading-relaxed text-pretty">
            Comprehensive workplace safety incident and risk management platform. Report hazards,
            track incidents, and protect your team.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Admin Card */}
          <div className="bg-card border-2 border-border rounded-lg p-8 hover:border-primary transition-colors">
            <div className="text-[32px] mb-4">👨‍💼</div>
            <h2 className="text-[20px] font-bold text-foreground mb-2">Admin Dashboard</h2>
            <p className="text-[14px] text-muted-foreground mb-6 leading-relaxed">
              Access comprehensive dashboards, manage all reports across the organization, view risk
              assessments, and analyze safety trends.
            </p>
            <div className="space-y-3 text-[13px] text-muted-foreground mb-6">
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>View all incidents and near misses</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Manage personnel and assignments</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Access detailed safety analytics</span>
              </div>
            </div>
            <Button variant="primary" size="lg" onClick={handleLoginAsAdmin} className="w-full">
              Enter as Admin
            </Button>
          </div>

          {/* Officer Card */}
          <div className="bg-card border-2 border-border rounded-lg p-8 hover:border-secondary transition-colors">
            <div className="text-[32px] mb-4">👷</div>
            <h2 className="text-[20px] font-bold text-foreground mb-2">Officer Dashboard</h2>
            <p className="text-[14px] text-muted-foreground mb-6 leading-relaxed">
              Submit safety reports, conduct risk assessments, track your contributions, and stay
              informed about workplace safety.
            </p>
            <div className="space-y-3 text-[13px] text-muted-foreground mb-6">
              <div className="flex items-start gap-2">
                <span className="text-secondary">✓</span>
                <span>Submit incident and hazard reports</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-secondary">✓</span>
                <span>Conduct risk assessments</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-secondary">✓</span>
                <span>Track your submissions</span>
              </div>
            </div>
            <Button variant="secondary" size="lg" onClick={handleLoginAsOfficer} className="w-full">
              Enter as Officer
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h3 className="text-[18px] font-bold text-foreground mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[18px] mb-2">📋</p>
              <p className="font-medium text-foreground text-[15px] mb-1">Report Management</p>
              <p className="text-[13px] text-muted-foreground">
                Easily submit and track incidents, near misses, and hazards with detailed documentation.
              </p>
            </div>
            <div>
              <p className="text-[18px] mb-2">⚠️</p>
              <p className="font-medium text-foreground text-[15px] mb-1">Risk Assessment</p>
              <p className="text-[13px] text-muted-foreground">
                Conduct comprehensive risk assessments with automatic risk score calculation.
              </p>
            </div>
            <div>
              <p className="text-[18px] mb-2">📊</p>
              <p className="font-medium text-foreground text-[15px] mb-1">Analytics & Insights</p>
              <p className="text-[13px] text-muted-foreground">
                Access real-time dashboards and detailed analysis of safety trends and metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[13px] text-muted-foreground">
            Safety Management System • Protecting your workplace, one report at a time
          </p>
        </div>
      </div>
    </div>
  );
}
