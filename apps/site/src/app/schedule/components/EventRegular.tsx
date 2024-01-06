import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import convertToPST from "@/lib/utils/convertToPST";
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

interface EventTypeProps {
	eventType: string;
}

interface EventMomentProps {
	now: Date;
	startTimeInPST: Date;
	endTimeInPST: Date;
}

function EventTypeComponent({ eventType }: EventTypeProps) {
	if (eventType === "Main") {
		return (
			<div className="inline-block px-4 py-1.5 font-semibold text-[#0D272D] bg-[#DFBA73] rounded-2xl sm:py-2">
				{eventType}
			</div>
		);
	} else if (eventType === "Workshop") {
		return (
			<div className="inline-block px-4 py-1.5 font-semibold text-[#0D272D] bg-[#94A9BD] rounded-2xl sm:py-2">
				{eventType}
			</div>
		);
	} else if (eventType === "Social") {
		return (
			<div className="inline-block px-4 py-1.5 font-semibold text-[#0D272D] bg-[#DFA9A9] rounded-2xl sm:py-2">
				{eventType}
			</div>
		);
	}
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
			<p className="text-white/50 text-right mb-0">
				Ended {timeAfterEnd}
			</p>
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
			<p className="mb-2">
				Hosted by:{" "}
				{organization === undefined ? hosts?.join(", ") : organization}
			</p>
			<p className="mb-2">
				{dateTimeFormat.formatRange(startTimeInPST, endTimeInPST)} PST |{" "}
				<a href={virtual}>Meeting Link</a>
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
