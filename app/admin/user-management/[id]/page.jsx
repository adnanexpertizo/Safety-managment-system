'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Mail,
  Building2,
  Shield,
} from 'lucide-react';

import { getLocalUsers } from '@/lib/localStorage';
import Button from '@/components/Button';

export default function UserDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const users = getLocalUsers();
    const foundUser = users.find((u) => u.id === id);

    setUser(foundUser);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-10 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-600">
          User Not Found
        </h2>

        <Button
          variant="ghost"
          onClick={() => router.push('/admin/user-management')}
          className="mt-5"
        >
          ← Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Employee Profile
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mt-1">
            User Information & Account Details
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft size={18} />
          Back to User Management
        </Button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <span
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm
                ${
                  user.status === 'Active'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
            >
              {user.status}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6">
            
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white rounded-2xl p-2 shadow-lg mx-auto sm:mx-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  {user.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white break-words">
                {user.name}
              </h2>

              <p className="text-blue-100 text-sm sm:text-lg lg:text-xl mt-1">
                {user.designation}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            
            {/* Left Section */}
            <div className="xl:col-span-2 space-y-5 sm:space-y-6">

              {/* Contact Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" />
                  Contact Information
                </h3>

                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-blue-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Email Address
                      </p>

                      <a
                        href={`mailto:${user.email}`}
                        className="text-sm sm:text-base font-medium text-gray-800 hover:text-blue-600 break-all"
                      >
                        {user.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  Work Information
                </h3>

                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 lg:p-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Department
                      </p>

                      <p className="text-sm sm:text-lg font-semibold text-gray-900 mt-1 break-words">
                        {user.department || 'Not Assigned'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Designation
                      </p>

                      <p className="text-sm sm:text-lg font-semibold text-gray-900 mt-1 break-words">
                        {user.designation}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Role
                      </p>

                      <p className="text-sm sm:text-lg font-semibold flex items-center gap-2 mt-1 break-words">
                        <Shield
                          size={16}
                          className="text-amber-600 shrink-0"
                        />

                        {user.role}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Employee ID
                      </p>

                      <p className="text-sm sm:text-lg font-mono font-semibold mt-1 break-all">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="space-y-5 sm:space-y-6">

              {/* Summary Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6">
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">
                  Profile Summary
                </h3>

                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between gap-4 pb-3 border-b">
                    <span className="text-sm text-gray-600">
                      Status
                    </span>

                    <span
                      className={`text-sm font-semibold ${
                        user.status === 'Active'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pb-3 border-b">
                    <span className="text-sm text-gray-600">
                      Joined
                    </span>

                    <span className="text-sm font-medium text-right">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                            }
                          )
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-600">
                      Account Type
                    </span>

                    <span className="text-sm font-medium capitalize text-right">
                      {user.role?.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() =>
                  router.push(`/admin/user-management?edit=${user.id}`)
                }
                className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 text-sm sm:text-base"
              >
                <Edit size={18} />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}