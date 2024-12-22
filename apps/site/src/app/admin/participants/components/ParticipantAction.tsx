import { useContext } from "react";

import Button from "@cloudscape-design/components/button";

import { isCheckInLead } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";
import { Participant } from "@/lib/admin/useParticipants";
import { ParticipantRole, ReviewStatus, Status } from "@/lib/userRecord";

import ParticipantActionPopover from "./ParticipantActionPopover";

const NONHACKER_ROLES = [
	ParticipantRole.Judge,
	ParticipantRole.Sponsor,
	ParticipantRole.Mentor,
	ParticipantRole.Volunteer,
	ParticipantRole.WorkshopLead,
];

// TODO: reexamine attendance confirmation process
export function isNonHacker(roles: ReadonlyArray<ParticipantRole>) {
	return roles.some((role) => NONHACKER_ROLES.includes(role));
}

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
	const { roles } = useContext(UserContext);

	const canPromote = isCheckInLead(roles);
	const isWaiverSigned = participant.status === Status.signed;
	const isAccepted = participant.status === Status.accepted;
	const nonHacker = isNonHacker(participant.roles);

	const promoteButton = (
		<Button
			variant="inline-link"
			ariaLabel={`Promote ${participant._id} off waitlist`}
			onClick={() => initiatePromotion(participant)}
			disabled={!canPromote}
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
			disabled={!canPromote}
		>
			Confirm
		</Button>
	);

	if (nonHacker) {
		const content = !canPromote
			? "Only check-in leads can confirm non-hackers."
			: "Must sign waiver first.";
		if (!canPromote || participant.status === ReviewStatus.reviewed) {
			return (
				<ParticipantActionPopover content={content}>
					{confirmButton}
				</ParticipantActionPopover>
			);
		} else if (participant.status === Status.signed) {
			return confirmButton;
		}
		return checkinButton;
	} else if (participant.status === Status.waitlisted) {
		if (!canPromote) {
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
