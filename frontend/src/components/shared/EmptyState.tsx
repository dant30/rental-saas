import type { ReactNode } from "react";
import Button from "./Button";

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-slate-700">
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-app-primary">{title}</h3>
      {description ? <p className="text-sm text-app-muted">{description}</p> : null}
    </div>
    {actionLabel && onAction ? (
      <div className="mt-4">
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      </div>
    ) : null}
  </div>
);

export default EmptyState;
