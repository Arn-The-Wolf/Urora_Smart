import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthFrame } from "@/components/auth/auth-frame";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <AuthFrame title="Welcome back." subtitle="Sign in to continue managing your herd. Email for now — SMS OTP can wait.">
      <LoginForm />
    </AuthFrame>
  );
}
