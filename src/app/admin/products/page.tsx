// src/app/admin/products/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Search,
  Select,
  Spinner,
  Alert,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@/components/ui";
import {
  Plus,
  Edit,
  Package,
  Trash2,
  MoreVertical,
  Eye,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDate, cn } from "@/lib/utils";
import Image from "next/image";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface Product {
  id: string;
  drawId: string;
  name: string;
  image: string | null;
  quantity: number;
  description: string | null;
  createdAt: string;
  draw: {
    id: string;
    title: string;
    status: string;
  } | null;
  winnersCount: number;
  remainingQuantity: number;
}

interface Draw {
  id: string;
  title: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDraw, setSelectedDraw] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

useEffect(() => {
  const fetchDraws = async () => {
    const response = await api.get<Draw[]>("/admin/draws");

    if (response.success && Array.isArray(response.data)) {
      setDraws(response.data);
    } else {
      setDraws([]); // safety fallback
    }
  };

  fetchDraws();
}, []);

useEffect(() => {
  let isMounted = true;

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      order: sortOrder,
    });

    if (search) params.append("search", search);
    if (selectedDraw !== "all") params.append("drawId", selectedDraw);

    const response = await api.get<{
      products: Product[];
      pagination: { totalPages: number };
    }>(`/admin/products?${params.toString()}`);

    if (!isMounted) return;

    if (response.success && response.data) {
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } else {
      setError(response.error || "Failed to load products");
    }

    setLoading(false);
  };

  fetchProducts();

  return () => {
    isMounted = false;
  };
}, [page, selectedDraw, sortBy, sortOrder, search]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const response = await api.delete(`/admin/products/${id}`);

    if (response.success) {
      setPage(1);
    } else {
      alert(response.error || "Failed to delete product");
    }
  };

  const getStatusColor = (status: string): BadgeVariant => {
    const colors: Record<string, BadgeVariant> = {
      DRAFT: "default",
      LIVE: "success",
      CLOSED: "warning",
      RESULT_DECLARED: "info",
    };
    return colors[status] ?? "default";
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Draw Products"
        description="Manage prizes and rewards for your draws"
        action={
          <Button asChild variant="primary">
            <Link href="/admin/products/create">
              <Plus size={18} />
              Add Product
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Search
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />

          <Select
            value={selectedDraw}
            onChange={(e) => setSelectedDraw(e.target.value)}
            options={[
              { value: "all", label: "All Draws" },
              ...draws.map((d) => ({ value: d.id, label: d.title })),
            ]}
          />

          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}
            options={[
              { value: "createdAt-desc", label: "Newest First" },
              { value: "createdAt-asc", label: "Oldest First" },
              { value: "name-asc", label: "Name (A-Z)" },
              { value: "name-desc", label: "Name (Z-A)" },
              { value: "quantity-desc", label: "Highest Quantity" },
              { value: "quantity-asc", label: "Lowest Quantity" },
            ]}
          />
        </div>
      </Card>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                  Product
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                  Draw
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                  Quantity
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                  Winners
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                  Remaining
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                  Created
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      No products found
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try adjusting your filters or add a new product
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {product.draw ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-900 font-medium">
                            {product.draw.title}
                          </span>
                          <Badge
                            variant={getStatusColor(product.draw.status)}
                            size="sm"
                          >
                            {product.draw.status}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <Badge variant="default">{product.quantity}</Badge>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <Badge
                        variant={
                          product.winnersCount > 0 ? "success" : "default"
                        }
                      >
                        {product.winnersCount}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <Badge
                        variant={
                          product.remainingQuantity === 0
                            ? "danger"
                            : product.remainingQuantity < 3
                            ? "warning"
                            : "success"
                        }
                      >
                        {product.remainingQuantity}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-center text-sm text-gray-600">
                      {formatDate(product.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <Dropdown
                        trigger={
                          <Button size="sm" variant="ghost">
                            <MoreVertical size={16} />
                          </Button>
                        }
                        align="right"
                      >
                        <DropdownItem
                          icon={<Eye size={16} />}
                          onClick={() =>
                            (window.location.href = `/admin/products/${product.id}`)
                          }
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          icon={<Edit size={16} />}
                          onClick={() =>
                            (window.location.href = `/admin/products/${product.id}/edit`)
                          }
                        >
                          Edit
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem
                          icon={<Trash2 size={16} />}
                          danger
                          onClick={() => handleDelete(product.id)}
                          disabled={product.winnersCount > 0}
                        >
                          Delete
                        </DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {products.some(
        (p) => p.remainingQuantity < 3 && p.remainingQuantity > 0
      ) && (
        <Alert variant="warning" icon={<AlertCircle />}>
          <strong>Low Stock Warning:</strong> Some products are running low on
          quantity. Consider adding more or closing the draw.
        </Alert>
      )}
    </div>
  );
}
