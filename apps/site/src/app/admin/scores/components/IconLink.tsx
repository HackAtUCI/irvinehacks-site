import { ReactElement } from "react";

const ACTIVE_COLOR = "#006ce0";
const DISABLED_COLOR = "#b4b4bb";

interface IconLinkProps {
	url: string | null;
	label: string;
	icon: ReactElement;
}

function IconLink({ url, label, icon }: IconLinkProps) {
	if (!url) {
		const missingLabel = `${label} not provided`;
		return (
			<span
				role="img"
				aria-label={missingLabel}
				title={missingLabel}
				style={{ display: "inline-flex", color: DISABLED_COLOR }}
			>
				{icon}
			</span>
		);
	}

	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`Open ${label} in a new tab`}
			title={`Open ${label}`}
			style={{ display: "inline-flex", color: ACTIVE_COLOR }}
		>
			{icon}
		</a>
	);
}

export default IconLink;
