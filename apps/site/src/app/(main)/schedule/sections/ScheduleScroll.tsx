/* eslint-disable no-mixed-spaces-and-tabs */
"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";

import getTimeAndDates from "@/lib/utils/getTimeAndDates";

import styles from "./ScheduleScroll.module.scss";

export default function ScheduleScroll({
	weekdays,
	selectedEventDay,
	setSelectedEventDay,
}: {
	weekdays: Date[];
	selectedEventDay: Date | undefined;
	setSelectedEventDay: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) {
	const scheduleBarRef = useRef<HTMLDivElement>(null);
	const scheduleContainerRef = useRef<HTMLDivElement>(null);

	function scrollTo(newPos: number) {
		const fixedPos = [0.015, 0.25, 0.51];
		scheduleContainerRef.current?.scrollTo({
			left: scheduleBarRef.current
				? scheduleBarRef.current.getBoundingClientRect().width *
				  fixedPos[newPos]
				: 0,
			behavior: "smooth",
		});
	}

	useEffect(() => {
		const date = new Date(Date.now());
		const curDay = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
		);
		let ind = 0;
		for (let i = 0; i < weekdays.length; i++) {
			if (curDay && weekdays[i].getTime() === curDay.getTime()) ind = i;
		}
		if (ind > 0) {
			scrollTo(ind);
		}
	}, [weekdays]);

	return (
		<div className="w-full flex flex-col items-center select-none gap-20 max-md:gap-5">
			<div className="w-full flex gap-40 justify-center h-[100px] max-lg:gap-2">
				<div
					className={clsx(
						"h-full gap-20 font-display overflow-auto relative",
						styles.background,
						styles.hideScroll,
					)}
					ref={scheduleContainerRef}
				>
					<div
						className={clsx("top-0 h-full min-w-full w-fit flex gap-16 px-28")}
						ref={scheduleBarRef}
					>
						{weekdays.map((weekday, i) => {
							const weekdayStr = getTimeAndDates(weekday).day;

							return (
								<div
									className="cursor-pointer flex justify-center items-center"
									key={weekdayStr}
									onClick={() => {
										setSelectedEventDay(weekday);
										scrollTo(i);
									}}
								>
									<p
										className={`text-2xl flex justify-center items-center text-[var(--color-pink)] [text-shadow:0_0_16px_var(--color-pink)] ${
											weekday.getDate() === selectedEventDay?.getDate()
												? "uppercase"
												: "opacity-60"
										}`}
									>
										{weekdayStr}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
