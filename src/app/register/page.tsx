import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthFrame } from "@/components/auth/auth-frame";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <AuthFrame title="Start your farm workspace." subtitle="You’ll register as the farm owner. Add operators later for field work while you keep money and reports.">
      <RegisterForm />
    </AuthFrame>
  );
}
