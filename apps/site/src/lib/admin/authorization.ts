const ADMIN_ROLES = ["director", "reviewer", "checkin_lead"];
const CHECKIN_ROLES = ["director", "checkin_lead"];
const ORGANIZER_ROLES = ["organizer"];
const NONHACKER_ROLES = [
	"judge",
	"sponsor",
	"mentor",
	"volunteer",
	"workshop_lead",
];

export function isApplicationManager(role: string | null) {
	return role !== null && ADMIN_ROLES.includes(role);
}

export function isAdminRole(role: string | null) {
	return (
		role !== null &&
		(ADMIN_ROLES.includes(role) || ORGANIZER_ROLES.includes(role))
	);
}

export function isCheckinLead(role: string | null) {
	return role !== null && CHECKIN_ROLES.includes(role);
}

export function isNonHacker(role: string | null) {
	return role !== null && NONHACKER_ROLES.includes(role);
}
