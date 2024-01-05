import { usePathname } from "next/navigation";

import BreadcrumbGroup, {
	BreadcrumbGroupProps,
} from "@cloudscape-design/components/breadcrumb-group";

import { BASE_PATH, useFollowWithNextLink } from "./common";

interface PathTitles {
	[key: string]: string;
}

const pathTitles: PathTitles = {
	applicants: "Applicants",
};

const DEFAULT_ITEMS = [{ text: "HackUCI 2023", href: BASE_PATH }];

function Breadcrumbs() {
	const pathname = usePathname();
	const followWithNextLink = useFollowWithNextLink();

	const breadcrumbItems = getBreadcrumbItems(pathname);

	return (
		<BreadcrumbGroup
			items={breadcrumbItems}
			ariaLabel="Breadcrumbs"
			onFollow={followWithNextLink}
		/>
	);
}

function getBreadcrumbItems(pathname: string): BreadcrumbGroupProps.Item[] {
	const items = [...DEFAULT_ITEMS];

	if (pathname !== BASE_PATH) {
		pathname
			.slice("/admin/".length)
			.split("/")
			.reduce((partial, path) => {
				partial += path;
				items.push({
					text: pathTitles[path] || path,
					href: partial,
				});
				return partial;
			}, "/admin/");
	}

	return items;
}

export default Breadcrumbs;
