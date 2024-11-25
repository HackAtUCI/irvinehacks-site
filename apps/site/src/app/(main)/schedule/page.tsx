import { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortableText } from "@portabletext/react";

import rawEvents from "@/data/schedule.json";
const events = rawEvents.map((day) =>
	day.map((event) => ({
		...event,
		startTime: new Date(event.startTime),
		endTime: new Date(event.endTime),
	})),
);

import ShiftingCountdown from "./components/ShiftingCountdown/ShiftingCountdown";
import SchedulePage from "./sections/SchedulePage";

// export const revalidate = 60;

export const metadata: Metadata = {
	title: "Schedule | IrvineHacks 2024",
};

export default function Schedule() {
	if (process.env.MAINTENANCE_MODE_SCHEDULE) {
		redirect("/");
	}

	const schedule = events.map((days) =>
		days.map(({ description, ...day }) => ({
			...day,
			description: <PortableText value={description} />,
		})),
	);

	return (
		<>
			<section className="h-full w-full mb-12">
				<div className="m-36">
					<ShiftingCountdown />
				</div>
				<div className="flex justify-center">
					<SchedulePage schedule={schedule} />
				</div>
			</section>
		</>
	);
}
