import { utcToZonedTime } from "date-fns-tz";

const dateTimeFormat = new Intl.DateTimeFormat("en", {
	hour: "numeric",
	minute: "numeric",
});

interface EventAnnouncementProps {
	title: string;
	startTime: Date;
	endTime: Date;
}

export default function EventAnnouncement({
	title,
	startTime,
	endTime,
}: EventAnnouncementProps) {
	const startTimeZoned = utcToZonedTime(startTime, "America/Los_Angeles");
	const endTimeZoned = utcToZonedTime(endTime, "America/Los_Angeles");

	return (
		<div className="text-white bg-[#0F6722] p-5 mb-6 rounded-2xl text-center">
			<h3 className="text-2xl font-bold mb-3">{title}</h3>
			<p className="mb-2">
				{dateTimeFormat.formatRange(startTimeZoned, endTimeZoned)} PST
			</p>
		</div>
	);
}
