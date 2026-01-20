export default function haveApplicationsOpened() {
	const pstDeadline = "2026-01-26T09:00:59";
	const utcOffset = "-08:00";

	const deadline = new Date(pstDeadline + utcOffset);
	const now = new Date();

	return now > deadline;
}
