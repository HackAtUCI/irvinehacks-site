import { useRouter } from "next/navigation";

import { BreadcrumbGroupProps } from "@cloudscape-design/components/breadcrumb-group";
import { SideNavigationProps } from "@cloudscape-design/components/side-navigation";

export const BASE_PATH = "/admin/dashboard";

type FollowEvent = CustomEvent<
	| BreadcrumbGroupProps.ClickDetail<BreadcrumbGroupProps.Item>
	| SideNavigationProps.FollowDetail
>;

export function useFollowWithNextLink(): (event: FollowEvent) => void {
	const router = useRouter();

	const followWithNextLink = (event: FollowEvent) => {
		if (!event.detail.external) {
			event.preventDefault();
			router.push(event.detail.href);
		}
	};

	return followWithNextLink;
}
