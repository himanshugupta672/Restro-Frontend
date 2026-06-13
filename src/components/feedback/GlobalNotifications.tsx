import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { notificationDismissed, selectNotifications } from "@/store/appStatus";

export const GlobalNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  useEffect(() => {
    notifications.forEach((notification) => {
      toast[notification.severity](notification.message, {
        toastId: notification.id,
      });
      dispatch(notificationDismissed(notification.id));
    });
  }, [dispatch, notifications]);

  return (
    <ToastContainer
      closeOnClick
      newestOnTop
      pauseOnFocusLoss
      position="top-right"
      theme="colored"
    />
  );
};
