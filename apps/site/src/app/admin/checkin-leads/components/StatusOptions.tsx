import { SelectProps } from "@cloudscape-design/components/select";

export const actions: SelectProps.Options = [
	{
		label: "End accepted hacker check in",
		value: "end-accepted-checkin",
		description: "[Confirmed] → [Waiver Signed]",
	},
	{
		label: "Get next batch",
		value: "get-next-batch",
		description: "[Confirmed] → [Waiver Signed] + [Queued] → [Confirmed]",
	},
	{
		label: "Notify venue is full",
		value: "notify-venue-full",
		description: "Send notification to remaining queued participants",
	},
];
