export type AsyncStatus = "idle" | "pending" | "succeeded" | "failed";

export interface AsyncState<TData> {
  data: TData;
  error: AppAsyncError | null;
  status: AsyncStatus;
}

export interface AppAsyncError {
  code?: string;
  fieldErrors?: Record<string, string[]>;
  message: string;
  notify: boolean;
  status?: number;
  traceId?: string;
}

export interface AppPendingMeta {
  globalLoading?: boolean;
}
