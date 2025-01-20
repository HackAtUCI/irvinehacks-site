"use client";

import clsx from "clsx";
import styles from "./EventSidebar.module.scss";
import { useState, useEffect, useRef } from "react";
import EventPlaque from "./EventPlaque";

interface EventProps {
	title: string;
	eventType: string;
	location?: string;
	virtual?: string | undefined;
	startTime: Date;
	endTime: Date;
	organization?: string | undefined;
	hosts?: string[] | undefined;
	description: JSX.Element;
}

export default function EventSidebar({
	events,
	currentTitle,
	setSelectedEvent,
}: {
	events: EventProps[];
	currentTitle: string | undefined;
	setSelectedEvent: any;
}) {
	const sheduleBarRef = useRef<any>(null);
	const scheduleContainerRef = useRef<any>(null);
	const scheduleScrollerRef = useRef<any>(null);

	const getScheduleRef = () => {
		if (!sheduleBarRef.current) sheduleBarRef.current = new Map();
		return sheduleBarRef.current;
	};

	const calculateScrollDistance = (node: any) => {
		return (
			node.getBoundingClientRect().top -
			scheduleContainerRef.current?.getBoundingClientRect().top +
			(node.getBoundingClientRect().bottom - node.getBoundingClientRect().top) /
				2 -
			(scheduleScrollerRef.current?.getBoundingClientRect().bottom -
				scheduleScrollerRef.current?.getBoundingClientRect().top) /
				2
		);
	};

	const eventPlaqueClick = (title: string) => {
		const m = getScheduleRef();
		const node = m.get(title);

		scheduleScrollerRef.current?.scrollTo({
			top: calculateScrollDistance(node),
			behavior: "smooth",
		});

		setSelectedEvent(events.filter((event) => event.title == title)[0]);
	};

	useEffect(() => {
		const m = getScheduleRef();
		const node = m.get(currentTitle);

		scheduleScrollerRef.current?.scrollTo({
			top: calculateScrollDistance(node),
			behavior: "smooth",
		});
	}, []);

	return (
		<div className="flex flex-col items-center select-none relative w-[50%] max-lg:w-[100%]">
			<div
				className={clsx(styles.background, "h-[800px] w-[80%] overflow-auto")}
				ref={scheduleScrollerRef}
			>
				<div
					className="w-full h-fit flex flex-col gap-4 p-6"
					ref={scheduleContainerRef}
				>
					<div className="h-[400px] w-full">Events...</div>
					{events.map((event) => {
						return (
							<EventPlaque
								key={event.title}
								onClick={eventPlaqueClick}
								ref={(node) => {
									const m = getScheduleRef();
									m.set(event.title, node);

									return () => m.delete(event.title);
								}}
								title={event.title}
								startTime={event.startTime}
								endTime={event.endTime}
							></EventPlaque>
						);
					})}
					<div className="h-[400px] w-full"></div>
				</div>
			</div>
		</div>
	);
}
