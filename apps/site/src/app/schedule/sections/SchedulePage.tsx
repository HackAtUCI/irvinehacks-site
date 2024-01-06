"use client";

import { useState, useEffect, useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";

import EventCard from "../components/EventCard";
import convertToPST from "@/lib/utils/convertToPST";

import "./SchedulePage.scss";

const T_REFRESH = 15000;

const weekdayFormat = new Intl.DateTimeFormat("en", {
	weekday: "long",
});

interface ScheduleProps {
	schedule: {
		title: string;
		eventType: string;
		location?: string | undefined;
		virtual?: string | undefined;
		startTime: Date;
		endTime: Date;
		organization?: string | undefined;
		hosts?: string[] | undefined;
		description: JSX.Element;
	}[][];
}

export default function SchedulePage({ schedule }: ScheduleProps) {
	const tabsRef = useRef<HTMLDivElement>(null);

	const tabsOffsetTopRef = useRef<number | undefined | null>(null);

	const [day, setDay] = useState("Friday");

	const [now, setNow] = useState<Date>(convertToPST(new Date()));

	const [haveTabsBeenScrolledToTop, setHaveTabsBeenScrolledToTop] =
		useState(false);

	useEffect(() => {
		const refreshNow = setInterval(() => {
			setNow(convertToPST(new Date()));
		}, T_REFRESH);

		return () => {
			clearInterval(refreshNow);
		};
	}, []);

	useEffect(() => {
		tabsOffsetTopRef.current = tabsRef.current?.offsetTop;

		const detectScroll = () => {
			if (
				tabsOffsetTopRef.current !== undefined &&
				tabsOffsetTopRef.current !== null &&
				window.scrollY > tabsOffsetTopRef.current
			) {
				setHaveTabsBeenScrolledToTop(true);
			} else {
				setHaveTabsBeenScrolledToTop(false);
			}
		};

		window.addEventListener("scroll", detectScroll);

		return () => {
			window.removeEventListener("scroll", detectScroll);
		};
	}, []);

	return (
		<Tabs.Root
			value={day}
			defaultValue="Friday"
			onValueChange={setDay}
			className="w-11/12 sm:w-4/5"
		>
			<div className="text-center mb-6 sm:mb-10 sm:flex sm:justify-between sm:flex-row-reverse">
				<Tabs.List
					className={`${
						haveTabsBeenScrolledToTop
							? "max-w-[15rem] m-auto xs:max-sm:fixed top-3 left-0 right-0 z-[51] sm:static sm:z-auto"
							: ""
					} mb-8 sm:m-0`}
					ref={tabsRef}
				>
					<Tabs.Trigger
						className="TabsTrigger text-lg text-[#2F1C00] px-3.5 py-1.5 border border-[#2F1C00] rounded-l-2xl bg-[#FFFCE2] min-w-[5rem] sm:min-w-[4rem]"
						value="Friday"
					>
						Fri
					</Tabs.Trigger>
					<Tabs.Trigger
						className="TabsTrigger text-lg text-[#2F1C00] px-3.5 py-1.5 border border-[#2F1C00] bg-[#FFFCE2] min-w-[5rem] sm:min-w-[4rem]"
						value="Saturday"
					>
						Sat
					</Tabs.Trigger>
					<Tabs.Trigger
						className="TabsTrigger text-lg text-[#2F1C00] px-3.5 py-1.5 border border-[#2F1C00] rounded-r-2xl bg-[#FFFCE2] min-w-[5rem] sm:min-w-[4rem]"
						value="Sunday"
					>
						Sun
					</Tabs.Trigger>
				</Tabs.List>
				<h2 className="text-[#FFFCE2] font-bold text-2xl sm:text-3xl">
					{day} Schedule
				</h2>
			</div>
			{schedule.map((day, i) => (
				<div
					key={i}
					className="flex flex-col justify-center items-center w-full"
				>
					<Tabs.Content
						value={weekdayFormat.format(
							convertToPST(day[0].startTime),
						)}
						className="w-full"
					>
						{day.map((event) => {
							return (
								<EventCard
									key={event.title}
									now={now}
									{...event}
								/>
							);
						})}
					</Tabs.Content>
				</div>
			))}
		</Tabs.Root>
	);
}
