const ADMIN_ROLES = ["director", "reviewer", "checkin_lead"];
const ORGANIZER_ROLES = ["organizer", "volunteer"];

export function isApplicationManager(role: string | null) {
	return role !== null && ADMIN_ROLES.includes(role);
}

export function isAdminRole(role: string | null) {
	return (
		role !== null &&
		(ADMIN_ROLES.includes(role) || ORGANIZER_ROLES.includes(role))
	);
}
