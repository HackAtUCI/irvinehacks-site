import { SpaceBetween } from "@cloudscape-design/components";
import SendGroup from "./SendGroup";

function selectedHackathon() {
	if (typeof document === "undefined") {
		return "irvinehacks";
	}
	return (
		document.cookie
			.split("; ")
			.find((cookie) => cookie.startsWith("hackathon="))
			?.split("=")[1] || "irvinehacks"
	);
}

function ReleaseNonHackerDecisions() {
	const showVolunteers = selectedHackathon() !== "zothacks";

	return (
		<SpaceBetween size="m">
			<SendGroup
				description="Send out decision emails for mentors"
				buttonText="Send MENTOR Decision Emails"
				modalText="You are about to send decision emails for mentors"
				route="/api/director/release/mentors"
			/>
			{showVolunteers && (
				<SendGroup
					description="Send out decision emails for volunteers"
					buttonText="Send VOLUNTEER Decision Emails"
					modalText="You are about to send decision emails for volunteers"
					route="/api/director/release/volunteers"
				/>
			)}
		</SpaceBetween>
	);
}

export default ReleaseNonHackerDecisions;
