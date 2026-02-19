"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listRecentViewedProducts, type Product } from "@/lib/api/product";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

type RecentProduct = Product & { viewedAt: string };

export default function BuyerRecentlyViewedPage() {
  const recentQuery = useQuery<RecentProduct[]>({
    queryKey: ["dashboard", "recent-viewed"],
    queryFn: async () => {
      const response = await listRecentViewedProducts();
      if (!response.success) {
        throw new Error(response.message || "Failed to load recently viewed products");
      }
      return response.data;
    },
  });

  const recentProducts = recentQuery.data ?? [];

  return (
    <DashboardPageScaffold
      title="Recently Viewed"
      subtitle="Resume where you left off with recently opened product listings."
      routeLabel="Dashboard / Recent"
      actions={
        <>
          <Link href="/dashboard/search" className="btn-primary btn-sm">Continue browsing</Link>
          <Link href="/dashboard/saved" className="btn-secondary btn-sm">Saved items</Link>
        </>
      }
    >
      {recentQuery.isError && <DashboardStatus tone="error">{(recentQuery.error as Error).message}</DashboardStatus>}

      <DashboardSurface className="p-0 overflow-hidden">
        {recentQuery.isLoading ? (
          <div className="p-4 text-sm text-white/70">Loading recent activity...</div>
        ) : recentProducts.length === 0 ? (
          <div className="p-4 text-sm text-white/70">No recently viewed listings yet.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {recentProducts.map((item) => (
              <Link key={item.productId} href={`/dashboard/products/${item.productId}`} className="block p-4 transition-colors hover:bg-white/[0.03]">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs text-white/65">{item.category} · {item.location} · NPR {item.priceListed}</p>
                <p className="mt-1 text-[11px] text-white/45">Viewed {new Date(item.viewedAt).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
      </DashboardSurface>
    </DashboardPageScaffold>
  );
}
