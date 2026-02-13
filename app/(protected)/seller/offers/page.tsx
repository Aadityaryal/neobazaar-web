"use client";

import { useEffect, useState } from "react";
import { acceptOffer, counterOffer, listOffers, rejectOffer } from "@/lib/api/offer";
import { OFFER_STATUS, OFFER_STATUS_LABEL, type UnifiedOffer } from "@/lib/offers/model";

export default function SellerOfferInboxPage() {
  const [offers, setOffers] = useState<UnifiedOffer[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await listOffers();
      if (!response.success) {
        throw new Error(response.message || "Failed to load offers");
      }
      setOffers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load offers");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const runAction = async (offerId: string, action: "accept" | "reject" | "counter") => {
    try {
      setError("");
      let response;
      if (action === "accept") {
        response = await acceptOffer(offerId);
      } else if (action === "reject") {
        response = await rejectOffer(offerId);
      } else {
        const amountInput = window.prompt("Enter counter amount");
        if (!amountInput) {
          return;
        }
        const parsedAmount = Number(amountInput);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          throw new Error("Counter amount must be a positive number");
        }
        response = await counterOffer(offerId, parsedAmount);
      }

      if (!response.success) {
        throw new Error(response.message || "Offer action failed");
      }

      setOffers((prev) => prev.map((item) => (item.offerId === offerId ? response.data : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Offer action failed");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Offer Inbox</h1>
            <p className="text-secondary">Review buyer offers and respond with counter/accept/reject actions.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="space-y-3">
            {offers.map((offer) => (
              <div key={offer.offerId} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-primary">Offer #{offer.offerId.slice(0, 8)}</p>
                    <p className="text-sm text-secondary">Product: {offer.productId}</p>
                    <p className="text-sm text-secondary">Amount: NPR {offer.amount}</p>
                    {typeof offer.counterAmount === "number" && <p className="text-sm text-secondary">Counter: NPR {offer.counterAmount}</p>}
                    <p className="text-sm text-secondary">Status: {OFFER_STATUS_LABEL[offer.status]}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-secondary btn-sm" onClick={() => runAction(offer.offerId, "counter")} disabled={offer.status !== OFFER_STATUS.PENDING}>Counter</button>
                    <button className="btn-primary btn-sm" onClick={() => runAction(offer.offerId, "accept")} disabled={offer.status !== OFFER_STATUS.PENDING}>Accept</button>
                    <button className="btn-secondary btn-sm" onClick={() => runAction(offer.offerId, "reject")} disabled={offer.status !== OFFER_STATUS.PENDING}>Reject</button>
                  </div>
                </div>
              </div>
            ))}

            {offers.length === 0 && <div className="card empty-state">No offers available.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
