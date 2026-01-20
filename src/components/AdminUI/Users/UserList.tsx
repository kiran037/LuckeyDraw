"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit2, UserX, UserCheck, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/AdminUI/ui/Badge";
import { Button } from "@/components/AdminUI/ui/Button";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  mobile?: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserListProps {
  users: UserItem[];
  meta: UserMeta;
}

export default function UserList({ users }: UserListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleStatus = async (id: string, isActive: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${isActive ? "block" : "activate"} this user?`
      )
    )
      return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update user");
      }

      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoadingId(null);
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed rounded-xl">
        <Users className="mx-auto mb-4 w-6 h-6 text-zinc-400" />
        <p className="text-sm text-zinc-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
          <tr>
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {users.map((user) => {
            const isLoading = loadingId === user.id;

            return (
              <tr key={user.id} className="group">
                {/* USER */}
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name ?? "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {(user.name ?? "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.name ?? "—"}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* PHONE */}
                <td className="p-3">{user.mobile ?? "—"}</td>

                {/* ROLE */}
                <td className="p-3">
                  <Badge>{user.role}</Badge>
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <Badge variant={user.isActive ? "success" : "neutral"}>
                    {user.isActive ? "Active" : "Blocked"}
                  </Badge>
                </td>

                {/* ACTION */}
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isLoading}
                      onClick={() => toggleStatus(user.id, user.isActive)}
                      title={user.isActive ? "Block user" : "Activate user"}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : user.isActive ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
