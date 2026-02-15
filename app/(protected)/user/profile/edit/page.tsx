import { getUserData } from "@/lib/cookie";
import ProfileForm from "../_components/ProfileForm";

export default async function UserProfileEditPage() {
  const userData = await getUserData();

  return (
    <div className="page-shell">
      <div className="page-container mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="page-title">Edit Profile</h1>
          <p className="text-secondary">Update your account details and avatar.</p>
        </div>
        <div className="card">
          <ProfileForm userData={userData} />
        </div>
      </div>
    </div>
  );
}
