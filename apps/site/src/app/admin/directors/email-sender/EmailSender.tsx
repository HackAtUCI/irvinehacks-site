"use client";

import { useRouter } from "next/navigation";

import { useContext } from "react";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";

import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";
import ApplyReminder from "./components/ApplyReminder";
import ReleaseNonHackerDecisions from "./components/ReleaseDecisions";
import ReleaseHackerDecisions from "./components/ReleaseHackerDecisions";

function EmailSender() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	return (
		<SpaceBetween size="l">
			<Header>Email Sender</Header>
			<ReleaseNonHackerDecisions />
			<ReleaseHackerDecisions />
			<ApplyReminder />
		</SpaceBetween>
	);
}

export default EmailSender;
