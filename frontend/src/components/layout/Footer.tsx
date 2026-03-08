import { Globe, ShieldCheck } from "lucide-react";

import { t } from "../../core/i18n/i18n";
import { APP_NAME } from "../../core/constants/appConstants";
import { cn } from "../../core/utils/cn";

const Footer = () => {
  return (
    <footer
      aria-label="Site footer"
      className={cn(
        "mt-8 border-t border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800",
      )}
      role="contentinfo"
    >
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-center md:text-left">
            <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-bold text-white">
                RS
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{APP_NAME}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t("layout.footer.copyright", "Property operations platform")}
            </p>
          </div>

          <div
            aria-label="System status"
            className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500"
          >
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              <div aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span>{t("layout.footer.systemOnline", "System online")}</span>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              <Globe aria-hidden="true" className="h-3 w-3" />
              <span>{t("layout.footer.apiVersion", "API connected")}</span>
            </div>
            <div className="hidden items-center gap-1.5 lg:flex">
              <ShieldCheck aria-hidden="true" className="h-3 w-3" />
              <span>{t("layout.footer.secureOps", "Secure operations")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
