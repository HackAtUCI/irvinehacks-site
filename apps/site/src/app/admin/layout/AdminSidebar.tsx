import { usePathname } from "next/navigation";

import SideNavigation, {
	SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";

import { BASE_PATH, useFollowWithNextLink } from "./common";

function AdminSidebar() {
	const pathname = usePathname();
	const followWithNextLink = useFollowWithNextLink();

	const navigationItems: SideNavigationProps.Item[] = [
		{ type: "link", text: "Applicants", href: "/admin/applicants" },
		{ type: "divider" },
		{ type: "link", text: "Back to main site", href: "/" },
	];

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
