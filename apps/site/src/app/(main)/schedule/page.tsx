import { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getSchedule } from "./components/getSchedule";

import Image from "next/image";

import illus_bg from "@/assets/backgrounds/alt_illus_moonless-blur.png";

import ShiftingCountdown from "./components/ShiftingCountdown/ShiftingCountdown";
import SchedulePage from "./SchedulePage";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Schedule | IrvineHacks 2026",
};

export default async function Schedule() {
	if (process.env.MAINTENANCE_MODE_SCHEDULE) {
		redirect("/");
	}

	const events = await getSchedule();

	const schedule = events.map((days) =>
		days.map(({ description, ...day }) => ({
			...day,
			description: <PortableText value={description} />,
		})),
	);

	return (
		<>
			<section className="h-full w-full mb-12 relative">
				<div className="absolute bottom-0 left-0 w-full h-full overflow-hidden z-[-1] min-w-[600px]">
					<Image
						src={illus_bg}
						alt="City background"
						className="absolute bottom-0 left-0 w-full"
					/>
				</div>
				<div className="p-2 relative lg:p-36">
					<ShiftingCountdown />
				</div>
				<div className="flex justify-center">
					<SchedulePage schedule={schedule} />
				</div>
			</section>
		</>
	);
}
