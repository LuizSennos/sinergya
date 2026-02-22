import Sidebar from "@/components/SidePanel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen bg-sinergya-background overflow-hidden">
      <Sidebar />
      <section className="flex-1 m-4 ml-0 rounded-2xl bg-white shadow-soft overflow-hidden flex flex-col">
        {children}
      </section>
    </main>
  );
}