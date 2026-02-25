/* eslint-disable no-mixed-spaces-and-tabs */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import getTimeAndDates from "@/lib/utils/getTimeAndDates";
import arrowTriangle from "@/assets/icons/arrow-triangle.svg";

export default function DesktopScheduleScroll({
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

		const nextIndex =
			action === "left"
				? (ind + (weekdays.length - 1)) % weekdays.length
				: (ind + 1) % weekdays.length;

		scrollTo(nextIndex);
		setSelectedEventDay(weekdays[nextIndex]);
	}

	if (!weekdays.length) {
		return null;
	}

	const selectedIndex = getCurrentDateIndex();
	const selectedWeekday = weekdays[selectedIndex];
	const nextWeekday = weekdays[(selectedIndex + 1) % weekdays.length];
	const selectedWeekdayStr = getTimeAndDates(selectedWeekday).day;
	const nextWeekdayStr = getTimeAndDates(nextWeekday).day;

	return (
		<div className="w-full flex flex-col items-center select-none gap-20 max-md:gap-5">
			<h1 className="text-5xl font-display">Schedule</h1>
			<div className="flex gap-10 sm:hidden">
				<div className="h-full flex items-center">
					<Image
						src={arrowTriangle}
						alt="Previous day"
						width={60}
						height={60}
						onClick={() => scrollDir("left")}
						className="cursor-pointer scale-x-[-1]"
					/>
				</div>
				<div className="h-full flex items-center">
					<Image
						src={arrowTriangle}
						alt="Next day"
						width={60}
						height={60}
						onClick={() => scrollDir("right")}
						className="cursor-pointer"
					/>
				</div>
			</div>
			<div className="w-full h-[120px] px-10 max-sm:hidden overflow-visible relative z-[60]">
				<div className="w-full flex items-center justify-between h-full xl:hidden">
					<div className="flex items-center gap-2 translate-y-[155px] -translate-x-[30px] relative z-[60]">
						{" "}
						<Image
							src={arrowTriangle}
							alt="Previous day"
							width={60}
							height={60}
							onClick={() => scrollDir("left")}
							className="cursor-pointer relative z-[60] scale-x-[-1]"
						/>
						<span
							className="font-display text-[#FF4DEF] text-[40px] leading-none whitespace-nowrap cursor-pointer"
							style={{ textShadow: "0px 0px 25px #FF4DEF" }}
							onClick={() => setSelectedEventDay(selectedWeekday)}
						>
							{selectedWeekdayStr}
						</span>
					</div>
					<div className="flex items-center gap-2 translate-y-[120px] translate-x-[50px] relative z-[60]">
						{" "}
						<div className="w-[160px] text-left">
							<span
								className="font-display text-[#FF4DEF] text-[24px] leading-none whitespace-nowrap cursor-pointer"
								style={{ textShadow: "0px 0px 25px #FF4DEF" }}
								onClick={() => scrollDir("right")}
							>
								{nextWeekdayStr}
							</span>
						</div>
						<Image
							src={arrowTriangle}
							alt="Next day"
							width={60}
							height={60}
							onClick={() => scrollDir("right")}
							className="cursor-pointer relative z-[60]"
						/>
					</div>
				</div>

				<div className="hidden xl:block w-full h-full relative">
					<div className="absolute left-[-50px] top-[125px] flex items-center gap-2 z-[60]">
						<Image
							src={arrowTriangle}
							alt="Previous day"
							width={60}
							height={60}
							onClick={() => scrollDir("left")}
							className="cursor-pointer scale-x-[-1]"
						/>
						<span
							className="font-display text-[#FF4DEF] text-[60px] leading-none whitespace-nowrap cursor-pointer"
							style={{ textShadow: "0px 0px 25px #FF4DEF" }}
							onClick={() => scrollDir("left")}
						>
							{selectedWeekdayStr}
						</span>
					</div>

					<Image
						src={arrowTriangle}
						alt="Next day"
						width={60}
						height={60}
						onClick={() => scrollDir("right")}
						className="cursor-pointer absolute right-[-45px] top-[95px] z-[60]"
					/>
					<div className="absolute right-[80px] top-[100px] w-[160px] z-[60]">
						<span
							className="block w-full text-left font-display text-[#FF4DEF] text-[32px] leading-none whitespace-nowrap cursor-pointer"
							style={{ textShadow: "0px 0px 25px #FF4DEF" }}
							onClick={() => scrollDir("right")}
						>
							{nextWeekdayStr}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
