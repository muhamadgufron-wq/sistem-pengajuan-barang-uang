import PageTransition from "@/components/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout ini akan membungkus semua halaman di dalam grup (dashboard)
  // dengan animasi transisi.
  return (
      <PageTransition>
          {children}
      </PageTransition>
  );
}