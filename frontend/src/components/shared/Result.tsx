import type { ReactNode } from "react";
import Button from "./Button";

type ResultTone = "success" | "warning" | "danger" | "info";

export interface ResultProps {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  tone?: ResultTone;
}

const toneClassMap: Record<ResultTone, string> = {
  success: "border-success-200 bg-success-50",
  warning: "border-warning-200 bg-warning-50",
  danger: "border-danger-200 bg-danger-50",
  info: "border-blue-200 bg-blue-50",
};

const Result = ({ title, subtitle, extra, tone = "info" }: ResultProps) => (
  <div className={`rounded-2xl border px-6 py-8 text-center ${toneClassMap[tone]}`}>
    <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{title}</h3>
    {subtitle ? <p className="mt-2 text-sm text-[color:var(--text-muted)]">{subtitle}</p> : null}
    {extra ? <div className="mt-4">{extra}</div> : null}
  </div>
);

export const ResultAction = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
  <Button onClick={onClick} variant="outline">
    {children}
  </Button>
);

export default Result;

