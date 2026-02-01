import Link from "next/link";
import { handleAdminGetUsers } from "@/lib/actions/admin-action";
import DeleteUserButton from "./_components/DeleteUserButton";

const formatName = (user: {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.username || user.email || "Unknown";
};

export default async function AdminUsersPage() {
  const response = await handleAdminGetUsers();
  const users = (response.success ? response.data : []) || [];
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

        <div className="mt-8 card p-0 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 border-b border-dark-border px-6 py-4 text-sm text-gray-400">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-dark-border">
            {users.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400">
                No users found yet.
              </div>
            ) : (
              users.map((user) => {
                return (
                  <div key={user._id} className="grid grid-cols-4 gap-4 px-6 py-5 text-white">
                    <span className="font-medium">{formatName(user)}</span>
                    <span className="text-gray-300">{user.email || "-"}</span>
                    <span className="text-gray-300 capitalize">{user.role || "user"}</span>
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/users/${user._id}`} className="text-primary-400 hover:text-primary-300">
                        View
                      </Link>
                      <Link href={`/admin/users/${user._id}/edit`} className="text-gray-300 hover:text-white">
                        Edit
                      </Link>
                      <DeleteUserButton userId={user._id} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
