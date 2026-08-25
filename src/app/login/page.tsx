import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthFrame } from "@/components/auth/auth-frame";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <AuthFrame title="Welcome back." subtitle="Sign in as farm owner or farm operator. Owners see money and reports; operators keep full daily herd tools.">
      <LoginForm />
    </AuthFrame>
  );
}
