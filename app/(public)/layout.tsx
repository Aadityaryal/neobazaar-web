import Header from "./_components/Header";

export default function PublicLayout({
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