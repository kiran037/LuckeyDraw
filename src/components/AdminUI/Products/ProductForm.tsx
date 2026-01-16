"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Loader2, Search } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import { Input } from "@/components/AdminUI/ui/Input";
import { ImageUploader } from "@/components/AdminUI/ui/ImageUploader";
import { Card } from "@/components/AdminUI/ui/Card";
import { Badge } from "@/components/AdminUI/ui/Badge";

interface Draw {
  id: string;
  title: string;
  status: string;
}

interface Winner {
  id: string;
  ticket: {
    ticketCode: string;
    user: {
      id: string;
      name: string;
      email: string | null;
      mobile: string;
    };
  };
  admin: {
    id: string;
    name: string;
  };
  declaredAt: string;
}

interface ProductData {
  id?: string;
  name: string;
  image: string | null;
  quantity: number;
  description: string;
  drawId: string;
  draw?: Draw;
  winner?: Winner[];
  winnersCount?: number;
  remainingQuantity?: number;
}

export default function ProductForm({ initialData }: { initialData?: ProductData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchingDraws, setSearchingDraws] = useState(false);
  const [availableDraws, setAvailableDraws] = useState<Draw[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<ProductData>(
    initialData || {
      name: "",
      image: null,
      quantity: 1,
      description: "",
      drawId: "",
    }
  );

  const handleChange = (field: keyof ProductData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchDraws = async () => {
      setSearchingDraws(true);
      try {
        const res = await fetch(`/api/admin/draws?search=${encodeURIComponent(searchQuery)}&limit=20`);
        if (res.ok) {
          const json = await res.json();
          setAvailableDraws(json.draws || []);
        }
      } catch (err) {
        console.error("Failed to fetch draws:", err);
      } finally {
        setSearchingDraws(false);
      }
    };

    const debounce = setTimeout(fetchDraws, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }

    if (!formData.drawId && !initialData?.id) {
      setError("Please select a draw");
      return;
    }

    if (formData.quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    if (initialData?.winnersCount && formData.quantity < initialData.winnersCount) {
      setError(`Quantity cannot be less than current winners count (${initialData.winnersCount})`);
      return;
    }

    setLoading(true);

    try {
      const isEdit = !!initialData?.id;
      const url = isEdit ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        name: formData.name,
        image: formData.image,
        quantity: Number(formData.quantity),
        description: formData.description,
        ...(isEdit ? {} : { drawId: formData.drawId })
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!initialData?.id;
  const hasWinners = (initialData?.winnersCount || 0) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-10 py-4 border-b border-zinc-200 dark:border-zinc-800 -mx-6 px-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {isEditMode ? "Edit Product" : "New Product"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Product Details">
            <div className="space-y-4">
              <Input
                label="Product Name"
                placeholder="e.g. iPhone 15 Pro Max"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  className="w-full min-h-[100px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100"
                  placeholder="Describe the product..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <Input
                label="Quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                disabled={hasWinners}
              />
              
              {hasWinners && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Quantity cannot be reduced below winners count ({initialData?.winnersCount})
                </p>
              )}
            </div>
          </Card>

          {isEditMode && initialData?.winner && initialData.winner.length > 0 && (
            <Card title={`Winners (${initialData.winner.length})`}>
              <div className="space-y-3">
                {initialData.winner.map((winner) => (
                  <div key={winner.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {winner.ticket.user.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Ticket: {winner.ticket.ticketCode} • {winner.ticket.user.mobile}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Declared by {winner.admin.name}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">Winner</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Configuration">
            <div className="space-y-4">
              <ImageUploader
                label="Product Image"
                value={formData.image}
                onChange={(path) => handleChange("image", path)}
              />

              {!isEditMode && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Select Draw</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      placeholder="Search draws..."
                      className="w-full h-9 pl-9 pr-3 text-sm rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-zinc-400 dark:text-zinc-100"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {searchingDraws ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    </div>
                  ) : (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                      {availableDraws.length > 0 ? (
                        availableDraws.map((draw) => (
                          <button
                            key={draw.id}
                            type="button"
                            onClick={() => handleChange("drawId", draw.id)}
                            className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                              formData.drawId === draw.id
                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{draw.title}</span>
                              <Badge variant="neutral" size="sm" className="capitalize ml-2">
                                {draw.status.toLowerCase()}
                              </Badge>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 text-center py-4">
                          {searchQuery ? "No draws found" : "Search to find draws"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isEditMode && initialData?.draw && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Assigned Draw</label>
                  <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{initialData.draw.title}</p>
                    <Badge variant="neutral" size="sm" className="mt-2 capitalize">
                      {initialData.draw.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}