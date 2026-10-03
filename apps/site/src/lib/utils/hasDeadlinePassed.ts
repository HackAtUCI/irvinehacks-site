export default function hasDeadlinePassed() {
	const isZotHacks = process.env.NEXT_PUBLIC_ACTIVE_HACKATHON !== "irvinehacks";
	const pstDeadline = isZotHacks
		? "2026-10-03T02:59:00"
		: "2026-02-14T00:00:59";
	const utcOffset = isZotHacks ? "-07:00" : "-08:00";

	const deadline = new Date(pstDeadline + utcOffset);
	const now = new Date();
	return now > deadline;
}
