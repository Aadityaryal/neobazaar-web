import RegisterForm from "../_components/RegisterForm";


export default function RegisterPage() {
  return (
    <div className="page-shell py-8">
      <div className="page-container">
        <div className="grid min-h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden rounded-xl border border-dark-border lg:grid-cols-2">
          <section className="hidden bg-dark-card p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-secondary">NeoBazaar</p>
              <h1 className="mt-4 text-5xl leading-[1.1] text-primary">Build trust, trade faster.</h1>
              <p className="mt-4 max-w-md text-sm text-secondary">Create your account and start listing, bidding, and earning rewards.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-dark-border px-3 py-1 text-primary-300">Reputation Driven</span>
              <span className="rounded-full border border-dark-border px-3 py-1 text-cyan-300">XP Leaderboards</span>
              <span className="rounded-full border border-dark-border px-3 py-1 text-emerald-300">Location Aware</span>
            </div>
          </section>
          <section className="bg-transparent p-4 sm:p-6 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <RegisterForm />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}