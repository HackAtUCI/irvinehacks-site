import Box from "@cloudscape-design/components/box";

import useEmailSenders from "@/lib/admin/useEmailSenders";
import Senders from "./Senders";
import SendGroup from "./SendGroup";

function Logistics() {
	const { senders, mutate } = useEmailSenders();

	const roles = ["Hacker", "Mentor", "Volunteer"];

	return (
		<>
			{roles.map((role, key) => {
				const body = {
                    role
                }
                
                return (
					<div key={key}>
						<SendGroup
							description={`Send out logistics emails to role: ${role}`}
							buttonText="Send Logistics Emails"
							modalText={`You are about to send out reminder emails to role: ${role}.`}
							route="/api/director/logistics"
							body={body}
							mutate={mutate}
						/>

						<Box variant="awsui-key-label">Emails Sent</Box>
						<Senders senders={senders} />
					</div>
				);
			})}
		</>
	);
}

export default Logistics;
