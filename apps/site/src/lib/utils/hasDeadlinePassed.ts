export default function hasDeadlinePassed() {
	const pstDeadline = "2026-02-13T00:00:59";
	const utcOffset = "-08:00";

	const deadline = new Date(pstDeadline + utcOffset);
	const now = new Date();
	return true;
	return now > deadline;
}
