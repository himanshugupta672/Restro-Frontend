import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { AuthBootstrap } from "@/app/bootstrap/AuthBootstrap";
import { appTheme } from "@/app/theme/appTheme";
import { AppFeedback } from "@/components/feedback/AppFeedback";
import { store } from "@/store";

export const AppProviders = ({ children }: PropsWithChildren) => (
  <Provider store={store}>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppFeedback />
        <AuthBootstrap>{children}</AuthBootstrap>
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
