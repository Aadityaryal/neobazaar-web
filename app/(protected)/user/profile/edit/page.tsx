import { getUserData } from "@/lib/cookie";
import ProfileForm from "../_components/ProfileForm";

export default async function UserProfileEditPage() {
  const userData = await getUserData();

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <p className="text-gray-400">Update your account details and avatar.</p>
        </div>
        <div className="card">
          <ProfileForm userData={userData} />
        </div>
      </div>
    </div>
  );
}
