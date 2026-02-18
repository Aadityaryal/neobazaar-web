"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createChat } from "@/lib/api/chat";
import { getMe } from "@/lib/api/auth";
import { getProductById, recordProductView, type Product } from "@/lib/api/product";
import { confirmTransaction, createTransaction, placeBid } from "@/lib/api/transaction";
import { createOffer } from "@/lib/api/offer";
import { nlpSuggest } from "@/lib/api/extension";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import type { AuctionBidPlacedV1Payload } from "@/lib/realtime/generated-events";
import { io, type Socket } from "socket.io-client";
import { ORDER_STATUS } from "@/lib/orders/status";
import DashboardPageScaffold from "../../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../../_components/DashboardUIPrimitives";

type CurrentUser = {
  userId: string;
  neoTokens: number;
};

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [escrowTxnId, setEscrowTxnId] = useState("");
  const [escrowStage, setEscrowStage] = useState<"idle" | "locked" | "released">("idle");
  const [aiNegotiation, setAiNegotiation] = useState("");
  const [aiNegotiationLabel, setAiNegotiationLabel] = useState("");
  const [bidFeed, setBidFeed] = useState<Array<{ amount: number; bidderId: string }>>([]);
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [productResponse, meResponse] = await Promise.all([
          getProductById(params.productId),
          getMe(),
        ]);
        if (productResponse.success) setProduct(productResponse.data);
        if (meResponse.success) setUser(meResponse.data);
        void recordProductView(params.productId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection error — please retry");
      }
    };
    load();

    const socket: Socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050", {
      transports: ["websocket"],
      withCredentials: true,
    });

    const onBid = (payload: AuctionBidPlacedV1Payload) => {
      if (payload.productId === params.productId) {
        setBidFeed((prev) => [payload.bid, ...prev]);
      }
    };

    socket.on(REALTIME_EVENTS.AUCTION_BID_PLACED_V1, onBid);
    socket.on(REALTIME_EVENTS.AUCTION_BID_LEGACY, onBid);

    const flagged = new URLSearchParams(window.location.search).get("flagged") === "1";
    setShowFlaggedModal(flagged);

    return () => {
      socket.disconnect();
    };
  }, [params.productId]);

  const buyNow = async () => {
    if (!product) return;
    try {
      setError("");
      const response = await createTransaction({ productId: params.productId, tokenAmount: product.priceListed });
      if (!response.success) {
        throw new Error(response.message || "Transaction failed");
      }
      setEscrowTxnId(response.data.txnId);
      setEscrowStage("locked");
      setNotice("Escrow created. Confirm from both sides to release tokens.");
      setUser((prev) => prev ? { ...prev, neoTokens: response.balances?.buyerNeoTokens ?? prev.neoTokens } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error — please retry");
    }
  };

  const bid = async () => {
    try {
      setError("");
      const response = await placeBid({ productId: params.productId, amount: Number(bidAmount) });
      if (!response.success) {
        throw new Error(response.message || "Bid failed");
      }
      setNotice("Bid placed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error — please retry");
    }
  };

  const offer = async () => {
    try {
      setError("");
      const amount = Number(offerAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Offer amount must be a positive number");
      }
      const response = await createOffer({ productId: params.productId, amount });
      if (!response.success) {
        throw new Error(response.message || "Offer creation failed");
      }
      setNotice("Offer sent");
      setOfferAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Offer creation failed");
    }
  };

  const runNegotiation = async () => {
    if (!product) return;
    try {
      const response = await nlpSuggest([{ senderId: "buyer", content: `Negotiate from price ${product.priceListed}` }]);
      if (!response.success) {
        throw new Error(response.message || "Negotiation suggestion failed");
      }
      setAiNegotiation(response.suggestionText);
      setAiNegotiationLabel(typeof response.fallbackLabel === "string" ? response.fallbackLabel : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Negotiation suggestion failed");
    }
  };

  const confirmEscrow = async (actor: "buyer" | "seller") => {
    if (!escrowTxnId) return;
    try {
      const response = await confirmTransaction(escrowTxnId, actor);
      if (!response.success) {
        throw new Error(response.message || "Confirmation failed");
      }
      if (response.data.status === ORDER_STATUS.COMPLETED) {
        setEscrowStage("released");
        setNotice("Escrow released successfully");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    }
  };

  const messageSeller = async () => {
    if (!user || !product) return;
    try {
      const response = await createChat({ buyerId: user.userId, sellerId: product.sellerId, productId: product.productId });
      if (!response.success) {
        throw new Error(response.message || "Chat creation failed");
      }
      router.push(`/dashboard/chat/${response.data.chatId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error — please retry");
    }
  };

  if (!product) {
    return <div className="page-shell flex items-center justify-center text-secondary">Loading...</div>;
  }

  return (
    <DashboardPageScaffold
      title={product.title}
      subtitle="Product details with escrow checkout, auction actions, and AI negotiation support."
      routeLabel={`Dashboard / Products / ${product.productId}`}
      actions={<button className="btn-secondary btn-sm" onClick={messageSeller}>Message Seller</button>}
    >
        {showFlaggedModal && (
          <DashboardStatus tone="warning">
            This listing has been flagged for review. Proceed with caution.
            <button className="ml-3 text-xs underline" onClick={() => setShowFlaggedModal(false)}>Dismiss</button>
          </DashboardStatus>
        )}
        {error && <DashboardStatus tone="error">{error}</DashboardStatus>}
        {notice && <DashboardStatus tone="success">{notice}</DashboardStatus>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardSurface className="overflow-hidden p-4">
            <div className="relative aspect-square overflow-hidden rounded-[14px] border border-dark-border bg-dark-card">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="empty-state flex h-full items-center justify-center">No Image</div>
              )}
            </div>
          </DashboardSurface>

          <section className="space-y-4">
            <DashboardSurface className="space-y-2 p-4">
              <p className="text-white/70">{product.description}</p>
              <div className="grid grid-cols-1 gap-1 text-sm text-white/60 sm:grid-cols-2">
                <p>Category: {product.category}</p>
                <p>Location: {product.location}</p>
                <p>Listed Price: NPR {product.priceListed}</p>
                <p className="token-text">AI Suggested: NPR {product.aiSuggestedPrice}</p>
                <p>AI Condition: {product.aiCondition}</p>
                <p>Mode: {product.mode}</p>
              </div>
            </DashboardSurface>

            {product.mode === "buy_now" && (
              <DashboardSurface className="space-y-3 p-4">
                <h2 className="section-title">Buy Now</h2>
                <input className="input-field" type="number" value={product.priceListed} readOnly aria-label="Buy now token amount" />
                <button className="btn-primary" onClick={buyNow}>Confirm Purchase</button>
                {escrowTxnId && (
                  <div className="rounded-lg border border-dark-border p-3">
                    <p className="mb-2 text-sm text-secondary">Escrow Animation</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className={`${escrowStage !== "idle" ? "text-primary-300" : "text-muted"}`}>Buyer Wallet</span>
                      <span>→</span>
                      <span className={`${escrowStage === "locked" ? "text-amber-300" : escrowStage === "released" ? "text-green-300" : "text-muted"}`}>Locked Vault</span>
                      <span>→</span>
                      <span className={`${escrowStage === "released" ? "text-green-300" : "text-muted"}`}>Seller Wallet</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="btn-secondary btn-sm" onClick={() => confirmEscrow("buyer")}>Buyer Confirm</button>
                      <button className="btn-secondary btn-sm" onClick={() => confirmEscrow("seller")}>Seller Confirm</button>
                    </div>
                  </div>
                )}
              </DashboardSurface>
            )}

            {product.mode === "auction" && (
              <DashboardSurface className="space-y-3 p-4">
                <h2 className="section-title">Auction</h2>
                <input className="input-field" type="number" placeholder="Bid amount" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                <button className="btn-primary" onClick={bid}>Place Bid</button>
                <div className="rounded-lg border border-dark-border p-3 space-y-2">
                  <p className="text-sm text-secondary">Live bids</p>
                  {bidFeed.map((entry, index) => (
                    <p key={`${entry.bidderId}-${entry.amount}-${index}`} className="text-xs text-secondary">{entry.bidderId}: {entry.amount}</p>
                  ))}
                  {bidFeed.length === 0 && <p className="text-xs text-muted">Waiting for incoming auction bid events...</p>}
                </div>
              </DashboardSurface>
            )}

            <div className="flex flex-wrap gap-2">
              <button className="btn-primary btn-sm px-6" onClick={runNegotiation}>Let AI Negotiate</button>
            </div>

            <DashboardSurface className="space-y-3 p-4">
              <h2 className="section-title">Send Offer</h2>
              <input
                className="input-field"
                type="number"
                placeholder="Offer amount"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
              <button className="btn-secondary btn-sm" onClick={offer}>Send Offer</button>
            </DashboardSurface>

            {aiNegotiation && (
              <DashboardSurface className="border border-primary-500/30 bg-primary-900/10 p-4">
                <p className="mb-1 text-sm text-white/70">AI Suggestion</p>
                {aiNegotiationLabel && <p className="mb-1 text-xs text-white/45">{aiNegotiationLabel}</p>}
                <p className="text-white">{aiNegotiation}</p>
              </DashboardSurface>
            )}
          </section>
        </div>
    </DashboardPageScaffold>
  );
}
