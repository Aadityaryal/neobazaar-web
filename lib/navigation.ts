export type NavRole = "guest" | "buyer" | "seller" | "admin";

export type NavItem = {
  href: string;
  label: string;
  startsWith?: string;
  priority?: "primary" | "secondary";
};

export function resolveNavHref(item: NavItem) {
  return item.href;
}

export const navByRole: Record<NavRole, NavItem[]> = {
  guest: [
    { href: "/login", label: "Log In", startsWith: "/login" },
    { href: "/register", label: "Sign Up", startsWith: "/register" },
  ],
  buyer: [
    { href: "/dashboard", label: "Dashboard", startsWith: "/dashboard" },
    { href: "/dashboard/orders", label: "Orders", startsWith: "/dashboard/orders" },
    { href: "/dashboard/chat", label: "Messages", startsWith: "/dashboard/chat" },
    { href: "/user/profile", label: "Profile", startsWith: "/user/profile" },
    { href: "/seller/studio", label: "Seller Mode", startsWith: "/seller", priority: "secondary" },
    { href: "/settings/sessions", label: "Settings", startsWith: "/settings", priority: "secondary" },
    { href: "/wallet", label: "Wallet", startsWith: "/wallet", priority: "secondary" },
    { href: "/notifications", label: "Alerts", startsWith: "/notifications", priority: "secondary" },
  ],
  seller: [
    { href: "/seller/studio", label: "Seller Studio", startsWith: "/seller" },
    { href: "/seller/listings/new", label: "New Listing", startsWith: "/seller/listings" },
    { href: "/seller/offers", label: "Offers", startsWith: "/seller/offers" },
    { href: "/user/profile", label: "Profile", startsWith: "/user/profile" },
    { href: "/dashboard", label: "Buyer Mode", startsWith: "/dashboard", priority: "secondary" },
    { href: "/seller/settings", label: "Settings", startsWith: "/seller/settings", priority: "secondary" },
    { href: "/seller/processing", label: "Fulfillment", startsWith: "/seller/processing", priority: "secondary" },
    { href: "/seller/wallet", label: "Wallet", startsWith: "/seller/wallet", priority: "secondary" },
  ],
  admin: [
    { href: "/admin", label: "Admin Home", startsWith: "/admin" },
    { href: "/admin/disputes", label: "Disputes", startsWith: "/admin/disputes" },
    { href: "/admin/fraud", label: "Fraud", startsWith: "/admin/fraud" },
    { href: "/admin/audit", label: "Audit", startsWith: "/admin/audit" },
    { href: "/admin/risk", label: "Risk", startsWith: "/admin/risk" },
  ],
};

export const sectionNavByPrefix: Array<{ prefix: string; items: NavItem[] }> = [
  {
    prefix: "/seller",
    items: [
      { href: "/seller/studio", label: "Studio" },
      { href: "/seller/listings/new", label: "Listings" },
      { href: "/seller/offers", label: "Offers" },
      { href: "/seller/processing", label: "Processing" },
      { href: "/seller/performance", label: "Performance" },
      { href: "/seller/settings", label: "Settings" },
    ],
  },
  {
    prefix: "/admin",
    items: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/disputes", label: "Disputes" },
      { href: "/admin/fraud", label: "Fraud" },
      { href: "/admin/audit", label: "Audit" },
      { href: "/admin/risk", label: "Risk" },
      { href: "/admin/users", label: "Users" },
    ],
  },
];
