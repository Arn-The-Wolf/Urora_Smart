import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UroraMark } from "@/components/brand/logo";

export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full items-center justify-center bg-[#f4f7f1] px-5 py-10">
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute top-5 left-5 inline-flex size-11 items-center justify-center rounded-full border border-[#dfe8df] bg-white text-[#173d31] shadow-sm transition hover:border-[#b9cbbd] hover:bg-[#f6faf5]"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <div className="w-full max-w-[410px] rounded-[20px] bg-white p-8 shadow-[0_25px_70px_#173d3140]">
        <UroraMark />
        <p className="mt-6 text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">URORA SMART</p>
        <h1 className="mt-1 text-[28px] tracking-[-1px]">{title}</h1>
        <p className="mt-2 mb-6 text-[13px] text-[#718079]">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
