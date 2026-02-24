"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import axios from "axios";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";
import useAvgScoreSetting from "@/lib/admin/useAvgScoreSetting";
import SendGroup from "./email-sender/components/SendGroup";

function Directors() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const { showWithOneReviewer, loading, mutate } = useAvgScoreSetting();

	const handleToggle = async () => {
		await axios.post("/api/director/avg-score-setting");
		mutate();
	};

	return (
		<SpaceBetween size="l">
			<p>Director page</p>
			<SpaceBetween size="s">
				<Box variant="h3">Avg Score Display Setting</Box>
				<Box>
					Show avg score with 1 reviewer:{" "}
					<strong>{showWithOneReviewer ? "ON" : "OFF"}</strong>
				</Box>
				<Button onClick={handleToggle} loading={loading}>
					{showWithOneReviewer ? "Disable" : "Enable"} for 1 reviewer
				</Button>
			</SpaceBetween>
			<SendGroup
				description="Waitlist all accepted hackers that failed to RSVP on time"
				buttonText="Update hacker statuses (Waitlist Transfer)"
				modalText="You are about to update all hacker statuses and this can't be reversed"
				route="/api/director/waitlist-transfer"
			/>
		</SpaceBetween>
	);
}

export default Directors;
