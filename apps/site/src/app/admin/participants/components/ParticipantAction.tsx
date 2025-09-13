import { useContext } from "react";

import Button from "@cloudscape-design/components/button";

import { isCheckInLead } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";
import { Participant } from "@/lib/admin/useParticipants";
import { ParticipantRole, ReviewStatus, Status } from "@/lib/userRecord";

import ParticipantActionPopover from "./ParticipantActionPopover";

const JUDGE_SPONSOR_ROLES = [ParticipantRole.Judge, ParticipantRole.Sponsor];
const HACKER_MENTOR_VOLUNTEER_ROLES = [
	ParticipantRole.Hacker,
	ParticipantRole.Mentor,
	ParticipantRole.Volunteer,
];

export function isJudgeSponsorParticipant(
	roles: ReadonlyArray<ParticipantRole>,
) {
	return roles.some((role) => JUDGE_SPONSOR_ROLES.includes(role));
}

function isWorkshopLead(roles: ReadonlyArray<ParticipantRole>) {
	return roles.includes(ParticipantRole.WorkshopLead);
}

function isHackerMentorVolunteer(roles: ReadonlyArray<ParticipantRole>) {
	return roles.some((role) => HACKER_MENTOR_VOLUNTEER_ROLES.includes(role));
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
	const isWaiverSigned = participant.status === Status.Signed;
	const isAccepted = participant.status === Status.Accepted;
	const judgeSponsorParticipant = isJudgeSponsorParticipant(participant.roles);
	const hackerMentorVolunteer = isHackerMentorVolunteer(participant.roles);
	const workshopLead = isWorkshopLead(participant.roles);

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

	if (judgeSponsorParticipant) {
		const content = !canPromote
			? "Only check-in leads can confirm judges and sponsors."
			: "Must sign waiver first.";
		if (!canPromote || participant.status === ReviewStatus.Reviewed) {
			return (
				<ParticipantActionPopover content={content}>
					{confirmButton}
				</ParticipantActionPopover>
			);
		} else if (participant.status === Status.Signed) {
			return confirmButton;
		}
		return checkinButton;
	} else if (participant.status === Status.Waitlisted) {
		if (!canPromote) {
			return (
				<ParticipantActionPopover content="Only check-in leads are allowed to promote walk-ins.">
					{promoteButton}
				</ParticipantActionPopover>
			);
		}
		return promoteButton;
	} else if (hackerMentorVolunteer && (isWaiverSigned || isAccepted)) {
		const content = isWaiverSigned
			? "Must confirm attendance in portal first"
			: "Must sign waiver and confirm attendance in portal";
		return (
			<ParticipantActionPopover content={content}>
				{checkinButton}
			</ParticipantActionPopover>
		);
	} else if (!hackerMentorVolunteer && workshopLead) {
		// participants that are just workshop leads
		const content = !canPromote
			? "Only check-in leads can confirm workshop leads without any other roles."
			: "Must sign waiver first.";
		if (!canPromote || participant.status === ReviewStatus.Reviewed) {
			return (
				<ParticipantActionPopover content={content}>
					{confirmButton}
				</ParticipantActionPopover>
			);
		} else if (participant.status === Status.Signed) {
			return confirmButton;
		}
		return checkinButton;
	}
	return checkinButton;
}

export default ParticipantAction;
