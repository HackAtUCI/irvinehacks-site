import Container from "@cloudscape-design/components/container";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import useParticipants, { Role } from "@/lib/admin/useParticipants";

dayjs.extend(utc);
dayjs.extend(timezone);

const EVENT_TIMEZONE = "America/Los_Angeles";

const FRIDAY = dayjs(new Date("2024-01-26T12:00:00")).tz(EVENT_TIMEZONE);

function HackerCount() {
	const { participants, loading } = useParticipants();

	const checkedIn = participants
		.filter((participant) => participant.roles.includes(Role.Applicant))
		.filter((participant) =>
			participant.checkins.some(([datetime]) =>
				FRIDAY.isSame(dayjs(datetime).tz(EVENT_TIMEZONE), "date"),
			),
		);

	if (loading) {
		return <Container>-</Container>;
	}

	return <Container>HackerCount {checkedIn.length}</Container>;
}

export default HackerCount;
