import type { ElementType, ReactNode } from "react";

type DashboardSurfaceProps = {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>;

type DashboardSectionProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
};

type DashboardStatusProps = {
  tone: "error" | "success" | "warning";
  children: ReactNode;
};

function joinClassNames(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function DashboardSurface({ as: Component = "section", className, children, ...rest }: DashboardSurfaceProps) {
  return <Component className={joinClassNames("neo-surface", className)} {...rest}>{children}</Component>;
}

export function DashboardSection({ title, subtitle, actions, className, children }: DashboardSectionProps) {
  return (
    <DashboardSurface className={joinClassNames("p-4 sm:p-5", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="neo-heading text-lg font-bold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </DashboardSurface>
  );
}

export function DashboardStatus({ tone, children }: DashboardStatusProps) {
  if (tone === "error") {
    return <div className="alert-error">{children}</div>;
  }
  if (tone === "warning") {
    return <div className="alert-warning">{children}</div>;
  }
  return <div className="alert-success">{children}</div>;
}
