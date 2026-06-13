import { LinearProgress } from "@mui/material";

import { useAppSelector } from "@/hooks/reduxHooks";
import { selectIsGlobalLoading } from "@/store/appStatus";

export const GlobalProgress = () => {
  const isLoading = useAppSelector(selectIsGlobalLoading);

  if (!isLoading) {
    return null;
  }

  return (
    <LinearProgress
      aria-label="Application request in progress"
      sx={{
        left: 0,
        position: "fixed",
        right: 0,
        top: 0,
        zIndex: (theme) => theme.zIndex.tooltip + 1,
      }}
    />
  );
};
