import React from "react";
import Image from "next/image";
import PortalCheck from "@/assets/icons/portal-check.svg";
import PortalWarning from "@/assets/icons/portal-warning.png";
import PortalPending from "@/assets/icons/portal-pending.png";

export interface StatusImageProps {
	statusIcon: "Accepted" | "Rejected" | "Pending";
}

const statusIcons = {
	Accepted: {
		src: PortalCheck,
		alt: "Accepted icon",
	},
	Rejected: {
		src: PortalWarning,
		alt: "Rejected icon",
	},
	Pending: {
		src: PortalPending,
		alt: "Pending icon",
	},
};

export const StatusImage: React.FC<StatusImageProps> = ({ statusIcon }) => {
	const { src, alt } = statusIcons[statusIcon];

	return (
		<Image
			src={src}
			alt={alt}
			width={120}
			height={120}
			className="w-16 sm:w-24 md:w-[120px] flex-shrink-0"
		/>
	);
};
