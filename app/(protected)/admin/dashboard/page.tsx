"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminUsers } from "@/lib/api/admin";
import { getAuthToken } from "@/lib/cookie";

interface User {
  _id: string;
  firstname?: string;
  lastname?: string;
  email: string;
  username?: string;
  role: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  recentUsers: User[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalRegularUsers: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = await getAuthToken();
        
        // Fetch all users with high limit to get stats
        const response = await getAdminUsers(token || undefined, {
          page: "1",
          limit: "100"
        });

        if (response.success && response.data) {
          const users: User[] = response.data;
          const admins = users.filter((u: User) => u.role === "admin");
          const regularUsers = users.filter((u: User) => u.role !== "admin");
          
          // Get 5 most recent users
          const sorted = [...users].sort((a: User, b: User) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ).slice(0, 5);

          setStats({
            totalUsers: response.total || users.length,
            totalAdmins: admins.length,
            totalRegularUsers: regularUsers.length,
            recentUsers: sorted
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatName = (user: User) => {
    const fullName = [user.firstname, user.lastname].filter(Boolean).join(" ");
    return fullName || user.username || user.email || "Unknown";
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Overview of NeoBazaar platform statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="card bg-linear-to-br from-blue-900/30 to-blue-900/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{loading ? "-" : stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM16 16H8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Admin Count */}
          <div className="card bg-linear-to-br from-red-900/30 to-red-900/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Admins</p>
                <p className="text-3xl font-bold text-white">{loading ? "-" : stats.totalAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-red-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Regular Users */}
          <div className="card bg-linear-to-br from-green-900/30 to-green-900/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Regular Users</p>
                <p className="text-3xl font-bold text-white">{loading ? "-" : stats.totalRegularUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM9 19c-4.3 0-8-1.79-8-4m0 0c0-2.21 3.7-4 8-4s8 1.79 8 4m0 0c0 2.21-3.7 4-8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="card bg-linear-to-br from-primary-900/30 to-primary-900/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Platform Health</p>
                <p className="text-3xl font-bold text-primary-300">Good</p>
              </div>
              <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Users</h2>
            <Link href="/admin/users" className="text-primary-400 hover:text-primary-300 text-sm">
              View All →
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : stats.recentUsers.length === 0 ? (
            <p className="text-gray-400">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-dark-border/50 hover:bg-dark-card/50">
                      <td className="px-4 py-3 text-white font-medium">{formatName(user)}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === "admin" 
                            ? "bg-red-900/30 text-red-300" 
                            : "bg-blue-900/30 text-blue-300"
                        }`}>
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link 
                          href={`/admin/users/${user._id}`}
                          className="text-primary-400 hover:text-primary-300 text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/admin/users/create" className="card hover:bg-dark-card/80 transition">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Create User</p>
                <p className="text-gray-400 text-sm">Add new user</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/users" className="card hover:bg-dark-card/80 transition">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Manage Users</p>
                <p className="text-gray-400 text-sm">View all users</p>
              </div>
            </div>
          </Link>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Settings</p>
                <p className="text-gray-400 text-sm">Admin settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
