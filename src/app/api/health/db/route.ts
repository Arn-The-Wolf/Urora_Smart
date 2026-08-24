import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrl = process.env["DATABASE_URL"] ?? process.env["POSTGRES_URL"] ?? "";
  const mode = databaseUrl.startsWith("postgres")
    ? "neon"
    : process.env["VERCEL"]
      ? "memory"
      : "pglite-file";

  try {
    const { getDb } = await import("@/lib/db");
    const db = await getDb();
    // Touch a real query so schema/seed run before we report healthy.
    const { users } = await import("@/lib/db/schema");
    const rows = await db.select({ email: users.email }).from(users).limit(5);
    return NextResponse.json({
      ok: true,
      mode,
      hasDatabaseUrl: Boolean(databaseUrl),
      userCountSample: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        mode,
        hasDatabaseUrl: Boolean(databaseUrl),
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
