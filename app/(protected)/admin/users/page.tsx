"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminUsers, deleteAdminUser } from "@/lib/api/admin";
import { getAuthToken } from "@/lib/cookie";

const formatName = (user: {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
}) => {
  const fullName = [user.firstname, user.lastname].filter(Boolean).join(" ");
  return fullName || user.username || user.email || "Unknown";
};

interface User {
  _id: string;
  firstname?: string;
  lastname?: string;
  email: string;
  username?: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = await getAuthToken();
        const response = await getAdminUsers(token || undefined, {
          page: page.toString(),
          limit: limit.toString(),
          ...(search ? { search } : {})
        });

        if (response.success) {
          setUsers(response.data || []);
          setTotal(response.total || 0);
          setTotalPages(response.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit, search]);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setDeleting(userId);
      const token = await getAuthToken();
      const response = await deleteAdminUser(userId, token || undefined);

      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400">Manage users and review profile details.</p>
          </div>
          <Link href="/admin/users/create" className="btn-primary w-auto px-6">
            Create User
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field"
            />
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="input-field"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-8 card p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Created</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-dark-border hover:bg-dark-card/50 transition">
                    <td className="px-6 py-5 text-white font-medium">{formatName(user)}</td>
                    <td className="px-6 py-5 text-gray-300">{user.email || "-"}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin" 
                          ? "bg-red-900/30 text-red-300" 
                          : "bg-blue-900/30 text-blue-300"
                      }`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-300 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <Link 
                          href={`/admin/users/${user._id}`} 
                          className="text-primary-400 hover:text-primary-300 text-sm"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/admin/users/${user._id}/edit`} 
                          className="text-gray-300 hover:text-white text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={deleting === user._id}
                          className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                        >
                          {deleting === user._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {users.length ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-dark-border rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-border/80"
              >
                Previous
              </button>
              <div className="px-4 py-2 bg-dark-border rounded text-white">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-dark-border rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-border/80"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
