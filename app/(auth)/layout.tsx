import Header from "../(public)/_components/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <Header />
      <main>{children}</main>
    </div>
  );
}