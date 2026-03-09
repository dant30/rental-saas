import type { ReactNode } from "react";
import Button from "./Button";

export interface PopconfirmProps {
  title: ReactNode;
  description?: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const Popconfirm = ({ title, description, onConfirm, onCancel }: PopconfirmProps) => (
  <div className="rounded-xl border bg-white p-4 shadow-hard dark:border-slate-700 dark:bg-slate-900">
    <div className="space-y-1">
      <div className="font-medium text-[color:var(--text-primary)]">{title}</div>
      {description ? <div className="text-sm text-[color:var(--text-muted)]">{description}</div> : null}
    </div>
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onConfirm}>Confirm</Button>
    </div>
  </div>
);

export default Popconfirm;

