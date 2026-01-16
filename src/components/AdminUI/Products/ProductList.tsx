"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/AdminUI/ui/Badge";
import { getImageUrl } from "@/lib/image-helper";
import { Button } from "../ui/Button";

interface ProductMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Draw {
  id: string;
  title: string;
  status: string;
}

interface ProductItem {
  id: string;
  name: string;
  image: string | null;
  quantity: number;
  description: string | null;
  winnersCount: number;
  remainingQuantity: number;
  draw: Draw;
  createdAt: string;
}

interface ProductListProps {
  products: ProductItem[];
  meta: ProductMeta;
}

export default function ProductList({ products }: ProductListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, winnersCount: number) => {
    if (winnersCount > 0) {
      alert("Cannot delete products with declared winners");
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }

      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error deleting product";
      alert(message);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string): "default" | "success" | "danger" | "neutral" => {
    switch (status) {
      case 'LIVE':
        return 'success';
      case 'CLOSED':
      case 'RESULT_DECLARED':
        return 'neutral';
      case 'DRAFT':
      default:
        return 'default';
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Package className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No products created</h3>
        <p className="text-xs text-zinc-500 mt-1">Add prizes to your draws to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Draw</th>
              <th className="px-5 py-3 font-medium">Quantity</th>
              <th className="px-5 py-3 font-medium">Winners</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products.map((product) => {
              const isDeleting = deleting === product.id;
              const canDelete: boolean = product.winnersCount === 0;

              return (
                <tr key={product.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {product.image ? (
                          <img 
                            src={getImageUrl(product.image)} 
                            alt={product.name}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-zinc-500 line-clamp-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{product.draw.title}</p>
                      <Badge variant={getStatusColor(product.draw.status)} size="sm" className="mt-1 capitalize">
                        {product.draw.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {product.quantity} total
                      </span>
                      <span className="text-xs text-zinc-500">
                        {product.remainingQuantity} remaining
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{product.winnersCount}</span>
                      <span className="text-zinc-500">declared</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(product.id, product.winnersCount)}
                        disabled={isDeleting || !canDelete}
                        title={!canDelete ? "Cannot delete products with winners" : "Delete product"}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}