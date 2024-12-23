// TODO: refactor roles to enum somewhere else
const MANAGER_ROLES = ["Director", "Reviewer", "Check-in Lead"];
const NONHACKER_ROLES = [
	"Judge",
	"Sponsor",
	"Mentor",
	"Volunteer",
	"Workshop Lead",
];

export function isApplicationManager(roles: ReadonlyArray<string>) {
	return roles.some((role) => MANAGER_ROLES.includes(role));
}

// Conceptually, an admin is just a Hack organizer
export function hasAdminRole(role: ReadonlyArray<string>) {
	return role.includes("Organizer");
}

export function isCheckinLead(roles: ReadonlyArray<string>) {
	return roles.includes("Director") || roles.includes("Check-in Lead");
}

export function isReviewer(roles: ReadonlyArray<string>) {
	return roles.includes("Reviewer");
}

// refactor: this function should be placed elsewhere later
export function isNonHacker(roles: ReadonlyArray<string>) {
	return roles.some((role) => NONHACKER_ROLES.includes(role));
}
