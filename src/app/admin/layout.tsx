import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth"; // Keep your existing auth logic
import AdminSidebar from "@/components/AdminUI/Layout/AdminSidebar";
import AdminHeader from "@/components/AdminUI/Layout/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  if (!user) {
    redirect("/signin?mode=login");
  }

  const serializableUser = {
    name: user.name,
    email: user.email || "",
    role: user.role,
    avatar: user.avatar,
  };

  return (
    // Main Container: Screen height, Zinc background for contrast
    <div className="flex flex-col h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      
      {/* 1. Header: Full width at the top */}
      <AdminHeader user={serializableUser} />

      {/* 2. Workspace: Sidebar + Main Content side-by-side */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar: Fixed width, scrollable if needed */}
        <AdminSidebar />
        
        {/* Main Content: Scrollable area */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-6 md:p-8">
          <div className="mx-auto w-full animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}