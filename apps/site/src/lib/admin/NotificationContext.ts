import { createContext, ReactNode, SetStateAction, Dispatch } from "react";

interface Notification {
	notifications: ReactNode[] | null;
	setNotifications: Dispatch<SetStateAction<ReactNode[]>> | null;
}

type x = Dispatch<SetStateAction<ReactNode[]>>;
const NotificationContext = createContext<Notification>({
	notifications: null,
	setNotifications: null,
});

export default NotificationContext;
