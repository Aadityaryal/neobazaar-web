"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api/auth";
import { listProducts, type Product } from "@/lib/api/product";

export default function SellerInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const me = await getMe();
        if (!me.success || !me.data?.userId) {
          throw new Error("Unauthorized");
        }

        const response = await listProducts({ sellerId: me.data.userId, page: 1, limit: 100, sort: "newest" });
        if (!response.success) {
          throw new Error(response.message || "Failed to load inventory");
        }

        setProducts(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Inventory Manager</h1>
            <p className="text-secondary">Track active listings, stock state, and listing health.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading inventory…</div>
            ) : products.length === 0 ? (
              <div className="card empty-state">No listings found for this seller.</div>
            ) : (
              products.map((item) => (
                <div key={item.productId} className="card">
                  <p className="text-sm font-medium text-primary">{item.title}</p>
                  <p className="text-xs text-secondary">Category: {item.category} · Mode: {item.mode}</p>
                  <p className="text-xs text-secondary">Price: NPR {item.priceListed}</p>
                  <p className="text-xs text-muted">Created: {new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
