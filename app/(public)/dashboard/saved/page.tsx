"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSavedProducts, unsaveProduct, type Product } from "@/lib/api/product";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

type SavedProduct = Product & { savedAt: string };

export default function BuyerSavedItemsPage() {
  const queryClient = useQueryClient();

  const savedQuery = useQuery<SavedProduct[]>({
    queryKey: ["dashboard", "saved-items"],
    queryFn: async () => {
      const response = await listSavedProducts();
      if (!response.success) {
        throw new Error(response.message || "Failed to load saved items");
      }
      return response.data;
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await unsaveProduct(productId);
      if (!response.success) {
        throw new Error(response.message || "Failed to remove saved item");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "saved-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "compare-items"] });
    },
  });

  const savedItems = savedQuery.data ?? [];

  return (
    <DashboardPageScaffold
      title="Saved Items"
      subtitle="Track bookmarked listings for later comparison and checkout."
      routeLabel="Dashboard / Saved"
      actions={
        <>
          <Link href="/dashboard/compare" className="btn-secondary btn-sm">Compare</Link>
          <Link href="/dashboard/checkout" className="btn-primary btn-sm">Checkout</Link>
        </>
      }
    >
      {savedQuery.isLoading && (
        <DashboardSurface className="p-4">
          <div className="skeleton h-5 w-1/3 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-5/6" />
        </DashboardSurface>
      )}

      {savedQuery.isError && (
        <DashboardStatus tone="error">
          {savedQuery.error instanceof Error ? savedQuery.error.message : "Failed to load saved items"}
        </DashboardStatus>
      )}

      {!savedQuery.isLoading && !savedQuery.isError && savedItems.length === 0 && (
        <DashboardSurface className="p-4">
          <p className="text-sm text-white/70">No saved products yet. Bookmark products from details to compare and checkout later.</p>
        </DashboardSurface>
      )}

      {savedItems.length > 0 && (
        <div className="space-y-3">
          {savedItems.map((item) => (
            <DashboardSurface key={item.productId} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-white/65">{item.category} · {item.location}</p>
                  <p className="text-sm text-emerald-300 mt-1">NPR {item.priceListed}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/products/${item.productId}`} className="btn-secondary btn-sm">Open</Link>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    disabled={unsaveMutation.isPending}
                    onClick={() => unsaveMutation.mutate(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </DashboardSurface>
          ))}
        </div>
      )}
    </DashboardPageScaffold>
  );
}
