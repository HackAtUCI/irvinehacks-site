import { utcToZonedTime } from "date-fns-tz";

const dateTimeFormat = new Intl.DateTimeFormat("en", {
	hour: "numeric",
	minute: "numeric",
});

interface EventProps {
	title: string;
	eventType: string;
	location?: string | undefined;
	virtual?: string | undefined;
	startTime: Date;
	endTime: Date;
	organization?: string | undefined;
	hosts?: string[] | undefined;
	description: JSX.Element;
}

export default function EventRegular({
	title,
	eventType,
	virtual,
	startTime,
	endTime,
	organization,
	hosts,
	description,
}: EventProps) {
	const eventTypeComponent = () => {
		if (eventType === "Main") {
			return (
				<div className="px-4 py-2 font-semibold text-[#0D272D] bg-[#DFBA73] rounded-2xl">
					{eventType}
				</div>
			);
		} else if (eventType === "Workshop") {
			return (
				<div className="px-4 py-2 font-semibold text-[#0D272D] bg-[#94A9BD] rounded-2xl">
					{eventType}
				</div>
			);
		} else if (eventType === "Social") {
			return (
				<div className="px-4 py-2 font-semibold text-[#0D272D] bg-[#DFA9A9] rounded-2xl">
					{eventType}
				</div>
			);
		}
	};

	const startTimeZoned = utcToZonedTime(startTime, "America/Los_Angeles");
	const endTimeZoned = utcToZonedTime(endTime, "America/Los_Angeles");

	return (
		<div className="text-[#FFFCE2] bg-[#432810] p-5 mb-6 rounded-2xl">
			<div className="flex justify-between items-center mb-3">
				<h3 className="text-2xl font-bold text-[#FFDA7B]">{title}</h3>
				{eventTypeComponent()}
			</div>
			<p className="mb-2">
				Hosted by:{" "}
				{organization === undefined ? hosts?.join(", ") : organization}
			</p>
			<p className="mb-2">
				{dateTimeFormat.formatRange(startTimeZoned, endTimeZoned)} PST |{" "}
				<a href={virtual}>Meeting Link</a>
			</p>
			{description}
		</div>
	);
}
