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
		alt: "Accepted",
		width: 178,
		height: 178,
		className: "w-16 h-16 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] flex-shrink-0",
	},
	Rejected: {
		src: PortalWarning,
		alt: "Rejected",
		width: 108,
		height: 94,
		className: "w-12 h-10 sm:w-16 sm:h-14 md:w-[108px] md:h-[94px] flex-shrink-0",
	},
	Pending: {
		src: PortalPending,
		alt: "Pending",
		width: 178,
		height: 178,
		className: "w-16 h-16 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] flex-shrink-0",
	},
};

export const StatusImage: React.FC<StatusImageProps> = ({ statusIcon }) => {
	const { src, alt, width, height, className } = statusIcons[statusIcon];

	return (
		<Image
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={className}
		/>
	);
};
