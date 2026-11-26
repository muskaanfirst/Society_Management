import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "SocMag — Campus Societies",
  description: "Discover, apply, and manage campus societies.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AppProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
