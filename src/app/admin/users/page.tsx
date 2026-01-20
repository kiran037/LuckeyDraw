export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import UserList from "@/components/AdminUI/Users/UserList";
import { headers, cookies } from "next/headers";

async function getUsers() {
    const headerList = await headers();
    const cookieStore = await cookies();

    const host = headerList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/admin/users?limit=20`, {
        cache: "no-store",
        headers: { Cookie: cookieStore.toString() },
    });

    if (!res.ok) {
        return { users: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }

    return res.json();
}

export default async function UsersPage() {
    const data = await getUsers();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Users</h1>
                    <p className="text-sm text-zinc-500">Manage users.</p>
                </div>
                <Link href="/admin/users/create">
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                    </Button>
                </Link>
            </div>

            <UserList users={data.users} meta={data.meta} />
        </div>
    );
}
