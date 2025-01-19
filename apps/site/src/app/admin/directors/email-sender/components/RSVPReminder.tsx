import SendGroup from "./SendGroup";

function RSVPReminder() {
	return (
		<SendGroup
			description="Send out RSVP reminder emails to applicants who haven't RSVP'd yet"
			buttonText="Send out RSVP reminder emails"
			modalText="You are about to send RSVP reminder emails"
			route="/api/director/rsvp-reminder"
		/>
	);
}

export default RSVPReminder;
