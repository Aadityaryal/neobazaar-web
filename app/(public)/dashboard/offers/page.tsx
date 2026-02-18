"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listOffers } from "@/lib/api/offer";
import { OFFER_STATUS_LABEL } from "@/lib/offers/model";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardSection, DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

const getOffersOrThrow = async () => {
  const response = await listOffers();
  if (!response.success) {
    throw new Error(response.message || "Failed to load offers");
  }
  return response.data;
};

export default function BuyerOfferCenterPage() {
  const offersQuery = useQuery({
    queryKey: ["dashboard", "offers"],
    queryFn: getOffersOrThrow,
  });

  const offers = offersQuery.data ?? [];

  return (
    <DashboardPageScaffold
      title="Offer Center"
      subtitle="Manage sent offers, counter-offers, and offer outcomes."
      routeLabel="Dashboard / Offers"
      actions={
        <>
          <Link href="/dashboard/chat" className="btn-secondary btn-sm">Negotiation chat</Link>
          <Link href="/dashboard/search" className="btn-primary btn-sm">Find listings</Link>
        </>
      }
    >

          {offersQuery.isLoading && (
            <DashboardSurface className="p-4">
              <div className="skeleton h-5 w-1/3 mb-3" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-5/6" />
            </DashboardSurface>
          )}

          {offersQuery.isError && (
            <DashboardStatus tone="error">{offersQuery.error instanceof Error ? offersQuery.error.message : "Failed to load offers"}</DashboardStatus>
          )}

          {!offersQuery.isLoading && !offersQuery.isError && offers.length === 0 && (
            <DashboardSection title="No Offers Yet" subtitle="Send an offer from any listing detail page.">
              <p className="empty-state">No offers yet.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/dashboard/search" className="btn-primary btn-sm">Explore products</Link>
                <Link href="/dashboard/recent" className="btn-secondary btn-sm">Recent listings</Link>
              </div>
            </DashboardSection>
          )}

          {offers.length > 0 && (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.offerId} className="neo-surface p-4">
                  <p className="font-semibold text-white">Offer #{offer.offerId.slice(0, 8)}</p>
                  <p className="text-sm text-white/65">Product: {offer.productId}</p>
                  <p className="text-sm text-white/65">Amount: NPR {offer.amount}</p>
                  <p className="text-sm text-white/65">Status: {OFFER_STATUS_LABEL[offer.status]}</p>
                </div>
              ))}
            </div>
          )}
    </DashboardPageScaffold>
  );
}
