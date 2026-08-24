import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createStock, listStock, moveStock } from "@/modules/inventory/service";

export async function GET() {
  return withAuth(async (session) => {
    const items = await listStock(session.farm.id);
    return NextResponse.json({ items });
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return withAuth(async (session) => {
    const item = await createStock(session.farm.id, body);
    return NextResponse.json({ item }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  return withAuth(async (session) => {
    const item = await moveStock(session.farm.id, body);
    return NextResponse.json({ item });
  });
}
