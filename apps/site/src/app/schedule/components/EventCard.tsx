import { utcToZonedTime } from "date-fns-tz";

const dateTimeFormat = new Intl.DateTimeFormat("en", {
	hour: "numeric",
	minute: "numeric",
});

interface EventProps {
	title: string;
	location?: string | undefined;
	virtual?: string | undefined;
	startTime: Date;
	endTime: Date;
	organization?: string | undefined;
	hosts?: string[] | undefined;
	description: JSX.Element;
}

export default function EventCard({
	title,
	location,
	virtual,
	startTime,
	endTime,
	organization,
	hosts,
	description,
}: EventProps) {
	const startTimeZoned = utcToZonedTime(startTime, "America/Los_Angeles");
	const endTimeZoned = utcToZonedTime(endTime, "America/Los_Angeles");
	return (
		<div className="text-[#FFFCE2] bg-[#432810] p-5 mb-6 rounded-2xl">
			<h3 className="text-2xl font-bold text-[#FFDA7B] mb-3">{title}</h3>
			<p className="mb-2">Hosted by: {organization}</p>
			<p className="mb-2">
				{dateTimeFormat.formatRange(startTimeZoned, endTimeZoned)} PST |{" "}
				<a href={virtual}>Meeting Link</a>
			</p>
			{description}
		</div>
	);
}
