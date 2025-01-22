"use client";

import clsx from "clsx";
import styles from "./ScheduleScroll.module.scss";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import getTimeAndDates from "@/lib/utils/getTimeAndDates";

export default function ScheduleScroll({
	weekdays,
	selectedEventDay,
	setSelectedEventDay,
}: {
	weekdays: Date[];
	selectedEventDay: Date | undefined;
	setSelectedEventDay: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) {
	const sheduleBarRef = useRef<HTMLDivElement>(null);
	const scheduleContainerRef = useRef<HTMLDivElement>(null);

	function scrollTo(newPos: number) {
		const fixedPos = [0, 0.25, 0.5];
		scheduleContainerRef.current?.scrollTo({
			left: sheduleBarRef.current
				? sheduleBarRef.current.getBoundingClientRect().width * fixedPos[newPos]
				: 0,
			behavior: "smooth",
		});
	}

	function getCurrentDateIndex() {
		let ind = 0;
		for (let i = 0; i < weekdays.length; i++) {
			if (
				selectedEventDay &&
				weekdays[i].getTime() === selectedEventDay.getTime()
			)
				ind = i;
		}

		return ind;
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

	function scrollDir(action: string) {
		const ind = getCurrentDateIndex();

		if (action === "left") {
			const nextIndex = (ind + (weekdays.length - 1)) % weekdays.length;
			scrollTo(nextIndex);
			setSelectedEventDay(weekdays[nextIndex]);
		} else {
			const nextIndex = (ind + 1) % weekdays.length;
			scrollTo(nextIndex);
			setSelectedEventDay(weekdays[nextIndex]);
		}
	}

	return (
		<div className="w-full flex flex-col items-center select-none gap-20">
			<h1 className="text-5xl font-display">Schedule</h1>
			<div className="flex gap-10 sm:hidden">
				<div className="h-full flex items-center">
					<ChevronLeft
						height={40}
						width={40}
						onClick={() => scrollDir("left")}
						className="cursor-pointer"
					/>
				</div>
				<div className="h-full flex items-center">
					<ChevronRight
						height={40}
						width={40}
						onClick={() => scrollDir("right")}
						className="cursor-pointer"
					/>
				</div>
			</div>
			<div className="w-full flex gap-40 justify-center h-[100px] max-lg:gap-2">
				<div className="h-full flex items-center max-sm:hidden">
					<ChevronLeft
						height={40}
						width={40}
						onClick={() => scrollDir("left")}
						className="cursor-pointer"
					/>
				</div>
				<div
					className={clsx(
						"w-[600px] h-full gap-20 font-display text-6xl overflow-auto relative max-lg:min-w-[400px] max-lg:w-[400px]",
						styles.background,
						styles.hideScroll,
					)}
					ref={scheduleContainerRef}
				>
					<div
						className={clsx(
							"top-0 absolute h-full min-w-full w-fit flex gap-20",
						)}
						ref={sheduleBarRef}
					>
						<div className="h-full w-[150px] max-lg:w-[50px]" />
						{weekdays.map((weekday, i) => {
							const weekdayStr = getTimeAndDates(weekday).day;
							return (
								<span
									className="whitespace-nowrap cursor-pointer"
									key={weekdayStr}
									onClick={() => {
										setSelectedEventDay(weekday);
										scrollTo(i);
									}}
								>
									{weekdayStr}
								</span>
							);
						})}
						<div className="h-full w-[100px] max-lg:w-[190px]" />
					</div>
				</div>
				<div className="h-full flex items-center max-sm:hidden">
					<ChevronRight
						height={40}
						width={40}
						onClick={() => scrollDir("right")}
						className="cursor-pointer"
					/>
				</div>
			</div>
		</div>
	);
}
