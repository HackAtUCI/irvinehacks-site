"use client";

import { useRouter } from "next/navigation";

import { useContext } from "react";

import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";

function Directors() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	return <p>Director page</p>;
}

export default Directors;
