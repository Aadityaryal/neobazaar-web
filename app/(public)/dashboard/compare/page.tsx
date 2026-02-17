"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listSavedProducts, type Product } from "@/lib/api/product";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

type SavedProduct = Product & { savedAt: string };

export default function BuyerCompareProductsPage() {
  const compareQuery = useQuery<SavedProduct[]>({
    queryKey: ["dashboard", "compare-items"],
    queryFn: async () => {
      const response = await listSavedProducts();
      if (!response.success) {
        throw new Error(response.message || "Failed to load compare candidates");
      }
      return response.data;
    },
  });

  const compareItems = compareQuery.data ?? [];

  return (
    <DashboardPageScaffold
      title="Compare Products"
      subtitle="Side-by-side comparison for shortlisted buyer options."
      routeLabel="Dashboard / Compare"
      actions={
        <>
          <Link href="/dashboard/saved" className="btn-secondary btn-sm">Saved list</Link>
          <Link href="/dashboard/checkout" className="btn-primary btn-sm">Proceed to checkout</Link>
        </>
      }
    >
      {compareQuery.isLoading && (
        <DashboardSurface className="p-4">
          <div className="skeleton h-5 w-1/3 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-5/6" />
        </DashboardSurface>
      )}

      {compareQuery.isError && (
        <DashboardStatus tone="error">
          {compareQuery.error instanceof Error ? compareQuery.error.message : "Failed to load compare data"}
        </DashboardStatus>
      )}

      {!compareQuery.isLoading && !compareQuery.isError && compareItems.length < 2 && (
        <DashboardSurface className="p-4">
          <p className="text-sm text-white/70">Save at least two products to compare pricing, condition, and mode.</p>
        </DashboardSurface>
      )}

      {compareItems.length >= 2 && (
        <DashboardSurface className="p-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/10">
                <th className="py-2 pr-3">Attribute</th>
                {compareItems.map((item) => (
                  <th key={item.productId} className="py-2 pr-3 font-semibold text-white">{item.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 text-white/60">Price</td>
                {compareItems.map((item) => (
                  <td key={`${item.productId}-price`} className="py-2 pr-3 text-emerald-300">NPR {item.priceListed}</td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 text-white/60">Mode</td>
                {compareItems.map((item) => (
                  <td key={`${item.productId}-mode`} className="py-2 pr-3 text-white/80">{item.mode}</td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 text-white/60">Condition (AI)</td>
                {compareItems.map((item) => (
                  <td key={`${item.productId}-condition`} className="py-2 pr-3 text-white/80">{item.aiCondition}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-3 text-white/60">Location</td>
                {compareItems.map((item) => (
                  <td key={`${item.productId}-location`} className="py-2 pr-3 text-white/80">{item.location}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </DashboardSurface>
      )}
    </DashboardPageScaffold>
  );
}
