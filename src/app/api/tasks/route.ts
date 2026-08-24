import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createTask, listTasks, toggleTask } from "@/modules/tasks/service";

export async function GET() {
  return withAuth(async (session) => {
    const tasks = await listTasks(session.farm.id);
    return NextResponse.json({ tasks });
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return withAuth(async (session) => {
    const task = await createTask(session.farm.id, body);
    return NextResponse.json({ task }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: string };
  return withAuth(async (session) => {
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const task = await toggleTask(session.farm.id, body.id);
    return NextResponse.json({ task });
  });
}
