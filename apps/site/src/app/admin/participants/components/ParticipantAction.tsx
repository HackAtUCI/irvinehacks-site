import Button from "@cloudscape-design/components/button";

import { Participant } from "@/lib/admin/useParticipants";

function ParticipantAction({ _id }: Participant) {
	// TODO: waitlist promotion
	return (
		<Button variant="inline-link" ariaLabel={`Check in ${_id}`}>
			Check In
		</Button>
	);
}

export default ParticipantAction;
