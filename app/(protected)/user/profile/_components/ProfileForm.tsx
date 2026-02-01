"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleUpdateProfile } from "@/lib/actions/user-action";

type UserData = {
  _id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export default function ProfileForm({
  userData,
}: {
  userData: UserData | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: userData?.email || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("firstName", formValues.firstName);
    formData.append("lastName", formValues.lastName);
    formData.append("email", formValues.email);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    startTransition(async () => {
      const response = await handleUpdateProfile(formData);
      if (!response.success) {
        setError(response.message);
        return;
      }

      setSuccess("Profile updated successfully.");
      router.push("/user/profile");
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">First Name</label>
          <input
            name="firstName"
            value={formValues.firstName}
            onChange={handleChange}
            placeholder="First name"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Last Name</label>
          <input
            name="lastName"
            value={formValues.lastName}
            onChange={handleChange}
            placeholder="Last name"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
        <input
          type="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Profile Image (optional)</label>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          className="input-field file:mr-4 file:rounded-md file:border-0 file:bg-dark-border file:px-4 file:py-2 file:text-sm file:text-white"
        />
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
