import { PortableText } from "@portabletext/react";

import ShiftingCountdown from "./components/ShiftingCountdown/ShiftingCountdown";
import { getSchedule } from "./components/getSchedule";
import SchedulePage from "./sections/SchedulePage";

export const revalidate = 60;

export default async function Schedule() {
	const events = await getSchedule();

	const schedule = events.map((days) =>
		days.map(({ description, ...day }) => ({
			...day,
			description: <PortableText value={description} />,
		})),
	);

	return (
		<>
			<section className="h-full w-full">
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
