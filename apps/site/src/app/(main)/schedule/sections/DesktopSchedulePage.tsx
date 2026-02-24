/* eslint-disable no-mixed-spaces-and-tabs */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import convertToPST from "@/lib/utils/convertToPST";
import scheduleFrame from "@/assets/images/schedule_frame.svg";

import DesktopEventCard from "../components/DesktopEventCard";
import EventProps from "../EventProps";
import DesktopScheduleScroll from "../components/DesktopScheduleScroll";
import EventSidebar from "../components/EventSidebar";

import "./SchedulePage.scss";

const T_REFRESH = 15000;

interface DesktopSchedulePageProps {
	schedule: EventProps[][];
}

// test date : "2024-01-26T23:30:00.000Z"

export default function DesktopSchedulePage({
	schedule,
}: DesktopSchedulePageProps) {
	const [now, setNow] = useState<Date>(convertToPST(new Date()));

	useEffect(() => {
		const refreshNow = setInterval(() => {
			setNow(convertToPST(new Date()));
		}, T_REFRESH);

		return () => {
			clearInterval(refreshNow);
		};
	}, []);

	const [selectedEvent, setSelectedEvent] = useState<EventProps | undefined>(
		undefined,
	);

	const [selectedEventDay, setSelectedEventDay] = useState<Date | undefined>(
		getEventDate(new Date(Date.now())),
	);

	function getEventDate(date: Date) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate());
	}

	const firstDay = new Date(2025, 0, 24); // hackathon start day

	const allDays = schedule
		.map((event) => (event ? event[0].startTime : new Date(0)))
		.filter((date) => date.getTime() > 0)
		.map((date) => getEventDate(date));

	const currentWeekday =
		now.getTime() > firstDay.getTime() ? getEventDate(now) : firstDay;

	let currentScheduleEvents = schedule.filter(
		(event) =>
			getEventDate(event[0].startTime).getTime() === currentWeekday.getTime(),
	)?.[0];

	const selectedScheduleEvents = schedule.filter(
		(event) =>
			getEventDate(event[0].startTime).getTime() ===
			selectedEventDay?.getTime(),
	)?.[0];

	if (!currentScheduleEvents) currentScheduleEvents = schedule[0];

	const currentEvent = currentScheduleEvents
		? currentScheduleEvents.filter(
				(event) =>
					event.startTime.getTime() <= now.getTime() &&
					event.endTime.getTime() >= now.getTime(),
			)?.[0]
		: undefined;

	useEffect(() => {
		setSelectedEvent(currentEvent);
	}, [currentEvent]);

	return (
		<div className="relative w-full h-fit flex gap-10 flex-col max-md:gap-2">
			<DesktopScheduleScroll
				weekdays={allDays}
				setSelectedEventDay={setSelectedEventDay}
				selectedEventDay={selectedEventDay}
			/>
			<div className="relative w-full">
				<div className="absolute inset-0 w-full h-full z-0">
					<Image
						src={scheduleFrame}
						alt=""
						className="w-full h-full object-contain"
						style={{ pointerEvents: "none" }}
					/>
				</div>
				<div className="w-full relative flex max-lg:flex-col-reverse max-lg:gap-20 p-5 z-10">
					<EventSidebar
						events={
							selectedScheduleEvents
								? selectedScheduleEvents
								: currentScheduleEvents
						}
						currentTitle={`${currentEvent?.title}${currentEvent?.startTime.toISOString()}`}
						setSelectedEvent={setSelectedEvent}
					/>
					{selectedEvent ? (
						<div className="flex-1 relative flex items-center justify-start max-lg:hidden lg:min-h-[400px]">
							<DesktopEventCard
								key={selectedEvent.title}
								now={now}
								isHappening={false}
								{...selectedEvent}
							/>
						</div>
					) : (
						<div className="flex-1 min-h-[400px] relative flex items-center justify-start max-lg:hidden">
							<div className="w-[78%] h-[520px] overflow-auto bg-[#170f51]/50 border-[9px] border-yellow relative p-7 font-display">
								<div className="text-4xl w-full h-full flex justify-center items-center text-center text-yellow">
									No Event Selected...
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
