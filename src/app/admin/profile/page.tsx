export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import ProfileForm from "@/components/AdminUI/Profile/ProfileForm";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import Link from "next/link";

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

    if (!res.ok) {
      console.error("Profile API returned:", res.status, res.statusText);
      return null;
    }
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const data = await getProfile();

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Failed to Load Profile
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              We couldn't retrieve your profile information. Please try again or contact support.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Link href="/login">
                <Button variant="secondary">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <ProfileForm user={data.user} stats={data.stats} />
    </div>
  );
}