import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import BreadcrumbGroup, {
	BreadcrumbGroupProps,
} from "@cloudscape-design/components/breadcrumb-group";

import { BASE_PATH, followWithNextLink } from "./common";

interface PathTitles {
	[key: string]: string;
}

const pathTitles: PathTitles = {
	applicants: "Applicants",
};

const DEFAULT_ITEMS = [{ text: "HackUCI 2023", href: BASE_PATH }];

function Breadcrumbs() {
	const router = useRouter();
	const { asPath, isReady } = router;

	const [breadcrumbItems, setBreadcrumbItems] =
		useState<BreadcrumbGroupProps.Item[]>(DEFAULT_ITEMS);

	useEffect(() => {
		if (!isReady) {
			return;
		}

		const items = [...DEFAULT_ITEMS];

		if (asPath !== BASE_PATH) {
			asPath
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

		setBreadcrumbItems(items);
	}, [asPath, isReady]);

	return (
		<BreadcrumbGroup
			items={breadcrumbItems}
			ariaLabel="Breadcrumbs"
			onFollow={followWithNextLink}
		/>
	);
}

export default Breadcrumbs;
