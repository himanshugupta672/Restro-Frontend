import {
  accessTokenRefreshed,
  sessionCleared,
  refreshAccessToken,
} from "@/features/auth";
import { configureApiAuth } from "@/services/api";
import { store } from "@/store";

export const configureApi = () => {
  configureApiAuth({
    getAccessToken: () => store.getState().auth.accessToken,
    onSessionExpired: () => {
      store.dispatch(sessionCleared());
    },
    refreshAccessToken: async () => {
      const accessToken = await refreshAccessToken();
      store.dispatch(accessTokenRefreshed(accessToken));

      return accessToken;
    },
  });
};
