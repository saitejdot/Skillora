import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { CategoryNav } from "@/components/layout/category-nav";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Skillora | Student Freelance Marketplace",
  description:
    "Your skills. Your opportunities. Your marketplace. Discover talented college students offering design, coding, tutoring, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans min-h-screen flex flex-col bg-slate-50/50">
        <Providers>
          <Navbar />
          <CategoryNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
