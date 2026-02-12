/* eslint-disable no-mixed-spaces-and-tabs */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import convertToPST from "@/lib/utils/convertToPST";

import EventCard from "../components/EventCard";
import EventProps from "../EventProps";
import ScheduleScroll from "./ScheduleScroll";
import EventSidebar from "../components/EventSidebar";

import "./SchedulePage.scss";

const T_REFRESH = 15000;

/* ---------------- Utilities ---------------- */

const getEventDate = (date: Date) =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate());

interface ScheduleProps {
	schedule: EventProps[][];
}

export default function SchedulePage({ schedule }: ScheduleProps) {
	/* ---------------- Time ---------------- */

	const [now, setNow] = useState<Date>(convertToPST(new Date()));

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(convertToPST(new Date()));
		}, T_REFRESH);

		return () => clearInterval(interval);
	}, []);

	/* ---------------- Flatten Events ---------------- */

	const allEvents = useMemo(() => {
		return schedule
			.flat()
			.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
	}, [schedule]);

	/* ---------------- All Unique Days ---------------- */

	const allDays = useMemo(() => {
		const uniqueDays = new Map<number, Date>();

		allEvents.forEach((event) => {
			const day = getEventDate(event.startTime);
			uniqueDays.set(day.getTime(), day);
		});

		return Array.from(uniqueDays.values()).sort(
			(a, b) => a.getTime() - b.getTime(),
		);
	}, [allEvents]);

	/* ---------------- Selected Event ---------------- */

	const [selectedEvent, setSelectedEvent] =
		useState<EventProps | undefined>(undefined);

	const selectedEventDay = useMemo(() => {
		return selectedEvent
			? getEventDate(selectedEvent.startTime)
			: allDays[0];
	}, [selectedEvent, allDays]);

	/* ---------------- Current Live Event ---------------- */

	const currentEvent = useMemo(() => {
		return allEvents.find(
			event =>
				event.startTime.getTime() <= now.getTime() &&
				event.endTime.getTime() >= now.getTime()
		);
	}, [allEvents, now]);

	useEffect(() => {
		if (!selectedEvent && currentEvent) {
			setSelectedEvent(currentEvent);
		}
	}, [currentEvent, selectedEvent]);

	/* ---------------- Active Index ---------------- */

	const activeIndex = useMemo(() => {
		if (!selectedEvent) return 0;

		const index = allEvents.findIndex(
			event =>
				event.title === selectedEvent.title &&
				event.startTime.getTime() ===
				selectedEvent.startTime.getTime()
		);

		return index >= 0 ? index : 0;
	}, [selectedEvent, allEvents]);

	/* ---------------- Carousel Ref ---------------- */

	const carouselRef = useRef<HTMLDivElement>(null);

	/* ---------------- Scroll To Index Helper ---------------- */

	// Ref to track manual scroll target
	const manualScrollTargetIndex = useRef<number | null>(null);

	const scrollToIndex = (index: number) => {
		const carousel = carouselRef.current;
		if (!carousel) return;

		const items = carousel.querySelectorAll(".mobile-carousel-item");
		const target = items[index] as HTMLElement;
		if (!target) return;

		// set target index
		manualScrollTargetIndex.current = index;

		carousel.scrollTo({
			left: target.offsetLeft,
			behavior: "smooth",
		});
	};

	useEffect(() => {
		const carousel = carouselRef.current;
		if (!carousel) return;

		let timeout: ReturnType<typeof setTimeout>;

		const handleScroll = () => {
			clearTimeout(timeout);

			timeout = setTimeout(() => {
				const carouselRect = carousel.getBoundingClientRect();
				const carouselCenter = carouselRect.left + carouselRect.width / 2;

				const items = Array.from(
					carousel.querySelectorAll(".mobile-carousel-item")
				);

				let closestIndex = 0;
				let smallestDistance = Infinity;

				items.forEach((item, index) => {
					const rect = item.getBoundingClientRect();
					const itemCenter = rect.left + rect.width / 2;
					const distance = Math.abs(carouselCenter - itemCenter);

					if (distance < smallestDistance) {
						smallestDistance = distance;
						closestIndex = index;
					}
				});

				// If we're in a manual scroll to a target, ignore intermediate updates
				if (
					manualScrollTargetIndex.current !== null &&
					closestIndex !== manualScrollTargetIndex.current
				) {
					return;
				}

				// Once we reach the target (or no target), clear manual scroll
				if (manualScrollTargetIndex.current === closestIndex) {
					manualScrollTargetIndex.current = null;
				}

				const nextEvent = allEvents[closestIndex];
				if (nextEvent) setSelectedEvent(nextEvent);
			}, 10);
		};

		carousel.addEventListener("scroll", handleScroll);
		return () => {
			carousel.removeEventListener("scroll", handleScroll);
			clearTimeout(timeout);
		};
	}, [allEvents]);

	/* ---------------- Sidebar Events (Current Day Only) ---------------- */

	const sidebarEvents = useMemo(() => {
		if (!selectedEventDay) return [];

		return allEvents.filter(
			event =>
				getEventDate(
					event.startTime
				).getTime() ===
				selectedEventDay.getTime()
		);
	}, [allEvents, selectedEventDay]);

	/* ---------------- Render ---------------- */

	return (
		<div className="relative w-full h-fit flex gap-10 flex-col max-md:gap-2">
			<ScheduleScroll
				weekdays={allDays}
				selectedEventDay={selectedEventDay}
				setSelectedEventDay={(day: Date) => {
					const index = allEvents.findIndex(
						event =>
							getEventDate(
								event.startTime
							).getTime() ===
							day.getTime()
					);

					if (index !== -1) {
						const event =
							allEvents[index];
						setSelectedEvent(event);
						scrollToIndex(index);
					}
				}}
			/>

			<div className="w-full relative flex max-lg:flex-col-reverse max-lg:gap-20">
				{/* Desktop Sidebar */}
				<div className="max-lg:hidden w-full">
					<EventSidebar
						events={sidebarEvents}
						currentTitle={
							selectedEvent
								? `${
										selectedEvent.title
								  }${selectedEvent.startTime.toISOString()}`
								: ""
						}
						setSelectedEvent={
							setSelectedEvent
						}
					/>
				</div>

				{/* Mobile Carousel */}
				<div className="mobile-carousel-wrapper lg:hidden">
					<div
						ref={carouselRef}
						className="mobile-carousel"
					>
						{allEvents.map(
							(event, index) => (
								<div
									key={`${event.title}-${event.startTime.toISOString()}`}
									className={`mobile-carousel-item ${index === activeIndex
										? "active"
										: ""
										}`}
								>
									<EventCard
										now={now}
										isHappening={
											event.startTime <= now &&
											event.endTime >= now
										}
										{...event}
									/>
								</div>
							)
						)}
					</div>
				</div>

				{/* Desktop Event Card */}
				{selectedEvent ? (
					<div className="w-[50%] relative flex max-lg:hidden lg:min-h-[700px]">
						<EventCard
							key={`${
								selectedEvent.title
							}-${selectedEvent.startTime.toISOString()}`}
							now={now}
							isHappening={false}
							{...selectedEvent}
						/>
					</div>
				) : (
					<div className="w-[50%] min-h-[700px] relative flex max-lg:justify-center max-lg:hidden">
						<div className="w-[90%] min-h-[700px] h-full bg-[#170f51]/50 border-[9px] border-yellow relative p-16 font-display">
							<div className="text-4xl min-h-[600px] w-full h-full flex justify-center items-center text-center text-yellow">
								No Event Selected...
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
