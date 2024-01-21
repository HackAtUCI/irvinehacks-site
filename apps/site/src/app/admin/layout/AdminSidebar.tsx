import { usePathname } from "next/navigation";

import { useContext } from "react";

import SideNavigation, {
	SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";

import { BASE_PATH, useFollowWithNextLink } from "./common";
import { isApplicationManager } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";

function AdminSidebar() {
	const pathname = usePathname();
	const followWithNextLink = useFollowWithNextLink();

	const { role } = useContext(UserContext);

	const navigationItems: SideNavigationProps.Item[] = [
		{ type: "link", text: "Participants", href: "/admin/participants" },
		{ type: "divider" },
		{ type: "link", text: "Back to main site", href: "/" },
	];

	if (isApplicationManager(role)) {
		navigationItems.unshift(
			{
				type: "link",
				text: "Applicants",
				href: "/admin/applicants",
			},
			{ type: "divider" },
		);
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
