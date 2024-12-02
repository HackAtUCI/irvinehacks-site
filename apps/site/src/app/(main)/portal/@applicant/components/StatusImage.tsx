import React from "react";
import Image from "next/image";
import Checkmark from "@/assets/icons/checkmark.svg";
import Xmark from "@/assets/icons/xmark.svg";
import PendingDots from "@/assets/icons/pending-dots.svg";

export interface StatusImageProps {
	statusIcon: "Accepted" | "Rejected" | "Pending";
	finished?: boolean;
}

const statusIcons = {
	"Accepted": { src: Checkmark, alt: "Confirmed checkmark" },
	"Rejected": { src: Xmark, alt: "Rejected X mark" },
	"Pending": { src: PendingDots, alt: "Pending dots" },
};

export const StatusImage: React.FC<StatusImageProps> = ({ statusIcon, finished }) => {
	const { src, alt } = statusIcons[statusIcon];

	return (
		<Image
			src={src}
			alt={alt}
			height={52}
			width={52}
			className={`mx-0 sm:mx-5 md:mx-16 p-4 sm:p-3 md:p-0 ${
				statusIcon === "Pending" && finished ? "invert" : ""
			}`}
		/>
	);
};
