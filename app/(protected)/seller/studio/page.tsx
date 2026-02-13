"use client";

import Link from "next/link";

const SELLER_QUICK_LINKS = [
  { href: "/seller/listings/new", label: "Create listing" },
  { href: "/seller/inventory", label: "Inventory" },
  { href: "/seller/offers", label: "Offer inbox" },
  { href: "/seller/processing", label: "Processing queue" },
  { href: "/seller/escrow-release", label: "Escrow release" },
  { href: "/seller/performance", label: "Performance" },
  { href: "/seller/listings/bulk", label: "Bulk upload" },
  { href: "/seller/wallet", label: "Payout ledger" },
];

export default function SellerStudioHomePage() {
  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="card flex flex-col gap-2">
            <h1 className="page-title">Seller Studio</h1>
            <p className="text-secondary">Manage listings, offers, fulfillment, and seller operations from one workspace.</p>
          </section>

          <section className="card space-y-3">
            <h2 className="section-title">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SELLER_QUICK_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl border border-dark-border p-4 text-primary hover:border-primary-500/50">
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
