import { SpaceBetween } from "@cloudscape-design/components";
import SendGroup from "./SendGroup";

function Logistics() {
	return (
		<SpaceBetween size="m">
			{["hackers", "mentors", "volunteers", "waitlists"].map((type, key) => {
				return (
					<SendGroup
						key={key}
						description={`Send out logistics emails to ${type}`}
						buttonText="Send Logistics Emails"
						modalText={`You are about to send out logistics emails to ${type}!`}
						route={`/api/director/logistics/${type}`}
					/>
				);
			})}
		</SpaceBetween>
	);
}

export default Logistics;
