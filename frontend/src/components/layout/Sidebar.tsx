import { Building2, CreditCard, Bell, Home, Shield, Users, Wrench, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { getStoredSession } from "../../router/PrivateRoute";
import { cn } from "../../core/utils/cn";
import { t } from "../../core/i18n/i18n";

interface NavItem {
  to: string;
  label: string;
}

interface SidebarProps {
  items: NavItem[];
  onNavigate?: () => void;
  onClose?: () => void;
}

const iconMap: Record<string, ReactNode> = {
  overview: <Home className="h-4 w-4" />,
  properties: <Building2 className="h-4 w-4" />,
  tenants: <Users className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  arrears: <Wallet className="h-4 w-4" />,
  expenses: <Wallet className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
};

const Sidebar = ({ items, onNavigate, onClose }: SidebarProps) => {
  const session = getStoredSession();
  const location = useLocation();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-slate-700">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {t("layout.sidebar.workspace", "Workspace")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {session.role} • {session.email || session.name}
          </p>
        </div>
        {onClose ? (
          <button
            aria-label={t("layout.sidebar.close", "Close sidebar")}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700/50"
            onClick={onClose}
            type="button"
          >
            <Shield className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="border-b border-gray-200 bg-white/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/70">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            {t("layout.sidebar.quickSummary", "Enabled features")}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {session.enabledFeatures.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("layout.sidebar.quickSummaryHint", "Tools available in this workspace")}
          </div>
        </div>
      </div>

      <nav
        aria-label={t("layout.sidebar.primary", "Primary navigation")}
        className="ui-scrollbar flex-1 overflow-y-auto py-4"
        id="app-sidebar"
      >
        <div className="space-y-1 px-2">
          {items.map((item) => {
            const key = item.label.toLowerCase();
            const icon = iconMap[key] ?? <Home className="h-4 w-4" />;
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));

            return (
              <NavLink className="block" key={item.to} onClick={onNavigate} to={item.to}>
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-slate-700/50",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
          <p className="flex items-center justify-between">
            <span>{t("layout.sidebar.version", "Version")}:</span>
            <span className="font-medium">v0.1.0</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
