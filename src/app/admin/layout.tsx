// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Sidebar from "@/components/AdminUI/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  // If not logged in or not admin, redirect to signin
  if (!user) {
    redirect("/signin?mode=login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="p-10 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}