"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

import { PropsWithChildren } from "react";
import { SWRConfig } from "swr";

import AppLayout from "@cloudscape-design/components/app-layout";

import UserContext from "@/lib/admin/UserContext";
import useUserIdentity from "@/lib/admin/useUserIdentity";

import AdminSidebar from "./AdminSidebar";
import Breadcrumbs from "./Breadcrumbs";

const ADMIN_ROLES = ["director", "reviewer"];

export function isAdminRole(role: string | null) {
	return role !== null && ADMIN_ROLES.includes(role);
}

function AdminLayout({ children }: PropsWithChildren) {
	const identity = useUserIdentity();
	const router = useRouter();

	if (!identity) {
		return "Loading...";
	}

	const { uid, role } = identity;
	const loggedIn = uid !== null;
	const authorized = isAdminRole(role);

	if (!loggedIn) {
		router.push("/login");
	} else if (!authorized) {
		router.push("/unauthorized");
	}

	return (
		<SWRConfig
			value={{
				onError: (err, _) => {
					if (axios.isAxiosError(err)) {
						router.push("/login");
					}
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
