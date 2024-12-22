import { AdminRole, Role } from "@/lib/userRecord";

// TODO: reexamine waitlist release procedure: do check-in leads really need to be managers?
const MANAGER_ROLES = [
	AdminRole.Director,
	AdminRole.Reviewer,
	AdminRole.CheckInLead,
];

export function isApplicationManager(roles: ReadonlyArray<Role>): boolean {
	return MANAGER_ROLES.some((managerRole) => roles.includes(managerRole));
}

// Conceptually, an admin is just a Hack organizer
export function hasAdminRole(role: ReadonlyArray<Role>): boolean {
	return role.includes(AdminRole.Organizer);
}

export function isCheckInLead(roles: ReadonlyArray<Role>): boolean {
	return (
		roles.includes(AdminRole.Director) || roles.includes(AdminRole.CheckInLead)
	);
}

export function isReviewer(roles: ReadonlyArray<Role>): boolean {
	return roles.includes(AdminRole.Reviewer);
}
