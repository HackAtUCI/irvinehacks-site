import SendGroup from "./SendGroup";

function ReleaseNonHackerDecisions() {
	return (
		<SendGroup
			description="Send out decision emails for mentors and volunteers"
			buttonText="Send MENTOR and VOLUNTEER Decision Emails"
			modalText="You are about to send decision emails for mentors and volunteers"
			route="/api/director/release/mentor-volunteer"
		/>
	);
}

export default ReleaseNonHackerDecisions;
