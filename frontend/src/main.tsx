import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { TenantProvider } from "./core/contexts/TenantContext";
import { ThemeProvider } from "./core/contexts/ThemeContext";
import { ToastProvider } from "./core/contexts/ToastContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <TenantProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TenantProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
