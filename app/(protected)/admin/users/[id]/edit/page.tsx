import EditUserForm from "../../_components/EditUserForm";
import { handleAdminGetUser } from "@/lib/actions/admin-action";

export default async function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await handleAdminGetUser(id);
  const user = response.success ? response.data : null;

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-4xl card">
        <h1 className="text-2xl font-bold text-white">Edit User</h1>
        <p className="mt-2 text-gray-400">Update user profile details.</p>
        <div className="mt-6">
          {user ? (
            <EditUserForm user={user} />
          ) : (
            <p className="text-sm text-red-400">Unable to load user details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
