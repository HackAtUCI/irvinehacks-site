import { useContext } from "react";

import Button from "@cloudscape-design/components/button";

import UserContext from "@/lib/admin/UserContext";
import { isCheckinLead, isNonHacker } from "@/lib/admin/authorization";
import { Status } from "@/lib/admin/useApplicant";
import { Participant } from "@/lib/admin/useParticipants";
import ParticipantActionPopover from "./ParticipantActionPopover";

interface ParticipantActionProps {
	participant: Participant;
	initiateCheckIn: (participant: Participant) => void;
	initiatePromotion: (participant: Participant) => void;
	initiateConfirm: (participant: Participant) => void;
}

function ParticipantAction({
	participant,
	initiateCheckIn,
	initiatePromotion,
	initiateConfirm,
}: ParticipantActionProps) {
	const { role } = useContext(UserContext);

	const isCheckin = isCheckinLead(role);
	const isWaiverSigned = participant.status === Status.signed;
	const isAccepted = participant.status === Status.accepted;
	const nonHacker = isNonHacker(participant.role);

	const promoteButton = (
		<Button
			variant="inline-link"
			ariaLabel={`Promote ${participant._id} off waitlist`}
			onClick={() => initiatePromotion(participant)}
			disabled={!isCheckin}
		>
			Promote
		</Button>
	);

	const checkinButton = (
		<Button
			variant="inline-link"
			ariaLabel={`Check in ${participant._id}`}
			onClick={() => initiateCheckIn(participant)}
			disabled={isWaiverSigned || isAccepted}
		>
			Check In
		</Button>
	);

	const confirmButton = (
		<Button
			variant="inline-link"
			ariaLabel={`Confirm attendance for ${participant._id}`}
			onClick={() => initiateConfirm(participant)}
			disabled={!isCheckin}
		>
			Confirm
		</Button>
	);

	if (nonHacker && isWaiverSigned) {
		if (role !== "director") {
			return (
				<ParticipantActionPopover content="Only directors are allowed to confirm non-hackers.">
					{confirmButton}
				</ParticipantActionPopover>
			);
		}
		return confirmButton;
	} else if (participant.status === Status.waitlisted) {
		if (!isCheckin) {
			return (
				<ParticipantActionPopover content="Only check-in leads are allowed to promote walk-ins.">
					{promoteButton}
				</ParticipantActionPopover>
			);
		}
		return promoteButton;
	} else if (isWaiverSigned || isAccepted) {
		const content = isWaiverSigned
			? "Must confirm attendance in portal first"
			: "Must sign waiver and confirm attendance in portal";
		return (
			<ParticipantActionPopover content={content}>
				{checkinButton}
			</ParticipantActionPopover>
		);
	}
	return checkinButton;
}

export default ParticipantAction;
