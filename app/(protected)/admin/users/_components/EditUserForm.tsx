"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAdminUser } from "@/lib/api/admin";
import { getAuthToken } from "@/lib/cookie";

type AdminUser = {
  _id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  username?: string;
  role?: string;
  image?: string;
};

export default function EditUserForm({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    email: user.email || "",
    username: user.username || "",
    role: user.role || "user",
    password: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (formValues.firstname) {
      formData.append("firstname", formValues.firstname);
    }
    if (formValues.lastname) {
      formData.append("lastname", formValues.lastname);
    }
    if (formValues.email) {
      formData.append("email", formValues.email);
    }
    if (formValues.username) {
      formData.append("username", formValues.username);
    }
    if (formValues.role) {
      formData.append("role", formValues.role);
    }
    if (formValues.password) {
      formData.append("password", formValues.password);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    startTransition(async () => {
      try {
        const token = await getAuthToken();
        const response = await updateAdminUser(user._id, formData, token || undefined);
        if (!response.success) {
          setError(response.message || "Failed to update user");
          return;
        }

        setSuccess("User updated successfully.");
        setTimeout(() => {
          router.push(`/admin/users/${user._id}`);
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update user");
      }
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
            name="firstname"
            value={formValues.firstname}
            onChange={handleChange}
            placeholder="First name"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Last Name</label>
          <input
            name="lastname"
            value={formValues.lastname}
            onChange={handleChange}
            placeholder="Last name"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder="user@example.com"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Username</label>
          <input
            type="text"
            name="username"
            value={formValues.username}
            onChange={handleChange}
            placeholder="username"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Role</label>
          <select
            name="role"
            value={formValues.role}
            onChange={handleChange}
            className="input-field"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Password (optional)</label>
          <input
            type="password"
            name="password"
            value={formValues.password}
            onChange={handleChange}
            placeholder="Leave empty to keep current"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Profile Image (optional)</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
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
