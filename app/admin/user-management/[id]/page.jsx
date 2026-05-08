'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Mail, Building2, UserCheck, Calendar, Shield } from 'lucide-react';

import { getLocalUsers } from '@/lib/localStorage';
import Button from '@/components/Button';

export default function UserDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const users = getLocalUsers();
    const foundUser = users.find(u => u.id === id);
    setUser(foundUser);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-3xl font-bold text-red-600">User Not Found</h2>
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin/user-management')}
          className="mt-6"
        >
          ← Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Back to User Management
      </Button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Hero Header */}
        <div className="h-48 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 relative">
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h1 className="text-4xl font-bold text-white drop-shadow-sm">{user.name}</h1>
              <p className="text-blue-100 text-xl">{user.designation}</p>
            </div>
          </div>

          <div className="absolute top-6 right-8">
            <span className={`px-6 py-2.5 rounded-full text-sm font-semibold shadow-md
              ${user.status === 'Active' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'}`}>
              {user.status}
            </span>
          </div>
        </div>

        <div className="pt-16 pb-10 px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Mail className="text-blue-600" /> Contact Information
                </h3>
                <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail size={22} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <a href={`mailto:${user.email}`} className="font-medium hover:underline">
                        {user.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="text-blue-600" /> Work Information
                </h3>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-lg font-semibold">{user.department || 'Not Assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Designation</p>
                      <p className="text-lg font-semibold">{user.designation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <Shield size={18} className="text-amber-600" />
                        {user.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Employee ID</p>
                      <p className="font-mono text-lg">{user.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-5">Profile Summary</h3>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                      {user.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Joined</span>
                    <span>
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          }) 
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium capitalize">{user.role?.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <Button 
                  onClick={() => router.push(`/admin/user-management?edit=${user.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                >
                  <Edit size={20} /> Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}