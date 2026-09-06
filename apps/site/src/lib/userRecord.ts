/** Represents a UID of a user record, just an alias for string. */
export type Uid = string;

/** Represents score for a hacker applicant, just an alias for number */
export type Score = number;

// Note: role labels should match `user_record.Role` in the API

/** The possible roles of general participants. */
export enum ParticipantRole {
	Applicant = "Applicant",
	Hacker = "Hacker",
	ZotHacks_Hacker = "zothacks_hacker",
	Mentor = "Mentor",
	Volunteer = "Volunteer",
	Sponsor = "Sponsor",
	Judge = "Judge",
	WorkshopLead = "Workshop Lead",
}

/** The possible roles of admin users (organizers). */
export enum AdminRole {
	Organizer = "Organizer",
	Reviewer = "Reviewer", // leaving this role in for now, but might be removed down the line
	HackerReviewer = "Hacker Reviewer",
	MentorReviewer = "Mentor Reviewer",
	VolunteerReviewer = "Volunteer Reviewer",
	Lead = "Lead", // Applications/Mentors/Volunteer Committee Leads
	CheckInLead = "Check-in Lead",
	Director = "Director",
}

/** All of the different possible user roles. */
export type Role = ParticipantRole | AdminRole;

/** The decision for an applicant. */
export enum Decision {
	Accepted = "ACCEPTED",
	Rejected = "REJECTED",
	Waitlisted = "WAITLISTED",
	Voided = "VOIDED",
}

/** The possible statuses for an applicant without a released decision. */
export enum ReviewStatus {
	Pending = "PENDING_REVIEW",
	Reviewed = "REVIEWED",
}

/** The possible status after an applicant has been accepted. */
export enum PostAcceptedStatus {
	Accepted = "ACCEPTED",
	Signed = "WAIVER_SIGNED",
	Confirmed = "CONFIRMED",
	Attending = "ATTENDING",
	Queued = "QUEUED",
	Voided = "VOIDED",
}

/** All of the different possible status values. */
export const Status = { ...ReviewStatus, ...Decision, ...PostAcceptedStatus };
export type Status =
	| ReviewStatus
	| Decision.Rejected
	| Decision.Waitlisted
	| PostAcceptedStatus;

export const ReviewDecision = { ...Decision };
