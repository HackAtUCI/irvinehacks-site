/* eslint-disable no-mixed-spaces-and-tabs */
"use client";

import { useState } from "react";
import { forwardRef } from "react";

import getTimeAndDates from "@/lib/utils/getTimeAndDates";

import styles from "./EventPlaque.module.scss";

interface EventPlaqueProps {
	title: string;
	startTime: Date;
	endTime: Date;
	isHappening: boolean;
	onClick: (title: string) => void;
}

export default forwardRef(function EventPlaque(
	{ title, startTime, endTime, isHappening, onClick }: EventPlaqueProps,
	ref: React.LegacyRef<HTMLDivElement>,
) {
	const [hovered, setHovered] = useState(false);

	const start = getTimeAndDates(startTime);
	const end = getTimeAndDates(endTime);

	return (
		<div
			className="duration-500 relative min-w-[200px] h-fit cursor-pointer"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			ref={ref}
			onClick={() => onClick(title)}
		>
			<div
				className={
					isHappening
						? "duration-500 font-display p-5 w-full h-fit border-4 bg-blue-100 border-blue-900 text-blue-950 top-[-8px] left-[-8px]"
						: `duration-500 font-display p-5 w-full h-fit border-4 top-0 left-0 ${
								hovered
									? `bg-white border-black text-black top-[-5px] left-[-5px] ${styles.plaqueHover}`
									: "bg-black border-white"
						  }`
				}
			>
				<div
					className={
						isHappening
							? "text-2xl flex justify-between min-h-[50px] gap-5 items-center"
							: `text-2xl`
					}
				>
					<span>{title}</span>
				</div>
				<div className="text-lg">
					<div>
						{startTime.getTime() === endTime.getTime()
							? `${end.compositeTimeHourMinute} ${end.amPm}`
							: `${start.compositeTimeHourMinute} - ${end.compositeTimeHourMinute} ${end.amPm}`}
					</div>
				</div>
			</div>
			<div
				className={
					isHappening
						? "absolute w-full h-full top-[9px] left-[9px] z-[-1] duration-500 bg-blue-100"
						: `absolute w-full h-full top-0 left-0 z-[-1] duration-500 bg-white ${
								hovered && styles.decorHover
						  }`
				}
			/>
		</div>
	);
});
