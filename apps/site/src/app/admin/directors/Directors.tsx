"use client";

import { useRouter } from "next/navigation";

import { useContext } from "react";

import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";
import SendGroup from "./email-sender/components/SendGroup";

function Directors() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	return (
		<>
			<p>Director page</p>
			<SendGroup
				description="Update all applicant statuses to VOID or ATTENDING based on their current status."
				buttonText="Update applicant statuses (Confirm Attendance)"
				modalText="You are about to update all applicant statuses and this can't be reversed"
				route="/api/director/confirm-attendance"
			/>
		</>
	);
}

export default Directors;
