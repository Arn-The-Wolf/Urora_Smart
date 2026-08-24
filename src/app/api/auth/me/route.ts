import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";

export async function GET() {
  return withAuth(async (session) => NextResponse.json(session));
}
