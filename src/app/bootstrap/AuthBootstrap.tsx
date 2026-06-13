import { useEffect, type PropsWithChildren } from "react";

import { restoreSession } from "@/features/auth";
import { useAppDispatch } from "@/hooks/reduxHooks";

export const AuthBootstrap = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  return children;
};
