import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import convertToPST from "@/lib/utils/convertToPST";
import EventProps from "../EventProps";
dayjs.extend(relativeTime);

const dateTimeFormat = new Intl.DateTimeFormat("en", {
	hour: "numeric",
	minute: "numeric",
});

interface EventTypeProps {
	eventType: string;
}

interface EventMomentProps {
	now: Date;
	startTimeInPST: Date;
	endTimeInPST: Date;
}

interface EventBackgroundColors {
	Main: string;
	Workshop: string;
	Social: string;
}

const eventBackgroundColors: EventBackgroundColors = {
	Main: "bg-[#DFBA73]",
	Workshop: "bg-[#94A9BD]",
	Social: "bg-[#DFA9A9]",
};

function EventTypeComponent({ eventType }: EventTypeProps) {
	return (
		<div
			className={`inline-block px-4 py-1.5 font-semibold text-[#0D272D] ${
				eventBackgroundColors[eventType as keyof EventBackgroundColors]
			} rounded-2xl sm:py-2`}
		>
			{eventType}
		</div>
	);
}

function EventMomentComponent({
	now,
	startTimeInPST,
	endTimeInPST,
}: EventMomentProps) {
	if (now > endTimeInPST) {
		const dEnd = dayjs(endTimeInPST);
		const timeAfterEnd = dEnd.from(now);
		return (
			<p className="text-white/50 text-right mb-0">Ended {timeAfterEnd}</p>
		);
	} else {
		if (now > startTimeInPST) {
			return <p className="text-white text-right mb-0">Happening Now!</p>;
		} else {
			const dStart = dayjs(startTimeInPST);
			const timeUntilStart = dStart.from(now);
			return (
				<p className="text-white/50 text-right mb-0">
					Starting {timeUntilStart}
				</p>
			);
		}
	}
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
	const startTimeInPST = convertToPST(startTime);
	const endTimeInPST = convertToPST(endTime);

	return (
		<div className="text-[#FFFCE2] bg-[#432810] p-5 mb-6 rounded-2xl sm:text-lg">
			<div className="mb-3 sm:flex sm:justify-between sm:items-center">
				<h3 className="mb-3 text-2xl font-bold text-[#FFDA7B] sm:mb-0">
					{title}
				</h3>
				<EventTypeComponent eventType={eventType} />
			</div>
			{hosts && (
				<p className="mb-2">
					Hosted by:{" "}
					{organization === undefined ? hosts?.join(", ") : organization}
				</p>
			)}
			<p className="mb-2">
				{dateTimeFormat.formatRange(startTimeInPST, endTimeInPST)} PST{" "}
				{virtual && <a href={virtual}>| Meeting Link</a>}
			</p>
			{description}
			<EventMomentComponent
				now={now}
				startTimeInPST={startTimeInPST}
				endTimeInPST={endTimeInPST}
			/>
		</div>
	);
}
