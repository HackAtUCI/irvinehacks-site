"use client";

import { redirect } from "next/navigation";

import { PropsWithChildren } from "react";

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

	if (!identity) {
		return "Loading...";
	}

	const { uid, role } = identity;
	const loggedIn = uid !== null;
	const authorized = isAdminRole(role);

	if (!loggedIn) {
		redirect("/login");
	} else if (!authorized) {
		redirect("/unauthorized");
	}

	return (
		<UserContext.Provider value={identity}>
			<AppLayout
				content={children}
				navigation={<AdminSidebar />}
				breadcrumbs={<Breadcrumbs />}
			/>
		</UserContext.Provider>
	);
}

export default AdminLayout;
