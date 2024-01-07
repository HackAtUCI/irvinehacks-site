import { utcToZonedTime } from "date-fns-tz";

export default function convertToPST(date: Date) {
	return utcToZonedTime(date, "America/Los_Angeles");
}
