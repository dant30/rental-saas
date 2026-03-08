import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Outlet } from "react-router-dom";

import { useMediaQuery } from "../../core/hooks/useMediaQuery";
import { cn } from "../../core/utils/cn";
import { t } from "../../core/i18n/i18n";
import Button from "../shared/Button";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  navItems: Array<{ to: string; label: string }>;
}

const DESKTOP_QUERY = "(min-width: 768px)";
const SCROLL_THRESHOLD = 300;

const MainLayout = ({ children, navItems }: PropsWithChildren<MainLayoutProps>) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isDesktop) {
      setMobileSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (!mobileSidebarOpen || !mobileDrawerRef.current) {
      return;
    }

    const drawer = mobileDrawerRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const handleTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusables.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    drawer.addEventListener("keydown", handleTrap);
    return () => drawer.removeEventListener("keydown", handleTrap);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  const content = children ?? <Outlet />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app-surface">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-700 focus:shadow-lg"
        href="#main-content"
      >
        {t("layout.main.skipToContent", "Skip to main content")}
      </a>

      <Header navItems={navItems} onToggleSidebar={() => setMobileSidebarOpen((current) => !current)} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isDesktop ? (
          <div className="min-h-0 w-72 shrink-0">
            <aside className="h-full w-72 border-r bg-app-panel" style={{ borderColor: "var(--surface-border)" }}>
              <Sidebar items={navItems} />
            </aside>
          </div>
        ) : null}

        <div
          aria-hidden={mobileSidebarOpen ? "false" : "true"}
          className={cn(
            "fixed inset-0 z-[60]",
            isDesktop ? "hidden" : "",
            mobileSidebarOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <button
            aria-label={t("layout.main.closeSidebarBackdrop", "Close sidebar backdrop")}
            className={cn(
              "absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ease-out",
              mobileSidebarOpen ? "opacity-100" : "opacity-0",
            )}
            onClick={() => setMobileSidebarOpen(false)}
            type="button"
          />

          <div
            aria-label={t("layout.sidebar.navigation", "Navigation")}
            aria-modal="true"
            className={cn(
              "relative z-10 h-full w-72 max-w-[88vw] transform-gpu transition-transform duration-200 ease-out",
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
            ref={mobileDrawerRef}
            role="dialog"
          >
            <aside className="h-full border-r bg-app-panel" style={{ borderColor: "var(--surface-border)" }}>
              <Sidebar
                items={navItems}
                onClose={() => setMobileSidebarOpen(false)}
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </aside>
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent" id="main-content">
          <div className="mx-auto w-full max-w-[1520px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {content}
          </div>
          <Footer />
        </main>

        {showBackToTop ? (
          <Button
            aria-label={t("layout.main.backToTop", "Back to top")}
            className="fixed bottom-4 right-4 z-50 rounded-full px-3 shadow-lg sm:bottom-6 sm:right-6 sm:px-4"
            icon={<ArrowUp className="h-4 w-4" />}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            size="sm"
            type="button"
            variant="primary"
          >
            {t("layout.main.backToTopShort", "Top")}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default MainLayout;
