import { useRouter } from "next/navigation";

import { LinkProps } from "@cloudscape-design/components/link";

export const BASE_PATH = "/admin/dashboard";

type BaseNavigationDetail = LinkProps.FollowDetail;
type FollowEvent = CustomEvent<BaseNavigationDetail>;

export function useFollowWithNextLink(): (event: FollowEvent) => void {
	const router = useRouter();

	const followWithNextLink = (event: FollowEvent) => {
		if (!event.detail.external && event.detail.href) {
			event.preventDefault();
			router.push(event.detail.href);
		}
	};

	return followWithNextLink;
}
