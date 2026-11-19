import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Blue 3D Anatomy Atlas",
  description: "Standalone interactive 3D Human Anatomy Atlas & 3D Organs Atelier.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060913] text-slate-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
