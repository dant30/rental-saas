export interface DashboardMetric {
  label: string;
  value: string;
  status?: "success" | "warning" | "danger";
}

export interface ActivityItem {
  title: string;
  description: string;
}
