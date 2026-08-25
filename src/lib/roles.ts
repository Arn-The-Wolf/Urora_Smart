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

export function isOperator(role: UserRole): boolean {
  return role === "operator";
}

/** Money, reports, and activity — farm owner only. */
export function canViewOwnerInsights(role: UserRole): boolean {
  return role === "owner";
}

/** Farm profile, digests, and kraals — farm owner only. */
export function canManageFarm(role: UserRole): boolean {
  return role === "owner";
}

/** Daily herd work both roles share. */
export const SHARED_WORKSPACE_PATHS = [
  "/dashboard",
  "/alerts",
  "/cattle",
  "/milk",
  "/health",
  "/breeding",
  "/stock",
  "/wash",
  "/schedule",
  "/settings",
] as const;

export const OWNER_ONLY_PATHS = ["/finance", "/reports", "/activity"] as const;
