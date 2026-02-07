"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-shell flex items-center justify-center">
      <div className="card w-full max-w-xl text-center space-y-3">
        <h1 className="page-title">500 — Something Went Wrong</h1>
        <p className="text-secondary">An unexpected error occurred. Please try again.</p>
        <button className="btn-primary btn-sm" onClick={reset}>Try Again</button>
      </div>
    </div>
  );
}
