export type NotificationSeverity = "error" | "info" | "success" | "warning";

export interface AppNotification {
  id: string;
  message: string;
  severity: NotificationSeverity;
}

export interface TrackedRequest {
  globalLoading: boolean;
}
