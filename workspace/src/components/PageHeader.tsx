import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  breadcrumbs,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between py-5 px-4 md:px-8 border-b border-neutral-200 bg-white sticky top-0 z-10">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && (
                  <ChevronRight className="w-3 h-3 text-neutral-400" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-xs text-neutral-400 hover:text-brand-500 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs text-neutral-500">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
