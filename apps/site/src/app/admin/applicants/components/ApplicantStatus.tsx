import StatusIndicator, {
	StatusIndicatorProps,
} from "@cloudscape-design/components/status-indicator";

import { Status } from "@/lib/userRecord";

export const StatusLabels = {
	[Status.accepted]: "accepted",
	[Status.rejected]: "rejected",
	[Status.waitlisted]: "waitlisted",
	[Status.pending]: "needs review",
	[Status.reviewed]: "reviewed",
	[Status.released]: "released",
	[Status.signed]: "waiver signed",
	[Status.confirmed]: "confirmed",
	[Status.attending]: "attending",
	[Status.void]: "void",
};

const StatusTypes: Record<Status, StatusIndicatorProps.Type> = {
	[Status.accepted]: "success",
	[Status.rejected]: "error",
	[Status.waitlisted]: "pending",
	[Status.pending]: "pending",
	[Status.reviewed]: "in-progress",
	[Status.released]: "success",
	[Status.signed]: "in-progress",
	[Status.confirmed]: "info",
	[Status.attending]: "success",
	[Status.void]: "stopped",
};

interface ApplicantStatusProps {
	status: Status;
}

function ApplicantStatus({ status }: ApplicantStatusProps) {
	return (
		<StatusIndicator
			type={StatusTypes[status]}
			colorOverride={status === Status.signed ? "blue" : undefined}
		>
			{StatusLabels[status]}
		</StatusIndicator>
	);
}

export default ApplicantStatus;
