import SendGroup from "./SendGroup";

function ReleaseHackerDecisions() {
	return (
		<SendGroup
			description="Send out decision emails for hackers"
			buttonText="Send HACKER Decision Emails"
			route="/api/admin/release/hackers"
		/>
	);
}

export default ReleaseHackerDecisions;
