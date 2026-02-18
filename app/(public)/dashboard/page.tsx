"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listProducts, type Product } from "@/lib/api/product";
import { getMe } from "@/lib/api/auth";
import { recommendProducts } from "@/lib/api/extension";
import { completeQuest, listQuests, type Quest } from "@/lib/api/quest";
import { DashboardStatus, DashboardSurface } from "./_components/DashboardUIPrimitives";

const DASHBOARD_TABS = ["Overview", "Search", "Orders", "Offers", "Disputes", "Rewards"] as const;

type DashboardTheme = "default" | "festival" | "midnight";

const getProductsOrThrow = async (filters: { category?: string; location?: string; mode?: string }) => {
  const response = await listProducts(filters);
  if (!response.success) {
    throw new Error(response.message || "Failed to load products");
  }
  return response.data;
};

const getMeOrThrow = async () => {
  const response = await getMe();
  if (!response.success) {
    throw new Error(response.message || "Failed to load profile");
  }
  return response.data;
};

const getRecommendationsOrThrow = async () => {
  const response = await recommendProducts();
  if (!response.success) {
    throw new Error(response.message || "Failed to load recommendations");
  }
  return response as { success: true; data: Product[]; fallbackLabel?: string };
};

const getQuestsOrThrow = async () => {
  const response = await listQuests();
  if (!response.success) {
    throw new Error(response.message || "Failed to load quests");
  }
  return response.data;
};

function modeBadgeClass(mode: Product["mode"]) {
  if (mode === "auction") return "neo-chip neo-badge-auction";
  if (mode === "donate") return "neo-chip neo-badge-donate";
  return "neo-chip neo-badge-buy";
}

function categoryGradient(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("phone")) return "from-violet-600 to-fuchsia-600";
  if (normalized.includes("laptop")) return "from-sky-600 to-cyan-500";
  if (normalized.includes("electronic")) return "from-emerald-600 to-teal-500";
  if (normalized.includes("cloth") || normalized.includes("fashion")) return "from-amber-500 to-orange-500";
  if (normalized.includes("furnit")) return "from-rose-500 to-pink-600";
  return "from-slate-600 to-slate-500";
}

function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <DashboardSurface className="w-full max-w-2xl overflow-hidden">
        <div className={`relative h-56 bg-gradient-to-br ${categoryGradient(product.category)}`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
            <span className="neo-chip">{product.category}</span>
            <span className={modeBadgeClass(product.mode)}>{product.mode.replace("_", " ")}</span>
            {product.aiVerified && <span className="neo-chip text-emerald-300">AI Verified</span>}
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="neo-heading text-2xl font-extrabold text-white">{product.title}</h2>
            <p className="mt-1 text-sm text-white/55">{product.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DashboardSurface className="p-3 text-center">
              <p className="text-xs text-white/50">Listed Price</p>
              <p className="mt-1 text-sm font-bold text-white">NPR {product.priceListed.toLocaleString()}</p>
            </DashboardSurface>
            <DashboardSurface className="p-3 text-center">
              <p className="text-xs text-white/50">AI Suggested</p>
              <p className="mt-1 text-sm font-bold text-emerald-300">NPR {product.aiSuggestedPrice.toLocaleString()}</p>
            </DashboardSurface>
            <DashboardSurface className="p-3 text-center">
              <p className="text-xs text-white/50">AI Condition</p>
              <p className="mt-1 text-sm font-bold text-sky-300">{product.aiCondition}</p>
            </DashboardSurface>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/60">
              {product.mode === "buy_now"
                ? "Buy-now checkout, escrow, and confirmations are handled on the product detail page."
                : `This listing is in ${product.mode.replace("_", " ")} mode.`}
            </p>
            <Link href={`/dashboard/products/${product.productId}`} className="btn-primary btn-sm">
              Open Details
            </Link>
          </div>
        </div>
      </DashboardSurface>
    </div>
  );
}

