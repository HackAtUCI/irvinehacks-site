import { usePathname } from "next/navigation";

import { useContext } from "react";

import SideNavigation, {
	SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";

import { isApplicationManager } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";

import { BASE_PATH, useFollowWithNextLink } from "./common";

function AdminSidebar() {
	const pathname = usePathname();
	const followWithNextLink = useFollowWithNextLink();

	const { role } = useContext(UserContext);

	const navigationItems: SideNavigationProps.Item[] = [
		{ type: "link", text: "Dashboard", href: "/admin/dashboard" },
		{ type: "link", text: "Participants", href: "/admin/participants" },
		{ type: "divider" },
		{ type: "link", text: "Back to main site", href: "/" },
	];

	if (isApplicationManager(role)) {
		navigationItems.splice(1, 0, {
			type: "link",
			text: "Applicants",
			href: "/admin/applicants",
		});
	}

	return (
		<SideNavigation
			activeHref={pathname}
			header={{ href: BASE_PATH, text: "IrvineHacks 2024" }}
			onFollow={followWithNextLink}
			items={navigationItems}
		/>
	);
}

export default AdminSidebar;
