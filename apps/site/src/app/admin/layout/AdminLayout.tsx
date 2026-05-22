"use client";

import { useRouter, usePathname } from "next/navigation";

import { PropsWithChildren, useCallback, useEffect, useState } from "react";

import AppLayout from "@cloudscape-design/components/app-layout";
import Box from "@cloudscape-design/components/box";
import Flashbar, {
	FlashbarProps,
} from "@cloudscape-design/components/flashbar";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import axios from "axios";
import { SWRConfig } from "swr";

import { hasAdminRole } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";
import NotificationContext from "@/lib/admin/NotificationContext";
import useUserIdentityStatic from "@/lib/admin/useUserIdentityStatic";

import AdminSidebar from "./AdminSidebar";
import Breadcrumbs from "./Breadcrumbs";
import SessionTimeoutModal from "./SessionTimeoutModal";
import { useSessionTimeout } from "@/lib/admin/useSessionTimeout";

function AdminLayout({ children }: PropsWithChildren) {
	const identity = useUserIdentityStatic();
	const router = useRouter();
	const pathName = usePathname();
	const [notifications, setNotifications] = useState<
		FlashbarProps.MessageDefinition[]
	>([]);
	const [showTimeoutModal, setShowTimeoutModal] = useState(false);
	const handleWarning = useCallback(() => {
		setShowTimeoutModal(true);
	}, []);
	const handleExpired = useCallback(() => {
		setShowTimeoutModal(false);
	}, []);

	const { logout, extendSession } = useSessionTimeout({
		onWarning: handleWarning,
		onExpired: handleExpired,
	});

	const handleExtend = useCallback(async () => {
		setShowTimeoutModal(false);
		await extendSession();
	}, [extendSession]);

	const handleLogout = useCallback(() => {
		setShowTimeoutModal(false);
		logout();
	}, [logout]);

	useEffect(() => {
		setNotifications(() => []);

		if (pathName.includes("/zothacks")) {
			document.cookie =
				"hackathon=zothacks; path=/; max-age=" + 60 * 60 * 24 * 30;
			return;
		}

		const hasHackathonCookie = document.cookie
			.split("; ")
			.some((cookie) => cookie.startsWith("hackathon="));
		if (!hasHackathonCookie) {
			document.cookie =
				"hackathon=irvinehacks; path=/; max-age=" + 60 * 60 * 24 * 30;
		}
	}, [pathName]);

	if (!identity) {
		return (
			<div
				style={{
					alignItems: "center",
					display: "flex",
					justifyContent: "center",
					minHeight: "100vh",
					padding: "2rem",
				}}
			>
				<SpaceBetween size="m" alignItems="center">
					<Spinner size="large" />
					<Box variant="h2" textAlign="center">
						Loading...
					</Box>
				</SpaceBetween>
			</div>
		);
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
						<SessionTimeoutModal
							visible={showTimeoutModal}
							onExtend={handleExtend}
							onLogout={handleLogout}
						/>
					</div>
				</NotificationContext.Provider>
			</UserContext.Provider>
		</SWRConfig>
	);
}

export default AdminLayout;
