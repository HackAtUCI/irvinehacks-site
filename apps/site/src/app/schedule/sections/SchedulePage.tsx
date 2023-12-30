"use client";

import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { utcToZonedTime } from "date-fns-tz";

import EventCard from "../components/EventCard";

import "@radix-ui/themes/styles.css";
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
	const [day, setDay] = useState("Friday");

	const [now, setNow] = useState<Date>(
		utcToZonedTime(new Date(), "America/Los_Angeles"),
	);

	useEffect(() => {
		const refreshNow = setInterval(() => {
			setNow(utcToZonedTime(new Date(), "America/Los_Angeles"));
		}, T_REFRESH);

		return () => {
			clearInterval(refreshNow);
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
				<Tabs.List className="mb-12 sm:mb-0">
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
							utcToZonedTime(
								day[0].startTime,
								"America/Los_Angeles",
							),
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
