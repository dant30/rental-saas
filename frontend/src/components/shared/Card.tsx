import type { ComponentType, ReactNode } from "react";
import { cn } from "@utils/cn";

export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glass?: boolean;
}

export interface CardHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
}

export interface CardSectionProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}

export const Card = ({ children, className, hoverable = false, glass = false }: CardProps) => (
  <div
    className={cn(
      glass ? "glass" : "card",
      hoverable && "hover-lift transition-shadow hover:shadow-md",
      className,
    )}
  >
    {children}
  </div>
);

export const CardHeader = ({
  title,
  description,
  icon: Icon,
  action,
  className,
}: CardHeaderProps) => {
  if (!title && !description && !action) {
    return null;
  }

  return (
    <div className={cn("card-header flex items-start justify-between", className)}>
      <div className="space-y-1">
        {title ? (
          <div className="flex items-center gap-2">
            {Icon ? <Icon className="h-5 w-5 text-primary-600" /> : null}
            <h4 className="text-base font-semibold text-app-primary">{title}</h4>
          </div>
        ) : null}
        {description ? <p className="text-sm text-app-muted">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
};

export const CardContent = ({ children, className, noPadding = false }: CardSectionProps) => (
  <div className={cn(!noPadding && "card-body", noPadding && "px-5 py-4", className)}>{children}</div>
);

export const CardFooter = ({ children, className, bordered = true }: CardFooterProps) => (
  <div className={cn("card-footer", !bordered && "border-t-0", className)}>{children}</div>
);

export default Card;
