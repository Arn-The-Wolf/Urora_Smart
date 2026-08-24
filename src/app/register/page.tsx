import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthFrame } from "@/components/auth/auth-frame";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <AuthFrame title="Start your farm workspace." subtitle="Create your account and bring milk, health, stock, and the wash schedule together.">
      <RegisterForm />
    </AuthFrame>
  );
}
