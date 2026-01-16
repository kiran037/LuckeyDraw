"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import { Input } from "@/components/AdminUI/ui/Input";

interface Draw {
  id: string;
  title: string;
  status: string;
  entryFee: number;
}

interface User {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
}

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [searchDrawQuery, setSearchDrawQuery] = useState("");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [draws, setDraws] = useState<Draw[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchingDraws, setSearchingDraws] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [count, setCount] = useState(1);
  const [customPrice, setCustomPrice] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchDraws = async () => {
      setSearchingDraws(true);
      try {
        const res = await fetch(`/api/admin/draws?search=${encodeURIComponent(searchDrawQuery)}&status=LIVE&limit=10`);
        if (res.ok) {
          const json = await res.json();
          setDraws(json.draws || []);
        }
      } catch (err) {
        console.error("Failed to fetch draws:", err);
      } finally {
        setSearchingDraws(false);
      }
    };

    const debounce = setTimeout(fetchDraws, 300);
    return () => clearTimeout(debounce);
  }, [searchDrawQuery, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchUserQuery)}&limit=10`);
        if (res.ok) {
          const json = await res.json();
          setUsers(json.users || []);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setSearchingUsers(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchUserQuery, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedDraw || !selectedUser) {
      setError("Please select both a draw and a user");
      return;
    }

    if (count < 1) {
      setError("Count must be at least 1");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, string | number> = {
        drawId: selectedDraw.id,
        userId: selectedUser.id,
        count: Number(count)
      };

      if (customPrice) {
        payload.pricePaid = Number(customPrice);
      }

      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to create tickets");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDraw(null);
    setSelectedUser(null);
    setCount(1);
    setCustomPrice("");
    setError("");
    setSearchDrawQuery("");
    setSearchUserQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Create Manual Ticket</h3>
          <Button size="icon" variant="ghost" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Select Draw */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select Draw</label>
            {selectedDraw ? (
              <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedDraw.title}</p>
                  <p className="text-xs text-zinc-500">Entry: ₹{selectedDraw.entryFee}</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedDraw(null)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    placeholder="Search draws..."
                    className="w-full h-9 pl-9 pr-3 text-sm rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-zinc-400 dark:text-zinc-100"
                    value={searchDrawQuery}
                    onChange={(e) => setSearchDrawQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                  {searchingDraws ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    </div>
                  ) : draws.length > 0 ? (
                    draws.map((draw) => (
                      <button
                        key={draw.id}
                        type="button"
                        onClick={() => setSelectedDraw(draw)}
                        className="w-full text-left p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md text-sm transition-colors"
                      >
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{draw.title}</p>
                        <p className="text-xs text-zinc-500">Entry: ₹{draw.entryFee}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 text-center py-4">
                      {searchDrawQuery ? "No draws found" : "Search to find draws"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Select User */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select User</label>
            {selectedUser ? (
              <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedUser.name}</p>
                  <p className="text-xs text-zinc-500">{selectedUser.mobile}</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedUser(null)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    placeholder="Search users by name or mobile..."
                    className="w-full h-9 pl-9 pr-3 text-sm rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-zinc-400 dark:text-zinc-100"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                  {searchingUsers ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    </div>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="w-full text-left p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md text-sm transition-colors"
                      >
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.mobile}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 text-center py-4">
                      {searchUserQuery ? "No users found" : "Search to find users"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ticket Count"
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              required
            />
            <Input
              label="Custom Price (Optional)"
              type="number"
              prefix="₹"
              placeholder={selectedDraw ? `Default: ₹${selectedDraw.entryFee}` : ""}
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
          </div>

          {selectedDraw && (
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              Will create <strong>{count}</strong> ticket{count > 1 ? 's' : ''} at{" "}
              <strong>₹{customPrice || selectedDraw.entryFee}</strong> each for <strong>{selectedUser?.name || "selected user"}</strong>
            </div>
          )}
        </form>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedDraw || !selectedUser} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket{count > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}