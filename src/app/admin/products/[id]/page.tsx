// src/app/admin/products/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Alert,
  Spinner,
  Tabs,
  Avatar,
} from "@/components/ui";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Trophy,
  Calendar,
  TrendingUp,
  User,
  Ticket,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/lib/utils";
import Image from "next/image";

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface Winner {
  id: string;
  ticketId: string;
  ticketCode: string;
  declaredAt: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    mobile: string;
  };
}

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
    description: string | null;
    status: string;
    startTime: string;
    endTime: string;
    entryFee: number;
  } | null;
  winners: Winner[];
  winnersCount: number;
  remainingQuantity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const response = await api.get<Product>(`/admin/products/${productId}`);

      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.error || "Failed to load product");
      }

      setLoading(false);
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;

    if (product.winnersCount > 0) {
      alert("Cannot delete product with declared winners");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    const response = await api.delete(`/admin/products/${productId}`);

    if (response.success) {
      router.push("/admin/products");
    } else {
      alert(response.error || "Failed to delete product");
      setDeleteLoading(false);
    }
  };

const getStatusColor = (status: string): BadgeVariant => {
  switch (status) {
    case "LIVE":
      return "success";
    case "CLOSED":
      return "warning";
    case "RESULT_DECLARED":
      return "info";
    case "DRAFT":
    default:
      return "default";
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Product Not Found"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Products", href: "/admin/products" },
            { label: "Details" },
          ]}
        />
        <Alert variant="danger">{error || "Product not found"}</Alert>
        <Link href="/admin/products">
          <Button variant="outline" leftIcon={<ArrowLeft size={18} />}>
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Package size={16} />,
      content: (
        <div className="space-y-6">
          {/* Product Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="bordered" padding="md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Quantity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.quantity}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Trophy size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Winners</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.winnersCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="md">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    product.remainingQuantity === 0
                      ? "bg-red-100"
                      : product.remainingQuantity < 3
                      ? "bg-orange-100"
                      : "bg-emerald-100"
                  }`}
                >
                  <TrendingUp
                    size={24}
                    className={
                      product.remainingQuantity === 0
                        ? "text-red-600"
                        : product.remainingQuantity < 3
                        ? "text-orange-600"
                        : "text-emerald-600"
                    }
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.remainingQuantity}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Calendar size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatDate(product.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Product Details */}
          <Card padding="lg">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    Product Name
                  </dt>
                  <dd className="text-base text-gray-900 font-semibold">
                    {product.name}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    Product ID
                  </dt>
                  <dd className="text-base text-gray-900 font-mono">
                    {product.id}
                  </dd>
                </div>

                {product.description && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-600 mb-1">
                      Description
                    </dt>
                    <dd className="text-base text-gray-900">
                      {product.description}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Draw Information */}
          {product.draw && (
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Associated Draw</CardTitle>
                    <CardDescription>
                      This product belongs to the following draw
                    </CardDescription>
                  </div>
<Badge variant={getStatusColor(product.draw.status)}>
                    {product.draw.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">
                      Draw Title
                    </dt>
                    <dd className="text-base text-gray-900 font-semibold">
                      {product.draw.title}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">
                      Entry Fee
                    </dt>
                    <dd className="text-base text-gray-900 font-semibold">
                      ₹{product.draw.entryFee}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">
                      Start Time
                    </dt>
                    <dd className="text-base text-gray-900">
                      {formatDateTime(product.draw.startTime)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">
                      End Time
                    </dt>
                    <dd className="text-base text-gray-900">
                      {formatDateTime(product.draw.endTime)}
                    </dd>
                  </div>

                  {product.draw.description && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-600 mb-1">
                        Description
                      </dt>
                      <dd className="text-base text-gray-900">
                        {product.draw.description}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-6">
                  <Link href={`/admin/draws/${product.draw.id}`}>
                    <Button variant="outline" size="sm">
                      View Draw Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      id: "winners",
      label: "Winners",
      icon: <Trophy size={16} />,
      content: (
        <div className="space-y-6">
          {product.winners.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <Trophy size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No winners yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Winners will appear here once they are declared
                </p>
              </div>
            </Card>
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                        Winner
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                        Ticket Code
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                        Contact
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                        Declared At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.winners.map((winner) => (
                      <tr
                        key={winner.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar
                              fallback={winner.user.name[0]}
                              size="md"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {winner.user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {winner.user.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="info">{winner.ticketCode}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {winner.user.email && (
                              <p className="text-sm text-gray-900">
                                {winner.user.email}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              {winner.user.mobile}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {formatDateTime(winner.declaredAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`Product ID: ${product.id}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button variant="outline" leftIcon={<ArrowLeft size={18} />}>
                Back
              </Button>
            </Link>
            <Link href={`/admin/products/${product.id}/edit`}>
              <Button variant="primary" leftIcon={<Edit size={18} />}>
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              leftIcon={<Trash2 size={18} />}
              onClick={handleDelete}
              loading={deleteLoading}
              disabled={product.winnersCount > 0}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Product Image */}
      {product.image && (
        <Card padding="none" className="overflow-hidden">
          <div className="relative w-full h-96">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </Card>
      )}

      {/* Alerts */}
      {product.winnersCount > 0 && (
        <Alert variant="info" icon={<AlertCircle />}>
          This product has{" "}
          <strong>{product.winnersCount} declared winner(s)</strong>. You
          cannot delete this product.
        </Alert>
      )}

      {product.remainingQuantity === 0 && (
        <Alert variant="warning" icon={<AlertCircle />}>
          All quantities have been distributed. This product is fully allocated.
        </Alert>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" variant="line" />
    </div>
  );
}