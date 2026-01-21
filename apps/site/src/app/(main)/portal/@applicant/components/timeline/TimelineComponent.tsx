import React from "react";
import { StatusImage } from "./StatusImage";

interface TimelineComponentProps {
	text: string;
	finished: boolean;
	statusIcon: "Accepted" | "Rejected" | "Pending";
}

const colorStyles = {
	Accepted: "text-turquoise bg-black border-turquoise",
	Rejected: "text-pink bg-black border-pink",
	Pending: "text-yellow bg-black border-yellow",
};

export const TimelineComponent: React.FC<TimelineComponentProps> = ({
	text,
	finished,
	statusIcon,
}) => {
	const baseStyles =
		"flex items-center justify-start border-[3px] md:border-[5px] w-full max-w-[865px] min-h-[80px] md:min-h-[120px] backdrop-blur-[20px]";

	return (
		<div className="flex items-center gap-6 md:gap-10">
			<div className={`${baseStyles} ${colorStyles[statusIcon]}`}>
				<h2 className="text-xs sm:text-base md:text-4xl mx-4 sm:mx-8 md:mx-16 my-5 md:my-6">
					{text}
				</h2>
			</div>
			<StatusImage statusIcon={statusIcon} />
		</div>
	);
};
