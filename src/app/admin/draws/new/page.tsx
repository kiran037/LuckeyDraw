// src/app/admin/draws/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader, Card, Input, Textarea, Select, Button } from "@/components/ui";
import ImageUpload from "@/components/ui/Upload";
import { Save, ArrowLeft } from "lucide-react";

export default function NewDrawPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    bannerImage: null as string | null,
    rules: "",
    entryFee: "501",
    maxTickets: "",
    startTime: "",
    endTime: "",
    status: "DRAFT",
  });

  const submit = async () => {
    setError(null);
    
    // Validation
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!form.maxTickets || Number(form.maxTickets) < 1) {
      setError("Max tickets must be at least 1");
      return;
    }
    
    if (!form.startTime || !form.endTime) {
      setError("Start and end times are required");
      return;
    }
    
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          bannerImage: form.bannerImage,
          rules: form.rules.trim() || null,
          entryFee: Number(form.entryFee),
          maxTickets: Number(form.maxTickets),
          startTime: form.startTime,
          endTime: form.endTime,
          status: form.status,
        }),
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        setError(json.message || "Failed to create draw");
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

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Create Lucky Draw"
        description="Add a new lucky draw with all details"
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

      <Card>
        <div className="space-y-6">
          <Input
            label="Draw Title"
            placeholder="e.g., iPhone 15 Pro Max Giveaway"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe what's being offered and any special details..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />

          <ImageUpload
            label="Banner Image"
            value={form.bannerImage}
            onChange={(base64) => setForm({ ...form, bannerImage: base64 })}
            required
          />

          <Textarea
            label="Rules & Terms"
            placeholder="Enter the rules and terms for this draw..."
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
            rows={6}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Entry Fee"
              value={form.entryFee}
              onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
              options={[
                { value: "501", label: "₹501" },
                { value: "1100", label: "₹1100" },
                { value: "2100", label: "₹2100" },
                { value: "5100", label: "₹5100" },
              ]}
              required
            />

            <Input
              label="Max Tickets"
              type="number"
              min="1"
              placeholder="e.g., 1000"
              value={form.maxTickets}
              onChange={(e) => setForm({ ...form, maxTickets: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Start Time"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />

            <Input
              label="End Time"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
          </div>

          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: "DRAFT", label: "DRAFT - Not visible to users" },
              { value: "LIVE", label: "LIVE - Visible and accepting entries" },
            ]}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
              Create Draw
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}