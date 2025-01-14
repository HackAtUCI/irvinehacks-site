import SendGroup from "./SendGroup";

function ReleaseNonHackerDecisions() {
	return (
		<SendGroup
			description="Send out decision emails for mentors and volunteers"
			buttonText="Send NONHACKER Decision Emails"
			route="/api/admin/release"
		/>
	);
}

export default ReleaseNonHackerDecisions;
