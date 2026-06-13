import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import { configureApi } from "@/app/bootstrap/configureApi";
import { AppProviders } from "@/app/providers/AppProviders";
import "@/config/env";
import "@/index.css";
import "react-toastify/dist/ReactToastify.css";

configureApi();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
