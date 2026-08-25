import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/api";
import {
  createExpense,
  createMilkSale,
  getFinanceSummary,
  listExpenses,
  listMilkSales,
} from "@/modules/finance/service";
import { logActivity } from "@/modules/activity/service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ?? undefined;
  return withAuth(async (session) => {
    if (session.user.role !== "owner") return jsonError("Only the farm owner can view money records", 403);
    const [expenses, sales, summary] = await Promise.all([
      listExpenses(session.farm.id),
      listMilkSales(session.farm.id),
      getFinanceSummary(session.farm.id, month),
    ]);
    return NextResponse.json({ expenses, sales, summary });
  }, ["owner"]);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { type?: string } & Record<string, unknown>;
  return withAuth(async (session) => {
    if (session.user.role !== "owner") return jsonError("Only the farm owner can record money", 403);
    if (body.type === "sale") {
      const sale = await createMilkSale(session.farm.id, body, session.user.name);
      await logActivity(session.farm.id, {
        userId: session.user.id,
        userName: session.user.name,
        action: "created",
        entity: "milk_sale",
        entityId: sale.id,
        detail: `${sale.liters} L · ${sale.totalAmount} RWF`,
      });
      return NextResponse.json({ sale }, { status: 201 });
    }
    const expense = await createExpense(session.farm.id, body, session.user.name);
    await logActivity(session.farm.id, {
      userId: session.user.id,
      userName: session.user.name,
      action: "created",
      entity: "expense",
      entityId: expense.id,
      detail: `${expense.category} · ${expense.amount} RWF`,
    });
    return NextResponse.json({ expense }, { status: 201 });
  }, ["owner"]);
}
