import Link from "next/link";
import { getUserData } from "@/lib/cookie";

export default async function UserProfilePage() {
  const userData = await getUserData();
  const fullName = [userData?.firstName, userData?.lastName].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="text-gray-400">Review your account details.</p>
          </div>
          <Link href="/user/profile/edit" className="btn-secondary w-auto px-6">
            Edit Profile
          </Link>
        </div>
        <div className="card space-y-4 text-sm text-gray-300">
          <div className="flex justify-between border-b border-dark-border pb-3">
            <span className="text-gray-400">User ID</span>
            <span className="text-white">{userData?._id || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-dark-border pb-3">
            <span className="text-gray-400">Name</span>
            <span className="text-white">{fullName || userData?.username || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-dark-border pb-3">
            <span className="text-gray-400">Email</span>
            <span className="text-white">{userData?.email || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Role</span>
            <span className="text-white capitalize">{userData?.role || "user"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
