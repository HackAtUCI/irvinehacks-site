"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { utcToZonedTime } from "date-fns-tz";

import "@radix-ui/themes/styles.css";
import "./SchedulePage.scss";

const dateTimeFormat = new Intl.DateTimeFormat("en", {
	hour: "numeric",
	minute: "numeric",
});

const weekdayFormat = new Intl.DateTimeFormat("en", {
	weekday: "long",
});

interface ScheduleProps {
	schedule: {
		title: string;
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

	return (
		<Tabs.Root
			value={day}
			defaultValue="Friday"
			onValueChange={setDay}
			className="w-4/5"
		>
			<div className="flex justify-between mb-10">
				<h2 className="text-[#FFFCE2] text-3xl font-bold">
					{day} Schedule
				</h2>
				<Tabs.List>
					<Tabs.Trigger
						className="TabsTrigger text-[#2F1C00] px-4 py-1 border border-[#2F1C00] rounded-l-2xl bg-[#FFFCE2] min-w-[64px]"
						value="Friday"
					>
						Fri
					</Tabs.Trigger>
					<Tabs.Trigger
						className="TabsTrigger text-[#2F1C00] px-3 py-1 border border-[#2F1C00] bg-[#FFFCE2]"
						value="Saturday"
					>
						Sat
					</Tabs.Trigger>
					<Tabs.Trigger
						className="TabsTrigger text-[#2F1C00] px-4 py-1 border border-[#2F1C00] rounded-r-2xl bg-[#FFFCE2] min-w-[64px]"
						value="Sunday"
					>
						Sun
					</Tabs.Trigger>
				</Tabs.List>
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
						className="w-full mb-5"
					>
						<div className="">
							{day.map(
								({
									title,
									location,
									virtual,
									startTime,
									endTime,
									organization,
									description,
								}) => {
									const startTimeZoned = utcToZonedTime(
										startTime,
										"America/Los_Angeles",
									);
									const endTimeZoned = utcToZonedTime(
										endTime,
										"America/Los_Angeles",
									);
									return (
										<div
											key={title}
											className="text-[#FFFCE2] bg-[#432810] p-5 mb-6"
										>
											<h3 className="text-2xl font-bold text-[#FFDA7B]">
												{title}
											</h3>
											<p>Hosted by: {organization}</p>
											<p>{location}</p>
											<span>
												{dateTimeFormat.formatRange(
													startTimeZoned,
													endTimeZoned,
												)}{" "}
												PST{" "}
											</span>
											<span>
												|{" "}
												<a href={virtual}>
													Meeting Link
												</a>
											</span>
											<p>{description}</p>
										</div>
									);
								},
							)}
						</div>
					</Tabs.Content>
				</div>
			))}
		</Tabs.Root>
	);
}
