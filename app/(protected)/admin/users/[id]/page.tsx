import Link from "next/link";
import { handleAdminGetUser } from "@/lib/actions/admin-action";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await handleAdminGetUser(id);
  const user = response.success ? response.data : null;
  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-4xl card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Details</h1>
            <p className="mt-2 text-gray-400">User profile information</p>
          </div>
          <Link href={`/admin/users/${id}/edit`} className="btn-secondary w-auto px-6">
            Edit User
          </Link>
        </div>

        {user ? (
          <div className="mt-6 space-y-4 text-sm text-gray-300">
            <div className="flex justify-between border-b border-dark-border pb-3">
              <span className="text-gray-400">User ID</span>
              <span className="text-white">{user._id}</span>
            </div>
            <div className="flex justify-between border-b border-dark-border pb-3">
              <span className="text-gray-400">Name</span>
              <span className="text-white">{fullName || user.username || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-dark-border pb-3">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{user.email || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-dark-border pb-3">
              <span className="text-gray-400">Role</span>
              <span className="text-white capitalize">{user.role || "user"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created At</span>
              <span className="text-white">{user.createdAt || "-"}</span>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-red-400">Unable to load user details.</p>
        )}
      </div>
    </div>
  );
}
