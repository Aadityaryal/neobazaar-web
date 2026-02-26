import type { NavRole } from "@/lib/navigation";

type UserLike = {
  userId?: string;
  role?: "user" | "admin";
};

export function deriveNavRole(isLoggedIn: boolean, userData: UserLike | null): NavRole {
  if (!isLoggedIn) {
    return "guest";
  }
  return userData?.role === "admin" ? "admin" : "buyer";
}

export function deriveEffectiveNavRole(role: NavRole, currentPath: string): NavRole {
  if (role === "buyer" && currentPath.startsWith("/seller")) {
    return "seller";
  }
  return role;
}
