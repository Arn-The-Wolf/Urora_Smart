import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

/** Entry: valid session → dashboard; expired / none → login. */
export default async function HomePage() {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
