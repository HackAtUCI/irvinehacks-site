import Icon from "@cloudscape-design/components/icon";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { Checkin } from "@/lib/admin/useParticipants";

dayjs.extend(utc);
dayjs.extend(timezone);
const EVENT_TIMEZONE = "America/Los_Angeles";

interface CheckinDayProps {
	checkins: Checkin[];
	date: Date;
}

const today = dayjs().tz(EVENT_TIMEZONE);

function CheckinDayIcon({ checkins, date }: CheckinDayProps) {
	// Timezones are weird, but comparing the days of the check-ins
	const day = dayjs(date).tz(EVENT_TIMEZONE);
	const checkinTimes = checkins.map(([datetime]) =>
		dayjs(datetime).tz(EVENT_TIMEZONE),
	);

	const checkedIn = checkinTimes.some((checkin) => day.isSame(checkin, "date"));
	const past = day.isBefore(today, "date");

	if (checkedIn) {
		return <Icon name="status-positive" variant="success" alt="Checked in" />;
	}
	if (past) {
		return <Icon name="status-negative" variant="error" alt="No show" />;
	}
	return <Icon name="status-pending" variant="subtle" alt="Pending" />;
}

export default CheckinDayIcon;
