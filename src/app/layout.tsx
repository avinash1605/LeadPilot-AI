import type { Metadata } from "next";
import { Toaster } from "sonner";
import { DemoBanner } from "@/components/layout/demo-banner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LeadPilot AI",
  description: "AI-powered lead operations workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <DemoBanner />
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            classNames: {
              toast:
                "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-lg",
              description: "text-zinc-400",
              actionButton: "bg-indigo-600 text-white",
              success: "border-emerald-500/30",
              error: "border-red-500/30",
              info: "border-indigo-500/30",
            },
          }}
        />
      </body>
    </html>
  );
}
