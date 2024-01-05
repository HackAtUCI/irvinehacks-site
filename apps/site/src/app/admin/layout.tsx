"use client";

import { PropsWithChildren } from "react";

import UserContext from "@/lib/admin/UserContext";
import useUserIdentity from "@/lib/admin/useUserIdentity";

function Layout({ children }: PropsWithChildren) {
	const identity = useUserIdentity();

	if (!identity) {
		return "Loading...";
	}

	return (
		<UserContext.Provider value={identity}>{children}</UserContext.Provider>
	);
}

export default Layout;
