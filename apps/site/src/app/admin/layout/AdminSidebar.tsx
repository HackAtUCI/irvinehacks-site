import { useRouter } from "next/router";

import SideNavigation, {
	SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";

import { BASE_PATH, followWithNextLink } from "./common";

function AdminSidebar() {
	const router = useRouter();

	const navigationItems: SideNavigationProps.Item[] = [
		{ type: "link", text: "Applicants", href: "/admin/applicants" },
		{ type: "divider" },
		{ type: "link", text: "Back to main site", href: "/" },
	];

	return (
		<SideNavigation
			activeHref={router.pathname}
			header={{ href: BASE_PATH, text: "HackUCI 2023" }}
			onFollow={followWithNextLink}
			items={navigationItems}
		/>
	);
}

export default AdminSidebar;