export default function DashboardPage() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("");
  const [activeTab] = useState<(typeof DASHBOARD_TABS)[number]>("Overview");
  const [localError, setLocalError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const computedTheme =
    typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") : "default";
  const theme: DashboardTheme =
    computedTheme === "festival" || computedTheme === "midnight" ? computedTheme : "default";

  const queryClient = useQueryClient();

  const productsQuery = useQuery<Product[]>({
    queryKey: ["dashboard", "products", category, location, mode],
    queryFn: () =>
      getProductsOrThrow({
        category: category || undefined,
        location: location || undefined,
        mode: mode || undefined,
      }),
  });

  const meQuery = useQuery({
    queryKey: ["dashboard", "me"],
    queryFn: getMeOrThrow,
  });

  const recommendationQuery = useQuery({
    queryKey: ["dashboard", "recommendations"],
    queryFn: getRecommendationsOrThrow,
  });

  const questsQuery = useQuery<Quest[]>({
    queryKey: ["dashboard", "quests"],
    queryFn: getQuestsOrThrow,
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await completeQuest(questId);
      if (!response.success) {
        throw new Error(response.message || "Quest completion failed");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "quests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "me"] });
    },
    onError: (error) => {
      setLocalError(error instanceof Error ? error.message : "Quest completion failed");
    },
  });

  const products = productsQuery.data ?? [];
  const recommendedProducts = recommendationQuery.data?.data ?? [];
  const recommendationLabel = recommendationQuery.data?.fallbackLabel ?? "";
  const quests = questsQuery.data ?? [];
  const user = meQuery.data;

  const filtersChanged = useMemo(() => Boolean(category || location || mode), [category, location, mode]);

  const queryError = productsQuery.error ?? meQuery.error ?? recommendationQuery.error ?? questsQuery.error;
  const combinedError = localError || (queryError instanceof Error ? queryError.message : "");

  const handleCompleteQuest = async (questId: string) => {
    setLocalError("");
    await completeQuestMutation.mutateAsync(questId);
  };

  return (
    <div className="neo-shell">
      <div className="page-container py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <DashboardSurface className="p-5 sm:p-6">
            <p className="text-xs uppercase tracking-wider text-white/35">Home / Dashboard</p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="neo-heading text-4xl font-extrabold text-white">Marketplace</h1>
                <p className="mt-1 text-sm text-white/55">Browse products and interact with listings.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {DASHBOARD_TABS.map((tab) => (
                  <span key={tab} className={`neo-chip ${tab === activeTab ? "text-white" : "text-white/60"}`}>
                    {tab}
                  </span>
                ))}
                <Link href="/dashboard/add-listing" className="btn-primary btn-sm">
                  Add Listing
                </Link>
              </div>
            </div>
          </DashboardSurface>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <DashboardSurface className="p-4 text-center">
              <p className="text-xs text-white/45">Theme</p>
              <p className="neo-heading mt-1 text-lg font-bold text-white">{theme}</p>
            </DashboardSurface>
            <DashboardSurface className="p-4 text-center">
              <p className="text-xs text-white/45">NeoTokens</p>
              <p className="neo-heading mt-1 text-lg font-bold text-amber-300">{user?.neoTokens?.toLocaleString() ?? "0"}</p>
            </DashboardSurface>
            <DashboardSurface className="p-4 text-center">
              <p className="text-xs text-white/45">XP</p>
              <p className="neo-heading mt-1 text-lg font-bold text-sky-300">{user?.xp?.toLocaleString() ?? "0"}</p>
            </DashboardSurface>
            <DashboardSurface className="p-4 text-center">
              <p className="text-xs text-white/45">Listings</p>
              <p className="neo-heading mt-1 text-lg font-bold text-white">{products.length}</p>
            </DashboardSurface>
            <DashboardSurface className="p-4 text-center">
              <p className="text-xs text-white/45">Reputation</p>
              <p className="neo-heading mt-1 text-lg font-bold text-emerald-300">{user?.reputationScore?.toLocaleString() ?? "0"}</p>
            </DashboardSurface>
          </section>

          <DashboardSurface className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="neo-heading text-xl font-bold text-white">AI Recommendations</h2>
                {recommendationLabel && <p className="mt-1 text-xs text-white/40">{recommendationLabel}</p>}
              </div>
              <Link href="/dashboard/recent" className="neo-chip text-white">View All</Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {recommendedProducts.map((product) => (
                <button
                  type="button"
                  key={product.productId}
                  onClick={() => setSelectedProduct(product)}
                  className="neo-grid-card min-w-[250px] max-w-[280px] text-left"
                >
                  <div className={`relative h-32 bg-gradient-to-br ${categoryGradient(product.category)}`}>
                    <div className="absolute bottom-2 left-2">
                      <span className={modeBadgeClass(product.mode)}>{product.mode.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-white">{product.title}</p>
                    <p className="line-clamp-2 text-xs text-white/50">{product.description}</p>
                    <p className="text-sm font-bold text-emerald-300">NPR {product.priceListed.toLocaleString()}</p>
                  </div>
                </button>
              ))}
              {recommendedProducts.length === 0 && <p className="empty-state">No recommendations yet.</p>}
            </div>
          </DashboardSurface>

          <DashboardSurface className="p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="neo-heading text-xl font-bold text-white">Daily Quests</h2>
              <Link href="/dashboard/quests" className="neo-chip text-white">Open Quests</Link>
            </div>
            <div className="space-y-3">
              {quests.map((quest) => (
                <DashboardSurface key={quest.questId} className="flex flex-col justify-between gap-3 p-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-white">{quest.title}</p>
                    <p className="text-sm text-white/55">{quest.description}</p>
                    <p className="text-xs text-white/45">
                      Reward: {quest.rewardTokens} NeoTokens + {quest.rewardXP} XP
                    </p>
                  </div>
                  <button className="btn-primary btn-sm" onClick={() => handleCompleteQuest(quest.questId)}>
                    Complete
                  </button>
                </DashboardSurface>
              ))}
              {quests.length === 0 && <p className="empty-state">No active quests.</p>}
            </div>
          </DashboardSurface>

          {combinedError && <DashboardStatus tone="error">{combinedError}</DashboardStatus>}

          <DashboardSurface className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
            <input className="input-field" placeholder="Category…" value={category} onChange={(event) => setCategory(event.target.value)} />
            <input className="input-field" placeholder="Location…" value={location} onChange={(event) => setLocation(event.target.value)} />
            <select className="input-field" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="">Any Mode</option>
              <option value="buy_now">Buy Now</option>
              <option value="auction">Auction</option>
              <option value="donate">Donate</option>
            </select>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => productsQuery.refetch()}>Apply</button>
              {filtersChanged && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setCategory("");
                    setLocation("");
                    setMode("");
                    queryClient.invalidateQueries({ queryKey: ["dashboard", "products"] });
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </DashboardSurface>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="neo-heading text-xl font-bold text-white">{products.length} Listings</h2>
              <span className="neo-chip text-white/70">Grid View</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <article key={product.productId} className="neo-grid-card">
                  <button type="button" onClick={() => setSelectedProduct(product)} className="block w-full text-left">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={product.images[0] || "https://picsum.photos/seed/neobazaar-product/640/420"}
                        alt={product.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-3 right-3 flex gap-1">
                        <span className="neo-chip">{product.category}</span>
                        <span className={modeBadgeClass(product.mode)}>{product.mode.replace("_", " ")}</span>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="line-clamp-1 font-semibold text-white">{product.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-white/50">{product.description}</p>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-white/45">Listed</p>
                          <p className="text-base font-bold text-white">NPR {product.priceListed.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/45">AI Suggested</p>
                          <p className="text-sm font-semibold text-emerald-300">NPR {product.aiSuggestedPrice.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs text-white/50">
                        <span>{product.location}</span>
                        <span>{product.aiCondition}</span>
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
