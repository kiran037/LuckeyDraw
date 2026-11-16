export const dynamic = "force-dynamic";

import DrawForm from "@/components/AdminUI/Draws/DrawForm";
import { headers, cookies } from "next/headers";

async function getDraw(id: string) {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/admin/draws/${id}`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    return json.draw; 
  } catch {
    return null;
  }
}

export default async function EditDrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draw = await getDraw(id);

  if (!draw) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Draw Not Found</h2>
          <p className="text-zinc-500 text-sm mt-1">The draw you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <DrawForm initialData={draw} />
    </div>
  );
}