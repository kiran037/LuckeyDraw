export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import ProductList from "@/components/AdminUI/Products/ProductList";
import { headers, cookies } from "next/headers";

async function getProducts() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/products?limit=20`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    
    if (!res.ok) {
      return { 
        products: [], 
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 } 
      };
    }
    
    const json = await res.json();
    return json; 
  } catch (e) {
    return { 
      products: [], 
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 } 
    };
  }
}

export default async function ProductsPage() {
  const data = await getProducts();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Products</h1>
          <p className="text-sm text-zinc-500">Manage prizes for your draws.</p>
        </div>
        <Link href="/admin/products/create">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <ProductList products={data.products} meta={data.meta} />
    </div>
  );
}