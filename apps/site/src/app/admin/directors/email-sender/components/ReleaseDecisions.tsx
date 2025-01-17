import SendGroup from "./SendGroup";

function ReleaseNonHackerDecisions() {
	return (
		<SendGroup
			description="Send out decision emails for mentors and volunteers"
			buttonText="Send MENTOR and VOLUNTEER Decision Emails"
			route="/api/director/release/mentor-volunteer"
		/>
	);
}

export default ReleaseNonHackerDecisions;
