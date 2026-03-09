import type { ComponentType } from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

interface BreadcrumbStructuredProps extends BreadcrumbProps {
  separator?: string;
}

const Breadcrumb = ({ items = [], className }: BreadcrumbProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <a
            href="/"
            className="flex items-center text-neutral-600 transition-colors duration-150 hover:text-brand-500 dark:text-neutral-400 dark:hover:text-brand-100"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </a>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href || `${item.label}-${index}`} className="contents">
              <span className="flex items-center">
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </span>
              {isLast ? (
                <span className="font-medium text-neutral-900 dark:text-neutral-300">{item.label}</span>
              ) : (
                <a
                  href={item.href}
                  className="text-neutral-600 transition-colors duration-150 hover:text-brand-500 dark:text-neutral-400 dark:hover:text-brand-100"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export const Breadcrumb2 = ({
  items = [],
  separator = "/",
  className,
}: BreadcrumbStructuredProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <nav className={cn("flex items-center", className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          const Icon = item.icon;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center">
              {!isFirst ? (
                <span className="mx-2 text-neutral-400 dark:text-neutral-500">{separator}</span>
              ) : null}
              {isLast ? (
                <span className="font-medium text-neutral-900 dark:text-neutral-300">{item.label}</span>
              ) : (
                <a
                  href={item.href}
                  className="inline-flex items-center text-neutral-600 transition-colors duration-150 hover:text-brand-500 dark:text-neutral-400 dark:hover:text-brand-100"
                >
                  {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

