import { useRouter } from "next/navigation";

import { LinkProps } from "@cloudscape-design/components/link";

export const BASE_PATH = "/admin/dashboard";
export const ACTIVE_ADMIN_HACKATHON =
	process.env.NEXT_PUBLIC_ACTIVE_HACKATHON === "irvinehacks"
		? "irvinehacks"
		: "zothacks";
export const HACKATHON_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

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
