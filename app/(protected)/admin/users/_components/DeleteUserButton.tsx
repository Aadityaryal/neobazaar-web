"use client";

import { useTransition } from "react";
import { handleAdminDeleteUser } from "@/lib/actions/admin-action";

export default function DeleteUserButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    startTransition(async () => {
      await handleAdminDeleteUser(userId);
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
