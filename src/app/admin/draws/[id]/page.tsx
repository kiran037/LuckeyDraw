// src/app/admin/draws/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  Select,
  Button,
} from "@/components/ui";
import ImageUpload from "@/components/ui/Upload";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

type DrawStatus = "DRAFT" | "LIVE" | "CLOSED" | "RESULT_DECLARED";

interface EditDrawForm {
  title: string;
  description: string | null;
  bannerImage: string | null;
  rules: string | null;
  entryFee: number;
  startTime: string;
  endTime: string;
  maxTickets: number;
  status: DrawStatus;
}

export default function EditDrawPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [form, setForm] = useState<EditDrawForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    async function loadDraw() {
      const res = await fetch(`/api/admin/draws/${id}`, {
        credentials: "include",
      });

      const json = await res.json();
      if (!json.success || !json.data) return;

      const d = json.data;

      setForm({
        title: d.title,
        description: d.description ?? null,
        bannerImage: d.bannerImage ?? null,
        rules: d.rules ?? null,
        entryFee: d.entryFee,
        maxTickets: d.maxTickets,
        status: d.status,
        startTime: d.startTime.slice(0, 16),
        endTime: d.endTime.slice(0, 16),
      });
      
      setTicketCount(d.ticketCount || 0);
    }

    loadDraw();
  }, [id]);

  const submit = async () => {
    if (!form) return;
    
    setError(null);
    
    // Validation
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!form.maxTickets || form.maxTickets < ticketCount) {
      setError(`Max tickets cannot be less than already sold tickets (${ticketCount})`);
      return;
    }
    
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/draws/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description?.trim() || null,
          bannerImage: form.bannerImage,
          rules: form.rules?.trim() || null,
          entryFee: form.entryFee,
          maxTickets: form.maxTickets,
          status: form.status,
          startTime: new Date(form.startTime),
          endTime: new Date(form.endTime),
        }),
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        setError(json.message || "Failed to update draw");
        return;
      }

      router.push("/admin/draws");
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!form) {
    return (
      <div className="p-6 text-sm text-gray-500">Loading draw…</div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Edit Draw"
        description={`Editing: ${form.title}`}
        action={
          <Link href="/admin/draws">
            <Button variant="outline" leftIcon={<ArrowLeft size={18} />}>
              Back
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {ticketCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          ⓘ {ticketCount} ticket(s) already sold. Some fields may have restrictions.
        </div>
      )}

      <Card>
        <div className="space-y-6">
          <Input
            label="Draw Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />

          <ImageUpload
            label="Banner Image"
            value={form.bannerImage}
            onChange={(base64) => setForm({ ...form, bannerImage: base64 })}
          />

          <Textarea
            label="Rules & Terms"
            value={form.rules ?? ""}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
            rows={6}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Entry Fee"
              type="number"
              value={form.entryFee}
              onChange={(e) =>
                setForm({ ...form, entryFee: Number(e.target.value) })
              }
              disabled={ticketCount > 0}
              required
            />

            <Input
              label="Max Tickets"
              type="number"
              min={ticketCount}
              value={form.maxTickets}
              onChange={(e) =>
                setForm({ ...form, maxTickets: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Start Time"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
              required
            />

            <Input
              label="End Time"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
              required
            />
          </div>

          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as DrawStatus,
              })
            }
            options={[
              { value: "DRAFT", label: "DRAFT" },
              { value: "LIVE", label: "LIVE" },
              { value: "CLOSED", label: "CLOSED" },
              { value: "RESULT_DECLARED", label: "RESULT_DECLARED" },
            ]}
          />

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              loading={loading}
              leftIcon={<Save size={18} />}
            >
              Update Draw
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}