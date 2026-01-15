// src/app/admin/products/create/page.tsx or [id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  Select,
  Button,
  Alert,
  Spinner,
} from "@/components/ui";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import ImageUpload from "@/components/ui/Upload";

interface ProductApiResponse {
  id: string;
  drawId: string;
  name: string;
  image: string | null;
  quantity: number;
  description: string | null;
  winnersCount: number;
}

interface ProductForm {
  drawId: string;
  name: string;
  image: string | null;
  quantity: string;
  description: string;
}

interface Draw {
  id: string;
  title: string;
  status: string;
}

interface ValidationErrors {
  drawId?: string;
  name?: string;
  quantity?: string;
}

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string | undefined;
  const isEdit = !!productId;

  const [form, setForm] = useState<ProductForm>({
    drawId: "",
    name: "",
    image: null,
    quantity: "",
    description: "",
  });

  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [currentWinnersCount, setCurrentWinnersCount] = useState(0);

useEffect(() => {
  const fetchDraws = async () => {
    const response = await api.get<Draw[]>("/admin/draws");

    if (!response.success || !Array.isArray(response.data)) {
      setDraws([]);
      return;
    }

    const availableDraws = isEdit
      ? response.data
      : response.data.filter(
          (d) => d.status === "DRAFT" || d.status === "LIVE"
        );

    setDraws(availableDraws);
  };

  fetchDraws();
}, [isEdit]);

  // Fetch product data if editing
  useEffect(() => {
    if (isEdit && productId) {
      const fetchProduct = async () => {
        setInitialLoading(true);
        const response = await api.get<ProductApiResponse>(
          `/admin/products/${productId}`
        );

        if (response.success && response.data) {
          const product = response.data;
          setForm({
            drawId: product.drawId,
            name: product.name,
            image: product.image,
            quantity: product.quantity.toString(),
            description: product.description || "",
          });
          setCurrentWinnersCount(product.winnersCount || 0);
        } else {
          setError(response.error || "Failed to load product");
        }

        setInitialLoading(false);
      };

      fetchProduct();
    }
  }, [productId, isEdit]);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.drawId && !isEdit) {
      newErrors.drawId = "Please select a draw";
    }

    if (!form.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    const qty = parseInt(form.quantity);
    if (!form.quantity || isNaN(qty)) {
      newErrors.quantity = "Quantity is required";
    } else if (qty < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    } else if (isEdit && qty < currentWinnersCount) {
      newErrors.quantity = `Quantity cannot be less than ${currentWinnersCount} (current winners count)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    setLoading(true);

    const payload = {
      drawId: form.drawId,
      name: form.name.trim(),
      image: form.image,
      quantity: parseInt(form.quantity),
      description: form.description.trim() || null,
    };

    const response = isEdit
      ? await api.patch(`/admin/products/${productId}`, payload)
      : await api.post("/admin/products", payload);

    if (response.success) {
      setSuccess(
        isEdit
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } else {
      setError(response.error || "Failed to save product");
    }

    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={isEdit ? "Edit Product" : "Create Product"}
        description={
          isEdit
            ? "Update product details and manage inventory"
            : "Add a new prize product to a draw"
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: isEdit ? "Edit" : "Create" },
        ]}
        action={
          <Link href="/admin/products">
            <Button variant="outline" leftIcon={<ArrowLeft size={18} />}>
              Back to Products
            </Button>
          </Link>
        }
      />

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && <Alert variant="success">{success}</Alert>}

      {isEdit && currentWinnersCount > 0 && (
        <Alert variant="info" icon={<AlertCircle />}>
          This product has <strong>{currentWinnersCount} winner(s)</strong>. You
          cannot reduce quantity below this number or delete the product.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card padding="lg">
          <div className="space-y-6">
            {/* Draw Selection - Only for new products */}
            {!isEdit && (
              <Select
                label="Draw"
                value={form.drawId}
                onChange={(e) => {
                  setForm({ ...form, drawId: e.target.value });
                  setErrors({ ...errors, drawId: undefined });
                }}
                options={[
                  { value: "", label: "Select a draw" },
                  ...draws.map((d) => ({
                    value: d.id,
                    label: `${d.title} (${d.status})`,
                  })),
                ]}
                error={errors.drawId}
                required
                helperText="Select the draw this product belongs to"
              />
            )}

            {/* Product Image */}
            <ImageUpload
              label="Product Image"
              value={form.image}
              onChange={(base64) => setForm({ ...form, image: base64 })}
              preview
              maxWidth={1200}
            />

            {/* Product Name */}
            <Input
              label="Product Name"
              placeholder="e.g., iPhone 15 Pro Max"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrors({ ...errors, name: undefined });
              }}
              error={errors.name}
              required
              helperText="Enter a clear, descriptive name for the product"
            />

            {/* Quantity */}
            <Input
              label="Quantity"
              type="number"
              min={isEdit ? currentWinnersCount : 1}
              placeholder="Number of items available"
              value={form.quantity}
              onChange={(e) => {
                setForm({ ...form, quantity: e.target.value });
                setErrors({ ...errors, quantity: undefined });
              }}
              error={errors.quantity}
              required
              helperText={
                isEdit && currentWinnersCount > 0
                  ? `Must be at least ${currentWinnersCount} (current winners)`
                  : "Total number of this product available as prizes"
              }
            />

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Optional product description, specifications, or details..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={5}
              helperText="Provide additional details about the product (optional)"
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <Link href="/admin/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                  type="submit"
                  variant="primary"
                  
                  loading={loading}
                  leftIcon={<Save size={18} />}
                  className="mt-6 w-full !bg-gray-900 !text-white hover:!bg-gray-800"
                >
                  {isEdit ? "Update Product" : "Create Product"}
                </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
