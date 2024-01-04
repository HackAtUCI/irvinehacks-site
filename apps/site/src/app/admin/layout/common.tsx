import Router from "next/router";

import { BreadcrumbGroupProps } from "@cloudscape-design/components/breadcrumb-group";
import { SideNavigationProps } from "@cloudscape-design/components/side-navigation";

export const BASE_PATH = "/admin/dashboard";

type FollowEvent = CustomEvent<
	| BreadcrumbGroupProps.ClickDetail<BreadcrumbGroupProps.Item>
	| SideNavigationProps.FollowDetail
>;

export const followWithNextLink = (event: FollowEvent) => {
	if (!event.detail.external) {
		event.preventDefault();
		Router.push(event.detail.href);
	}
};
