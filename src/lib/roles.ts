import type { UserRole } from "@/lib/types";

/** Map legacy seed roles onto the current product roles. */
export function normalizeRole(role: string): UserRole {
  if (role === "owner" || role === "boss") return "boss";
  if (role === "herder" || role === "operator") return "operator";
  return "operator";
}

export function roleLabel(role: UserRole): string {
  return role === "boss" ? "Farm boss" : "Farm operator";
}

export function isBoss(role: UserRole): boolean {
  return role === "boss";
}
