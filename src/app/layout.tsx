import { Geist } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Urora Smart",
    template: "%s · Urora Smart",
  },
  description: "Cattle, milk, health, stock, and daily farm work in one calm workspace. Built for farms in Rwanda.",
  applicationName: "Urora Smart",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Urora Smart",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#173d31",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className={`${geist.className} min-h-full bg-background text-foreground antialiased`}>
        {children}
        <Toaster position="top-center" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
