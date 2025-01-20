"use client";

import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import getTimeAndDates from "@/lib/utils/getTimeAndDates";

import { forwardRef } from "react";

import styles from "./EventPlaque.module.scss";

export default forwardRef(function EventPlaque(
	{
		title,
		startTime,
		endTime,
		onClick,
	}: {
		title: string;
		startTime: Date;
		endTime: Date;
		onClick: any;
	},
	ref: any,
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
				className={`duration-500 font-display p-5 w-full h-fit border-4 top-0 left-0 ${
					hovered
						? `bg-white border-black text-black top-[-5px] left-[-5px] ${styles.plaqueHover}`
						: "bg-black border-white"
				}`}
			>
				<div className="text-2xl">{title}</div>
				<div className="text-lg">
					<div>{`${start.compositeTimeHourMinute} - ${end.compositeTimeHourMinute} ${end.amPm}`}</div>
				</div>
			</div>
			<div
				className={`absolute w-full h-full top-0 left-0 z-[-1] duration-500 bg-white ${
					hovered ? styles.decorHover : ""
				}`}
			></div>
		</div>
	);
});
