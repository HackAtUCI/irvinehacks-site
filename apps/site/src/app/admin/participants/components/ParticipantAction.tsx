import Button from "@cloudscape-design/components/button";

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
	initiateConfirm: (participant: Participant) => void;
}

function ParticipantAction({
	participant,
	initiateCheckIn,
	initiateConfirm,
}: ParticipantActionProps) {
	const isWaiverSigned = participant.status === Status.Signed;
	const isAccepted = participant.status === Status.Accepted;
	const judgeSponsorParticipant = isJudgeSponsorParticipant(participant.roles);
	const hackerMentorVolunteer = isHackerMentorVolunteer(participant.roles);
	const workshopLead = isWorkshopLead(participant.roles);

	const checkinButton = (
		<Button
			variant="inline-link"
			ariaLabel={`Check in ${participant._id}`}
			onClick={() => initiateCheckIn(participant)}
			disabled={isAccepted}
		>
			Check In
		</Button>
	);

	const confirmButton = (
		<Button
			variant="inline-link"
			ariaLabel={`Confirm attendance for ${participant._id}`}
			onClick={() => initiateConfirm(participant)}
		>
			Confirm
		</Button>
	);

	if (judgeSponsorParticipant) {
		const content = "Must sign waiver first.";
		if (participant.status === ReviewStatus.Reviewed) {
			return (
				<ParticipantActionPopover content={content}>
					{confirmButton}
				</ParticipantActionPopover>
			);
		} else if (participant.status === Status.Signed) {
			return confirmButton;
		}
		return checkinButton;
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
		const content = "Must sign waiver first.";
		if (participant.status === ReviewStatus.Reviewed) {
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
