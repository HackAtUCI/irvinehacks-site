const ADMIN_ROLES = ["director", "reviewer"];

export function isAdminRole(role: string | null) {
	return role !== null && ADMIN_ROLES.includes(role);
}
