import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, withAuth } from "@/lib/api";
import { applySync } from "@/modules/sync/service";

const mutationSchema = z.object({
  lastPulledAt: z.string().datetime().nullable(),
  mutations: z.array(
    z.object({
      entity: z.enum(["cow", "milking"]),
      op: z.enum(["upsert", "delete"]),
      record: z.record(z.string(), z.unknown()),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const body = mutationSchema.parse(await request.json());
    return withAuth(async (session) => {
      const result = await applySync(
        session.farm.id,
        body.lastPulledAt,
        body.mutations as Parameters<typeof applySync>[2],
      );
      return NextResponse.json(result);
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
