// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Sidebar from "@/components/AdminUI/Sidebar";
import AdminHeader from "@/components/AdminUI/AdminHeader"; // We will create this next

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  // Security Gate
  if (!user) {
    redirect("/signin?mode=login");
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* 
        --- SIDEBAR AREA --- 
        Hidden on mobile (md:flex), fixed width on desktop.
        Glass effect applied via border and background.
      */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border bg-card/50 backdrop-blur-xl z-20">
        <Sidebar />
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* Top Header (Search, Profile, Theme Toggle) */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md z-10 sticky top-0 px-6 flex items-center justify-between">
           <AdminHeader user={user} />
        </header>

        {/* 
          Scrollable Content Canvas 
          This is where the Bento Grid lives. 
          p-4 md:p-8 gives it breathing room.
        */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}