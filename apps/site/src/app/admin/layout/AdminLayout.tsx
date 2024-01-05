import { redirect } from "next/navigation";

import { PropsWithChildren, useContext, useEffect } from "react";

import AppLayout from "@cloudscape-design/components/app-layout";

import UserContext from "@/lib/admin/UserContext";

import AdminSidebar from "./AdminSidebar";
import Breadcrumbs from "./Breadcrumbs";

const ADMIN_ROLES = ["director", "reviewer"];

export function isAdminRole(role: string | null) {
	return role !== null && ADMIN_ROLES.includes(role);
}

function AdminLayout({ children }: PropsWithChildren) {
	const { uid, role } = useContext(UserContext);

	const loggedIn = uid !== null;
	const authorized = isAdminRole(role);

	useEffect(() => {
		if (!loggedIn) {
			redirect("/login")
		} else if (!authorized) {
			redirect("/unauthorized")
		}
	}, [loggedIn, authorized]);

	if (!loggedIn || !authorized) {
		return null;
	}

	return (
		<AppLayout
			content={children}
			navigation={<AdminSidebar />}
			breadcrumbs={<Breadcrumbs />}
		/>
	);
}

export default AdminLayout;
