import EventRegular from "./EventRegular";
import EventAnnouncement from "./EventAnnouncement";
import EventMiscellaneous from "./EventMiscellaneous";
import EventProps from "../EventProps";

import Castle from "@/assets/images/castle_island.png";

import getTimeAndDates from "@/lib/utils/getTimeAndDates";
import Image from "next/image";

export default function EventCard({
	now,
	title,
	eventType,
	location,
	virtual,
	startTime,
	endTime,
	organization,
	hosts,
	description,
}: EventProps) {
	console.log(
		now,
		title,
		eventType,
		location,
		virtual,
		startTime,
		endTime,
		organization,
		hosts,
		description,
	);

	if (!title) {
		return <div></div>;
	}
	const start = getTimeAndDates(startTime);
	const end = getTimeAndDates(endTime);

	return (
		<div className="w-[50%] min-h-[700px] relative flex max-lg:justify-center max-lg:w-full">
			<div className="w-[90%] h-full bg-black border-4 border-white relative p-16 font-display">
				<div>
					<div className="flex items-center justify-between">
						<h1 className="text-4xl max-w-[80%]">{title}</h1>
						<p className="text-2xl">{start.day}</p>
					</div>
					<div className="pt-5">
						<p className="text-2xl">
							<span>Location: </span>
							{virtual ? <a>Zoom</a> : location}
						</p>
						<p className="text-xl">{`Time: ${start.compositeTimeHourMinute} - ${end.compositeTimeHourMinute} ${end.amPm}`}</p>
					</div>
				</div>
				<div className="w-full h-[2px] bg-white mt-4 mb-4"></div>
				<div>
					{hosts && (
						<div className="text-2xl">{`Hosted By: ${hosts?.join(", ")}`}</div>
					)}
					<div className="text-xl pt-5">{description}</div>
				</div>
			</div>
		</div>
	);
}
