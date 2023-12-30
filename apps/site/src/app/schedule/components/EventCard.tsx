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
	description?: JSX.Element;
}

export default function EventCard({
	now,
	title,
	eventType,
	virtual,
	startTime,
	endTime,
	organization,
	description,
}: EventProps) {
	const EventComponent = () => {
		if (eventType === "Announcement") {
			return EventAnnouncement({ title, startTime, endTime });
		} else if (eventType === "Miscellaneous") {
			return EventMiscellaneous({
				title,
				startTime,
				endTime,
				description,
			});
		} else {
			return EventRegular({
				now,
				title,
				eventType,
				virtual,
				startTime,
				endTime,
				organization,
				description,
			});
		}
	};

	return EventComponent();
}
