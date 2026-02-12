"use client";

import { useRouter, usePathname } from "next/navigation";

import { PropsWithChildren, useEffect, useState } from "react";

import AppLayout from "@cloudscape-design/components/app-layout";
import Flashbar, {
	FlashbarProps,
} from "@cloudscape-design/components/flashbar";
import axios from "axios";
import { SWRConfig } from "swr";

import { hasAdminRole } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";
import NotificationContext from "@/lib/admin/NotificationContext";
import useUserIdentityStatic from "@/lib/admin/useUserIdentityStatic";

import AdminSidebar from "./AdminSidebar";
import Breadcrumbs from "./Breadcrumbs";

function AdminLayout({ children }: PropsWithChildren) {
	const identity = useUserIdentityStatic();
	const router = useRouter();
	const pathName = usePathname();
	const [notifications, setNotifications] = useState<
		FlashbarProps.MessageDefinition[]
	>([]);

	useEffect(() => {
		setNotifications(() => []);

		if (!document.cookie.includes("hackathon=irvinehacks")) {
			document.cookie =
				"hackathon=irvinehacks; path=/; max-age=" + 60 * 60 * 24 * 30;
		}
	}, [pathName]);

	if (!identity) {
		return "Loading...";
	}

	const { uid, roles } = identity;
	const loggedIn = uid !== null;
	const authorized = hasAdminRole(roles);

	if (!loggedIn) {
		router.push("/login");
	} else if (!authorized) {
		router.push("/unauthorized");
	}

	return (
		<SWRConfig
			value={{
				shouldRetryOnError: (err) => {
					if (axios.isAxiosError(err) && err.response?.status === 401) {
						router.push("/login");
						return false;
					}
					return true;
				},
			}}
		>
			<UserContext.Provider value={identity}>
				<NotificationContext.Provider value={{ setNotifications }}>
					<AppLayout
						content={children}
						navigation={<AdminSidebar />}
						breadcrumbs={<Breadcrumbs />}
					/>
					<div
						style={{
							position: "fixed",
							top: "1rem",
							right: "1rem",
							zIndex: 1000,
							width: "400px",
							maxWidth: "calc(100% - 2rem)",
						}}
					>
						<Flashbar
							items={notifications}
							i18nStrings={{
								ariaLabel: "Notifications",
								notificationBarAriaLabel: "View all notifications",
								notificationBarText: "Notifications",
								errorIconAriaLabel: "Error",
								warningIconAriaLabel: "Warning",
								successIconAriaLabel: "Success",
								infoIconAriaLabel: "Info",
								inProgressIconAriaLabel: "In progress",
							}}
							stackItems
						/>
					</div>
				</NotificationContext.Provider>
			</UserContext.Provider>
		</SWRConfig>
	);
}

export default AdminLayout;
