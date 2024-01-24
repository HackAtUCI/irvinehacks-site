import Button from "@cloudscape-design/components/button";

import { Participant } from "@/lib/admin/useParticipants";

interface ParticipantActionProps {
	participant: Participant;
	initiateCheckIn: (participant: Participant) => void;
}
function ParticipantAction({
	participant,
	initiateCheckIn,
}: ParticipantActionProps) {
	// TODO: waitlist promotion

	return (
		<Button
			variant="inline-link"
			ariaLabel={`Check in ${participant._id}`}
			onClick={() => initiateCheckIn(participant)}
		>
			Check In
		</Button>
	);
}

export default ParticipantAction;
