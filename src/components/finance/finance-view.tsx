"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BusyButton } from "@/components/loading/busy-button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { formatShortDate, todayInKigali } from "@/lib/dates";
import type { Expense, MilkSale } from "@/lib/types";

function formatRwf(amount: number) {
  return `${amount.toLocaleString("en-RW", { maximumFractionDigits: 0 })} RWF`;
}

export function FinanceView({
  expenses,
  sales,
  summary,
}: {
  expenses: Expense[];
  sales: MilkSale[];
  summary: {
    month: string;
    expenseTotal: number;
    salesTotal: number;
    net: number;
    litersSold: number;
  };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"sale" | "expense">("sale");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, ...Object.fromEntries(form.entries()) }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save");
      toast.success(tab === "sale" ? "Milk sale recorded" : "Expense recorded");
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-enter space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">OWNER VIEW</p>
        <h1 className="text-[28px] tracking-[-1px]">Money · milk sales & expenses</h1>
        <p className="text-sm text-muted-foreground">Track liters sold, buyers, and farm spend for {summary.month}.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat title="Sales this month" value={formatRwf(summary.salesTotal)} meta={`${summary.litersSold} L sold`} />
        <Stat title="Expenses" value={formatRwf(summary.expenseTotal)} meta="All categories" />
        <Stat title="Net" value={formatRwf(summary.net)} meta={summary.net >= 0 ? "In the black" : "In the red"} />
        <Stat title="Records" value={String(sales.length + expenses.length)} meta={`${sales.length} sales · ${expenses.length} expenses`} />
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "sale" ? "default" : "outline"} onClick={() => setTab("sale")}>
          Milk sale
        </Button>
        <Button variant={tab === "expense" ? "default" : "outline"} onClick={() => setTab("expense")}>
          Expense
        </Button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[15px] border border-border bg-card p-5 md:grid-cols-2">
        <Field label="Date">
          <Input name="date" type="date" required defaultValue={todayInKigali()} className="h-12 bg-input" />
        </Field>
        {tab === "sale" ? (
          <>
            <Field label="Liters sold">
              <Input name="liters" type="number" step="0.1" required className="h-12 bg-input" />
            </Field>
            <Field label="Price per liter (RWF)">
              <Input name="pricePerLiter" type="number" step="1" required defaultValue="400" className="h-12 bg-input" />
            </Field>
            <Field label="Buyer">
              <Input name="buyer" placeholder="Co-op / neighbour / collection centre" className="h-12 bg-input" />
            </Field>
          </>
        ) : (
          <>
            <Field label="Category">
              <select name="category" className="h-12 rounded-[9px] border border-border bg-input px-3">
                <option value="feed">Feed</option>
                <option value="medicine">Medicine</option>
                <option value="vet">Vet</option>
                <option value="labor">Labor</option>
                <option value="transport">Transport</option>
                <option value="equipment">Equipment</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Amount (RWF)">
              <Input name="amount" type="number" step="1" required className="h-12 bg-input" />
            </Field>
            <Field label="Vendor">
              <Input name="vendor" placeholder="Shop / supplier" className="h-12 bg-input" />
            </Field>
          </>
        )}
        <Field label="Notes" className="md:col-span-2">
          <Input name="notes" className="h-12 bg-input" />
        </Field>
        <BusyButton type="submit" busy={saving} busyLabel="Saving…" className="h-11 md:col-span-2">
          {tab === "sale" ? "Record sale" : "Record expense"}
        </BusyButton>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-[15px] border border-border bg-card">
          <h2 className="border-b border-[#edf1ed] px-4 py-3 text-sm font-semibold">Recent sales</h2>
          {sales.slice(0, 12).map((sale) => (
            <div key={sale.id} className="flex justify-between border-t border-[#edf1ed] px-4 py-3 first:border-t-0">
              <div>
                <b className="block text-sm">{sale.liters} L · {sale.buyer || "Buyer"}</b>
                <span className="text-xs text-muted-foreground">{formatShortDate(sale.date)}</span>
              </div>
              <strong className="text-sm text-[#397c52]">{formatRwf(sale.totalAmount)}</strong>
            </div>
          ))}
          {sales.length === 0 ? <p className="px-4 py-6 text-sm text-muted-foreground">No sales yet.</p> : null}
        </div>
        <div className="overflow-hidden rounded-[15px] border border-border bg-card">
          <h2 className="border-b border-[#edf1ed] px-4 py-3 text-sm font-semibold">Recent expenses</h2>
          {expenses.slice(0, 12).map((expense) => (
            <div key={expense.id} className="flex justify-between border-t border-[#edf1ed] px-4 py-3 first:border-t-0">
              <div>
                <b className="block text-sm capitalize">{expense.category} · {expense.vendor || "—"}</b>
                <span className="text-xs text-muted-foreground">{formatShortDate(expense.date)}</span>
              </div>
              <strong className="text-sm">{formatRwf(expense.amount)}</strong>
            </div>
          ))}
          {expenses.length === 0 ? <p className="px-4 py-6 text-sm text-muted-foreground">No expenses yet.</p> : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <div className="rounded-[15px] border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-xl font-semibold tracking-[-0.5px]">{value}</p>
      <p className="mt-1 text-[11px] text-[#718079]">{meta}</p>
    </div>
  );
}
