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

function Logistics() {
	const types =
		selectedHackathon() === "zothacks"
			? ["hackers", "mentors", "waitlists"]
			: ["hackers", "mentors", "volunteers", "waitlists"];

	return (
		<SpaceBetween size="m">
			{types.map((type, key) => {
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
