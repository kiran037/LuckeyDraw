// src/app/admin/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Badge, Button, Modal, Textarea, Avatar } from "@/components/ui";
import { Eye, ExternalLink } from "lucide-react";

interface Payment {
  id: number;
  amount: number;
  transactionId: string;
  status: string;
  screenshot?: string;
  user: {
    name: string;
  };
  draw: {
    title: string;
  };
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((res) => setPayments(res.data || []));
  };

  useEffect(load, []);

  const action = async (status: "APPROVED" | "REJECTED") => {
    if (!selected?.id) return;
    setLoading(true);
    
    await fetch(`/api/admin/payments/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        remark,
        adminId: 1,
      }),
    });

    setSelected(null);
    setRemark("");
    setLoading(false);
    load();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Approvals"
        description="Review and approve payment submissions"
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  User
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Draw
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Transaction ID
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        fallback={p.user.name[0]}
                        size="sm"
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        {p.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {p.draw.title}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">
                    ₹{p.amount}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                    {p.transactionId}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Badge variant={getStatusVariant(p.status)}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(p)}
                      leftIcon={<Eye size={16} />}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Payment Review"
        description="Review and approve or reject this payment"
        size="md"
      >
        {selected && (
          <div className="space-y-6">
            {/* Payment Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">User</span>
                <span className="text-sm font-bold text-gray-900">
                  {selected.user.name}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Draw</span>
                <span className="text-sm font-bold text-gray-900">
                  {selected.draw.title}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Amount</span>
                <span className="text-sm font-bold text-gray-900">
                  ₹{selected.amount}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Transaction ID</span>
                <span className="text-sm font-mono text-gray-900">
                  {selected.transactionId}
                </span>
              </div>
            </div>

            {/* Screenshot */}
            {selected.screenshot && (
              <a
                href={selected.screenshot}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-semibold text-sm"
              >
                <ExternalLink size={16} />
                View Payment Screenshot
              </a>
            )}

            {/* Remark */}
            <Textarea
              label="Admin Remark"
              placeholder="Add your remarks here..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
            />

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelected(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => action("REJECTED")}
                loading={loading}
                className="flex-1"
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => action("APPROVED")}
                loading={loading}
                className="flex-1"
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}