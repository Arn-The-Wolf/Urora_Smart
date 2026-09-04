import { redirect } from "next/navigation";

/** Reports are hidden for now — keep route from 404. */
export default function ReportsPage() {
  redirect("/dashboard");
}
