"use client";

import { useState } from "react";
import { Button } from "@/components/AdminUI/ui/Button";

const SOURCES = ["ADMIN_ADJUSTMENT"] as const;

export default function AddWalletModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [source, setSource] = useState("ADMIN_ADJUSTMENT");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!amount) return alert("Enter amount");

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          type,
          source,
          remark,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(`Wallet updated. New balance: ₹${data.balance}`);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open)
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        💰 Adjust Wallet
      </Button>
    );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold">Wallet Adjustment</h3>

        {/* Amount */}
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        {/* Type */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="CREDIT">➕ Credit (Add)</option>
          <option value="DEBIT">➖ Debit (Minus)</option>
        </select>

        {/* Source */}
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Remark */}
        <input
          type="text"
          placeholder="Remark (optional)"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
