"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, X, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import { Input } from "@/components/AdminUI/ui/Input";
import { ImageUploader } from "@/components/AdminUI/ui/ImageUploader";
import { Card } from "@/components/AdminUI/ui/Card";
import { Badge } from "@/components/AdminUI/ui/Badge";

interface Product {
  id: string;
  name: string;
  image?: string | null;
  quantity: number;
}

interface DrawData {
  id?: string;
  title: string;
  description: string;
  bannerImage: string | null;
  entryFee: number;
  maxTickets: number;
  startTime: string;
  endTime: string;
  status: string;
  drawproduct: Product[];
}

export default function DrawForm({ initialData }: { initialData?: DrawData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<DrawData>(() => {
    if (initialData) {
      return {
        ...initialData,
        startTime: initialData.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : "",
        endTime: initialData.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : "",
      };
    }
    return {
      title: "",
      description: "",
      bannerImage: null,
      entryFee: 0,
      maxTickets: 100,
      startTime: "",
      endTime: "",
      status: "DRAFT",
      drawproduct: [],
    };
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleChange = (field: keyof DrawData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      drawproduct: prev.drawproduct.filter(p => p.id !== productId)
    }));
  };

  const handleAddProduct = (product: Product) => {
    if (formData.drawproduct.find(p => p.id === product.id)) return;
    setFormData(prev => ({ 
      ...prev, 
      drawproduct: [...prev.drawproduct, product] 
    }));
    setIsProductModalOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (!isProductModalOpen) return;

    const fetchProducts = async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/products?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const json = await res.json();
          setAvailableProducts(json.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isProductModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      setError("Start and end dates are required");
      return;
    }

    setLoading(true);

    try {
      const isEdit = !!initialData?.id;
      const url = isEdit ? `/api/admin/draws/${initialData.id}` : "/api/admin/draws";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        title: formData.title,
        description: formData.description,
        bannerImage: formData.bannerImage,
        entryFee: Number(formData.entryFee),
        maxTickets: Number(formData.maxTickets),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        status: formData.status,
        productIds: formData.drawproduct.map(p => p.id)
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to save draw");
      }

      router.push("/admin/draws");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!initialData?.id;
  const hasTicketsSold = !!(initialData?.status && initialData.status !== "DRAFT" && initialData.status !== "CANCELLED");

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-10 py-4 border-b border-zinc-200 dark:border-zinc-800 -mx-6 px-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {isEditMode ? "Edit Draw" : "New Draw"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => router.push("/admin/draws")}>
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
          <Card title="Details">
            <div className="space-y-4">
              <Input
                label="Draw Title"
                placeholder="e.g. iPhone 15 Pro Max Giveaway"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  className="w-full min-h-[120px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100"
                  placeholder="Describe the draw details..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card 
            title={`Assigned Prizes (${formData.drawproduct.length})`}
            action={
              <Button type="button" size="sm" variant="outline" onClick={() => setIsProductModalOpen(true)}>
                <Plus className="w-3 h-3 mr-2" />
                Add Prize
              </Button>
            }
          >
            <div className="space-y-3">
              {formData.drawproduct.length > 0 ? (
                formData.drawproduct.map((p) => (
                  <div key={p.id} className="group flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No img</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.name}</p>
                        <p className="text-xs text-zinc-500">Qty: {p.quantity}</p>
                      </div>
                    </div>
                    <Button 
                      type="button"
                      size="icon" 
                      variant="ghost" 
                      className="text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveProduct(p.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">No prizes assigned yet.</p>
                  <Button type="button" variant="link" onClick={() => setIsProductModalOpen(true)}>Select Products</Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Settings">
            <div className="space-y-4">
              <ImageUploader
                label="Banner Image"
                value={formData.bannerImage}
                onChange={(path) => handleChange("bannerImage", path)}
              />
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Draw Status</label>
                <select
                  className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm px-2 focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="DRAFT">Draft (Hidden)</option>
                  <option value="LIVE">Live (Public)</option>
                  <option value="ENDED">Ended</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Entry Fee"
                  type="number"
                  prefix="₹"
                  value={formData.entryFee}
                  onChange={(e) => handleChange("entryFee", e.target.value)}
                  disabled={hasTicketsSold}
                />
                <Input
                  label="Total Tickets"
                  type="number"
                  value={formData.maxTickets}
                  onChange={(e) => handleChange("maxTickets", e.target.value)}
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Input
                  label="Start Date"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  required
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Select Product</h3>
              <Button type="button" size="icon" variant="ghost" onClick={() => setIsProductModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                <input 
                  autoFocus
                  placeholder="Search products..."
                  className="w-full h-9 pl-9 pr-3 text-sm rounded-md bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-1 focus:ring-zinc-400 dark:text-zinc-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {searching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                </div>
              ) : availableProducts.length > 0 ? (
                availableProducts.map(product => {
                  const isSelected = formData.drawproduct.some(p => p.id === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddProduct(product)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">?</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-500">Stock: {product.quantity}</p>
                      </div>
                      {isSelected && <Badge variant="neutral" size="sm">Added</Badge>}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-sm text-zinc-400">
                  {searchQuery ? "No products found." : "Search to find products."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}