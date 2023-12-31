import { utcToZonedTime } from "date-fns-tz";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const dateTimeFormat = new Intl.DateTimeFormat("en", {
	hour: "numeric",
	minute: "numeric",
});

interface EventProps {
	now: Date;
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
	now,
	title,
	eventType,
	virtual,
	startTime,
	endTime,
	organization,
	hosts,
	description,
}: EventProps) {
	const startTimeZoned = utcToZonedTime(startTime, "America/Los_Angeles");
	const endTimeZoned = utcToZonedTime(endTime, "America/Los_Angeles");

	let eventBackgroundColor;
	if (eventType === "Main") {
		eventBackgroundColor = "#DFBA73";
	} else if (eventType === "Workshop") {
		eventBackgroundColor = "#94A9BD";
	} else if (eventType === "Social") {
		eventBackgroundColor = "#DFA9A9";
	}

	const eventMomentComponent = () => {
		if (now > endTimeZoned) {
			const dEnd = dayjs(endTimeZoned);
			const timeAfterEnd = dEnd.from(now);
			return (
				<p className="text-white/50 text-right mb-0">
					Ended {timeAfterEnd}
				</p>
			);
		} else {
			if (now > startTimeZoned) {
				return (
					<p className="text-white text-right mb-0">Happening Now!</p>
				);
			} else {
				const dStart = dayjs(startTimeZoned);
				const timeUntilStart = dStart.from(now);
				return (
					<p className="text-white/50 text-right mb-0">
						Starting {timeUntilStart}
					</p>
				);
			}
		}
	};

	return (
		<div className="text-[#FFFCE2] bg-[#432810] p-5 mb-6 rounded-2xl">
			<div className="mb-3 sm:flex sm:justify-between sm:items-center">
				<h3 className="mb-3 text-2xl font-bold text-[#FFDA7B] sm:mb-0">
					{title}
				</h3>
				<div
					className={`inline-block px-4 py-1.5 font-semibold text-[#0D272D] bg-[${eventBackgroundColor}] rounded-2xl sm:py-2`}
				>
					{eventType}
				</div>
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
			{eventMomentComponent()}
		</div>
	);
}
