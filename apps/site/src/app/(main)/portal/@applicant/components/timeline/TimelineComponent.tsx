import React from "react";

interface TimelineComponentProps {
	text: string;
	finished: boolean;
	statusIcon: "Accepted" | "Rejected" | "Pending";
}

export const TimelineComponent: React.FC<TimelineComponentProps> = ({
	text,
	finished,
}) => {
	const baseStyles =
		"flex items-center justify-start border-[3px] md:border-[5px] w-full max-w-[865px] min-h-[80px] md:min-h-[120px] rounded-xl backdrop-blur-[20px]";
	const colorStyles = finished
		? "text-[var(--color-turquoise)] bg-[var(--color-black)] border-[var(--color-turquoise)]"
		: "text-[var(--color-pink)] bg-[var(--color-black)] border-[var(--color-pink)]";

	return (
		<div className={`${baseStyles} ${colorStyles}`}>
			<h2 className="text-xs sm:text-base md:text-4xl mx-4 sm:mx-8 md:mx-16 my-5 md:my-6">
				{text}
			</h2>
		</div>
	);
};
