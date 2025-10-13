import { AdminRole, Role } from "@/lib/userRecord";

// TODO: reexamine waitlist release procedure: do check-in leads really need to be managers?
const MANAGER_ROLES = [
	AdminRole.Director,
	AdminRole.HackerReviewer,
	AdminRole.MentorReviewer,
	AdminRole.VolunteerReviewer,
	AdminRole.CheckInLead,
];

const REVIEWER_ROLES = [
	AdminRole.HackerReviewer,
	AdminRole.MentorReviewer,
	AdminRole.VolunteerReviewer,
];

export function isApplicationManager(roles: ReadonlyArray<Role>): boolean {
	return MANAGER_ROLES.some((managerRole) => roles.includes(managerRole));
}

// Conceptually, an admin is just a Hack organizer
export function hasAdminRole(role: ReadonlyArray<Role>): boolean {
	return role.includes(AdminRole.Organizer);
}

export function isDirector(roles: ReadonlyArray<Role>): boolean {
	return roles.includes(AdminRole.Director);
}

export function isCheckInLead(roles: ReadonlyArray<Role>): boolean {
	return (
		roles.includes(AdminRole.Director) || roles.includes(AdminRole.CheckInLead)
	);
}

export function isReviewer(roles: ReadonlyArray<Role>): boolean {
	return REVIEWER_ROLES.some((reviewerRole) => roles.includes(reviewerRole));
}

export function isLead(roles: ReadonlyArray<Role>): boolean {
	return roles.includes(AdminRole.Lead);
}

export function isHackerReviewer(roles: ReadonlyArray<Role>): boolean {
	return (
		roles.includes(AdminRole.Director) ||
		roles.includes(AdminRole.HackerReviewer)
	);
}

export function isMentorReviewer(roles: ReadonlyArray<Role>): boolean {
	return (
		roles.includes(AdminRole.Director) ||
		roles.includes(AdminRole.MentorReviewer)
	);
}

export function isVolunteerReviewer(roles: ReadonlyArray<Role>): boolean {
	return (
		roles.includes(AdminRole.Director) ||
		roles.includes(AdminRole.VolunteerReviewer)
	);
}
