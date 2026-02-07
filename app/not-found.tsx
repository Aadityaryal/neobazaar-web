export default function NotFound() {
  return (
    <div className="page-shell flex items-center justify-center">
      <div className="card w-full max-w-xl text-center space-y-3">
        <h1 className="page-title">404 — Page Not Found</h1>
        <p className="text-secondary">The page you requested does not exist.</p>
      </div>
    </div>
  );
}
