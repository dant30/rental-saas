import { PropsWithChildren } from "react";

import Sidebar from "./Sidebar";

interface MainLayoutProps {
  navItems: Array<{ to: string; label: string }>;
}

const MainLayout = ({ children, navItems }: PropsWithChildren<MainLayoutProps>) => (
  <div className="theme-shell">
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="glass-panel metric-card" style={{ height: "100%" }}>
          <Sidebar items={navItems} />
        </div>
      </aside>
      <main className="app-shell__main">{children}</main>
    </div>
  </div>
);

export default MainLayout;
