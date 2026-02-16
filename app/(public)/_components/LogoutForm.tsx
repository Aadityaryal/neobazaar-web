"use client";

import { handleLogout } from "@/lib/actions/auth-action";
import { publishAuthTransition } from "@/lib/auth/transitions";

export default function LogoutForm() {
  return (
    <form
      action={handleLogout}
      onSubmit={() => {
        publishAuthTransition("logout");
      }}
    >
      <button type="submit" className="btn-primary btn-sm">
        Log Out
      </button>
    </form>
  );
}
