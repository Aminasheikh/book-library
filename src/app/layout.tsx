import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SupabaseSync } from "@/components/SupabaseSync";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumen Library — Your Personal Book Universe",
  description:
    "A premium personal book library. Organize, search, categorize, rate, track reading progress, and manage borrowing history with a beautiful glassmorphism UI.",
  keywords: ["book library", "reading tracker", "personal library", "book manager"],
  authors: [{ name: "Lumen Library" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <div className="aurora-bg" aria-hidden="true" />
        <SupabaseSync />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "!glass-strong !text-fg !border-border-strong",
            duration: 3500,
          }}
        />
      </body>
    </html>
  );
}
