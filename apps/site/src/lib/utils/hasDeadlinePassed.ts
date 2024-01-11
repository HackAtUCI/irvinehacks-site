export default function hasDeadlinePassed() {
	const pstDeadline = "2024-01-14T23:59:00";
	const utcOffset = "-08:00";

	const deadline = new Date(pstDeadline + utcOffset);
	const now = new Date();

	return now > deadline;
}
