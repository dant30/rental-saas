import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { routePaths } from "../../core/constants/routePaths";
import { useTheme } from "../../core/contexts/ThemeContext";
import { useMediaQuery } from "../../core/hooks/useMediaQuery";
import { cn } from "../../core/utils/cn";
import { APP_NAME } from "../../core/constants/appConstants";
import { t } from "../../core/i18n/i18n";
import { getStoredSession } from "../../router/PrivateRoute";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { notificationApi } from "../../features/notifications/services/notificationApi";
import type { NotificationRecord } from "../../features/notifications/types";

interface NavItem {
  to?: string;
  label: string;
  children?: Array<{ to: string; label: string }>;
}

interface HeaderProps {
  navItems?: NavItem[];
  onToggleSidebar?: () => void;
  title?: string;
  subtitle?: string;
}

const DESKTOP_QUERY = "(min-width: 768px)";

const PageHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <header className="page-header">
    <div>
      <span className="eyebrow">{APP_NAME}</span>
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
  </header>
);

const ShellHeader = ({
  navItems,
  onToggleSidebar,
}: {
  navItems: NavItem[];
  onToggleSidebar?: () => void;
}) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const session = getStoredSession();

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    void notificationApi
      .list()
      .then((data) => setNotifications(data.slice(0, 8)))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsMobileSearchOpen(false);
        profileButtonRef.current?.focus();
        notificationsButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileSearchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSearchOpen]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return;
    }

    let matchTo: string | undefined;
    for (const item of navItems) {
      if (item.label.toLowerCase().includes(query) && item.to) {
        matchTo = item.to;
        break;
      }
      if (item.children) {
        const child = item.children.find((childItem) => childItem.label.toLowerCase().includes(query));
        if (child) {
          matchTo = child.to;
          break;
        }
      }
    }

    if (matchTo) {
      navigate(matchTo);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(routePaths.login);
  };

  return (
    <>
      {isMobileSearchOpen ? (
        <div className="anim-fade-in fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="anim-slide-up relative w-full bg-white shadow-hard dark:bg-slate-800"
            ref={mobileSearchRef}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-slate-700">
              <form className="relative w-full" onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  className="ui-input pl-10"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("layout.header.searchPlaceholder", "Search pages...")}
                  type="search"
                  value={searchQuery}
                />
              </form>
              <button
                aria-label={t("layout.header.closeSearch", "Close search")}
                className="ml-4 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMobileSearchOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header
        className="sticky top-0 z-40 h-16 border-b bg-white/92 backdrop-blur-md dark:bg-slate-800/92"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <div className="flex h-full items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-3">
            {!isDesktop && onToggleSidebar ? (
              <button
                aria-controls="app-sidebar"
                aria-label={t("layout.header.openNavMenu", "Open navigation menu")}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700/50 md:hidden"
                onClick={onToggleSidebar}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
            ) : null}

            <button
              className="flex items-center gap-2 text-left"
              onClick={() => navigate(routePaths.dashboard)}
              type="button"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white shadow-sm">
                RS
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-app-primary">{APP_NAME}</p>
                <p className="text-xs text-app-muted">{session.role}</p>
              </div>
            </button>
          </div>

          {isDesktop ? (
            <div className="min-w-0 flex-1">
              <form className="relative mx-auto w-full max-w-2xl" onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  className="ui-input pl-10"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("layout.header.searchPlaceholder", "Search pages...")}
                  type="search"
                  value={searchQuery}
                />
              </form>
            </div>
          ) : null}

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isDesktop ? (
              <button
                aria-expanded={isMobileSearchOpen}
                aria-label={t("layout.header.search", "Search")}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700/50 md:hidden"
                onClick={() => setIsMobileSearchOpen((current) => !current)}
                type="button"
              >
                <Search className="h-5 w-5" />
              </button>
            ) : null}

            <div className="relative" ref={notificationsRef}>
              <button
                aria-controls="header-notifications-menu"
                aria-expanded={isNotificationsOpen}
                aria-haspopup="menu"
                aria-label={`Notifications (${unreadCount} unread)`}
                className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700/50"
                onClick={() => {
                  setIsNotificationsOpen((current) => !current);
                  setIsProfileOpen(false);
                }}
                ref={notificationsButtonRef}
                type="button"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                ) : null}
              </button>

              {isNotificationsOpen ? (
                <div
                  className="fixed right-4 top-16 z-50 mt-2 max-h-[calc(100vh-6rem)] w-[calc(100vw-1.5rem)] rounded-lg border border-gray-200 bg-white shadow-hard dark:border-slate-700 dark:bg-slate-800 md:absolute md:right-0 md:top-full md:w-96"
                  id="header-notifications-menu"
                  role="menu"
                  tabIndex={-1}
                >
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("layout.header.notifications", "Notifications")}
                    </h3>
                    <button
                      className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                      onClick={() => {
                        navigate(routePaths.notifications);
                        setIsNotificationsOpen(false);
                      }}
                      type="button"
                    >
                      {t("layout.header.viewAllNotifications", "View all")}
                    </button>
                  </div>
                  <div className="max-h-[calc(100vh-12rem)] overflow-y-auto md:max-h-80">
                    {notifications.length ? (
                      notifications.map((notification) => (
                        <button
                          className={cn(
                            "w-full border-b border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700",
                            !notification.is_read && "bg-blue-50/50 dark:bg-blue-900/10",
                          )}
                          key={notification.id}
                          onClick={() => {
                            navigate(routePaths.notifications);
                            setIsNotificationsOpen(false);
                          }}
                          type="button"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.subject}
                          </p>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {notification.content}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        {t("layout.header.noNotifications", "No notifications")}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              aria-label={
                isDark
                  ? t("layout.header.lightMode", "Switch to light mode")
                  : t("layout.header.darkMode", "Switch to dark mode")
              }
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700/50"
              onClick={toggleTheme}
              type="button"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={profileRef}>
              <button
                aria-controls="header-profile-menu"
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                aria-label={t("layout.header.profileMenu", "Profile menu")}
                className="group flex items-center gap-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700/50"
                onClick={() => {
                  setIsProfileOpen((current) => !current);
                  setIsNotificationsOpen(false);
                }}
                ref={profileButtonRef}
                type="button"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-semibold text-white shadow-md transition-shadow group-hover:shadow-lg">
                  {(session.name || session.email || "U").charAt(0).toUpperCase()}
                </div>
                <ChevronDown
                  className={cn(
                    "hidden h-4 w-4 transition-transform duration-200 sm:block",
                    isProfileOpen && "rotate-180",
                  )}
                />
              </button>

              {isProfileOpen ? (
                <div
                  className="fixed right-4 top-16 z-50 mt-2 w-[calc(100vw-1.5rem)] rounded-lg border border-gray-200 bg-white shadow-hard dark:border-slate-700 dark:bg-slate-800 md:absolute md:right-0 md:top-full md:w-64"
                  id="header-profile-menu"
                  role="menu"
                  tabIndex={-1}
                >
                  <div className="border-b border-gray-200 px-4 py-4 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-base font-semibold text-white shadow-md">
                        {(session.name || session.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {session.name || "User"}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {session.email}
                        </p>
                        <p className="mt-1 text-xs capitalize text-primary-600 dark:text-primary-400">
                          {session.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
                      onClick={() => {
                        navigate(routePaths.tenantPortal);
                        setIsProfileOpen(false);
                      }}
                      type="button"
                    >
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>{t("layout.header.profile", "My portal")}</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-200 py-2 dark:border-slate-700">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span>{t("auth.logout", "Logout")}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {isProfileOpen || isNotificationsOpen ? (
        <div
          className="anim-fade-in fixed inset-0 z-30 bg-black/20 dark:bg-black/40 md:hidden"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

const Header = ({ navItems = [], onToggleSidebar, title, subtitle }: HeaderProps) => {
  if (title) {
    return <PageHeader subtitle={subtitle} title={title} />;
  }

  return <ShellHeader navItems={navItems} onToggleSidebar={onToggleSidebar} />;
};

export default Header;
