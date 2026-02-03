"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminUserById, updateAdminUser } from "@/lib/api/admin";

type AdminUserDetail = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "user" | "admin";
  location?: string;
};

export default function AdminUserEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAdminUserById(params.id);
        if (!response.success) {
          throw new Error(response.message || "Failed to load user");
        }
        const row = response.data as AdminUserDetail;
        setFirstName(row.firstName || "");
        setLastName(row.lastName || "");
        setEmail(row.email || "");
        setRole(row.role === "admin" ? "admin" : "user");
        setLocation(row.location || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.id]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const payload = new FormData();
      payload.set("firstName", firstName.trim());
      payload.set("lastName", lastName.trim());
      payload.set("email", email.trim());
      payload.set("role", role);
      payload.set("location", location.trim());
      if (password.trim()) {
        payload.set("password", password.trim());
      }
      const response = await updateAdminUser(params.id, payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to update user");
      }
      router.push(`/admin/users/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="card flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="page-title">Edit User</h1>
              <p className="text-secondary">Update account, role, and profile fields.</p>
            </div>
            <Link href={`/admin/users/${params.id}`} className="btn-secondary btn-sm">Back</Link>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="card text-sm text-secondary">Loading user…</div>
          ) : (
            <form className="card space-y-3" onSubmit={submit}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input className="input-field" placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
                <input className="input-field" placeholder="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
                <input className="input-field" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <select className="input-field" value={role} onChange={(event) => setRole(event.target.value as "user" | "admin") }>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <input className="input-field" placeholder="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
                <input className="input-field md:col-span-2" placeholder="New password (optional)" type="text" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
              <button className="btn-primary btn-sm" type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save changes"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
