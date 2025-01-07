import { usePathname } from "next/navigation";

import { useContext } from "react";

import SideNavigation, {
	SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";

import { isApplicationManager, isDirector } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";

import { BASE_PATH, useFollowWithNextLink } from "./common";

function AdminSidebar() {
	const pathname = usePathname();
	const followWithNextLink = useFollowWithNextLink();

	const { roles } = useContext(UserContext);

	const navigationItems: SideNavigationProps.Item[] = [
		{ type: "link", text: "Dashboard", href: "/admin/dashboard" },
		{ type: "link", text: "Participants", href: "/admin/participants" },
		{ type: "link", text: "Events", href: "/admin/events" },
		{ type: "divider" },
		{ type: "link", text: "Back to main site", href: "/" },
	];

	const applicationLinks: SideNavigationProps.Link[] = [];

	// TODO: change access to role "Hacker Reviewer"
	if (isApplicationManager(roles)) {
		applicationLinks.push({
			type: "link",
			text: "Hacker Applications",
			href: "/admin/applicants/hackers",
		});
	}

	// TODO: change access to role "Mentor Reviewer"
	if (isApplicationManager(roles)) {
		applicationLinks.push({
			type: "link",
			text: "Mentor Applications",
			href: "/admin/applicants/mentors",
		});
	}

	// TODO: change access to role "Volunteer Reviewer"
	if (isApplicationManager(roles)) {
		applicationLinks.push({
			type: "link",
			text: "Volunteer Applications",
			href: "/admin/applicants/volunteers",
		});
	}

	if (isApplicationManager(roles)) {
		navigationItems.splice(1, 0, {
			type: "link-group",
			text: "Applicants",
			href: "/admin/applicants",
			items: applicationLinks,
		});
	}

	if (isDirector(roles)) {
		navigationItems.splice(4, 0, {
			type: "link",
			text: "Directors",
			href: "/admin/directors",
		});
	}

	return (
		<SideNavigation
			activeHref={pathname}
			header={{ href: BASE_PATH, text: "IrvineHacks 2025" }}
			onFollow={followWithNextLink}
			items={navigationItems}
		/>
	);
}

export default AdminSidebar;
