import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster dari sonner

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Pengajuan",
  description: "Untuk mempermudah pengajuan di perusahaan anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}