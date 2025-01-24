import { FlashbarProps } from "@cloudscape-design/components";
import { createContext, SetStateAction, Dispatch } from "react";

interface Notification {
	setNotifications: Dispatch<
		SetStateAction<FlashbarProps.MessageDefinition[]>
	> | null;
}

const NotificationContext = createContext<Notification>({
	setNotifications: null,
});

export default NotificationContext;
