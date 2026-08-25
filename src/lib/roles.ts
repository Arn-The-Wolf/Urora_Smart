import type { UserRole } from "@/lib/types";

/** Map legacy seed roles onto the current product roles. */
export function normalizeRole(role: string): UserRole {
  if (role === "owner" || role === "boss") return "owner";
  if (role === "herder" || role === "operator") return "operator";
  return "operator";
}

export function roleLabel(role: UserRole): string {
  return role === "owner" ? "Farm owner" : "Farm operator";
}

export function isOwner(role: UserRole): boolean {
  return role === "owner";
}
