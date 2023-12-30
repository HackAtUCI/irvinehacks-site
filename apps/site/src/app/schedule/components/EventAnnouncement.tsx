import { utcToZonedTime } from "date-fns-tz";

const dateTimeFormat = new Intl.DateTimeFormat("en", {
	hour: "numeric",
	minute: "numeric",
});

interface EventAnnouncementProps {
	description: JSX.Element;
	startTime: Date;
	endTime: Date;
}

export default function EventAnnouncement({
	description,
	startTime,
	endTime,
}: EventAnnouncementProps) {
	const startTimeZoned = utcToZonedTime(startTime, "America/Los_Angeles");
	const endTimeZoned = utcToZonedTime(endTime, "America/Los_Angeles");

	return (
		<div className="text-white bg-[#0F6722] p-5 mb-6 rounded-2xl text-center">
			<div className="text-2xl">{description}</div>
			<p className="mb-2">
				{dateTimeFormat.formatRange(startTimeZoned, endTimeZoned)} PST
			</p>
		</div>
	);
}
