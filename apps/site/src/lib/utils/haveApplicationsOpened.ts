export default function haveApplicationsOpened() {
	const pstDeadline = "2026-01-23T08:59:00";
	const utcOffset = "-08:00";

	const deadline = new Date(pstDeadline + utcOffset);
	const now = new Date();
	return now > deadline;
}
