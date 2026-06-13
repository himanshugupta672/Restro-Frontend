import type { Location } from "react-router-dom";

interface RedirectState {
  from?: Location;
}

export const getRedirectPath = (state: unknown, fallback: string) => {
  if (typeof state !== "object" || state === null) {
    return fallback;
  }

  const { from } = state as RedirectState;

  if (!from?.pathname.startsWith("/")) {
    return fallback;
  }

  return `${from.pathname}${from.search}${from.hash}`;
};
