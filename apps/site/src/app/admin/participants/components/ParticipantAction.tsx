import { useContext } from "react";

import Button from "@cloudscape-design/components/button";
import Popover from "@cloudscape-design/components/popover";

import { Decision, PostAcceptedStatus } from "@/lib/admin/useApplicant";
import { Participant, Role } from "@/lib/admin/useParticipants";
import UserContext from "@/lib/admin/UserContext";

interface ParticipantActionProps {
	participant: Participant;
	initiateCheckIn: (participant: Participant) => void;
	initiatePromotion: (participant: Participant) => void;
}
function ParticipantAction({
	participant,
	initiateCheckIn,
	initiatePromotion,
}: ParticipantActionProps) {
	const { role } = useContext(UserContext);

	const isNotCheckinLead = role !== Role.CheckInLead;
	const isWaiverSigned = participant.status === PostAcceptedStatus.signed;

	const promoteButton = (
		<Button
			variant="inline-link"
			ariaLabel={`Promote ${participant._id} off waitlist`}
			onClick={() => initiatePromotion(participant)}
			disabled={isNotCheckinLead}
		>
			Promote
		</Button>
	);

	const checkinButton = (
		<Button
			variant="inline-link"
			ariaLabel={`Check in ${participant._id}`}
			onClick={() => initiateCheckIn(participant)}
			disabled={isWaiverSigned}
		>
			Check In
		</Button>
	);

	if (participant.status === Decision.waitlisted) {
		if (isNotCheckinLead) {
			return (
				<Popover
					dismissButton={false}
					position="top"
					size="medium"
					triggerType="custom"
					content="Only check-in leads are allowed to promote walk-ins."
				>
					{promoteButton}
				</Popover>
			);
		}
		return promoteButton;
	} else if (isWaiverSigned) {
		return (
			<Popover
				dismissButton={false}
				position="top"
				size="medium"
				triggerType="custom"
				content="Must confirm attendance in portal first"
			>
				{checkinButton}
			</Popover>
		);
	}
	return checkinButton;
}

export default ParticipantAction;
