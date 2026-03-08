import Badge from "./Badge";

const statusMap = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "secondary" },
  pending: { label: "Pending", variant: "warning" },
  overdue: { label: "Overdue", variant: "danger" },
  draft: { label: "Draft", variant: "outline" },
  completed: { label: "Completed", variant: "success" },
} as const;

export interface StatusBadgeProps {
  status: keyof typeof statusMap | string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusMap[status as keyof typeof statusMap] ?? { label: status, variant: "secondary" as const };
  return (
    <Badge className={className} variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
