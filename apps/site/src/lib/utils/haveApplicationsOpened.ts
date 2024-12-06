export default function haveApplicationsOpened() {
	const pstDeadline = "2024-12-6T18:00:59";
	const utcOffset = "-08:00";

	const deadline = new Date(pstDeadline + utcOffset);
	const now = new Date();

	return now > deadline;
}
