"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusyButton } from "@/components/loading/busy-button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { todayInKigali } from "@/lib/dates";
import type { FarmTask } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ScheduleView({ tasks }: { tasks: FarmTask[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const done = tasks.filter((task) => task.status === "done").length;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save");
      toast.success("Task added");
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string) {
    await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <div className="page-enter space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">DAILY OPERATIONS</p>
        <h1 className="text-[28px] tracking-[-1px]">Schedule <span className="ml-2 rounded-full bg-[#dfeee0] px-2 py-0.5 text-xs text-[#3a7552]">{done}/{tasks.length}</span></h1>
        <p className="text-sm text-muted-foreground">Milking, tick spray, sick-cow checks, salt, and restock — ticked off as the day runs.</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[15px] border border-border bg-card p-5 md:grid-cols-2">
        <Field label="Task" className="md:col-span-2"><Input name="title" required placeholder="Evening milking" className="h-12 bg-input" /></Field>
        <Field label="Category">
          <select name="category" className="h-12 rounded-[9px] border border-border bg-input px-3">
            <option value="milking">Milking</option>
            <option value="wash">Wash / dip</option>
            <option value="health">Health</option>
            <option value="feed">Feed / salt</option>
            <option value="stock">Stock</option>
            <option value="routine">Routine</option>
          </select>
        </Field>
        <Field label="Due date"><Input name="dueDate" type="date" required defaultValue={todayInKigali()} className="h-12 bg-input" /></Field>
        <Field label="Time"><Input name="dueTime" type="time" className="h-12 bg-input" /></Field>
        <Field label="Notes" className="md:col-span-2"><Input name="notes" placeholder="Optional detail" className="h-12 bg-input" /></Field>
        <BusyButton type="submit" busy={saving} busyLabel="Saving…" className="h-11 self-end md:col-span-2">Add task</BusyButton>
      </form>

      <div className="rounded-[15px] border border-border bg-card px-5">
        {tasks.map((task) => (
          <label key={task.id} className={cn("flex cursor-pointer items-center gap-3.5 border-b border-border py-4 last:border-b-0", task.status === "done" && "opacity-60")}>
            <input type="checkbox" checked={task.status === "done"} onChange={() => void toggle(task.id)} className="size-4 accent-primary" />
            <CheckCircle2 className={cn("size-4", task.status === "done" ? "text-[#4c9b65]" : "text-[#9bb6a3]")} />
            <div className="flex-1">
              <b className={cn("block text-sm", task.status === "done" && "line-through text-[#84948c]")}>{task.title}</b>
              <small className="text-xs text-muted-foreground">{task.category} · {task.dueDate}{task.dueTime ? ` · ${task.dueTime}` : ""}</small>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
