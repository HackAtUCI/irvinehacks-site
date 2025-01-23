import Box from "@cloudscape-design/components/box";

import useEmailSenders from "@/lib/admin/useEmailSenders";
import Senders from "./Senders";
import SendGroup from "./SendGroup";

function ApplyReminder() {
	const { senders, mutate } = useEmailSenders();

	return (
		<>
			<SendGroup
				description="Send out email reminders to users who haven't submitted an app"
				buttonText="Send Reminder Emails"
				modalText="You are about to send out reminder emails."
				route="/api/director/apply-reminder"
				mutate={mutate}
			/>

			<Box variant="awsui-key-label">Emails Sent</Box>
			<Senders senders={senders} />
		</>
	);
}

export default ApplyReminder;
