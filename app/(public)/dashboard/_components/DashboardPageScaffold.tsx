import type { ReactNode } from "react";
import { DashboardSurface } from "./DashboardUIPrimitives";

type DashboardPageScaffoldProps = {
  title: string;
  subtitle: string;
  routeLabel?: string;
  actions?: ReactNode;
  maxWidth?: string;
  children?: ReactNode;
};

export default function DashboardPageScaffold({
  title,
  subtitle,
  routeLabel,
  actions,
  maxWidth = "max-w-6xl",
  children,
}: DashboardPageScaffoldProps) {
  return (
    <div className="neo-shell">
      <div className="page-container py-8">
        <div className={`mx-auto ${maxWidth} space-y-6`}>
          <DashboardSurface className="p-5 sm:p-6">
            {routeLabel && <p className="text-xs uppercase tracking-wider text-white/35">{routeLabel}</p>}
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="neo-heading text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
                <p className="mt-1 text-sm text-white/55">{subtitle}</p>
              </div>
              {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>
          </DashboardSurface>

          {children}
        </div>
      </div>
    </div>
  );
}
