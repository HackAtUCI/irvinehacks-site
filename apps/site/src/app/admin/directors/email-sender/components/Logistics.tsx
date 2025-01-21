import SendGroup from "./SendGroup";

function Logistics() {
	return (
		<SendGroup
			description={"Send out logistics emails"}
			buttonText="Send Logistics Emails"
			modalText={
				"You are about to send out logistics emails to hackers, mentors, and volunteers."
			}
			route="/api/director/logistics"
		/>
	);
}

export default Logistics;
