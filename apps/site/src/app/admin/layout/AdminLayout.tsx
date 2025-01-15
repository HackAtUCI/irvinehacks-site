"use client";

import { useRouter } from "next/navigation";

import { PropsWithChildren } from "react";

import AppLayout from "@cloudscape-design/components/app-layout";
import axios from "axios";
import { SWRConfig } from "swr";

import { hasAdminRole } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";
import useUserIdentity from "@/lib/utils/useUserIdentity";

import AdminSidebar from "./AdminSidebar";
import Breadcrumbs from "./Breadcrumbs";

function AdminLayout({ children }: PropsWithChildren) {
	const identity = useUserIdentity();
	const router = useRouter();

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
				<AppLayout
					content={children}
					navigation={<AdminSidebar />}
					breadcrumbs={<Breadcrumbs />}
				/>
			</UserContext.Provider>
		</SWRConfig>
	);
}

export default AdminLayout;
