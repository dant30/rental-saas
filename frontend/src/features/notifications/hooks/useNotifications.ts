import { useEffect, useState } from "react";

import { notificationApi } from "../services/notificationApi";
import { notificationsInitialState, NotificationsState } from "../store/notificationsSlice";

export const useNotifications = () => {
  const [state, setState] = useState<NotificationsState>(notificationsInitialState);

  useEffect(() => {
    notificationApi.list().then((items) => setState({ items })).catch(() => setState(notificationsInitialState));
  }, []);

  return state;
};
