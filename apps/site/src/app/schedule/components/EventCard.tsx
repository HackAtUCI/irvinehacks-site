import EventRegular from "./EventRegular";
import EventAnnouncement from "./EventAnnouncement";
import EventMiscellaneous from "./EventMiscellaneous";

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

export default function EventCard({
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
	if (eventType === "Announcement") {
		// description is used as the prop as opposed to title because description is a Portable Text object
		// that can reflect all text formats put in Sanity
		return (
			<EventAnnouncement
				description={description}
				startTime={startTime}
				endTime={endTime}
			/>
		);
	} else if (eventType === "Miscellaneous") {
		return (
			<EventMiscellaneous
				title={title}
				startTime={startTime}
				endTime={endTime}
				description={description}
			/>
		);
	} else {
		return (
			<EventRegular
				now={now}
				title={title}
				eventType={eventType}
				virtual={virtual}
				startTime={startTime}
				endTime={endTime}
				organization={organization}
				hosts={hosts}
				description={description}
			/>
		);
	}
}
