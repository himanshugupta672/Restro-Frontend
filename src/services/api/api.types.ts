export interface ValidationProblemDetails {
  errors?: Record<string, string[]>;
  status?: number;
  title?: string;
  traceId?: string;
  type?: string;
}

export interface ApiErrorDetails {
  fieldErrors?: Record<string, string[]>;
  payload?: unknown;
  traceId?: string;
}

export interface ApiAuthAdapter {
  getAccessToken: () => string | null;
  onSessionExpired: () => void;
  refreshAccessToken: () => Promise<string>;
}
