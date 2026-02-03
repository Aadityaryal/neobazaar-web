"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminUser } from "@/lib/api/admin";

export default function AdminUserCreatePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Pass12345");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [location, setLocation] = useState("Kathmandu");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const payload = new FormData();
      payload.set("firstName", firstName.trim());
      payload.set("lastName", lastName.trim());
      payload.set("email", email.trim());
      payload.set("password", password);
      payload.set("role", role);
      payload.set("location", location.trim());

      const response = await createAdminUser(payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to create user");
      }

      router.push(response.data?.userId ? `/admin/users/${response.data.userId}` : "/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
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
              <h1 className="page-title">Create User</h1>
              <p className="text-secondary">Provision a user/admin account from admin console.</p>
            </div>
            <Link href="/admin/users" className="btn-secondary btn-sm">Back to users</Link>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <form className="card space-y-3" onSubmit={submit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input className="input-field" placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              <input className="input-field" placeholder="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
              <input className="input-field" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
              <input className="input-field" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} type="text" required />
              <select className="input-field" value={role} onChange={(event) => setRole(event.target.value as "user" | "admin") }>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <input className="input-field" placeholder="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
            <button className="btn-primary btn-sm" type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create user"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
