import Link from "next/link";
import { getAdminUserById } from "@/lib/api/admin";
import { getAuthToken } from "@/lib/cookie";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  let user = null;
  try {
    const token = await getAuthToken();
    const response = await getAdminUserById(id, token || undefined);
    user = response.success ? response.data : null;
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }

  const fullName = user ? [user.firstname, user.lastname].filter(Boolean).join(" ") : "";

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Details</h1>
            <p className="mt-2 text-gray-400">User profile information</p>
          </div>
          <Link href={`/admin/users/${id}/edit`} className="btn-secondary w-auto px-6">
            Edit User
          </Link>
        </div>

        {user ? (
          <div className="card space-y-4">
            {user.image && (
              <div className="mb-6">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050'}${user.image}`}
                  alt={fullName}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-400">Full Name</label>
                <p className="text-lg text-white font-medium">{fullName || user.username || "-"}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white">{user.email || "-"}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Username</label>
                <p className="text-white">{user.username || "-"}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Role</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === "admin" 
                    ? "bg-red-900/30 text-red-300" 
                    : "bg-blue-900/30 text-blue-300"
                }`}>
                  {user.role || "user"}
                </span>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Created At</label>
                <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              
              {user.updatedAt && (
                <div>
                  <label className="text-sm text-gray-400">Last Updated</label>
                  <p className="text-white">{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="text-center text-red-400">Unable to load user details.</p>
          </div>
        )}
        
        <Link href="/admin/users" className="mt-6 inline-block text-primary-400 hover:text-primary-300">
          ← Back to Users
        </Link>
      </div>
    </div>
  );
}
