"use client";

import { useRouter } from "next/navigation";

import { useContext } from "react";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";

import ApplyReminder from "./components/ApplyReminder";

import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";

function EmailSender() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	return (
		<SpaceBetween size="l">
			<Header>Email Sender</Header>
			<ApplyReminder />
		</SpaceBetween>
	);
}

export default EmailSender;
