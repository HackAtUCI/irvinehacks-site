import SendGroup from "./SendGroup";

function ReleaseHackerDecisions() {
	return (
		<SendGroup
			description="Send out decision emails for hackers"
			buttonText="Send HACKER Decision Emails"
			modalText="You are about to send out decision emails for hackers"
			route="/api/director/release/hackers"
		/>
	);
}

export default ReleaseHackerDecisions;
