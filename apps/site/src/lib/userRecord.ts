/** Represents a UID of a user record, just an alias for string. */
export type Uid = string;

// Note: role labels should match `user_record.Role` in the API

/** The possible roles of general participants. */
export enum ParticipantRole {
	Applicant = "Applicant",
	Mentor = "Mentor",
	Volunteer = "Volunteer",
	Sponsor = "Sponsor",
	Judge = "Judge",
	WorkshopLead = "Workshop Lead",
}

/** The possible roles of admin users (organizers). */
export enum AdminRole {
	Organizer = "Organizer",
	Reviewer = "Reviewer",
	CheckInLead = "Check-in Lead",
	Director = "Director",
}

/** All of the different possible user roles. */
export type Role = ParticipantRole | AdminRole;

/**
 * The decision for an applicant.
 * An applicant's decision becomes their status when released.
 */
export enum Decision {
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
}

/** The possible statuses for an applicant without a released decision. */
export enum ReviewStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	released = "RELEASED",
}

/** The possible status after an applicant has been accepted. */
export enum PostAcceptedStatus {
	signed = "WAIVER_SIGNED",
	confirmed = "CONFIRMED",
	attending = "ATTENDING",
	void = "VOID",
}

/** All of the different possible status values. */
export const Status = { ...ReviewStatus, ...Decision, ...PostAcceptedStatus };
export type Status = ReviewStatus | Decision | PostAcceptedStatus;
