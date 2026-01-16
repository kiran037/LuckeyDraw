export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import ProfileForm from "@/components/AdminUI/Profile/ProfileForm";

async function getProfile() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/user/profile`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    // Structure based on your API: { success: true, data: { user: {...}, stats: {...} } }
    return json.data;
  } catch (e) {
    console.error("Profile fetch error:", e);
    return null;
  }
}

export default async function ProfilePage() {
  const data = await getProfile();

  if (!data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-900">Failed to load profile</h2>
          <p className="text-zinc-500 text-sm mt-1">Please try refreshing the page or logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <ProfileForm user={data.user} stats={data.stats} />
    </div>
  );
}