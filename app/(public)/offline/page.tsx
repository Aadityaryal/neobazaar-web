export default function OfflinePage() {
  return (
    <div className="page-shell flex items-center justify-center">
      <div className="card w-full max-w-xl text-center space-y-3">
        <h1 className="page-title">Offline Mode</h1>
        <p className="text-secondary">You are offline. Some actions will sync automatically when connection returns.</p>
      </div>
    </div>
  );
}
